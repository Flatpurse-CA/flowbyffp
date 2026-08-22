import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { listPayments } from "./actions";
import { getShopContext } from "@/lib/dashboard/shop";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: "18px 20px",
};

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}

const STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
  completed: { fg: "rgb(52,211,153)", bg: "rgba(16,185,129,0.1)" },
  deposit:   { fg: "rgb(251,191,36)", bg: "rgba(245,158,11,0.1)" },
  confirmed: { fg: "rgb(96,165,250)", bg: "rgba(59,130,246,0.1)" },
  pending:   { fg: "var(--dw45)",     bg: "var(--dw06)" },
  cancelled: { fg: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)" },
};

export default async function PaymentsPage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 90);

  const payments = ctx ? await listPayments(rangeStart.toISOString(), now.toISOString()) : [];

  const totalCollected = payments.reduce((s, p) => s + (p.paidAmount ?? p.depositAmount ?? 0), 0);
  const totalTips = payments.reduce((s, p) => s + (p.tipAmount ?? 0), 0);
  const outstandingDeposits = payments.filter(p => p.status === "deposit").length;

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric" }).format(new Date(iso));

  return (
    <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Payments</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Transaction history from your last 90 days of bookings.</p>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ ...card, flex: "1 1 180px" }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 8px" }}>Collected</p>
          <p style={{ color: "var(--dtext)", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{fmtPrice(totalCollected)}</p>
        </div>
        <div style={{ ...card, flex: "1 1 180px" }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 8px" }}>Tips</p>
          <p style={{ color: "var(--dtext)", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{fmtPrice(totalTips)}</p>
        </div>
        <div style={{ ...card, flex: "1 1 180px" }}>
          <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 8px" }}>Outstanding deposits</p>
          <p style={{ color: "var(--dtext)", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{outstandingDeposits}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px" }}>
          <Wallet size={22} color="var(--dw25)" style={{ marginBottom: 10 }} />
          <p style={{ color: "var(--dw3)", fontSize: 13, margin: 0 }}>No payments recorded yet — they&apos;ll show up here once a booking is paid or deposited.</p>
        </div>
      ) : (
        <div style={{ background: "var(--dsurface1)", border: "1px solid var(--dw07)", borderRadius: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "var(--dsurface2)" }}>
                {["Client", "Service", "Date", "Method", "Status", "Amount"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--dw35)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--dw06)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const amount = p.paidAmount ?? p.depositAmount ?? 0;
                const statusColor = STATUS_COLOR[p.status] ?? STATUS_COLOR.pending;
                return (
                  <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? "1px solid var(--dw04)" : "none" }}>
                    <td style={{ padding: "12px 16px", color: "var(--dtext)", fontSize: 13, fontWeight: 600 }}>{p.clientName}</td>
                    <td style={{ padding: "12px 16px", color: "var(--dw55)", fontSize: 12.5 }}>{p.serviceName}</td>
                    <td style={{ padding: "12px 16px", color: "var(--dw35)", fontSize: 12 }}>{fmtDate(p.startsAt)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--dw45)", fontSize: 12.5, textTransform: "capitalize" }}>{p.paymentMethod ?? "-"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.03em", textTransform: "uppercase", color: statusColor.fg, background: statusColor.bg }}>
                        {p.status === "deposit" ? "Deposit" : p.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--dtext)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {fmtPrice(amount)}{p.tipAmount ? <span style={{ color: "var(--dw35)", fontWeight: 500 }}> + {fmtPrice(p.tipAmount)} tip</span> : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
