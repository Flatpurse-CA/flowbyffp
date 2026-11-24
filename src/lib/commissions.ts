/**
 * FL-088 commissions. Pure maths so it is testable and shared by the report page
 * and the CSV export. Base = service price after discounts, before tax, less any
 * refund (refunds reverse the commission). Tips are separate and 100% the staff's.
 */
export type CommissionStaff = {
  id: string; full_name: string; commission_type: "percent" | "flat" | "none" | "renter";
  commission_pct: number | null; commission_flat: number | null; rent_amount: number | null; rent_period: "week" | "month" | null;
};
export type CommissionAppt = {
  staff_id: string | null; service_name: string; status: string; price: number | null;
  refunded_amount: number | null; tip_amount: number | null; fee_amount: number | null; fee_charged_at: string | null;
};
export type CommissionRules = { servicePct: Map<string, number>; shopDefaultPct: number; onFees: boolean };
export type CommissionRow = {
  staffId: string; name: string; type: CommissionStaff["commission_type"];
  services: number; sales: number; commission: number; fees: number; tips: number; rent: number; totalOwed: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Rate for one service: the staff member's own % wins, then the service's %, then the shop default. */
export function ratePct(staff: CommissionStaff, serviceName: string, rules: CommissionRules): number {
  if (staff.commission_type !== "percent") return 0;
  return staff.commission_pct ?? rules.servicePct.get(serviceName.toLowerCase()) ?? rules.shopDefaultPct;
}

export function commissionFor(staff: CommissionStaff, a: CommissionAppt, rules: CommissionRules): { sale: number; commission: number; fee: number } {
  const fee = a.fee_charged_at ? Number(a.fee_amount ?? 0) : 0;
  const feeShare = rules.onFees && staff.commission_type === "percent" ? fee * ratePct(staff, a.service_name, rules) / 100 : 0;
  if (a.status !== "completed") return { sale: 0, commission: r2(feeShare), fee };
  const sale = Math.max(0, Number(a.price ?? 0) - Number(a.refunded_amount ?? 0));
  let commission = 0;
  if (staff.commission_type === "percent") commission = sale * ratePct(staff, a.service_name, rules) / 100;
  else if (staff.commission_type === "flat") commission = sale > 0 ? Number(staff.commission_flat ?? 0) : 0;
  return { sale: r2(sale), commission: r2(commission + feeShare), fee };
}

/** Pay-period report: one row per staff member. Rent is shown for booth renters, prorated to the period. */
export function payPeriodReport(staff: CommissionStaff[], appts: CommissionAppt[], rules: CommissionRules, periodDays: number): CommissionRow[] {
  return staff.map((s) => {
    const mine = appts.filter((a) => a.staff_id === s.id);
    let services = 0, sales = 0, commission = 0, fees = 0, tips = 0;
    for (const a of mine) {
      const c = commissionFor(s, a, rules);
      if (a.status === "completed") { services++; tips += Number(a.tip_amount ?? 0); }
      sales += c.sale; commission += c.commission; fees += c.fee;
    }
    const rent = s.commission_type === "renter" && s.rent_amount
      ? s.rent_amount * periodDays / (s.rent_period === "week" ? 7 : 30.4375) : 0;
    return {
      staffId: s.id, name: s.full_name, type: s.commission_type, services,
      sales: r2(sales), commission: r2(commission), fees: r2(fees), tips: r2(tips), rent: r2(rent),
      totalOwed: r2(commission + tips),
    };
  });
}

export function reportCsv(rows: CommissionRow[], from: string, to: string): string {
  const cell = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const head = ["Staff", "Type", "Services", "Sales (before tax)", "Commission", "Tips", "Total owed", "Booth rent due", "Period"];
  const lines = rows.map((r) => [r.name, r.type, r.services, r.sales.toFixed(2), r.commission.toFixed(2), r.tips.toFixed(2), r.totalOwed.toFixed(2), r.rent.toFixed(2), `${from} to ${to}`]);
  return [head, ...lines].map((l) => l.map(cell).join(",")).join("\n");
}
