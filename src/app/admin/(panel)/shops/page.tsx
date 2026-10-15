import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin } from "lucide-react";
import { ADMIN_PLAN_BADGE, planLabel, formatCAD } from "@/lib/plans";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";
import { computeAccessStatus, type AccessStatus } from "@/lib/dashboard/accessStatus";

const BADGE: Record<"green" | "amber" | "red" | "blue" | "purple", { fg: string; bg: string }> = {
  green:  { fg: "var(--astatus-green-fg)",  bg: "var(--astatus-green-bg)" },
  amber:  { fg: "var(--astatus-amber-fg)",  bg: "var(--astatus-amber-bg)" },
  red:    { fg: "var(--astatus-red-fg)",    bg: "var(--astatus-red-bg)" },
  blue:   { fg: "var(--astatus-blue-fg)",   bg: "var(--astatus-blue-bg)" },
  purple: { fg: "var(--astatus-purple-fg)", bg: "var(--astatus-purple-bg)" },
};
const TRIAL_BADGE: Record<AccessStatus, { label: string; tone: keyof typeof BADGE }> = {
  trialing: { label: "Trialing",   tone: "blue" },
  grace:    { label: "Grace",      tone: "amber" },
  inactive: { label: "Locked out", tone: "red" },
  active:   { label: "Active",     tone: "green" },
  paused:   { label: "Paused",     tone: "purple" },
};

// Billing column: the Stripe subscription status when there is one,
// otherwise where the shop sits in its free trial, so the column is never
// just a wall of dashes for shops that haven't added a card.
function billingBadge(shop: { plan: string; subscription_status: string | null; trial_started_at: string | null; trial_override: boolean; trial_paused_at: string | null }): { label: string; tone: keyof typeof BADGE } | null {
  if (shop.subscription_status) {
    const s = shop.subscription_status;
    return { label: s.replace(/_/g, " "), tone: s === "active" ? "green" : s === "trialing" ? "blue" : s === "canceled" ? "red" : "amber" };
  }
  if (shop.trial_override && shop.plan === "enterprise") return { label: "Comped", tone: "purple" };
  if (shop.trial_override) return { label: "Bypassed", tone: "purple" };
  if (!shop.trial_started_at) return null;
  return TRIAL_BADGE[computeAccessStatus({ trial_started_at: shop.trial_started_at, subscription_status: null, trial_override: false, trial_paused_at: shop.trial_paused_at }).status];
}

const pill: React.CSSProperties = {
  display: "inline-block", whiteSpace: "nowrap", fontSize: 10, fontWeight: 700, padding: "3px 9px",
  borderRadius: 20, letterSpacing: "0.04em", textTransform: "capitalize",
};

export default async function AdminShopsPage() {
  const admin = createAdminClient();

  const [shopsRes, usersRes, apptsRes] = await Promise.all([
    admin.from("shops").select("*").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
  ]);

  const shops = (shopsRes.data ?? []) as {
    id: string;
    owner_id: string;
    name: string;
    business_type: string;
    city: string;
    province: string;
    plan: string;
    subscription_status: string | null;
    trial_started_at: string | null;
    trial_override: boolean;
    trial_paused_at: string | null;
    created_at: string;
  }[];

  const emailMap = Object.fromEntries(
    (usersRes.data?.users ?? []).map(u => [u.id, u.email ?? "-"])
  );

  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Shops</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>{shops.length} registered shop{shops.length !== 1 ? "s" : ""}</p>
      </div>

      {shops.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>
          No shops yet.
        </div>
      ) : (
        <div style={{ background: "var(--asurface1)", border: "1px solid var(--aw07)", borderRadius: 16, overflowY: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ background: "var(--aw015)" }}>
                {["Shop", "Type", "Location", "Owner", "Plan", "Billing", "Revenue", "Joined"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "var(--aw3)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid var(--aw06)",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shops.map((shop, i) => {
                const initials = shop.name.slice(0, 2).toUpperCase();
                const date = new Date(shop.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
                const planBadge = ADMIN_PLAN_BADGE[shop.plan] ?? ADMIN_PLAN_BADGE.starter;
                const planColor = planBadge.fg;
                const planBg    = planBadge.bg;

                return (
                  <tr key={shop.id} style={{ borderBottom: i < shops.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                    {/* Shop name */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: `hsl(${(i * 53 + 260) % 360}, 35%, var(--aavatar-l, 20%))`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "var(--aavatar-fg, var(--aw85))",
                        }}>
                          {initials}
                        </div>
                        <span style={{ color: "var(--atext2)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{shop.name}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "13px 18px", color: "var(--aw45)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                      {shop.business_type}
                    </td>

                    {/* Location */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--aw45)", fontSize: 12.5 }}>
                        <MapPin size={11} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        {[shop.city, shop.province].filter(Boolean).join(", ") || "-"}
                      </div>
                    </td>

                    {/* Owner email */}
                    <td style={{ padding: "13px 18px", color: "var(--aw42)", fontSize: 12, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emailMap[shop.owner_id] ?? "-"}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ ...pill, color: planColor, background: planBg }}>
                        {planLabel(shop.plan)}
                      </span>
                    </td>

                    {/* Billing status */}
                    <td style={{ padding: "13px 18px" }}>
                      {(() => {
                        const b = billingBadge(shop);
                        return b
                          ? <span style={{ ...pill, color: BADGE[b.tone].fg, background: BADGE[b.tone].bg }}>{b.label}</span>
                          : <span style={{ color: "var(--aw2)", fontSize: 12 }}>-</span>;
                      })()}
                    </td>

                    {/* Revenue */}
                    <td style={{ padding: "13px 18px", color: "var(--aw55)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatCAD(revenueByShop[shop.id] ?? 0)}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "13px 18px", color: "var(--aw3)", fontSize: 12, whiteSpace: "nowrap" }}>
                      {date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
