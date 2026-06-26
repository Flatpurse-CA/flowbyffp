import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Store, ClipboardList, CreditCard, TrendingUp, UserCheck, Clock } from "lucide-react";

function StatCard({
  label, value, sub, Icon, iconBg, iconColor,
}: {
  label: string; value: string | number; sub: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconBg: string; iconColor: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, margin: 0, letterSpacing: "0.02em" }}>{label}</p>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} strokeWidth={1.8} color={iconColor} />
        </div>
      </div>
      <div>
        <p style={{ color: "rgb(250,250,250)", fontSize: 32, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11.5, margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

const PLAN_COLORS: Record<string, string> = {
  starter:   "rgba(255,255,255,0.25)",
  pro:       "rgb(96,165,250)",
  unlimited: "rgb(167,139,250)",
  founders:  "rgb(251,191,36)",
};

const PLAN_BG: Record<string, string> = {
  starter:   "rgba(255,255,255,0.06)",
  pro:       "rgba(59,130,246,0.12)",
  unlimited: "rgba(109,40,217,0.12)",
  founders:  "rgba(245,158,11,0.12)",
};

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [usersRes, shopsRes, waitlistRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("shops").select("plan, created_at"),
    admin.from("waitlist").select("status, created_at"),
  ]);

  const users = usersRes.data?.users ?? [];
  const shops = (shopsRes.data ?? []) as { plan: string; created_at: string }[];
  const waitlist = (waitlistRes.data ?? []) as { status: string; created_at: string }[];

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalUsers     = users.length;
  const newThisWeek    = users.filter(u => new Date(u.created_at) > sevenDaysAgo).length;
  const totalShops     = shops.length;
  const totalWaitlist  = waitlist.length;
  const pendingWaitlist = waitlist.filter(w => w.status === "pending").length;

  const planCounts: Record<string, number> = { starter: 0, pro: 0, unlimited: 0, founders: 0 };
  shops.forEach(s => {
    const key = s.plan?.toLowerCase() ?? "starter";
    planCounts[key] = (planCounts[key] ?? 0) + 1;
  });

  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1100, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Heading */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Overview</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>Platform health at a glance</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard
          label="Total Users" value={totalUsers}
          sub={`+${newThisWeek} this week`}
          Icon={Users} iconBg="rgba(109,40,217,0.18)" iconColor="rgb(167,139,250)"
        />
        <StatCard
          label="Active Shops" value={totalShops}
          sub="completed onboarding"
          Icon={Store} iconBg="rgba(16,185,129,0.14)" iconColor="rgb(52,211,153)"
        />
        <StatCard
          label="Waitlist" value={totalWaitlist}
          sub={`${pendingWaitlist} pending approval`}
          Icon={ClipboardList} iconBg="rgba(59,130,246,0.14)" iconColor="rgb(96,165,250)"
        />
        <StatCard
          label="On a Paid Plan" value={shops.filter(s => s.plan !== "starter").length}
          sub={`${totalShops ? Math.round((shops.filter(s => s.plan !== "starter").length / totalShops) * 100) : 0}% conversion`}
          Icon={CreditCard} iconBg="rgba(245,158,11,0.14)" iconColor="rgb(251,191,36)"
        />
      </div>

      {/* Row 2: Plan breakdown + Recent signups */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Plan breakdown */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>Plan Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["founders", "unlimited", "pro", "starter"] as const).map(plan => {
              const count = planCounts[plan] ?? 0;
              const pct = totalShops ? Math.round((count / totalShops) * 100) : 0;
              return (
                <div key={plan}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: PLAN_COLORS[plan], background: PLAN_BG[plan],
                        padding: "2px 8px", borderRadius: 20,
                        textTransform: "capitalize", letterSpacing: "0.04em",
                      }}>
                        {plan}
                      </span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600 }}>{count} shop{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: PLAN_COLORS[plan], transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <TrendingUp size={14} color="rgba(255,255,255,0.4)" />
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Signups</p>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: 0 }}>No users yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentUsers.map((u, i) => {
                const email = u.email ?? "Unknown";
                const initials = email.slice(0, 2).toUpperCase();
                const date = new Date(u.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                      background: `hsl(${(i * 53 + 200) % 360}, 35%, 22%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                    }}>
                      {initials}
                    </div>
                    <p style={{ flex: 1, color: "rgba(255,255,255,0.65)", fontSize: 12.5, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <Clock size={10} color="rgba(255,255,255,0.25)" />
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Waitlist status */}
      <div style={{ ...card, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <UserCheck size={14} color="rgba(255,255,255,0.4)" />
          <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>Waitlist Status</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Pending",  count: waitlist.filter(w => w.status === "pending").length,  color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)" },
            { label: "Approved", count: waitlist.filter(w => w.status === "approved").length, color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)" },
            { label: "Rejected", count: waitlist.filter(w => w.status === "rejected").length, color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)"  },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ padding: "14px 16px", borderRadius: 12, background: bg, border: `1px solid ${color}22` }}>
              <p style={{ color, fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{count}</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
