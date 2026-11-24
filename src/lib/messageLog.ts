import { createAdminClient } from "@/lib/supabase/admin";

/** FL-005: one log of every email and text Flow sends. Never throws. */
export type MessageLogEntry = {
  shopId?: string | null; channel: "email" | "sms" | "push"; audience?: "client" | "owner" | "staff" | "system";
  kind?: string | null; recipient: string; subject?: string | null;
  status: "sent" | "failed" | "queued" | "skipped"; providerId?: string | null; error?: string | null;
};

export async function logMessage(e: MessageLogEntry): Promise<void> {
  try {
    await createAdminClient().from("message_log").insert({
      shop_id: e.shopId ?? null, channel: e.channel, audience: e.audience ?? "client", kind: e.kind ?? null,
      recipient: e.recipient.slice(0, 254), subject: e.subject?.slice(0, 300) ?? null, status: e.status,
      provider_id: e.providerId ?? null, error: e.error?.slice(0, 500) ?? null,
    });
  } catch {
    // Logging must never block a send.
  }
}
