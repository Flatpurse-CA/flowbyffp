import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./OnboardingFlow";
import { createAdminClient } from "@/lib/supabase/admin";
import { needsCard } from "@/lib/billing/cardGate";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;

  if (!preview) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) redirect("/login");

    const { data: profile } = await supabase.from("profiles").select("first_name").eq("id", data.user.id).maybeSingle();
    let displayName = profile?.first_name as string | undefined;
    if (!displayName) {
      const raw = (data.user.email ?? "").split("@")[0];
      displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    const { data: shop } = await createAdminClient().from("shops")
      .select("created_at, subscription_status, trial_override, plan").eq("owner_id", data.user.id).maybeSingle();
    return <OnboardingFlow displayName={displayName} needsCard={Boolean(shop && needsCard(shop))} />;
  }

  return <OnboardingFlow displayName="Nnamdi" />;
}
