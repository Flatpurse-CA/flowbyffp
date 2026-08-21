import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlatPurse Flow <onboarding@resend.dev>";

Deno.serve(async () => {
  const now = new Date().toISOString();

  const { data: pending, error } = await supabase
    .from("email_sends")
    .select(`
      id, subscriber_id, sequence_id,
      waitlist:subscriber_id ( email, name ),
      email_sequences:sequence_id ( subject, body )
    `)
    .eq("status", "pending")
    .lte("scheduled_at", now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const send of pending ?? []) {
    const subscriber = send.waitlist as { email: string; name: string | null } | null;
    const seq        = send.email_sequences as { subject: string; body: string } | null;

    if (!subscriber || !seq) {
      await supabase.from("email_sends").update({ status: "failed", error_message: "Missing subscriber or sequence" }).eq("id", send.id);
      failed++;
      continue;
    }

    const firstName = subscriber.name?.split(" ")[0] ?? "there";
    const html = seq.body.replace(/\[First Name\]/g, firstName);

    try {
      const { error: sendError } = await resend.emails.send({ from: FROM, to: subscriber.email, subject: seq.subject, html });
      if (sendError) throw new Error(sendError.message);
      await supabase.from("email_sends").update({ status: "sent", sent_at: new Date().toISOString(), error_message: null }).eq("id", send.id);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await supabase.from("email_sends").update({ status: "failed", error_message: msg }).eq("id", send.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: (pending ?? []).length, sent, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
