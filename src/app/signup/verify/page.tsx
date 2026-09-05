import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifyForm } from "./VerifyForm";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; preview?: string }>;
}) {
  const cookieStore = await cookies();
  const { error, preview } = await searchParams;
  const email = cookieStore.get("onboarding_email")?.value || preview;
  if (!email) {
    // verifyCode() (./actions.ts) deletes the onboarding_email cookie on a
    // successful verify, and Next.js re-renders this route's server
    // components in that same Server Action round-trip — before the client's
    // success animation gets to navigate to /onboarding. Without this check,
    // that race sends an already-verified user back to a blank signup form.
    // A live session here means verification just succeeded, not that the
    // cookie was never set.
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/onboarding");
    redirect("/signup");
  }

  return <VerifyForm email={email} initialError={error} />;
}
