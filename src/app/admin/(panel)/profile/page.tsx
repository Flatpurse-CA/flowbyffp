import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";
import { PasswordForm } from "./PasswordForm";
import { KeyRound, ShieldCheck } from "lucide-react";

const card: React.CSSProperties = {
  background: "rgb(10,10,12)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 18,
  padding: "22px 24px",
};

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user || !(await isAdmin(user.email))) redirect("/admin/login");

  const email    = user.email ?? "";
  const username = email.split("@")[0];
  const name     = username.charAt(0).toUpperCase() + username.slice(1);
  const initial  = name.charAt(0);
  const joined   = new Date(user.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
  const isRoot   = email === ROOT_ADMIN_EMAIL;

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Profile</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Your admin account</p>
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
            <p style={{ color: "rgb(240,240,248)", fontSize: 16, fontWeight: 700, margin: 0 }}>{name}</p>
            {isRoot && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                color: "rgb(251,191,36)", background: "rgba(245,158,11,0.1)",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                <ShieldCheck size={10} /> Root
              </span>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, margin: "0 0 2px" }}>{email}</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>Admin since {joined}</p>
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
            <p style={{ color: "rgb(240,240,248)", fontSize: 14.5, fontWeight: 700, margin: "0 0 2px" }}>Password</p>
            <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 12, margin: 0 }}>Change your admin login password</p>
          </div>
        </div>
        <PasswordForm />
      </div>
    </div>
  );
}
