"use server";

import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { createPlanCheckout } from "@/lib/billing/trialCheckout";
import type { BillablePlanKey, BillingInterval } from "@/lib/plans";

const BILLABLE: BillablePlanKey[] = ["starter", "pro", "pro_plus"];

export async function startCardCheckout(formData: FormData) {
  const ctx = await getShopContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") redirect("/dashboard");

  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops").select("plan").eq("id", ctx.shopId).maybeSingle();
  const raw = (formData.get("plan") as string | null) ?? (shop?.plan as string | null) ?? "pro";
  const planKey = (BILLABLE.includes(raw as BillablePlanKey) ? raw : "pro") as BillablePlanKey;
  const interval: BillingInterval = formData.get("interval") === "annual" ? "annual" : "monthly";

  const res = await createPlanCheckout({
    admin,
    shopId: ctx.shopId,
    planKey,
    interval,
    claimFounders: true,
    origin: await getRequestOrigin(),
    successPath: "/dashboard?trial=started",
    cancelPath: "/signup/card?cancelled=1",
  });
  if (res.error || !res.url) redirect(`/signup/card?error=${encodeURIComponent(res.error ?? "Couldn't open checkout")}`);
  redirect(res.url);
}
