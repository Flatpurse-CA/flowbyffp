import { createAdminClient } from "@/lib/supabase/admin";

const PLANS = [
  { key: "founders",  label: "Founders",  price: "C$29/mo",  color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  { key: "unlimited", label: "Unlimited", price: "C$274/mo", color: "rgb(167,139,250)", bg: "rgba(109,40,217,0.1)", border: "rgba(139,92,246,0.2)"  },
  { key: "pro",       label: "Pro",       price: "C$49/mo",  color: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)"  },
  { key: "starter",   label: "Starter",   price: "Free",     color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)" },
];

export default async function AdminPlansPage() {
  const admin = createAdminClient();

  const [shopsRes, usersRes] = await Promise.all([
    admin.from("shops").select("owner_id, name, plan, created_at").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const shops = (shopsRes.data ?? []) as { owner_id: string; name: string; plan: string; created_at: string }[];
  const emailMap = Object.fromEntries((usersRes.data?.users ?? []).map(u => [u.id, u.email ?? "—"]));

  const planCounts: Record<string, number> = {};
  shops.forEach(s => {
    const k = s.plan?.toLowerCase() ?? "starter";
    planCounts[k] = (planCounts[k] ?? 0) + 1;
  });

  const totalShops = shops.length;

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Plans</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Distribution across {totalShops} shop{totalShops !== 1 ? "s" : ""}</p>
      </div>

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {PLANS.map(({ key, label, price, color, bg, border }) => {
          const count = planCounts[key] ?? 0;
          const pct   = totalShops ? Math.round((count / totalShops) * 100) : 0;
          return (
            <div key={key} style={{
              padding: "18px 20px", borderRadius: 16,
              background: bg, border: `1px solid ${border}`,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{price}</span>
              </div>
              <p style={{ color: "rgb(250,250,250)", fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: "-0.04em", lineHeight: 1 }}>{count}</p>
              <div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: color }} />
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "5px 0 0" }}>{pct}% of shops</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-plan shop tables */}
      {PLANS.map(({ key, label, color, bg }) => {
        const planShops = shops.filter(s => (s.plan?.toLowerCase() ?? "starter") === key);
        if (planShops.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color,
                background: bg, padding: "3px 10px", borderRadius: 20,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 12 }}>{planShops.length} shop{planShops.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                    {["Shop", "Owner", "Joined"].map(h => (
                      <th key={h} style={{
                        padding: "10px 16px", textAlign: "left",
                        color: "rgba(255,255,255,0.25)", fontSize: 10.5,
                        fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planShops.map((shop, i) => (
                    <tr key={shop.owner_id} style={{ borderBottom: i < planShops.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{ padding: "11px 16px", color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{shop.name}</td>
                      <td style={{ padding: "11px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{emailMap[shop.owner_id] ?? "—"}</td>
                      <td style={{ padding: "11px 16px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                        {new Date(shop.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {totalShops === 0 && (
        <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          No shops yet.
        </div>
      )}
    </div>
  );
}
