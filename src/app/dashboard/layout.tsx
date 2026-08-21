import { redirect } from "next/navigation";
import { getAuthUser, getShopContext } from "@/lib/dashboard/shop";
import { getUnreadCount } from "./messages/actions";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "rgb(10,10,12)", padding: "0 24px" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Your account isn&apos;t linked to a shop yet
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
            If you were invited as a team member, ask your shop owner to send a fresh invite. Otherwise, complete onboarding to set up your shop.
          </p>
        </div>
      </div>
    );
  }

  if (ctx.accessStatus === "inactive") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "rgb(10,10,12)", padding: "0 24px" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Your trial has ended
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 24px" }}>
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
    <DashboardShell user={user} role={ctx.role} staffName={ctx.staffName} unreadCount={unreadCount} accessStatus={ctx.accessStatus}>
      {children}
    </DashboardShell>
  );
}
