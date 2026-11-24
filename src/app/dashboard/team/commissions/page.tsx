import Link from "next/link";
import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { loadCommissionData, periodOf } from "./data";
import { saveCommissionSettings } from "./actions";

export const dynamic = "force-dynamic";

const money = (n: number) => `$${n.toFixed(2)}`;
const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 16 };
const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", color: "var(--dw45)", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "8px 10px", borderTop: "1px solid var(--dsurface3)", color: "var(--dtext)", fontSize: 13.5 };
const input: React.CSSProperties = { height: 32, borderRadius: 8, border: "1px solid var(--dsurface3)", background: "var(--dsurface2)", color: "var(--dtext)", padding: "0 8px", fontSize: 13, width: 84 };
const TYPE_LABEL = { percent: "% of service", flat: "Flat per service", none: "None (salaried)", renter: "Booth renter" } as const;

/** FL-088: commission settings + pay-period report. Flow reports; it does not run payroll. */
export default async function CommissionsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { from, to, days } = periodOf(await searchParams);
  const { shop, staff, services, rows } = await loadCommissionData(ctx.shopId, from, to, days);
  const totals = rows.reduce((t, r) => ({ sales: t.sales + r.sales, commission: t.commission + r.commission, tips: t.tips + r.tips, owed: t.owed + r.totalOwed }), { sales: 0, commission: 0, tips: 0, owed: 0 });

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>Commissions</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13, margin: 0 }}>Worked out on the service price after discounts, before tax. Refunds reverse the commission. Tips always go 100% to the staff member.</p>
      </div>

      <div style={card}>
        <form style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: "var(--dtext)", fontWeight: 700, fontSize: 14, marginRight: 6 }}>Pay period</span>
          <input type="date" name="from" defaultValue={from} style={{ ...input, width: 150 }} />
          <span style={{ color: "var(--dw45)" }}>to</span>
          <input type="date" name="to" defaultValue={to} style={{ ...input, width: 150 }} />
          <button type="submit" style={{ ...input, width: "auto", cursor: "pointer", fontWeight: 600 }}>Show</button>
          <a href={`/dashboard/team/commissions/export?from=${from}&to=${to}`} style={{ marginLeft: "auto", color: "rgb(109,40,217)", fontWeight: 600, fontSize: 13 }}>Export CSV</a>
        </form>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead><tr>{["Staff", "Services", "Sales", "Commission", "Tips", "Total owed", "Booth rent due"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td style={td} colSpan={7}>No active team members.</td></tr>}
              {rows.map((r) => (
                <tr key={r.staffId}>
                  <td style={td}>{r.name} <span style={{ color: "var(--dw45)", fontSize: 12 }}>{TYPE_LABEL[r.type]}</span></td>
                  <td style={td}>{r.services}</td><td style={td}>{money(r.sales)}</td><td style={td}>{money(r.commission)}</td>
                  <td style={td}>{money(r.tips)}</td><td style={{ ...td, fontWeight: 700 }}>{money(r.totalOwed)}</td><td style={td}>{r.rent ? money(r.rent) : "-"}</td>
                </tr>
              ))}
              {rows.length > 0 && (
                <tr><td style={{ ...td, fontWeight: 700 }}>Total</td><td style={td} /><td style={td}>{money(totals.sales)}</td><td style={td}>{money(totals.commission)}</td><td style={td}>{money(totals.tips)}</td><td style={{ ...td, fontWeight: 700 }}>{money(totals.owed)}</td><td style={td} /></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form action={saveCommissionSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={card}>
          <p style={{ color: "var(--dtext)", fontWeight: 700, fontSize: 14, margin: "0 0 10px" }}>Rules</p>
          <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--dtext)", fontSize: 13.5, marginBottom: 10 }}>
            Default commission <input name="default_pct" type="number" min={0} max={100} step="0.5" defaultValue={Number(shop?.default_commission_pct ?? 0)} style={input} /> %
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--dtext)", fontSize: 13.5 }}>
            <input type="checkbox" name="on_fees" defaultChecked={Boolean(shop?.commission_on_fees)} /> Split no-show and late-cancel fees by the same % (off: the business keeps them)
          </label>
        </div>

        <div style={card}>
          <p style={{ color: "var(--dtext)", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>Team</p>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "0 0 10px" }}>Leave the % blank to use each service&apos;s %. A % here overrides every service for that person.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead><tr>{["Staff", "Type", "Own %", "Flat $", "Booth rent"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td style={td}>{s.full_name}<input type="hidden" name="staff_id" value={s.id} /></td>
                    <td style={td}>
                      <select name={`type_${s.id}`} defaultValue={s.commission_type} style={{ ...input, width: 150 }}>
                        {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td style={td}><input name={`pct_${s.id}`} type="number" min={0} max={100} step="0.5" defaultValue={s.commission_pct ?? ""} style={input} /></td>
                    <td style={td}><input name={`flat_${s.id}`} type="number" min={0} step="0.01" defaultValue={s.commission_flat ?? ""} style={input} /></td>
                    <td style={td}>
                      <input name={`rent_${s.id}`} type="number" min={0} step="0.01" defaultValue={s.rent_amount ?? ""} style={input} />{" "}
                      <select name={`rentp_${s.id}`} defaultValue={s.rent_period ?? "week"} style={{ ...input, width: 90 }}><option value="week">/ week</option><option value="month">/ month</option></select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={card}>
          <p style={{ color: "var(--dtext)", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>Services</p>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "0 0 10px" }}>Commission % per service, e.g. colour 40%, cuts 50%. Blank uses the default.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
            {services.map((s) => (
              <label key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, color: "var(--dtext)", fontSize: 13.5 }}>
                {s.name}<input type="hidden" name="service_id" value={s.id} />
                <span><input name={`svc_${s.id}`} type="number" min={0} max={100} step="0.5" defaultValue={s.commission_pct ?? ""} style={input} /> %</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={{ alignSelf: "flex-start", height: 40, padding: "0 18px", borderRadius: 10, border: "none", background: "rgb(109,40,217)", color: "white", fontWeight: 700, cursor: "pointer" }}>Save commission settings</button>
      </form>
      <Link href="/dashboard/team" style={{ color: "var(--dw45)", fontSize: 13 }}>Back to Team</Link>
    </div>
  );
}
