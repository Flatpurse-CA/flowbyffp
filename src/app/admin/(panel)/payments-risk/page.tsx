import { createAdminClient } from "@/lib/supabase/admin";
import { ShieldAlert } from "lucide-react";
import { formatCAD } from "@/lib/plans";

type DisputeRow = {
  id: string;
  shop_id: string | null;
  stripe_dispute_id: string;
  amount: number;
  currency: string;
  reason: string | null;
  status: string;
  is_platform: boolean;
  created_at: string;
  shops: { name: string } | { name: string }[] | null;
};

function shopNameFrom(row: DisputeRow): string {
  if (row.is_platform) return "FlatPurse (subscription)";
  const s = row.shops;
  if (!s) return "Unknown shop";
  return Array.isArray(s) ? (s[0]?.name ?? "Unknown shop") : s.name;
}

function statusColor(status: string) {
  if (status === "won") return "rgb(52,211,153)";
  if (status === "lost") return "rgb(248,113,113)";
  return "rgb(251,191,36)";
}

const card: React.CSSProperties = {
  background: "var(--am1)",
  border: "1px solid var(--aw09)",
  borderRadius: 18,
};

export default async function AdminPaymentsRiskPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("disputes")
    .select("id, shop_id, stripe_dispute_id, amount, currency, reason, status, is_platform, created_at, shops(name)")
    .order("created_at", { ascending: false });

  const disputes = (data ?? []) as unknown as DisputeRow[];
  const openDisputes = disputes.filter(d => d.status !== "won" && d.status !== "lost");
  const totalAtRisk = openDisputes.reduce((s, d) => s + Number(d.amount), 0);
  const lostAmount = disputes.filter(d => d.status === "lost").reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Payments Risk</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>
          Disputes and chargebacks across platform subscriptions and shop payouts. Populated by the Stripe dispute webhook once Stripe is connected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          { label: "Open disputes", value: String(openDisputes.length), sub: "Awaiting resolution" },
          { label: "Amount at risk", value: formatCAD(totalAtRisk), sub: "Across open disputes" },
          { label: "Lost to date", value: formatCAD(lostAmount), sub: "Disputes ruled against us" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "20px 22px" }}>
            <p style={{ color: "var(--aw45)", fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>{s.label}</p>
            <p style={{ color: "var(--atext2)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>{s.value}</p>
            <p style={{ color: "var(--aw25)", fontSize: 12, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {disputes.length === 0 ? (
        <div style={{ ...card, minHeight: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--aw04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={22} color="var(--aw2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "var(--aw3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No disputes yet</p>
          <p style={{ color: "var(--aw18)", fontSize: 12, margin: 0 }}>Real disputes will appear here once Stripe is connected</p>
        </div>
      ) : (
        <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--aw015)" }}>
                {["Source", "Amount", "Reason", "Status", "Opened"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "var(--aw3)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid var(--aw06)", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {disputes.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < disputes.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                  <td style={{ padding: "13px 18px", color: "var(--atext2)", fontSize: 13, fontWeight: 600 }}>{shopNameFrom(d)}</td>
                  <td style={{ padding: "13px 18px", color: "var(--aw6)", fontSize: 13, fontWeight: 600 }}>{formatCAD(Number(d.amount))}</td>
                  <td style={{ padding: "13px 18px", color: "var(--aw4)", fontSize: 12.5 }}>{d.reason ?? "-"}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                      textTransform: "capitalize", color: statusColor(d.status), background: `${statusColor(d.status)}1A`,
                    }}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", color: "var(--aw3)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(d.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
