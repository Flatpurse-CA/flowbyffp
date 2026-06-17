import { redirect } from "next/navigation";
import { getOnboardingContext } from "@/lib/onboarding";
import { OnboardingShell } from "@/components/OnboardingShell";
import { PlanForm } from "./PlanForm";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; preview?: string }>;
}) {
  const { error, preview } = await searchParams;
  const ctx = await getOnboardingContext();
  if (!ctx && !preview) redirect("/signup");

  return (
    <OnboardingShell>
      <PlanForm error={error} />
    </OnboardingShell>
  );
}
