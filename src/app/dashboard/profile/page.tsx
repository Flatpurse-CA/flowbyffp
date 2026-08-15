import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { PasswordForm } from "./PasswordForm";
import { KeyRound, ShieldCheck } from "lucide-react";

const card: React.CSSProperties = {
  background: "var(--dsurface1)",
  border: "1px solid var(--dw07)",
  borderRadius: 18,
  padding: "22px 24px",
};

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const ctx = await getShopContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();

  const email = user.email ?? "";
  let name: string;
  let roleLabel: string;

  if (ctx.role === "owner") {
    const meta = user.user_metadata as { first_name?: string; last_name?: string } | undefined;
    const username = email.split("@")[0];
    const fallback = username.charAt(0).toUpperCase() + username.slice(1);
    name = meta?.first_name ? `${meta.first_name} ${meta.last_name ?? ""}`.trim() : fallback;
    const { data: shop } = await supabase.from("shops").select("name").eq("id", ctx.shopId).maybeSingle();
    roleLabel = shop ? `Owner of ${shop.name}` : "Owner";
  } else {
    const { data: staff } = await supabase.from("staff").select("role").eq("id", ctx.staffId as string).maybeSingle();
    name = ctx.staffName ?? "Team member";
    roleLabel = (staff?.role as string | null) ?? "Team member";
  }

  const initial = name.charAt(0).toUpperCase();
  const joined = new Date(user.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Profile</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Your account</p>
      </div>

      {/* Account card */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(109,40,217,0.18)",
          border: "1px solid rgba(139,92,246,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "rgb(167,139,250)", flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <p style={{ color: "var(--dtext)", fontSize: 16, fontWeight: 700, margin: 0 }}>{name}</p>
            {ctx.role === "owner" && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                color: "rgb(251,191,36)", background: "rgba(245,158,11,0.1)",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                <ShieldCheck size={10} /> Owner
              </span>
            )}
          </div>
          <p style={{ color: "var(--dw42)", fontSize: 13, margin: "0 0 2px" }}>{email}</p>
          <p style={{ color: "var(--dw25)", fontSize: 12, margin: 0 }}>{roleLabel} · Member since {joined}</p>
        </div>
      </div>

      {/* Password */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(139,92,246,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <KeyRound size={16} color="rgb(167,139,250)" strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ color: "var(--dtext)", fontSize: 14.5, fontWeight: 700, margin: "0 0 2px" }}>Password</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Change your login password</p>
          </div>
        </div>
        <PasswordForm />
      </div>
    </div>
  );
}
