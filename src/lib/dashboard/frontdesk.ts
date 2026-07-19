import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { getRequestOrigin } from "@/lib/requestOrigin";

export type FrontdeskIntent = "book" | "reschedule" | "cancel" | "price" | "question" | "complaint";

// AI classification seam — keyword heuristic today, swap for a real Claude
// (or other LLM) call here later without changing any caller. Deliberately
// errs toward "complaint" (which triggers escalation) on ambiguous input
// rather than guessing an action — matches the spec's "anything unclear gets
// escalated immediately."
export function classifyMessage(body: string): FrontdeskIntent {
  const text = body.toLowerCase();
  const has = (words: string[]) => words.some(w => text.includes(w));

  if (has(["cancel"])) return "cancel";
  if (has(["reschedule", "move my", "change my appointment", "different time", "another time"])) return "reschedule";
  if (has(["price", "cost", "how much", "pricing", "rate"])) return "price";
  if (has(["book", "appointment", "available", "schedule", "opening", "slot"])) return "book";
  if (has(["angry", "terrible", "worst", "refund", "unacceptable", "disappointed", "complain", "awful", "rude"])) return "complaint";
  if (has(["hi", "hello", "hey", "?", "thanks", "thank you"])) return "question";
  return "complaint"; // no recognizable intent at all → escalate rather than guess
}

export type HandleInboundResult = { intent: FrontdeskIntent; outcome: "sent" | "escalated" };

export async function handleInboundMessage(input: {
  shopId: string; fromEmail: string; fromName: string; body: string;
}): Promise<HandleInboundResult> {
  const admin = createAdminClient();

  const { data: shop } = await admin
    .from("shops")
    .select("id, name, handle, owner_id")
    .eq("id", input.shopId)
    .maybeSingle();
  if (!shop) throw new Error("Shop not found");

  let { data: convo } = await admin
    .from("frontdesk_conversations")
    .select("id, status")
    .eq("shop_id", shop.id)
    .eq("client_email", input.fromEmail)
    .maybeSingle();

  if (!convo) {
    const { data: created, error: createError } = await admin
      .from("frontdesk_conversations")
      .insert({ shop_id: shop.id, client_email: input.fromEmail, client_name: input.fromName })
      .select("id, status")
      .single();
    if (createError || !created) throw new Error(createError?.message ?? "Could not create conversation");
    convo = created;
  }

  await admin.from("frontdesk_messages").insert({ conversation_id: convo.id, direction: "inbound", body: input.body });

  const { data: client } = await admin
    .from("clients").select("id").eq("shop_id", shop.id).eq("email", input.fromEmail).maybeSingle();

  // Once a conversation is escalated, AutoPilot stops auto-responding — a
  // human has the thread. Still logs the inbound message above, just no
  // outbound reply or further event.
  if (convo.status === "escalated") {
    return { intent: "complaint", outcome: "escalated" };
  }

  const intent = classifyMessage(input.body);
  const origin = await getRequestOrigin();
  const bookingUrl = shop.handle ? `${origin}/book/${shop.handle}` : origin;

  let replyBody: string | null = null;
  let outcome: "sent" | "escalated" = "sent";
  let eventText: string;

  if (intent === "price") {
    // Answered directly from the real service menu — no AI needed for the
    // answer itself, just a real query + template.
    const { data: services } = await admin
      .from("services").select("name, price").eq("shop_id", shop.id).eq("active", true).order("price");
    const list = (services ?? []).map(s => `${s.name}: C$${s.price}`).join("<br>");
    replyBody = `Here's our current pricing at ${shop.name}:<br><br>${list || "Reach out directly and we'll get you a quote."}`;
    eventText = `Answered a pricing question from ${input.fromName}`;
  } else if (intent === "book" || intent === "reschedule") {
    // The AI never creates a booking directly — it always sends a link for
    // the client to confirm against real, live availability.
    replyBody = intent === "reschedule"
      ? `You can pick a new time here: <a href="${bookingUrl}">${bookingUrl}</a>`
      : `You can book directly here: <a href="${bookingUrl}">${bookingUrl}</a>`;
    eventText = `Sent booking link to ${input.fromName} (${intent})`;
  } else if (intent === "cancel") {
    replyBody = `You can cancel your booking anytime from your account: <a href="${origin}/customer/account">${origin}/customer/account</a>`;
    eventText = `Sent cancellation link to ${input.fromName}`;
  } else if (intent === "question") {
    replyBody = `Thanks for reaching out to ${shop.name}! We'll get back to you shortly — or you can book directly here: <a href="${bookingUrl}">${bookingUrl}</a>`;
    eventText = `Auto-replied to a general question from ${input.fromName}`;
  } else {
    outcome = "escalated";
    await admin.from("frontdesk_conversations").update({ status: "escalated", updated_at: new Date().toISOString() }).eq("id", convo.id);

    const { data: ownerUser } = await admin.auth.admin.getUserById(shop.owner_id);
    const ownerEmail = ownerUser?.user?.email;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `Needs your attention — message from ${input.fromName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h1 style="font-size: 18px;">A client message needs your attention</h1>
            <p style="color: #444; font-size: 14px;"><strong>${input.fromName}</strong> (${input.fromEmail}) wrote:</p>
            <p style="color: #444; font-size: 14px; background: #f4f4f5; padding: 12px 16px; border-radius: 8px;">${input.body}</p>
            <p style="color: #999; font-size: 12px;">AutoPilot has paused auto-replies for this conversation until you respond.</p>
          </div>`,
      });
    }
    eventText = `Escalated a message from ${input.fromName} to the owner`;
  }

  if (replyBody) {
    await admin.from("frontdesk_messages").insert({ conversation_id: convo.id, direction: "outbound", body: replyBody, classified_intent: intent });
    await sendEmail({ to: input.fromEmail, subject: `Re: your message to ${shop.name}`, html: `<div style="font-family: sans-serif;">${replyBody}</div>` });
  }

  await admin.from("autopilot_events").insert({
    shop_id: shop.id, flow_key: "frontdesk",
    client_id: client?.id ?? null, client_email: input.fromEmail, client_name: input.fromName,
    message_body: replyBody, outcome, event_text: eventText,
  });

  return { intent, outcome };
}
