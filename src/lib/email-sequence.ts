import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";

export async function enqueueSubscriber(subscriberId: string) {
  const admin = createAdminClient();

  const { data: sequences } = await admin
    .from("email_sequences")
    .select("id, delay_days")
    .eq("is_active", true);

  if (!sequences?.length) return;

  const { data: subscriber } = await admin
    .from("waitlist")
    .select("created_at")
    .eq("id", subscriberId)
    .single();

  if (!subscriber) return;

  const baseDate = new Date(subscriber.created_at);

  const rows = sequences.map((seq) => {
    const scheduled = new Date(baseDate);
    scheduled.setDate(scheduled.getDate() + seq.delay_days);
    return {
      subscriber_id: subscriberId,
      sequence_id: seq.id,
      scheduled_at: scheduled.toISOString(),
      status: "pending",
    };
  });

  await admin.from("email_sends").upsert(rows, {
    onConflict: "subscriber_id,sequence_id",
    ignoreDuplicates: true,
  });
}

export async function sendSequenceEmail(sendId: string): Promise<{ error: string | null }> {
  const admin = createAdminClient();

  const { data: send } = await admin
    .from("email_sends")
    .select("id, subscriber_id, sequence_id, status")
    .eq("id", sendId)
    .single();

  if (!send) return { error: "Send record not found" };
  if (send.status === "sent") return { error: "Already sent" };

  const [{ data: subscriber }, { data: sequence }] = await Promise.all([
    admin.from("waitlist").select("email, name").eq("id", send.subscriber_id).single(),
    admin.from("email_sequences").select("subject, body").eq("id", send.sequence_id).single(),
  ]);

  if (!subscriber || !sequence) return { error: "Subscriber or sequence not found" };

  const firstName = subscriber.name?.split(" ")[0] ?? "there";
  const html = sequence.body.replace(/\[First Name\]/g, firstName);

  try {
    await sendEmail({ to: subscriber.email, subject: sequence.subject, html });

    await admin.from("email_sends").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", sendId);

    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    await admin.from("email_sends").update({
      status: "failed",
      error_message: msg,
    }).eq("id", sendId);

    return { error: msg };
  }
}
