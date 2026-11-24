import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetupChecklist } from "@/lib/dashboard/setupChecklist";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import { formatCAD, planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

const SESSION_MS = 60 * 60 * 1000;
const card: React.CSSProperties = { background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, padding: "18px 20px" };
const title: React.CSSProperties = { color: "var(--aw35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--aw07)", fontSize: 13, color: "var(--atext2)" };
const muted: React.CSSProperties = { color: "var(--aw45)", fontSize: 12.5 };
const when = (s: string) => new Date(s).toLocaleString("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** FL-079: read-only snapshot of what the owner sees. Needs a logged support session from the last hour. */
export default async function ViewAsOwnerPage({ params, searchParams }: { params: Promise<{ shopId: string }>; searchParams: Promise<{ s?: string }> }) {
  const { email } = await requireAdmin();
  const { shopId } = await params;
  const { s } = await searchParams;
  const admin = createAdminClient();

  const { data: session } = s
    ? await admin.from("admin_audit_log").select("admin_email, target_id, details, created_at").eq("id", s).eq("action", "view_as_owner").maybeSingle()
    : { data: null };
  const valid = session && session.admin_email === email && session.target_id === shopId && Date.now() - new Date(session.created_at as string).getTime() < SESSION_MS;
  if (!valid) redirect("/admin/shops");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: shop } = await admin.from("shops").select("*").eq("id", shopId).maybeSingle();
  if (!shop) notFound();

  const [setup, upcoming, services, staff, clients, events, recovered] = await Promise.all([
    getSetupChecklist(shopId, (shop.handle as string | null) ?? null),
    admin.from("appointments").select("*").eq("shop_id", shopId).gte("starts_at", now.toISOString()).order("starts_at").limit(15),
    admin.from("services").select("id, name, price, duration_minutes, active").eq("shop_id", shopId).order("name"),
    admin.from("staff").select("id, full_name, role, active, invite_status").eq("shop_id", shopId),
    admin.from("clients").select("id", { count: "exact", head: true }).eq("shop_id", shopId),
    admin.from("autopilot_events").select("id, flow_key, event_text, client_name, channel, outcome, amount, created_at").eq("shop_id", shopId).order("created_at", { ascending: false }).limit(20),
    admin.from("autopilot_events").select("amount").eq("shop_id", shopId).eq("outcome", "booked").gte("created_at", monthStart),
  ]);
  const access = shop.trial_started_at ? computeAccessStatus(shop as never).status : null;
  const recoveredTotal = (recovered.data ?? []).reduce((t, r) => t + Number(r.amount ?? 0), 0);
  const reason = (session!.details as { reason?: string } | null)?.reason ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...card, background: "rgb(109,40,217)", border: "none", color: "white", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Eye size={18} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Viewing {shop.name as string} as the owner. Read-only.</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5 }}>Reason: {reason}. Logged and shown in the owner&apos;s activity log. Session ends after 1 hour.</p>
        </div>
        <Link href="/admin/shops" style={{ color: "white", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}><ArrowLeft size={14} /> Exit</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {[
          ["Plan", planLabel(shop.plan as string)],
          ["Billing", (shop.subscription_status as string | null)?.replace(/_/g, " ") ?? access ?? "-"],
          ["Payouts", shop.stripe_connected ? "Connected" : "Not connected"],
          ["Clients", String(clients.count ?? 0)],
          ["Recovered this month", formatCAD(recoveredTotal)],
          ["Founders", (shop.founder_status as string | null) ?? "No"],
        ].map(([k, v]) => (
          <div key={k} style={card}><p style={title}>{k}</p><p style={{ margin: 0, color: "var(--atext)", fontWeight: 700, fontSize: 16 }}>{v}</p></div>
        ))}
      </div>

      <div style={card}>
        <p style={title}>Setup checklist ({setup.filter(i => i.done).length} of {setup.length})</p>
        {setup.map(i => <div key={i.key} style={row}><span>{i.title}</span><span style={muted}>{i.done ? "Done" : "Not yet"}</span></div>)}
      </div>

      <div style={card}>
        <p style={title}>Upcoming bookings</p>
        {(upcoming.data ?? []).length === 0 && <p style={muted}>None.</p>}
        {(upcoming.data ?? []).map(a => (
          <div key={a.id as string} style={row}>
            <span>{when(a.starts_at as string)} · {(a.client_name as string) ?? "Client"} · {(a.service_name as string) ?? ""}</span>
            <span style={muted}>{a.status as string} · {formatCAD(Number(a.price ?? 0))}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={card}>
          <p style={title}>Services</p>
          {(services.data ?? []).map(sv => <div key={sv.id as string} style={row}><span>{sv.name as string}{sv.active === false ? " (hidden)" : ""}</span><span style={muted}>{formatCAD(Number(sv.price ?? 0))} · {String(sv.duration_minutes ?? "-")} min</span></div>)}
        </div>
        <div style={card}>
          <p style={title}>Team</p>
          {(staff.data ?? []).map(st => <div key={st.id as string} style={row}><span>{st.full_name as string}</span><span style={muted}>{(st.role as string) ?? ""} · {st.active ? st.invite_status as string : "archived"}</span></div>)}
        </div>
      </div>

      <div style={card}>
        <p style={title}>AutoPilot messages (latest 20)</p>
        {(events.data ?? []).length === 0 && <p style={muted}>None.</p>}
        {(events.data ?? []).map(e => (
          <div key={e.id as string} style={row}>
            <span>{when(e.created_at as string)} · {(e.client_name as string) ?? ""} · {e.event_text as string}</span>
            <span style={muted}>{e.channel as string} · {e.outcome as string}{e.amount ? ` · ${formatCAD(Number(e.amount))}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
