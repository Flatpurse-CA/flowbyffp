import { createClient } from "@/lib/supabase/server";
import {
  CalendarDays,
  DollarSign,
  Users,
  Star,
  Clock,
  ChevronRight,
  Plus,
  Zap,
} from "lucide-react";

const easing = "cubic-bezier(0.16,1,0.3,1)";

const STATS = [
  {
    label: "Today's Bookings",
    value: "8",
    sub: "+2 from yesterday",
    positive: true,
    icon: CalendarDays,
    color: "rgba(109,40,217,0.2)",
    iconColor: "rgb(167,139,250)",
  },
  {
    label: "Monthly Revenue",
    value: "C$2,340",
    sub: "+12% this month",
    positive: true,
    icon: DollarSign,
    color: "rgba(16,185,129,0.15)",
    iconColor: "rgb(52,211,153)",
  },
  {
    label: "Active Clients",
    value: "142",
    sub: "14 new this week",
    positive: true,
    icon: Users,
    color: "rgba(59,130,246,0.15)",
    iconColor: "rgb(96,165,250)",
  },
  {
    label: "Avg. Rating",
    value: "4.9",
    sub: "Based on 38 reviews",
    positive: true,
    icon: Star,
    color: "rgba(245,158,11,0.15)",
    iconColor: "rgb(251,191,36)",
  },
];

const APPOINTMENTS = [
  { name: "Amara Obi", service: "Full highlights + trim", time: "9:00 AM", status: "confirmed" },
  { name: "Lola Adeyemi", service: "Knotless braids", time: "11:30 AM", status: "confirmed" },
  { name: "Temi Bello", service: "Silk press", time: "1:00 PM", status: "pending" },
  { name: "Zara Johnson", service: "Colour + gloss", time: "3:00 PM", status: "confirmed" },
  { name: "Chisom Eze", service: "Trim + blowout", time: "5:00 PM", status: "confirmed" },
];

const QUICK_ACTIONS = [
  { label: "New Appointment", icon: Plus, desc: "Book a client manually" },
  { label: "AutoPilot", icon: Zap, desc: "Review AI-sent reminders" },
  { label: "Daily Brief", icon: CalendarDays, desc: "Today's AI summary" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";
  const name = email.split("@")[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 36,
          animation: `0.5s ${easing} 0ms 1 normal both running fp-fade-up`,
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: "0 0 6px" }}>{dateStr}</p>
        <h1
          style={{
            color: "rgb(250,250,250)",
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {greeting}, {displayName} 👋
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "6px 0 0" }}>
          You have <strong style={{ color: "rgb(167,139,250)" }}>8 appointments</strong> today.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {STATS.map(({ label, value, sub, positive, icon: Icon, color, iconColor }, i) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "20px 20px 18px",
              animation: `0.5s ${easing} ${i * 60}ms 1 normal both running fp-fade-up`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, margin: 0, letterSpacing: "0.02em" }}>
                {label}
              </p>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={15} color={iconColor} strokeWidth={2} />
              </div>
            </div>
            <p style={{ color: "rgb(250,250,250)", fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ color: positive ? "rgb(52,211,153)" : "rgb(248,113,113)", fontSize: 12, margin: 0 }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr minmax(220px, 280px)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Today's appointments */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
            animation: `0.5s ${easing} 240ms 1 normal both running fp-fade-up`,
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 600, margin: 0 }}>
              Today&apos;s Appointments
            </p>
            <button
              style={{
                background: "none",
                border: "none",
                color: "rgba(167,139,250,0.8)",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: 0,
              }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          <div>
            {APPOINTMENTS.map((appt, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 20px",
                  borderBottom: i < APPOINTMENTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: `hsl(${(i * 47 + 240) % 360}, 40%, 25%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {appt.name.split(" ").map((n) => n[0]).join("")}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {appt.name}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {appt.service}
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginBottom: 4 }}>
                    <Clock size={11} color="rgba(255,255,255,0.35)" />
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{appt.time}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: appt.status === "confirmed" ? "rgb(52,211,153)" : "rgb(251,191,36)",
                      background: appt.status === "confirmed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                      borderRadius: 6,
                      padding: "2px 7px",
                    }}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            animation: `0.5s ${easing} 300ms 1 normal both running fp-fade-up`,
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, margin: "0 0 4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Quick Actions
          </p>
          {QUICK_ACTIONS.map(({ label, icon: Icon, desc }) => (
            <button
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(109,40,217,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color="rgb(167,139,250)" strokeWidth={2} />
              </div>
              <div>
                <p style={{ color: "rgb(250,250,250)", fontSize: 13.5, fontWeight: 600, margin: 0 }}>{label}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "2px 0 0" }}>{desc}</p>
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </button>
          ))}

          {/* AutoPilot status card */}
          <div
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(76,29,149,0.08) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 14,
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Zap size={14} color="rgb(167,139,250)" strokeWidth={2} />
              <p style={{ color: "rgb(196,181,253)", fontSize: 13, fontWeight: 600, margin: 0 }}>AutoPilot Active</p>
            </div>
            <p style={{ color: "rgba(196,181,253,0.6)", fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>
              3 reminders sent today. 0 no-shows so far.
            </p>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "72%", background: "rgb(139,92,246)", borderRadius: 2 }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "6px 0 0" }}>72% of today completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
