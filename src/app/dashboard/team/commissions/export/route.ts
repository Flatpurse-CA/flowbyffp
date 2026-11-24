import { NextRequest, NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { reportCsv } from "@/lib/commissions";
import { loadCommissionData, periodOf } from "../data";

/** Pay-period CSV for payroll or the bookkeeper. Owner only. */
export async function GET(req: NextRequest) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = Object.fromEntries(req.nextUrl.searchParams) as { from?: string; to?: string };
  const { from, to, days } = periodOf(sp);
  const { rows } = await loadCommissionData(ctx.shopId, from, to, days);
  return new NextResponse(reportCsv(rows, from, to), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="flow-commissions-${from}-to-${to}.csv"` },
  });
}
