import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STATUS_BG: Record<string, string> = { sent: "rgb(22,163,74)", failed: "rgb(220,38,38)", queued: "rgb(37,99,235)", skipped: "rgb(107,114,128)" };
const cell: React.CSSProperties = { padding: "8px 10px", borderTop: "1px solid var(--aw07)", fontSize: 12.5, color: "var(--atext2)", verticalAlign: "top" };

/** FL-005 / Spec 17 "Messages": every email and text Flow sent, to whom, and how it went. */
export default async function MessageLogPage({ searchParams }: { searchParams: Promise<{ status?: string; channel?: string; q?: string }> }) {
  await requireAdmin();
  const { status, channel, q } = await searchParams;
  const admin = createAdminClient();
  let query = admin.from("message_log").select("id, shop_id, channel, audience, kind, recipient, subject, status, error, created_at, shops(name)").order("created_at", { ascending: false }).limit(300);
  if (status) query = query.eq("status", status);
  if (channel) query = query.eq("channel", channel);
  if (q) query = query.ilike("recipient", `%${q.replace(/[%_,()]/g, "")}%`);
  const [{ data }, queued] = await Promise.all([
    query,
    admin.from("scheduled_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const input: React.CSSProperties = { height: 32, borderRadius: 9, border: "1px solid var(--aw08)", background: "var(--asurface1)", color: "var(--atext2)", padding: "0 10px", fontSize: 12.5, fontFamily: "inherit" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ color: "var(--atext)", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Message log</h1>
        <p style={{ color: "var(--aw45)", fontSize: 13, margin: 0 }}>Every email and text Flow sent, latest 300. {queued.count ?? 0} scheduled jobs waiting (texts held for quiet hours and other delayed work).</p>
      </div>
      <form style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Recipient contains" style={input} />
        <select name="channel" defaultValue={channel ?? ""} style={input}><option value="">All channels</option><option value="email">Email</option><option value="sms">SMS</option></select>
        <select name="status" defaultValue={status ?? ""} style={input}><option value="">All statuses</option>{Object.keys(STATUS_BG).map(s => <option key={s} value={s}>{s}</option>)}</select>
        <button type="submit" style={{ ...input, cursor: "pointer", fontWeight: 600 }}>Filter</button>
      </form>
      <div style={{ overflowX: "auto", background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead><tr>{["When", "Shop", "Channel", "To", "What", "Status"].map(h => <th key={h} style={{ ...cell, borderTop: "none", textAlign: "left", color: "var(--aw35)", fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
          <tbody>
            {(data ?? []).length === 0 && <tr><td colSpan={6} style={cell}>Nothing logged yet.</td></tr>}
            {(data ?? []).map(m => {
              const shop = (Array.isArray(m.shops) ? m.shops[0] : m.shops) as { name: string } | null;
              return (
                <tr key={m.id as number}>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>{new Date(m.created_at as string).toLocaleString("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
                  <td style={cell}>{shop?.name ?? "Flow"}</td>
                  <td style={cell}>{m.channel as string} · {m.audience as string}</td>
                  <td style={{ ...cell, overflowWrap: "anywhere" }}>{m.recipient as string}</td>
                  <td style={cell}>{(m.kind as string) ?? ""}{m.kind && m.subject ? ": " : ""}{(m.subject as string) ?? ""}{m.error ? <div style={{ color: "#f87171" }}>{m.error as string}</div> : null}</td>
                  <td style={cell}><span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, color: "white", background: STATUS_BG[m.status as string] ?? "gray" }}>{m.status as string}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
