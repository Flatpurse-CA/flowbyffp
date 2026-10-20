import Link from "next/link";
import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";
import { pgrstQuote } from "@/lib/postgrest";
import { keyFor } from "@/lib/dashboard/clients";
import { LocalDateTime } from "./LocalDateTime";
import type { AppointmentRow, AppointmentStatus } from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Every booking the shop has ever had, including history imported from
// another platform. Paged in the database so it works at any size; the
// calendar view only loads a few weeks around today.
const PAGE_SIZE = 50;

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed", pending: "Pending", deposit: "Deposit paid",
  completed: "Completed", cancelled: "Cancelled", no_show: "No-show",
};
const STATUS_BG: Record<AppointmentStatus, string> = {
  confirmed: "rgb(37,99,235)", pending: "rgb(217,119,6)", deposit: "rgb(124,58,237)",
  completed: "rgb(22,163,74)", cancelled: "rgb(107,114,128)", no_show: "rgb(220,38,38)",
};

const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16 };
const input: React.CSSProperties = { background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, color: "var(--dtext)", fontSize: 13, padding: "9px 12px" };

type Search = { q?: string; status?: string; from?: string; to?: string; page?: string };

export default async function BookingHistoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = sp.status && sp.status in STATUS_LABEL ? (sp.status as AppointmentStatus) : "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from! : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to ?? "") ? sp.to! : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const ctx = await getShopContext();
  let rows: AppointmentRow[] = [];
  let total = 0;
  if (ctx) {
    const supabase = await createClient();
    let query = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .eq("shop_id", ctx.shopId)
      .order("starts_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (status) query = query.eq("status", status);
    if (from) query = query.gte("starts_at", new Date(`${from}T00:00:00`).toISOString());
    if (to) query = query.lt("starts_at", new Date(new Date(`${to}T00:00:00`).getTime() + 86_400_000).toISOString());
    if (q) {
      const like = pgrstQuote(`%${q.replace(/[%_]/g, "")}%`);
      query = query.or(["client_name", "client_email", "client_phone", "service_name", "stylist_name"].map(c => `${c}.ilike.${like}`).join(","));
    }
    const { data, count } = await query;
    rows = (data ?? []) as AppointmentRow[];
    total = count ?? 0;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/dashboard/appointments/history${s ? `?${s}` : ""}`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Booking history</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>{total.toLocaleString()} booking{total === 1 ? "" : "s"}{q || status || from || to ? " match" : " in total"}</p>
      </div>

      <form method="get" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input name="q" defaultValue={q} placeholder="Search client, service or staff" style={{ ...input, flex: "1 1 220px", minWidth: 0 }} />
        <select name="status" defaultValue={status} style={input}>
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as AppointmentStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <input type="date" name="from" defaultValue={from} aria-label="From" style={input} />
        <input type="date" name="to" defaultValue={to} aria-label="To" style={input} />
        <button type="submit" style={{ padding: "9px 18px", borderRadius: 10, background: "rgb(109,40,217)", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Search</button>
        {(q || status || from || to) && (
          <Link href="/dashboard/appointments/history" style={{ alignSelf: "center", color: "var(--dpurple-text)", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>Clear</Link>
        )}
      </form>

      <div style={{ ...card, overflow: "hidden" }}>
        {rows.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--dw25)", fontSize: 13 }}>No bookings found</div>
        ) : rows.map((a, i) => {
          return (
            <Link
              key={a.id}
              href={`/dashboard/clients/${encodeURIComponent(keyFor(a))}`}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", textDecoration: "none", borderTop: i ? "1px solid var(--dw05)" : "none", flexWrap: "wrap" }}
            >
              <div style={{ width: 110, flexShrink: 0 }}>
                <LocalDateTime iso={a.starts_at} />
              </div>
              <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                <div style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.client_name}</div>
                <div style={{ color: "var(--dw35)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.service_name}{a.stylist_name ? ` with ${a.stylist_name}` : ""}
                </div>
              </div>
              <div style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600 }}>C${Number(a.price).toFixed(2)}</div>
              <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "white", background: STATUS_BG[a.status] ?? "rgb(107,114,128)" }}>
                {STATUS_LABEL[a.status] ?? a.status}
              </span>
            </Link>
          );
        })}
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 13 }}>
          {page > 1
            ? <Link href={hrefFor(page - 1)} style={{ color: "var(--dpurple-text)", fontWeight: 600, textDecoration: "none" }}>Newer</Link>
            : <span style={{ color: "var(--dw25)" }}>Newer</span>}
          <span style={{ color: "var(--dw35)" }}>Page {page} of {pages.toLocaleString()}</span>
          {page < pages
            ? <Link href={hrefFor(page + 1)} style={{ color: "var(--dpurple-text)", fontWeight: 600, textDecoration: "none" }}>Older</Link>
            : <span style={{ color: "var(--dw25)" }}>Older</span>}
        </div>
      )}
    </div>
  );
}
