#!/usr/bin/env node
/**
 * Demo/test data for a NON-production Supabase project (staging, a branch, or local).
 *
 *   SEED_OWNER_EMAIL=you+demo@example.com SEED_OWNER_PASSWORD='...' \
 *   node --env-file=.env.staging scripts/seed-demo.mjs
 *
 * Creates one owner login, a "Demo Salon" shop (comped, so no card step), services,
 * hours, 3 staff, 40 clients, ~90 days of bookings (completed, no-shows, upcoming),
 * AutoPilot messages with attributed bookings. Prints the booking handle for E2E.
 * Refuses to touch production unless SEED_ALLOW_PROD=yes. Re-run with SEED_RESET=yes
 * to delete the previous demo shop for that email first.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const PROD_REF = "navceclnjivngtjysxpw";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const email = process.env.SEED_OWNER_EMAIL;
const password = process.env.SEED_OWNER_PASSWORD;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required");
if (!email || !password) throw new Error("Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD");
if (url.includes(PROD_REF) && process.env.SEED_ALLOW_PROD !== "yes") {
  throw new Error("This is the production database. Use a staging project, or set SEED_ALLOW_PROD=yes if you really mean it.");
}

const db = createClient(url, key, { auth: { persistSession: false } });
const must = async (p) => { const { data, error } = await p; if (error) throw new Error(error.message); return data; };
const DAY = 86_400_000;
const pick = (arr, i) => arr[i % arr.length];

// Owner login (reuse if it exists).
const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list.users.find((u) => u.email === email);
if (!user) user = (await must(db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: "Demo", last_name: "Owner" } }))).user;
await must(db.from("profiles").upsert({ id: user.id, first_name: "Demo", last_name: "Owner" }));

const existing = await must(db.from("shops").select("id, handle").eq("owner_id", user.id).maybeSingle());
if (existing && process.env.SEED_RESET !== "yes") {
  console.log(`Demo shop already exists: /book/${existing.handle}. Set SEED_RESET=yes to rebuild it.`);
  process.exit(0);
}
if (existing) await must(db.from("shops").delete().eq("id", existing.id));

const handle = `demo-salon-${randomUUID().slice(0, 6)}`;
const shop = await must(db.from("shops").insert({
  owner_id: user.id, name: "Demo Salon", business_type: "hair_salon", city: "Calgary", province: "AB",
  plan: "pro_plus", trial_override: true, handle, stripe_connected: false,
}).select("id").single());
const shopId = shop.id;

const services = await must(db.from("services").insert([
  ["Women's Cut", 75, 60, 50], ["Men's Cut", 45, 30, 50], ["Colour", 140, 120, 40], ["Balayage", 220, 180, 40], ["Blowout", 55, 45, null],
].map(([name, price, duration_minutes, commission_pct]) => ({ shop_id: shopId, name, price, duration_minutes, commission_pct, active: true }))).select("id, name, price, duration_minutes"));

await must(db.from("business_hours").insert([0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  shop_id: shopId, weekday, open: weekday !== 0, start_time: "09:00", end_time: weekday === 6 ? "16:00" : "19:00",
}))));

const staff = await must(db.from("staff").insert([
  { full_name: "Ava Chen", role: "Senior Stylist", commission_type: "percent" },
  { full_name: "Marcus Lee", role: "Barber", commission_type: "percent", commission_pct: 45 },
  { full_name: "Priya Shah", role: "Booth Renter", commission_type: "renter", rent_amount: 350, rent_period: "week" },
].map((s) => ({ shop_id: shopId, active: true, ...s }))).select("id, full_name"));

const first = ["Olivia", "Liam", "Emma", "Noah", "Sophia", "Ethan", "Mia", "Lucas", "Amelia", "Mason", "Harper", "Logan", "Ella", "Jacob", "Chloe", "Aiden", "Zoe", "Owen", "Lily", "Leo"];
const last = ["Martin", "Roy", "Tremblay", "Wilson", "Brown", "Singh", "Nguyen", "Campbell"];
const clients = Array.from({ length: 40 }, (_, i) => {
  const full_name = `${pick(first, i)} ${pick(last, i * 3)}`;
  const em = `seed.client${i + 1}@example.com`;
  return { shop_id: shopId, key: em, full_name, email: em, phone: null, marketing_consent: i % 3 === 0 ? "express" : null };
});
await must(db.from("clients").insert(clients));

// ~90 days back, 14 days forward.
const now = Date.now();
const appts = [];
for (let d = -90; d <= 14; d++) {
  const day = new Date(now + d * DAY);
  if (day.getUTCDay() === 0) continue;
  const perDay = 3 + (Math.abs(d) % 4);
  for (let k = 0; k < perDay; k++) {
    const c = pick(clients, d * 7 + k * 11 + 400);
    const s = pick(services, d + k + 100);
    const st = pick(staff, k + d + 100);
    const start = new Date(day); start.setUTCHours(16 + k * 2, 0, 0, 0); // 9-10am+ Mountain
    const past = start.getTime() < now;
    const roll = (Math.abs(d * 13 + k * 7)) % 20;
    const status = past ? (roll === 0 ? "no_show" : roll === 1 ? "cancelled" : "completed") : (roll < 3 ? "pending" : "confirmed");
    appts.push({
      shop_id: shopId, client_name: c.full_name, client_email: c.email, service_name: s.name, stylist_name: st.full_name, staff_id: st.id,
      starts_at: start.toISOString(), duration_minutes: s.duration_minutes, price: s.price, status,
      completed_at: status === "completed" ? start.toISOString() : null,
      paid_amount: status === "completed" ? s.price + (roll % 4) * 5 : null,
      tip_amount: status === "completed" ? (roll % 4) * 5 : null,
      payment_method: status === "completed" ? (roll % 2 ? "card" : "cash") : null,
    });
  }
}
const inserted = [];
for (let i = 0; i < appts.length; i += 200) inserted.push(...await must(db.from("appointments").insert(appts.slice(i, i + 200)).select("id, client_name, client_email, status, starts_at, price")));

// AutoPilot: a message a few days before some completed bookings, attributed to them.
const flows = ["noshow", "winback", "reminders", "filler"];
const won = inserted.filter((a) => a.status === "completed").filter((_, i) => i % 9 === 0).slice(0, 12);
for (const [i, a] of won.entries()) {
  const flow = pick(flows, i);
  const ev = await must(db.from("autopilot_events").insert({
    shop_id: shopId, flow_key: flow, dedupe_key: `seed-${a.id}`, client_name: a.client_name, client_email: a.client_email,
    channel: "email", outcome: "booked", amount: a.price, appointment_id: a.id, event_text: `Seed ${flow} message (${a.client_name})`,
    created_at: new Date(new Date(a.starts_at).getTime() - 2 * DAY).toISOString(),
  }).select("id").single());
  await must(db.from("attributions").insert({
    shop_id: shopId, appointment_id: a.id, autopilot_event_id: ev.id, flow_key: flow, value_cents: Math.round(Number(a.price) * 100),
    status: "completed", completed_at: a.starts_at,
  }));
}

console.log(JSON.stringify({ ok: true, shopId, handle, owner: email, appointments: inserted.length, attributed: won.length }, null, 2));
console.log(`\nE2E: E2E_SHOP_HANDLE=${handle} E2E_OWNER_EMAIL=${email} E2E_OWNER_PASSWORD=... npm run e2e`);
