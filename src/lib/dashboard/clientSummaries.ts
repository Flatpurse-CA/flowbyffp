import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";
import { deriveClients, type DerivedClient } from "@/lib/dashboard/clients";
import type { AppointmentRow } from "@/app/dashboard/appointments/actions";

// Every client for the shop, aggregated in Postgres (shop_client_summaries,
// migration 0047). Returned as one JSON value, so no row cap applies no
// matter how much history a shop imported.
export async function listClientSummaries(): Promise<DerivedClient[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("shop_client_summaries", { p_shop_id: ctx.shopId });
  if (error) throw new Error(error.message);
  return (data ?? []) as DerivedClient[];
}

// One client's appointments plus their summary. Clients imported from
// another platform may have no Flow appointments yet; their summary comes
// from the clients table instead.
export async function getClientWithAppointments(key: string): Promise<{ client: DerivedClient; appointments: AppointmentRow[] } | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("client_appointments", { p_shop_id: ctx.shopId, p_key: key });
  if (error) throw new Error(error.message);
  const appointments = (data ?? []) as AppointmentRow[];

  const derived = deriveClients(appointments, new Date())[0];
  if (derived) return { client: derived, appointments };

  const { data: stored } = await supabase
    .from("clients")
    .select("key, full_name, phone, email, visits_count, lifetime_value, last_visit_at")
    .eq("shop_id", ctx.shopId)
    .eq("key", key)
    .maybeSingle();
  if (!stored) return null;
  const visits = Number(stored.visits_count) || 0;
  const ltv = Number(stored.lifetime_value) || 0;
  return {
    appointments,
    client: {
      key: stored.key,
      name: stored.full_name,
      phone: stored.phone,
      email: stored.email,
      visits,
      ltv,
      lastVisitAt: stored.last_visit_at,
      avgIntervalDays: null,
      daysSinceLastVisit: stored.last_visit_at ? (Date.now() - new Date(stored.last_visit_at).getTime()) / 86_400_000 : null,
      tag: visits >= 5 && ltv >= 500 ? "VIP" : visits >= 3 ? "Loyal" : "New",
    },
  };
}
