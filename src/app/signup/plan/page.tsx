import { redirect } from "next/navigation";
import { getOnboardingContext } from "@/lib/onboarding";
import { OnboardingShell } from "@/components/OnboardingShell";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlanForm } from "./PlanForm";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; preview?: string }>;
}) {
  const { error, preview } = await searchParams;
  const ctx = await getOnboardingContext();
  if (!ctx && !preview) redirect("/signup");

  const admin = createAdminClient();
  const { data: founders } = await admin.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle();

  return (
    <OnboardingShell>
      <PlanForm error={error} foundersSpotsRemaining={founders?.spots_remaining ?? 0} />
    </OnboardingShell>
  );
}
