"use server";

import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneForStorage } from "@/lib/phone";
import { PLATFORMS } from "@/lib/migrate/platforms";
import type { ImportKind, NAppointment, NClient, NService, NStaff } from "@/lib/migrate/normalize";

// Imports write with the service-role client (clients has no owner write
// policy; it is normally maintained by the nightly job), so every action
// re-checks ownership itself and scopes every query to that shop.
async function requireOwner() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can import data");
  return { admin: createAdminClient(), shopId: ctx.shopId };
}

const MAX_CHUNK = 500;
const STATUSES = new Set(["confirmed", "completed", "cancelled", "no_show"]);
const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const iso = (v: unknown) => {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

// Must match keyFor() in src/lib/dashboard/clients.ts so imported clients
// merge with the bookings they make in Flow later.
const clientKey = (phone: string | null, email: string | null, name: string) => (phone || email || name).trim().toLowerCase();

export type ImportSummary = { id: string; source: string; status: string; counts: Record<string, number>; created_at: string };

export async function startImport(source: string): Promise<string> {
  const { admin, shopId } = await requireOwner();
  if (!PLATFORMS.some(p => p.id === source)) throw new Error("Unknown source");
  const { data, error } = await admin.from("imports").insert({ shop_id: shopId, source }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

async function ownedImport(admin: ReturnType<typeof createAdminClient>, shopId: string, importId: string) {
  const { data } = await admin.from("imports").select("id, status").eq("id", importId).eq("shop_id", shopId).maybeSingle();
  if (!data) throw new Error("Import not found");
  return data as { id: string; status: string };
}

/** Writes one chunk of normalized rows. Returns how many were new (duplicates are skipped). */
export async function importChunk(importId: string, kind: ImportKind, rows: unknown[]): Promise<{ inserted: number; duplicates: number }> {
  const { admin, shopId } = await requireOwner();
  const imp = await ownedImport(admin, shopId, importId);
  if (imp.status !== "running") throw new Error("This import is already finished");
  if (!Array.isArray(rows) || rows.length > MAX_CHUNK) throw new Error("Bad chunk");

  if (kind === "staff") {
    const { data: existing } = await admin.from("staff").select("full_name").eq("shop_id", shopId);
    const seen = new Set((existing ?? []).map(s => (s.full_name as string).toLowerCase()));
    const out = [];
    for (const r of rows as NStaff[]) {
      const name = str(r.name, 120);
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({ shop_id: shopId, import_id: importId, full_name: name, email: str(r.email, 254), role: str(r.role, 80) });
    }
    if (out.length) {
      const { error } = await admin.from("staff").insert(out);
      if (error) throw new Error(error.message);
    }
    return { inserted: out.length, duplicates: rows.length - out.length };
  }

  if (kind === "services") {
    const { data: existing } = await admin.from("services").select("name").eq("shop_id", shopId);
    const seen = new Set((existing ?? []).map(s => (s.name as string).toLowerCase()));
    const out = [];
    for (const r of rows as NService[]) {
      const name = str(r.name, 160);
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({
        shop_id: shopId, import_id: importId, name,
        price: num(r.price, 0, 100000, 0),
        duration_minutes: Math.round(num(r.duration, 5, 1440, 30)),
        category: str(r.category, 80),
      });
    }
    if (out.length) {
      const { error } = await admin.from("services").insert(out);
      if (error) throw new Error(error.message);
    }
    return { inserted: out.length, duplicates: rows.length - out.length };
  }

  if (kind === "clients") {
    const byKey = new Map<string, Record<string, unknown>>();
    for (const r of rows as NClient[]) {
      const name = str(r.name, 160);
      const email = str(r.email, 254)?.toLowerCase() ?? null;
      const phone = normalizePhoneForStorage(str(r.phone, 40));
      if (!name) continue;
      const key = clientKey(phone, email, name);
      if (byKey.has(key)) continue;
      byKey.set(key, {
        shop_id: shopId, import_id: importId, key, full_name: name, email, phone,
        date_of_birth: typeof r.birthday === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.birthday) ? r.birthday : null,
        notes: str(r.notes, 2000),
        visits_count: Math.round(num(r.visits ?? 0, 0, 100000, 0)),
        lifetime_value: num(r.totalSpent ?? 0, 0, 10000000, 0),
        last_visit_at: iso(r.lastVisit),
      });
    }
    const out = [...byKey.values()];
    if (!out.length) return { inserted: 0, duplicates: rows.length };
    // ignoreDuplicates: a client already in Flow keeps their live data.
    const { data, error } = await admin.from("clients").upsert(out, { onConflict: "shop_id,key", ignoreDuplicates: true }).select("id");
    if (error) throw new Error(error.message);
    const inserted = data?.length ?? 0;
    return { inserted, duplicates: rows.length - inserted };
  }

  // appointments
  const appts = (rows as NAppointment[])
    .map(r => ({ ...r, startsAt: iso(r.startsAt), clientName: str(r.clientName, 160) }))
    .filter((r): r is NAppointment & { startsAt: string; clientName: string } => !!r.startsAt && !!r.clientName);

  const times = appts.map(a => a.startsAt).sort();
  const [{ data: staffRows }, { data: existing }] = await Promise.all([
    admin.from("staff").select("id, full_name").eq("shop_id", shopId),
    appts.length
      ? admin.from("appointments").select("starts_at, client_name").eq("shop_id", shopId).gte("starts_at", times[0]).lte("starts_at", times[times.length - 1]).limit(20000)
      : Promise.resolve({ data: [] as { starts_at: string; client_name: string }[] }),
  ]);
  const staffByName = new Map((staffRows ?? []).map(s => [(s.full_name as string).toLowerCase(), s.id as string]));
  const dupKey = (startsAt: string, name: string) => `${new Date(startsAt).getTime()}|${name.toLowerCase()}`;
  const seen = new Set((existing ?? []).map(a => dupKey(a.starts_at as string, a.client_name as string)));

  const out = [];
  for (const a of appts) {
    const k = dupKey(a.startsAt, a.clientName);
    if (seen.has(k)) continue;
    seen.add(k);
    const stylist = str(a.staff, 120);
    out.push({
      shop_id: shopId, import_id: importId,
      client_name: a.clientName,
      client_email: str(a.clientEmail, 254)?.toLowerCase() ?? null,
      client_phone: normalizePhoneForStorage(str(a.clientPhone, 40)),
      client_notes: str(a.notes, 2000),
      service_name: str(a.service, 160) ?? "Appointment",
      stylist_name: stylist,
      staff_id: stylist ? staffByName.get(stylist.toLowerCase()) ?? null : null,
      starts_at: a.startsAt,
      duration_minutes: Math.round(num(a.duration, 5, 1440, 60)),
      price: num(a.price, 0, 100000, 0),
      status: STATUSES.has(a.status) ? a.status : "confirmed",
      completed_at: a.status === "completed" ? a.startsAt : null,
    });
  }
  if (out.length) {
    const { error } = await admin.from("appointments").insert(out);
    if (error) throw new Error(error.message);
  }
  return { inserted: out.length, duplicates: rows.length - out.length };
}

export async function finishImport(importId: string, counts: Record<string, number>) {
  const { admin, shopId } = await requireOwner();
  await ownedImport(admin, shopId, importId);
  const safe = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k.slice(0, 32), num(v, 0, 1e7, 0)]));
  await admin.from("imports").update({ status: "completed", counts: safe, completed_at: new Date().toISOString() }).eq("id", importId).eq("shop_id", shopId);
  for (const p of ["/dashboard/clients", "/dashboard/services", "/dashboard/team", "/dashboard/appointments", "/dashboard/migrate"]) revalidatePath(p);
}

export async function undoImport(importId: string) {
  const { admin, shopId } = await requireOwner();
  const imp = await ownedImport(admin, shopId, importId);
  if (imp.status === "undone") return;
  // Appointments first: they may point at imported staff.
  for (const table of ["appointments", "clients", "services", "staff"]) {
    const { error } = await admin.from(table).delete().eq("shop_id", shopId).eq("import_id", importId);
    if (error) throw new Error(error.message);
  }
  await admin.from("imports").update({ status: "undone", undone_at: new Date().toISOString() }).eq("id", importId).eq("shop_id", shopId);
  for (const p of ["/dashboard/clients", "/dashboard/services", "/dashboard/team", "/dashboard/appointments", "/dashboard/migrate"]) revalidatePath(p);
}

export async function listImports(): Promise<ImportSummary[]> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("imports")
    .select("id, source, status, counts, created_at")
    .eq("shop_id", ctx.shopId)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as ImportSummary[];
}
