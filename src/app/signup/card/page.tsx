import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingShell } from "@/components/OnboardingShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getPlan, type PlanKey } from "@/lib/plans";
import { FOUNDERS_PRICES } from "@/lib/plans";
import { FOUNDERS_PLANS, remainingTrialDays } from "@/lib/billing/trialCheckout";
import { needsCard } from "@/lib/billing/cardGate";
import { startCardCheckout } from "./actions";

export const metadata = { title: { absolute: "Add your card, FlatPurse Flow" } };

const DAY_MS = 24 * 60 * 60 * 1000;

function formatChargeDate(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
}

export default async function CardPage({ searchParams }: { searchParams: Promise<{ error?: string; cancelled?: string }> }) {
  const { error, cancelled } = await searchParams;
  const ctx = await getShopContext();
  if (!ctx) redirect("/login");
  if (ctx.role !== "owner") redirect("/dashboard");

  const admin = createAdminClient();
  const [{ data: shop }, { data: founders }] = await Promise.all([
    admin.from("shops").select("plan, created_at, subscription_status, trial_override, trial_started_at, founder_discount_claimed_at, is_founder, founder_status").eq("id", ctx.shopId).maybeSingle(),
    admin.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle(),
  ]);
  if (!shop || !needsCard(shop)) redirect("/dashboard");

  const planKey = (["starter", "pro", "pro_plus"].includes(shop.plan as string) ? shop.plan : "pro") as PlanKey;
  const plan = getPlan(planKey);
  const list = plan.monthlyPrice ?? 0;
  const spots = founders?.spots_remaining ?? 0;
  const founder = FOUNDERS_PLANS.includes(planKey as "pro") && (Boolean(shop.is_founder || shop.founder_status) || spots > 0);
  const firstPrice = founder ? FOUNDERS_PRICES[planKey as "pro"].monthly : list;
  const days = remainingTrialDays(shop.trial_started_at as string | null);
  const chargeDate = formatChargeDate(days);

  const muted = { color: "var(--auth-text-sub)", fontSize: 14, lineHeight: 1.6, margin: 0 } as const;

  return (
    <OnboardingShell>
      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto", padding: "8px 24px 48px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ color: "var(--auth-text)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            Add your card to start your free trial
          </h1>
          <p style={muted}>
            Nothing is charged today. {days > 0 ? <>Your first charge is on <strong style={{ color: "var(--auth-text)" }}>{chargeDate}</strong>. Cancel any time before then and you pay nothing.</> : <>Your trial has ended, so your plan starts today.</>}
          </p>
        </div>

        <div style={{ border: "1px solid var(--auth-input-border, rgb(63,63,70))", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <span style={{ color: "var(--auth-text)", fontWeight: 700, fontSize: 16 }}>{plan.label}</span>
            <span style={{ color: "var(--auth-text)", fontWeight: 800, fontSize: 20, whiteSpace: "nowrap" }}>
              {founder && <s style={{ color: "var(--auth-text-sub)", fontWeight: 500, fontSize: 14, marginRight: 6 }}>C${list}</s>}
              C${firstPrice}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--auth-text-sub)" }}>/mo</span>
            </span>
          </div>
          {founder && <p style={{ ...muted, fontSize: 13 }}>Founders price, locked for life. {spots} of 40 spots left.</p>}
          <p style={{ ...muted, fontSize: 13 }}>Full Pro+ access during your trial. Prices in CAD, per location, plus applicable tax.</p>
        </div>

        {(error || cancelled) && (
          <p role="alert" style={{ ...muted, color: "#f87171" }}>{error ?? "Checkout was closed before your card was saved. Your trial starts once it is."}</p>
        )}

        <form action={startCardCheckout}>
          <input type="hidden" name="plan" value={planKey} />
          <SubmitButton
            pendingText="Opening secure checkout..."
            style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: "rgb(109,40,217)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
          >
            Add card and start trial
          </SubmitButton>
        </form>
        <p style={{ ...muted, fontSize: 12.5, textAlign: "center" }}>Card details are handled by Stripe. Flow never sees your full card number.</p>
      </div>
    </OnboardingShell>
  );
}
