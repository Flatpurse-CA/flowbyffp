import { NextResponse } from "next/server";
import { logShopAction } from "@/lib/audit";
import { requireTwoStep } from "@/lib/auth/twoStep";
import { zipSync, strToU8 } from "fflate";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    // Neutralise spreadsheet formulas and quote everything.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
}

/** Owner data export (FL-068/069): ZIP of CSVs. */
export async function GET() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return NextResponse.json({ error: "Only the owner can export data" }, { status: 403 });
  const twoStep = await requireTwoStep();
  if (twoStep) return NextResponse.json({ error: twoStep }, { status: 403 });
  await logShopAction("data_export");
  const admin = createAdminClient();
  const tables = ["clients", "appointments", "services", "staff"] as const;
  const files: Record<string, Uint8Array> = {};
  for (const t of tables) {
    const { data } = await admin.from(t).select("*").eq("shop_id", ctx.shopId).limit(50000);
    files[`${t}.csv`] = strToU8(toCsv((data ?? []) as Record<string, unknown>[]));
  }
  const zip = zipSync(files);
  return new NextResponse(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="flow-export-${new Date().toISOString().slice(0, 10)}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
