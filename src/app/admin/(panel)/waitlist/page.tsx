import { createAdminClient } from "@/lib/supabase/admin";
import { ClipboardList, Clock, Users } from "lucide-react";
import { WaitlistTable } from "./WaitlistTable";

const TYPE_COLORS: Record<string, string> = {
  "Hair Salon":  "rgb(167,139,250)",
  "Barbershop":  "rgb(96,165,250)",
  "Spa":         "rgb(52,211,153)",
  "Massage":     "rgb(251,191,36)",
  "Nail Studio": "rgb(248,113,113)",
  "Other":       "rgba(255,255,255,0.35)",
};

function StatCard({
  label, count, Icon, iconColor, iconBg,
}: {
  label: string; count: number;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconColor: string; iconBg: string;
}) {
  return (
    <div style={{
      background: "rgb(10,10,12)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 16, padding: "20px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 500, margin: "0 0 8px" }}>{label}</p>
        <p style={{ color: "rgb(245,245,252)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", margin: 0, lineHeight: 1 }}>{count}</p>
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} color={iconColor} strokeWidth={1.8} />
      </div>
    </div>
  );
}

export default async function AdminWaitlistPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("waitlist")
    .select("id, name, email, shop_type, created_at")
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as {
    id: string;
    name: string | null;
    email: string;
    shop_type: string | null;
    created_at: string;
  }[];

  const total   = entries.length;
  const thisWeek = entries.filter(e => new Date(e.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const today   = entries.filter(e => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;

  // Business type breakdown
  const typeCounts: Record<string, number> = {};
  entries.forEach(e => {
    const t = e.shop_type ?? "Not specified";
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  });
  const typeBreakdown = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]);
  const withType = entries.filter(e => e.shop_type).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Waitlist
        </h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          {total} {total === 1 ? "person" : "people"} waiting for early access
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total"     count={total}    Icon={ClipboardList} iconColor="rgb(167,139,250)" iconBg="rgba(109,40,217,0.15)" />
        <StatCard label="This week" count={thisWeek} Icon={Clock}         iconColor="rgb(251,191,36)"  iconBg="rgba(245,158,11,0.12)" />
        <StatCard label="Today"     count={today}    Icon={Users}         iconColor="rgb(52,211,153)"  iconBg="rgba(16,185,129,0.12)" />
      </div>

      {/* ── Business type breakdown ── */}
      {total > 0 && (
        <div style={{
          background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <p style={{ color: "rgb(240,240,248)", fontSize: 13.5, fontWeight: 700, margin: "0 0 2px" }}>Business type breakdown</p>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0 }}>
                {withType} of {total} specified their type
              </p>
            </div>
            {/* Top type badge */}
            {typeBreakdown[0] && typeBreakdown[0][0] !== "Not specified" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Top</span>
                <span style={{ color: "rgb(240,240,248)", fontSize: 12, fontWeight: 700 }}>
                  {typeBreakdown[0][0]}
                </span>
                <span style={{
                  color: TYPE_COLORS[typeBreakdown[0][0]] ?? "rgba(255,255,255,0.35)",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {Math.round((typeBreakdown[0][1] / total) * 100)}%
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {typeBreakdown.map(([type, count]) => {
              const pct   = Math.round((count / total) * 100);
              const color = TYPE_COLORS[type] ?? "rgba(255,255,255,0.35)";
              const isUnspecified = type === "Not specified";
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{
                        color: isUnspecified ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
                        fontSize: 12.5,
                        fontStyle: isUnspecified ? "italic" : "normal",
                      }}>
                        {type}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>{pct}%</span>
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 600, minWidth: 16, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(248,113,113)", fontSize: 13 }}>
          Could not load waitlist.
        </div>
      )}

      {/* ── Table / empty ── */}
      {entries.length === 0 && !error ? (
        <div style={{
          background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "72px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ClipboardList size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600, margin: 0 }}>No one on the waitlist yet</p>
          <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12.5, margin: 0 }}>Entries appear here once people join at /waitlist</p>
        </div>
      ) : (
        <WaitlistTable entries={entries} />
      )}
    </div>
  );
}
