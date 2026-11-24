import { NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const csv = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
const money = (c: number) => (c / 100).toFixed(2);

/**
 * FL-039: payout report straight from Stripe balance transactions on the shop's
 * connected account, so totals reconcile to the payout to the cent.
 * ?days=30 (default) or ?payout=po_... for one payout.
 */
export async function GET(req: Request) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const { data: shop } = await createAdminClient().from("shops").select("stripe_account_id").eq("id", ctx.shopId).maybeSingle();
  if (!shop?.stripe_account_id) return NextResponse.json({ error: "Connect Stripe first" }, { status: 400 });
  const url = new URL(req.url);
  const payout = url.searchParams.get("payout");
  const days = Math.min(366, Math.max(1, Number(url.searchParams.get("days") ?? 30)));
  const params = payout && /^po_[A-Za-z0-9]+$/.test(payout)
    ? { payout, limit: 100 as const }
    : { created: { gte: Math.floor(Date.now() / 1000) - days * 86400 }, limit: 100 as const };

  const rows: string[] = ["date,type,description,gross,fee,net,source,payout_status"];
  let gross = 0, fee = 0, net = 0;
  for await (const t of stripe().balanceTransactions.list(params, { stripeAccount: shop.stripe_account_id as string })) {
    gross += t.amount; fee += t.fee; net += t.net;
    rows.push([new Date(t.created * 1000).toISOString().slice(0, 10), t.reporting_category, t.description, money(t.amount), money(t.fee), money(t.net), typeof t.source === "string" ? t.source : t.source?.id, t.status].map(csv).join(","));
  }
  rows.push(["", "TOTAL", "", money(gross), money(fee), money(net), "", ""].join(","));
  return new NextResponse(rows.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="flow-payout-report-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
