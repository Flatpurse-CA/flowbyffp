import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { logFeatureUsage } from "@/lib/featureUsage";
import { getAutopilotState } from "./actions";
import { AutoPilotClient } from "./AutoPilotClient";
import { shopHasFeature } from "@/lib/dashboard/plan";
import PlanUpsell from "@/components/PlanUpsell";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AutoPilotPage() {
  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext2)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet. Complete onboarding to unlock AutoPilot.
        </p>
      </div>
    );
  }

  if (ctx.role !== "owner") redirect("/dashboard");

  if (ctx.accessStatus === "grace" || ctx.accessStatus === "inactive") {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext2)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          AutoPilot is paused
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          Your trial ended, so no-show recovery, win-backs and the AI Front Desk are paused. Add a card to turn them back on.
        </p>
      </div>
    );
  }

  if (!(await shopHasFeature(ctx.shopId, "autopilot"))) {
    return <PlanUpsell feature="AutoPilot" plan="Pro+" body="Upgrade to Pro+ for No-Show Recovery, the Last-Minute Slot Filler, 30-day win-backs and birthday offers, running on their own." />;
  }

  await logFeatureUsage("autopilot_viewed", ctx.shopId);

  const state = await getAutopilotState();
  return <AutoPilotClient state={state} />;
}
