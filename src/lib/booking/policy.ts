export type FeeMode = "none" | "fixed" | "percent";
export type Policy = {
  deposit_mode: FeeMode; deposit_value: number; cancel_window_hours: number;
  late_cancel_fee_mode: FeeMode; late_cancel_fee_value: number; no_show_fee_mode: FeeMode; no_show_fee_value: number;
};
export const POLICY_COLUMNS = "deposit_mode, deposit_value, cancel_window_hours, late_cancel_fee_mode, late_cancel_fee_value, no_show_fee_mode, no_show_fee_value";

export const amountFor = (mode: FeeMode, value: number, price: number) =>
  mode === "none" ? 0 : mode === "fixed" ? Math.min(Number(value), price) : Math.ceil(price * Number(value)) / 100;

export const insideWindow = (startsAt: string, hours: number) => new Date(startsAt).getTime() - Date.now() < hours * 3_600_000;

export function policyText(p: Policy, price: number): string {
  const parts: string[] = [`Free to cancel or change up to ${p.cancel_window_hours} hours before.`];
  const late = amountFor(p.late_cancel_fee_mode, p.late_cancel_fee_value, price);
  const ns = amountFor(p.no_show_fee_mode, p.no_show_fee_value, price);
  if (late) parts.push(`Later cancellations: $${late.toFixed(2)} fee.`);
  if (ns) parts.push(`No-shows: $${ns.toFixed(2)} fee, charged only after staff confirm.`);
  return parts.join(" ");
}

export const newManageToken = () => crypto.randomUUID().replaceAll("-", "").slice(0, 24);

