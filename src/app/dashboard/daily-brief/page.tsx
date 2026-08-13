import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { logFeatureUsage } from "@/lib/featureUsage";
import { getDailyBriefData } from "./actions";
import { DailyBriefClient } from "./DailyBriefClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DailyBriefPage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext2)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet. Complete onboarding to unlock your Daily Brief.
        </p>
      </div>
    );
  }

  await logFeatureUsage("daily_brief_viewed", ctx.shopId);
  const data = await getDailyBriefData();

  return <DailyBriefClient data={data} />;
}
