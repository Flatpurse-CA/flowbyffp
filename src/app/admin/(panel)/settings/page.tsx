import { createAdminClient } from "@/lib/supabase/admin";
import { ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";
import { addAdmin, removeAdmin } from "./actions";
import { NotificationPrefsForm } from "./NotificationPrefsForm";
import { ShieldCheck, Bell, Palette, UserMinus } from "lucide-react";

const card: React.CSSProperties = {
  background: "var(--am1)",
  border: "1px solid var(--aw09)",
  borderRadius: 18,
  padding: "22px 24px",
};

function SectionHeader({ Icon, title, subtitle }: { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: "rgba(139,92,246,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={16} color="rgb(167,139,250)" strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ color: "var(--atext)", fontSize: 14.5, fontWeight: 700, margin: "0 0 2px" }}>{title}</p>
        <p style={{ color: "var(--aw3)", fontSize: 12, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const admin = createAdminClient();
  const { data: extraAdmins } = await admin
    .from("admin_users")
    .select("email, created_at")
    .order("created_at", { ascending: true });

  const admins = extraAdmins ?? [];

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>Admin access and panel preferences</p>
      </div>

      {/* Admin access */}
      <div style={card}>
        <SectionHeader Icon={ShieldCheck} title="Admin Access" subtitle="Who can sign in to this panel" />

        <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(109,40,217,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "rgb(167,139,250)",
              }}>
                {ROOT_ADMIN_EMAIL.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ color: "var(--atext)", fontSize: 13, fontWeight: 600 }}>{ROOT_ADMIN_EMAIL}</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
              letterSpacing: "0.04em", textTransform: "uppercase",
              color: "rgb(251,191,36)", background: "rgba(245,158,11,0.1)",
            }}>
              Root
            </span>
          </div>

          {admins.map(a => (
            <div key={a.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "var(--aw06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "var(--aw6)",
                }}>
                  {a.email.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ color: "var(--atext)", fontSize: 13, fontWeight: 600 }}>{a.email}</span>
              </div>
              <form action={removeAdmin}>
                <input type="hidden" name="email" value={a.email} />
                <button
                  type="submit"
                  title="Remove admin"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8, cursor: "pointer",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                    color: "rgb(248,113,113)", fontFamily: "inherit",
                  }}
                >
                  <UserMinus size={13} />
                </button>
              </form>
            </div>
          ))}
        </div>

        <form action={addAdmin} style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            name="email"
            required
            placeholder="teammate@email.com"
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 10,
              background: "var(--aw04)", border: "1px solid var(--aw09)",
              color: "var(--atext)", fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "9px 18px", borderRadius: 10, cursor: "pointer",
              background: "rgb(139,92,246)", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            }}
          >
            Add admin
          </button>
        </form>
        <p style={{ color: "var(--aw2)", fontSize: 11, margin: "10px 4px 0" }}>
          Added admins must already have an account (sign up at /signup) before they can log in here.
        </p>
      </div>

      {/* Notifications */}
      <div style={card}>
        <SectionHeader Icon={Bell} title="Notifications" subtitle="What shows up in the bell dropdown" />
        <NotificationPrefsForm />
      </div>

      {/* Appearance */}
      <div style={card}>
        <SectionHeader Icon={Palette} title="Appearance" subtitle="Light and dark mode" />
        <p style={{ color: "var(--aw45)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Toggle light/dark from the sun/moon icon in the header. It applies across the whole admin panel and is remembered on this device.
        </p>
      </div>
    </div>
  );
}
