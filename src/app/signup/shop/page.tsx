import { redirect } from "next/navigation";
import { getOnboardingContext } from "@/lib/onboarding";
import { OnboardingShell } from "@/components/OnboardingShell";
import { ShopForm } from "./ShopForm";

export default async function ShopSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await getOnboardingContext();
  if (!ctx) redirect("/signup");
  const { error } = await searchParams;

  return (
    <OnboardingShell>
      <ShopForm error={error} />
    </OnboardingShell>
  );
}
