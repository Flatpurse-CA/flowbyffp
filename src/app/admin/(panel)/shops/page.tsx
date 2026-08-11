import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin } from "lucide-react";
import { PLAN_COLORS, PLAN_BG, planLabel, formatCAD } from "@/lib/plans";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";

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
    created_at: string;
  }[];

  const emailMap = Object.fromEntries(
    (usersRes.data?.users ?? []).map(u => [u.id, u.email ?? "-"])
  );

  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Shops</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>{shops.length} registered shop{shops.length !== 1 ? "s" : ""}</p>
      </div>

      {shops.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          No shops yet.
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflowY: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                {["Shop", "Type", "Location", "Owner", "Plan", "Billing", "Revenue", "Joined"].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "rgba(255,255,255,0.28)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                const planColor = PLAN_COLORS[shop.plan] ?? PLAN_COLORS.starter;
                const planBg    = PLAN_BG[shop.plan]    ?? PLAN_BG.starter;

                return (
                  <tr key={shop.id} style={{ borderBottom: i < shops.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    {/* Shop name */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: `hsl(${(i * 53 + 260) % 360}, 35%, 20%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                        }}>
                          {initials}
                        </div>
                        <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{shop.name}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>
                      {shop.business_type}
                    </td>

                    {/* Location */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.45)", fontSize: 12.5 }}>
                        <MapPin size={11} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        {[shop.city, shop.province].filter(Boolean).join(", ") || "-"}
                      </div>
                    </td>

                    {/* Owner email */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.42)", fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emailMap[shop.owner_id] ?? "-"}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                        letterSpacing: "0.04em", textTransform: "capitalize",
                        color: planColor, background: planBg,
                      }}>
                        {planLabel(shop.plan)}
                      </span>
                    </td>

                    {/* Billing status */}
                    <td style={{ padding: "13px 18px" }}>
                      {shop.subscription_status ? (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                          letterSpacing: "0.04em", textTransform: "capitalize",
                          color: shop.subscription_status === "active" ? "rgb(52,211,153)" : "rgb(251,191,36)",
                          background: shop.subscription_status === "active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        }}>
                          {shop.subscription_status}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>-</span>
                      )}
                    </td>

                    {/* Revenue */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatCAD(revenueByShop[shop.id] ?? 0)}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "13px 18px", color: "rgba(255,255,255,0.3)", fontSize: 12, whiteSpace: "nowrap" }}>
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
