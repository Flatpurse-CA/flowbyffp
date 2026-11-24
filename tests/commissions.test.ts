import { describe, expect, it } from "vitest";
import { commissionFor, payPeriodReport, type CommissionStaff, type CommissionAppt, type CommissionRules } from "@/lib/commissions";

const staff = (o: Partial<CommissionStaff> = {}): CommissionStaff => ({ id: "s1", full_name: "Sam", commission_type: "percent", commission_pct: null, commission_flat: null, rent_amount: null, rent_period: null, ...o });
const appt = (o: Partial<CommissionAppt> = {}): CommissionAppt => ({ staff_id: "s1", service_name: "Colour", status: "completed", price: 100, refunded_amount: 0, tip_amount: 20, fee_amount: null, fee_charged_at: null, ...o });
const rules: CommissionRules = { servicePct: new Map([["colour", 40], ["cut", 50]]), shopDefaultPct: 30, onFees: false };

describe("commissions", () => {
  it("uses the service % and ignores tips and tax", () => {
    expect(commissionFor(staff(), appt(), rules).commission).toBe(40);
  });
  it("staff override beats the service %", () => {
    expect(commissionFor(staff({ commission_pct: 55 }), appt(), rules).commission).toBe(55);
  });
  it("falls back to the shop default", () => {
    expect(commissionFor(staff(), appt({ service_name: "Blowout" }), rules).commission).toBe(30);
  });
  it("refunds reverse the commission", () => {
    expect(commissionFor(staff(), appt({ refunded_amount: 50 }), rules).commission).toBe(20);
  });
  it("no-show fees stay with the business unless the owner splits them", () => {
    const ns = appt({ status: "no_show", fee_amount: 40, fee_charged_at: "2026-11-20" });
    expect(commissionFor(staff(), ns, rules).commission).toBe(0);
    expect(commissionFor(staff(), ns, { ...rules, onFees: true }).commission).toBe(16);
  });
  it("flat, none and renter types", () => {
    expect(commissionFor(staff({ commission_type: "flat", commission_flat: 15 }), appt(), rules).commission).toBe(15);
    expect(commissionFor(staff({ commission_type: "none" }), appt(), rules).commission).toBe(0);
    const [row] = payPeriodReport([staff({ commission_type: "renter", rent_amount: 700, rent_period: "week" })], [appt()], rules, 14);
    expect(row).toMatchObject({ commission: 0, tips: 20, totalOwed: 20, rent: 1400 });
  });
  it("report totals: commission + tips", () => {
    const [row] = payPeriodReport([staff()], [appt(), appt({ service_name: "Cut", price: 60, tip_amount: 0 }), appt({ status: "cancelled" })], rules, 14);
    expect(row).toMatchObject({ services: 2, sales: 160, commission: 70, tips: 20, totalOwed: 90 });
  });
});
