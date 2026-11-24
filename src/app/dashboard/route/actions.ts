"use server";

import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendShopSms } from "@/lib/sms/allowance";

/** FL-059: "Start driving" ETA text and "Running late" text to the client. */
export async function sendTravelText(input: { appointmentId: string; kind: "eta" | "late"; minutes: number }): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx) return { error: "Not signed in" };
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments").select("id, staff_id, client_name, client_phone").eq("id", input.appointmentId).eq("shop_id", ctx.shopId).maybeSingle();
  if (!a) return { error: "Booking not found" };
  if (ctx.role !== "owner" && a.staff_id !== ctx.staffId) return { error: "Not your booking" };
  if (!a.client_phone) return { error: "No phone number for this client" };
  const { data: shop } = await admin.from("shops").select("name").eq("id", ctx.shopId).maybeSingle();
  const m = Math.min(240, Math.max(1, Math.round(input.minutes)));
  const first = String(a.client_name).split(" ")[0];
  const body = input.kind === "eta"
    ? `Hi ${first}, ${ctx.staffName ?? shop?.name ?? "we"} from ${shop?.name ?? "Flow"} is on the way. ETA about ${m} min.`
    : `Hi ${first}, ${shop?.name ?? "we"} is running about ${m} min late. Sorry, see you soon!`;
  const r = await sendShopSms(ctx.shopId, a.client_phone as string, body, { marketing: false });
  if (r.error) return r;
  if (input.kind === "eta") await admin.from("appointments").update({ eta_sent_at: new Date().toISOString() }).eq("id", a.id);
  return {};
}
