"use server";

import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots } from "@/app/book/[handle]/actions";
import { createAppointment } from "@/app/dashboard/appointments/actions";

const TZ = "America/Edmonton";
const DAY = 86_400_000;
const keyOf = (e: string | null, p: string | null, n: string) => (e || p || n).toLowerCase().trim();
const parts = (iso: string) => {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date(iso));
  return { wd: f.find((x) => x.type === "weekday")?.value ?? "", hr: Number(f.find((x) => x.type === "hour")?.value ?? 0) };
};

export type DueClient = { key: string; name: string; phone: string | null; email: string | null; serviceName: string; staffId: string | null; daysOver: number; usual: { wd: string; hr: number } | null };
export type BestTime = { startsAt: string; tag: "Their usual time" | "Fills a gap" | null };

/** Clients past their usual rebook gap with nothing booked (FL-045). */
export async function getDueClients(): Promise<DueClient[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const admin = createAdminClient();
  const since = new Date(Date.now() - 540 * DAY).toISOString();
  const { data } = await admin.from("appointments")
    .select("client_name, client_phone, client_email, service_name, staff_id, starts_at, status")
    .eq("shop_id", ctx.shopId).gte("starts_at", since).order("starts_at").limit(5000);
  const now = Date.now();
  type Agg = { name: string; phone: string | null; email: string | null; visits: string[]; services: Record<string, number>; staff: Record<string, number>; upcoming: boolean };
  const map = new Map<string, Agg>();
  for (const a of (data ?? []) as { client_name: string; client_phone: string | null; client_email: string | null; service_name: string; staff_id: string | null; starts_at: string; status: string }[]) {
    const k = keyOf(a.client_email, a.client_phone, a.client_name);
    const m: Agg = map.get(k) ?? { name: a.client_name, phone: a.client_phone, email: a.client_email, visits: [], services: {}, staff: {}, upcoming: false };
    const t = new Date(a.starts_at).getTime();
    if (t > now && ["confirmed", "deposit", "pending"].includes(a.status)) m.upcoming = true;
    if (t <= now && ["completed", "confirmed", "paid"].includes(a.status)) {
      m.visits.push(a.starts_at);
      m.services[a.service_name] = (m.services[a.service_name] ?? 0) + 1;
      if (a.staff_id) m.staff[a.staff_id] = (m.staff[a.staff_id] ?? 0) + 1;
    }
    map.set(k, m);
  }
  const top = (r: Record<string, number>) => Object.entries(r).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;
  const out: DueClient[] = [];
  for (const [key, m] of map) {
    if (m.upcoming || m.visits.length === 0) continue;
    const ts = m.visits.map((v) => new Date(v).getTime());
    const gap = ts.length >= 2 ? (ts[ts.length - 1] - ts[0]) / (ts.length - 1) / DAY : 42;
    const since = (now - ts[ts.length - 1]) / DAY;
    if (since < gap) continue;
    const p = m.visits.map(parts);
    const wd = top(p.reduce((r, x) => ({ ...r, [x.wd]: (r[x.wd] ?? 0) + 1 }), {} as Record<string, number>));
    const hr = Math.round(p.reduce((s, x) => s + x.hr, 0) / p.length);
    out.push({ key, name: m.name, phone: m.phone, email: m.email, serviceName: top(m.services) ?? "", staffId: top(m.staff), daysOver: Math.round(since - gap), usual: wd ? { wd, hr } : null });
  }
  return out.sort((a, b) => a.daysOver - b.daysOver).slice(0, 30);
}

/** Open slots this week, ranked: usual day/time first, then gap fillers. */
export async function getBestTimes(input: { serviceName: string; staffId: string | null; usual: { wd: string; hr: number } | null }): Promise<{ times: BestTime[]; serviceId: string | null }> {
  const ctx = await getShopContext();
  if (!ctx) return { times: [], serviceId: null };
  const admin = createAdminClient();
  const { data: svc } = await admin.from("services").select("id, duration_minutes").eq("shop_id", ctx.shopId).eq("name", input.serviceName).eq("active", true).maybeSingle();
  if (!svc) return { times: [], serviceId: null };
  const staffId = ctx.staffId ?? input.staffId ?? "any";
  const end = new Date(Date.now() + 7 * DAY).toISOString();
  const { data: booked } = await admin.from("appointments").select("starts_at, duration_minutes")
    .eq("shop_id", ctx.shopId).gte("starts_at", new Date().toISOString()).lte("starts_at", end).in("status", ["confirmed", "deposit", "pending"]);
  const edges = new Set<number>();
  for (const b of booked ?? []) { const s = new Date(b.starts_at).getTime(); edges.add(s); edges.add(s + (b.duration_minutes ?? 0) * 60000); }
  const dur = (svc.duration_minutes ?? 30) * 60000;
  const all: BestTime[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(Date.now() + d * DAY));
    const slots = await getAvailableSlots({ shopId: ctx.shopId, serviceId: svc.id as string, staffId, date });
    for (const s of slots) {
      const t = new Date(s).getTime();
      if (t < Date.now() + 30 * 60000) continue;
      const p = parts(s);
      const usual = input.usual && p.wd === input.usual.wd && Math.abs(p.hr - input.usual.hr) <= 1;
      all.push({ startsAt: s, tag: usual ? "Their usual time" : edges.has(t) || edges.has(t + dur) ? "Fills a gap" : null });
    }
  }
  const rank = (b: BestTime) => (b.tag === "Their usual time" ? 0 : b.tag === "Fills a gap" ? 1 : 2);
  return { times: all.sort((a, b) => rank(a) - rank(b) || a.startsAt.localeCompare(b.startsAt)).slice(0, 6), serviceId: svc.id as string };
}

export async function quickBook(input: { client: DueClient; startsAt: string }): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx) return { error: "Not signed in" };
  const admin = createAdminClient();
  const { data: svc } = await admin.from("services").select("name, duration_minutes, price").eq("shop_id", ctx.shopId).eq("name", input.client.serviceName).maybeSingle();
  if (!svc) return { error: "Service not found" };
  const staffId = ctx.staffId ?? input.client.staffId ?? undefined;
  const { data: st } = staffId ? await admin.from("staff").select("full_name").eq("id", staffId).maybeSingle() : { data: null };
  try {
    await createAppointment({
      clientName: input.client.name, clientPhone: input.client.phone ?? undefined, clientEmail: input.client.email ?? undefined,
      serviceName: svc.name as string, staffId, stylistName: (st?.full_name as string) ?? undefined,
      startsAt: input.startsAt, durationMinutes: svc.duration_minutes as number, price: Number(svc.price ?? 0),
    });
    return {};
  } catch (e) { return { error: (e as Error).message }; }
}
