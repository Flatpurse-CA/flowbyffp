// Shared by /admin/shops and /admin/users — all-time completed-appointment
// revenue per shop, so both pages show the same number instead of two
// independently-computed ones.
export function sumRevenueByShop(appointments: { shop_id: string | null; price: number }[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const a of appointments) {
    if (!a.shop_id) continue;
    totals[a.shop_id] = (totals[a.shop_id] ?? 0) + Number(a.price);
  }
  return totals;
}
