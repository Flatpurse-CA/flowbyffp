import Link from "next/link";
import { Lock } from "lucide-react";

/** Full-page prompt shown in place of a dashboard feature the shop's plan doesn't include. */
export default function PlanUpsell({ feature, plan, body }: { feature: string; plan: "Pro" | "Pro+"; body: string }) {
  return (
    <div style={{ maxWidth: 480, margin: "100px auto 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--dsurface3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Lock size={22} color="var(--dviolet-text)" strokeWidth={1.8} />
      </div>
      <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
        {feature} is a {plan} feature
      </h1>
      <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{body}</p>
      <Link href="/dashboard/settings?tab=Billing" style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, padding: "10px 20px",
        borderRadius: 10, background: "rgb(109,40,217)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none",
      }}>
        Upgrade to {plan}
      </Link>
    </div>
  );
}
