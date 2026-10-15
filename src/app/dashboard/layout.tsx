import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUnreadCount } from "./messages/actions";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const ctx = await getShopContext();

  // An owner who never finished onboarding (most commonly: verified their
  // email but got bounced by the /signup/verify race fixed in 84a1b7d, or
  // just closed the tab mid-wizard) has a shop row but no handle. Sending
  // them here instead of an empty, unconfigured dashboard means logging back
  // in actually finishes the job instead of leaving them stuck a second way.
  if (ctx && ctx.role === "owner" && !ctx.handle) redirect("/onboarding");

  // Same idea one step earlier: an owner who signed up (has an owner profile)
  // but never created a shop goes straight to shop setup. This is where the
  // admin "finish setting up your shop" reminder email lands them.
  if (!ctx) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (profile) redirect("/signup/shop");
  }

  if (!ctx) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--dring)", padding: "0 24px" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Your account isn&apos;t linked to a shop yet
          </h1>
          <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 24px" }}>
            If you were invited as a team member, ask your shop owner to send a fresh invite. Otherwise, set up your shop to get started.
          </p>
          <a href="/signup/shop" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "12px 24px", background: "#712AE2", color: "#fff",
            fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none",
          }}>
            Set up your shop
          </a>
        </div>
      </div>
    );
  }

  if (ctx.accessStatus === "inactive") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--dring)", padding: "0 24px" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Your trial has ended
          </h1>
          <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 24px" }}>
            Your data is safe and nothing has been deleted. Add a card to pick up right where you left off.
          </p>
          <a href="/dashboard/settings?tab=Billing" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "12px 24px", background: "#712AE2", color: "#fff",
            fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: "none",
          }}>
            Add a card
          </a>
        </div>
      </div>
    );
  }

  const unreadCount = await getUnreadCount();

  return (
    <DashboardShell user={user} role={ctx.role} staffName={ctx.staffName} unreadCount={unreadCount} accessStatus={ctx.accessStatus} initialDark={(await cookies()).get("portal-theme")?.value !== "light"}>
      {children}
    </DashboardShell>
  );
}
