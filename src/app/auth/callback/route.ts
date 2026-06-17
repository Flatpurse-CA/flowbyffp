import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing authorization code")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "Sign-in failed")}`,
    );
  }

  const admin = createAdminClient();

  await admin.from("profiles").upsert({
    id: data.user.id,
    first_name:
      data.user.user_metadata.given_name ??
      data.user.user_metadata.full_name?.split(" ")[0] ??
      "",
    last_name:
      data.user.user_metadata.family_name ??
      data.user.user_metadata.full_name?.split(" ").slice(1).join(" ") ??
      "",
  });

  const { data: shop } = await admin
    .from("shops")
    .select("id")
    .eq("owner_id", data.user.id)
    .maybeSingle();

  if (!shop) {
    return NextResponse.redirect(`${origin}/signup/shop`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
