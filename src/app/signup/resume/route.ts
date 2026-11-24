import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/signedLink";
import { createAdminClient } from "@/lib/supabase/admin";

/** E0b "Finish signing up": restores the pending signup and lands on the verify step to send a fresh code. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const userId = verifyToken(req.nextUrl.searchParams.get("t") ?? "");
  if (!userId) return NextResponse.redirect(`${origin}/login`);
  const { data } = await createAdminClient().auth.admin.getUserById(userId);
  const user = data?.user;
  if (!user?.email) return NextResponse.redirect(`${origin}/login`);
  if (user.email_confirmed_at) return NextResponse.redirect(`${origin}/login`);
  const res = NextResponse.redirect(`${origin}/signup/verify`);
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 60 * 30 };
  res.cookies.set("onboarding_user_id", user.id, opts);
  res.cookies.set("onboarding_email", user.email, opts);
  return res;
}
