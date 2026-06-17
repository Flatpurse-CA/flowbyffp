import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyForm } from "./VerifyForm";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; preview?: string }>;
}) {
  const cookieStore = await cookies();
  const { error, preview } = await searchParams;
  const email = cookieStore.get("onboarding_email")?.value || preview;
  if (!email) redirect("/signup");

  return <VerifyForm email={email} initialError={error} />;
}
