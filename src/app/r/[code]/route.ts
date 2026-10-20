import { NextResponse } from "next/server";
import { REFERRAL_COOKIE } from "@/lib/referrals";

// Salon referral link: /r/<code>. Remembers the code for 30 days and sends
// the visitor to signup; setupShop() records it when the shop is created.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/signup", req.url));
  if (/^[A-Z0-9]{6,12}$/i.test(code)) {
    res.cookies.set(REFERRAL_COOKIE, code.toUpperCase(), { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  }
  return res;
}
