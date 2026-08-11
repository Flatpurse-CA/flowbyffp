import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/twilio";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { generateFrontdeskReply } from "./frontdeskAi";

export type FrontdeskChannel = "email" | "sms";

// Shared-number model (see 0029_frontdesk_sms.sql): every shop's SMS traffic
// arrives on the same Twilio number, so an inbound text carries no shop_id —
// it has to be inferred from who the sender has actually been a client of.
// Ties (a client of more than one shop) resolve to whichever shop they most
// recently visited. A phone with no match at all (a cold, never-booked
// number) can't be resolved — the webhook handles that case itself.
export async function resolveShopIdForPhone(phone: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("shop_id, last_visit_at")
    .eq("phone", phone)
    .order("last_visit_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return (data?.shop_id as string | undefined) ?? null;
}

export type HandleInboundResult = { intent: string; outcome: "sent" | "escalated" | "disabled" };

export async function handleInboundMessage(input: {
  shopId: string;
  fromEmail?: string;
  fromPhone?: string;
  fromName: string;
  body: string;
  channel: FrontdeskChannel;
}): Promise<HandleInboundResult> {
  if (!input.fromEmail && !input.fromPhone) throw new Error("fromEmail or fromPhone is required");

  const admin = createAdminClient();

  const { data: shop } = await admin
    .from("shops")
    .select("id, name, handle, owner_id, frontdesk_enabled")
    .eq("id", input.shopId)
    .maybeSingle();
  if (!shop) throw new Error("Shop not found");

  const identityColumn = input.fromPhone ? "client_phone" : "client_email";
  const identityValue = input.fromPhone ?? input.fromEmail!;

  let { data: convo } = await admin
    .from("frontdesk_conversations")
    .select("id, status")
    .eq("shop_id", shop.id)
    .eq(identityColumn, identityValue)
    .maybeSingle();

  if (!convo) {
    const { data: created, error: createError } = await admin
      .from("frontdesk_conversations")
      .insert({
        shop_id: shop.id,
        client_email: input.fromEmail ?? null,
        client_phone: input.fromPhone ?? null,
        client_name: input.fromName,
        channel: input.channel,
      })
      .select("id, status")
      .single();
    if (createError || !created) throw new Error(createError?.message ?? "Could not create conversation");
    convo = created;
  }

  await admin.from("frontdesk_messages").insert({ conversation_id: convo.id, direction: "inbound", body: input.body });

  const { data: client } = input.fromPhone
    ? await admin.from("clients").select("id").eq("shop_id", shop.id).eq("phone", input.fromPhone).maybeSingle()
    : await admin.from("clients").select("id").eq("shop_id", shop.id).eq("email", input.fromEmail!).maybeSingle();

  const reply = async (body: string) => {
    await admin.from("frontdesk_messages").insert({ conversation_id: convo!.id, direction: "outbound", body });
    if (input.channel === "sms") await sendSms(identityValue, body);
    else await sendEmail({ to: identityValue, subject: `Re: your message to ${shop.name}`, html: `<div style="font-family: sans-serif;">${body}</div>` });
  };

  const notifyOwner = async (reason: string) => {
    const { data: ownerUser } = await admin.auth.admin.getUserById(shop.owner_id);
    const ownerEmail = ownerUser?.user?.email;
    if (!ownerEmail) return;
    await sendEmail({
      to: ownerEmail,
      subject: `Needs your attention: message from ${input.fromName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 18px;">A client message needs your attention</h1>
          <p style="color: #444; font-size: 14px;"><strong>${input.fromName}</strong> (${identityValue}) wrote:</p>
          <p style="color: #444; font-size: 14px; background: #f4f4f5; padding: 12px 16px; border-radius: 8px;">${input.body}</p>
          <p style="color: #999; font-size: 12px;">${reason}</p>
        </div>`,
    });
  };

  // Once a conversation is escalated, AutoPilot stops auto-responding — a
  // human has the thread. Still logs the inbound message above.
  if (convo.status === "escalated") {
    return { intent: "complaint", outcome: "escalated" };
  }

  if (!shop.frontdesk_enabled) {
    await notifyOwner("AI Front Desk is turned off for your shop, reply directly from Settings > AutoPilot.");
    await admin.from("autopilot_events").insert({
      shop_id: shop.id, flow_key: "frontdesk",
      client_id: client?.id ?? null, client_email: input.fromEmail ?? null, client_name: input.fromName,
      outcome: "disabled", event_text: `Received a message from ${input.fromName}: AI Front Desk is off, notified owner`,
    });
    return { intent: "n/a", outcome: "disabled" };
  }

  const origin = await getRequestOrigin();
  const bookingUrl = shop.handle ? `${origin}/book/${shop.handle}` : origin;
  const accountUrl = `${origin}/customer/account`;

  const { data: history } = await admin
    .from("frontdesk_messages")
    .select("direction, body")
    .eq("conversation_id", convo.id)
    .order("created_at", { ascending: true })
    .limit(12);

  const { data: services } = await admin
    .from("services").select("name, price").eq("shop_id", shop.id).eq("active", true).order("price");

  const ai = await generateFrontdeskReply({
    shopName: shop.name,
    services: (services ?? []).map(s => ({ name: s.name as string, price: Number(s.price) })),
    bookingUrl,
    accountUrl,
    customerMessage: input.body,
    history: (history ?? []).slice(0, -1) as { direction: "inbound" | "outbound"; body: string }[],
    channel: input.channel,
  });

  let outcome: "sent" | "escalated" = "sent";
  let eventText: string;

  if (ai.escalate || !ai.reply) {
    outcome = "escalated";
    await admin.from("frontdesk_conversations").update({ status: "escalated", updated_at: new Date().toISOString() }).eq("id", convo.id);
    await reply(`Thanks for the message, someone from the team will get back to you shortly.`);
    await notifyOwner("AutoPilot has paused auto-replies for this conversation until you respond.");
    eventText = `Escalated a message from ${input.fromName} to the owner`;
  } else {
    await reply(ai.reply);
    eventText = `AI Front Desk replied to ${input.fromName} (${ai.intent})`;
  }

  await admin.from("autopilot_events").insert({
    shop_id: shop.id, flow_key: "frontdesk",
    client_id: client?.id ?? null, client_email: input.fromEmail ?? null, client_name: input.fromName,
    message_body: ai.reply, outcome, event_text: eventText,
  });

  return { intent: ai.intent, outcome };
}
