import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users2, Zap, LayoutGrid, Compass, Sparkles, Settings, MessageSquare, LogOut,
  ChevronRight, Star, type LucideIcon,
} from "lucide-react";
import { getShopContext } from "@/lib/dashboard/shop";
import { getUnreadCount } from "../messages/actions";
import { logout } from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const card: React.CSSProperties = {
  background: "var(--dsurface2)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  overflow: "hidden",
};

function Row({ icon: Icon, label, sub, href, badge, danger, formAction }: {
  icon: LucideIcon; label: string; sub?: string; href?: string; badge?: number; danger?: boolean;
  formAction?: () => Promise<void>;
}) {
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: danger ? "rgba(239,68,68,0.1)" : "rgba(139,92,246,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={17} strokeWidth={1.8} color={danger ? "rgb(248,113,113)" : "var(--dpurple-text)"} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? "rgb(248,113,113)" : "var(--dtext2)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--dw4)", marginTop: 1 }}>{sub}</div>}
      </div>
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px",
          background: "rgb(139,92,246)", color: "white", fontSize: 11, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{badge > 9 ? "9+" : badge}</span>
      )}
      {!danger && <ChevronRight size={16} color="var(--dw2)" />}
    </div>
  );

  if (formAction) {
    return (
      <form action={formAction} style={{ margin: 0 }}>
        <button type="submit" style={{ background: "transparent", border: "none", padding: 0, margin: 0, width: "100%", cursor: "pointer", fontFamily: "inherit" }}>
          {inner}
        </button>
      </form>
    );
  }
  return <Link href={href!} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
}

const Divider = () => <div style={{ height: 1, background: "var(--dsurface3)" }} />;

export default async function MorePage() {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");

  const unreadCount = await getUnreadCount();

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--dtext2)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>More</h1>
      <p style={{ fontSize: 13.5, color: "var(--dw4)", margin: "0 0 24px" }}>Everything else, in one place.</p>

      {ctx.role === "owner" && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dw25)", margin: "0 0 8px" }}>
            Workspace
          </p>
          <div style={{ ...card, marginBottom: 20 }}>
            <Row icon={Users2}     label="Team"        sub="Staff, invites, performance"     href="/dashboard/team" />
            <Divider />
            <Row icon={Zap}        label="AutoPilot"   sub="Automated recovery flows"        href="/dashboard/autopilot" />
            <Divider />
            <Row icon={LayoutGrid} label="Operations"  sub="Ops score, KPIs, AI insights"    href="/dashboard/operations" />
            <Divider />
            <Row icon={Compass}    label="Flow Coach"  sub="Your AI business advisor"        href="/dashboard/flow-coach" />
            <Divider />
            <Row icon={Sparkles}   label="Daily Brief" sub="Your morning shop summary"       href="/dashboard/daily-brief" />
          </div>
        </>
      )}

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--dw25)", margin: "0 0 8px" }}>
        Account
      </p>
      <div style={{ ...card, marginBottom: 20 }}>
        <Row icon={MessageSquare} label="Messages" sub="Chat with your team" href="/dashboard/messages" badge={unreadCount} />
        <Divider />
        <Row icon={Star} label="Reviews" sub="What clients are saying" href="/dashboard/reviews" />
        {ctx.role === "owner" && (
          <>
            <Divider />
            <Row icon={Settings} label="Settings" sub="Business, payments, automation" href="/dashboard/settings" />
          </>
        )}
      </div>

      <div style={card}>
        <Row icon={LogOut} label="Sign out" danger formAction={logout} />
      </div>
    </div>
  );
}
