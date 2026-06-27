import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const { subscriber_id } = await req.json();
  if (!subscriber_id) {
    return new Response(JSON.stringify({ error: "subscriber_id required" }), { status: 400 });
  }

  const { data: sequences } = await supabase
    .from("email_sequences")
    .select("id, delay_days")
    .eq("is_active", true);

  const { data: subscriber } = await supabase
    .from("waitlist")
    .select("created_at")
    .eq("id", subscriber_id)
    .single();

  if (!subscriber) {
    return new Response(JSON.stringify({ error: "Subscriber not found" }), { status: 404 });
  }

  const baseDate = new Date(subscriber.created_at);

  const rows = (sequences ?? []).map((seq) => {
    const scheduled = new Date(baseDate);
    scheduled.setDate(scheduled.getDate() + seq.delay_days);
    return {
      subscriber_id,
      sequence_id: seq.id,
      scheduled_at: scheduled.toISOString(),
      status: "pending",
    };
  });

  await supabase.from("email_sends").upsert(rows, {
    onConflict: "subscriber_id,sequence_id",
    ignoreDuplicates: true,
  });

  return new Response(JSON.stringify({ enqueued: rows.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
