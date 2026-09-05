import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./OnboardingFlow";

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
    return <OnboardingFlow displayName={displayName} />;
  }

  return <OnboardingFlow displayName="Nnamdi" />;
}
