"use client";

import { useState } from "react";
import {
  Zap, AlertCircle, CalendarDays, CreditCard, Users,
  MessageSquare, TrendingUp, Clock, CheckCircle2, X,
  Bell, BellOff, Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifKind = "needs_you" | "autopilot";

type Notif = {
  id: number;
  kind: NotifKind;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  timeAgo: string;
  read: boolean;
  action?: { label: string; primary?: boolean };
  action2?: { label: string };
  client?: string;
  amount?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_NOTIFS: Notif[] = [
  // Needs You
  {
    id: 1,
    kind: "needs_you",
    icon: AlertCircle,
    iconColor: "rgb(248,113,113)",
    iconBg: "rgba(239,68,68,0.12)",
    title: "No-show — Funmi Alabi",
    body: "Funmi missed her 10:00 AM appointment. She hasn't responded to AutoPilot's message. You may want to follow up personally.",
    time: "Today, 10:42 AM",
    timeAgo: "42 min ago",
    read: false,
    client: "Funmi Alabi",
    action:  { label: "Send message", primary: true },
    action2: { label: "Mark as resolved" },
  },
  {
    id: 2,
    kind: "needs_you",
    icon: CreditCard,
    iconColor: "rgb(251,146,60)",
    iconBg: "rgba(249,115,22,0.12)",
    title: "Payment failed — Yemi Okafor",
    body: "Yemi's card was declined for a C$65 deposit. AutoPilot sent a payment link but it hasn't been used yet.",
    time: "Today, 9:15 AM",
    timeAgo: "2h ago",
    read: false,
    client: "Yemi Okafor",
    amount: "C$65",
    action:  { label: "Resend link", primary: true },
    action2: { label: "Dismiss" },
  },
  {
    id: 3,
    kind: "needs_you",
    icon: MessageSquare,
    iconColor: "rgb(251,191,36)",
    iconBg: "rgba(245,158,11,0.12)",
    title: "Client reply needs attention",
    body: "Adaeze Nwosu replied to the win-back message: \"I had a bad experience last time.\" AutoPilot flagged this for your personal response.",
    time: "Yesterday, 6:30 PM",
    timeAgo: "17h ago",
    read: false,
    client: "Adaeze Nwosu",
    action:  { label: "Reply now", primary: true },
    action2: { label: "Dismiss" },
  },
  {
    id: 4,
    kind: "needs_you",
    icon: CalendarDays,
    iconColor: "rgb(96,165,250)",
    iconBg: "rgba(59,130,246,0.12)",
    title: "Schedule gap — tomorrow 2–4 PM",
    body: "You have a 2-hour gap tomorrow afternoon with no bookings. AutoPilot has identified 3 clients who could fill it — approve to send them an offer.",
    time: "Yesterday, 3:00 PM",
    timeAgo: "21h ago",
    read: true,
    action:  { label: "Approve & send", primary: true },
    action2: { label: "Leave it" },
  },
  {
    id: 5,
    kind: "needs_you",
    icon: Users,
    iconColor: "rgb(167,139,250)",
    iconBg: "rgba(139,92,246,0.12)",
    title: "High churn risk — 3 clients",
    body: "Sola Dada, Adaeze Nwosu, and Yemi Okafor are all 20+ days overdue. AutoPilot has already messaged them — but a personal touch from you could help.",
    time: "Jun 27, 8:00 AM",
    timeAgo: "2 days ago",
    read: true,
    action:  { label: "View clients", primary: true },
  },

  // AutoPilot Wins
  {
    id: 6,
    kind: "autopilot",
    icon: Zap,
    iconColor: "rgb(167,139,250)",
    iconBg: "rgba(139,92,246,0.15)",
    title: "Rebooked — Lola Adeyemi",
    body: "AutoPilot sent a rebooking reminder and Lola booked herself in for Jun 30 at 11:00 AM. No action needed.",
    time: "Today, 8:45 AM",
    timeAgo: "3h ago",
    read: false,
    client: "Lola Adeyemi",
    amount: "C$120",
  },
  {
    id: 7,
    kind: "autopilot",
    icon: TrendingUp,
    iconColor: "rgb(52,211,153)",
    iconBg: "rgba(16,185,129,0.12)",
    title: "Win-back recovered — Ngozi Chukwu",
    body: "Ngozi was inactive for 15 days. AutoPilot's win-back SMS brought her back — she's booked for Jul 7 at 2:00 PM. C$122 recovered.",
    time: "Today, 7:30 AM",
    timeAgo: "4h ago",
    client: "Ngozi Chukwu",
    amount: "C$122",
    read: false,
  },
  {
    id: 8,
    kind: "autopilot",
    icon: CheckCircle2,
    iconColor: "rgb(52,211,153)",
    iconBg: "rgba(16,185,129,0.12)",
    title: "Reminder sent — 5 clients",
    body: "AutoPilot sent your daily appointment reminders to 5 clients booked for tomorrow. 4 of 5 confirmed already.",
    time: "Yesterday, 5:00 PM",
    timeAgo: "19h ago",
    read: true,
  },
  {
    id: 9,
    kind: "autopilot",
    icon: Zap,
    iconColor: "rgb(167,139,250)",
    iconBg: "rgba(139,92,246,0.15)",
    title: "Last-minute slot filled — Temi Bello",
    body: "Chisom's 3:00 PM cancellation was auto-filled by Temi Bello within 8 minutes. Zero lost revenue.",
    time: "Yesterday, 2:52 PM",
    timeAgo: "20h ago",
    client: "Temi Bello",
    amount: "C$102",
    read: true,
  },
  {
    id: 10,
    kind: "autopilot",
    icon: CreditCard,
    iconColor: "rgb(52,211,153)",
    iconBg: "rgba(16,185,129,0.12)",
    title: "Deposit collected — Zara Johnson",
    body: "Zara paid a C$22 deposit for her Jul 4 appointment. Her card is saved for the balance.",
    time: "Jun 27, 11:20 AM",
    timeAgo: "2 days ago",
    client: "Zara Johnson",
    amount: "C$22",
    read: true,
  },
  {
    id: 11,
    kind: "autopilot",
    icon: MessageSquare,
    iconColor: "rgb(96,165,250)",
    iconBg: "rgba(59,130,246,0.12)",
    title: "AI front desk — 3 enquiries handled",
    body: "AutoPilot answered 3 inbound client messages today about pricing and availability. All resolved without your involvement.",
    time: "Jun 27, 4:00 PM",
    timeAgo: "2 days ago",
    read: true,
  },
  {
    id: 12,
    kind: "autopilot",
    icon: Clock,
    iconColor: "rgb(167,139,250)",
    iconBg: "rgba(139,92,246,0.15)",
    title: "Birthday offer sent — Bisola Akin",
    body: "Bisola's birthday is in 3 days. AutoPilot sent a 15% off birthday message. Booking link opened.",
    time: "Jun 26, 9:00 AM",
    timeAgo: "3 days ago",
    client: "Bisola Akin",
    read: true,
  },
];

// ─── Notification card ─────────────────────────────────────────────────────────

function NotifCard({ n, onDismiss }: { n: Notif; onDismiss: (id: number) => void }) {
  const Icon = n.icon;
  const isNeeds = n.kind === "needs_you";

  return (
    <div style={{
      position: "relative",
      background: n.read ? "var(--dw02)" : isNeeds ? "rgba(248,113,113,0.04)" : "rgba(139,92,246,0.04)",
      border: `1px solid ${n.read ? "var(--dw06)" : isNeeds ? "rgba(239,68,68,0.18)" : "rgba(139,92,246,0.18)"}`,
      borderRadius: 16,
      padding: "16px 18px",
      transition: "border-color 0.2s",
    }}>
      {/* Unread dot */}
      {!n.read && (
        <span style={{
          position: "absolute", top: 18, right: 18,
          width: 8, height: 8, borderRadius: "50%",
          background: isNeeds ? "rgb(248,113,113)" : "rgb(167,139,250)",
        }} />
      )}

      <div style={{ display: "flex", gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: n.iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={n.iconColor} strokeWidth={2} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
            <p style={{ color: "var(--dtext)", fontSize: 13.5, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{n.title}</p>
            <span style={{ color: "var(--dw25)", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>{n.timeAgo}</span>
          </div>

          <p style={{ color: "var(--dw55)", fontSize: 13, margin: "0 0 12px", lineHeight: 1.55 }}>{n.body}</p>

          {/* Meta chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: n.action ? 12 : 0 }}>
            {n.client && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, color: "var(--dw4)", background: "var(--dw06)" }}>
                {n.client}
              </span>
            )}
            {n.amount && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, color: "rgb(52,211,153)", background: "rgba(16,185,129,0.1)" }}>
                {n.amount}
              </span>
            )}
          </div>

          {/* Action buttons */}
          {n.action && (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{
                padding: "7px 16px", borderRadius: 9, cursor: "pointer",
                fontSize: 12.5, fontWeight: 700,
                background: n.action.primary ? (isNeeds ? "rgb(109,40,217)" : "rgba(139,92,246,0.2)") : "var(--dw06)",
                color: n.action.primary ? (isNeeds ? "white" : "rgb(167,139,250)") : "var(--dw4)",
                border: n.action.primary && !isNeeds ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              }}>
                {n.action.label}
              </button>
              {n.action2 && (
                <button onClick={() => onDismiss(n.id)} style={{
                  padding: "7px 14px", borderRadius: 9,
                  background: "var(--dw04)", border: "1px solid var(--dw07)",
                  color: "var(--dw35)", fontSize: 12.5, cursor: "pointer",
                }}>
                  {n.action2.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type FilterTab = "All" | "Needs you" | "AutoPilot wins";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(ALL_NOTIFS);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [muteAll, setMuteAll] = useState(false);

  const dismiss  = (id: number) => setNotifs(n => n.filter(x => x.id !== id));
  const markAll  = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const unreadNeeds    = notifs.filter(n => n.kind === "needs_you" && !n.read).length;
  const unreadAuto     = notifs.filter(n => n.kind === "autopilot"  && !n.read).length;
  const totalUnread    = unreadNeeds + unreadAuto;

  const visible = notifs.filter(n => {
    if (filter === "Needs you")     return n.kind === "needs_you";
    if (filter === "AutoPilot wins") return n.kind === "autopilot";
    return true;
  });

  const needsGroup = visible.filter(n => n.kind === "needs_you");
  const autoGroup  = visible.filter(n => n.kind === "autopilot");

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Notifications</h1>
            {totalUnread > 0 && (
              <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: "rgba(248,113,113,0.2)", color: "rgb(248,113,113)", border: "1px solid rgba(239,68,68,0.25)" }}>
                {totalUnread} new
              </span>
            )}
          </div>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>
            {unreadNeeds > 0 ? `${unreadNeeds} need${unreadNeeds > 1 ? "" : "s"} your attention` : "You're all caught up"} · AutoPilot handled {notifs.filter(n => n.kind === "autopilot").length} things
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {totalUnread > 0 && (
            <button onClick={markAll} style={{ padding: "8px 14px", borderRadius: 9, background: "var(--dw05)", border: "1px solid var(--dw09)", color: "var(--dw45)", fontSize: 12.5, cursor: "pointer" }}>
              Mark all read
            </button>
          )}
          <button onClick={() => setMuteAll(v => !v)} style={{
            width: 36, height: 36, borderRadius: 9,
            background: muteAll ? "rgba(248,113,113,0.1)" : "var(--dw05)",
            border: `1px solid ${muteAll ? "rgba(239,68,68,0.2)" : "var(--dw09)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            {muteAll ? <BellOff size={15} color="rgb(248,113,113)" /> : <Bell size={15} color="var(--dw4)" />}
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{
          background: unreadNeeds > 0 ? "rgba(248,113,113,0.06)" : "var(--dw025)",
          border: `1px solid ${unreadNeeds > 0 ? "rgba(239,68,68,0.2)" : "var(--dw07)"}`,
          borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={18} color="rgb(248,113,113)" strokeWidth={2} />
          </div>
          <div>
            <p style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{needsGroup.length}</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>Need your eyes</p>
          </div>
          {unreadNeeds > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "rgb(248,113,113)" }}>{unreadNeeds} new</span>
          )}
        </div>

        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.15)",
          borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="rgb(167,139,250)" strokeWidth={2} />
          </div>
          <div>
            <p style={{ color: "var(--dtext)", fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{autoGroup.length}</p>
            <p style={{ color: "var(--dw35)", fontSize: 12, margin: 0 }}>AutoPilot wins</p>
          </div>
          {unreadAuto > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>{unreadAuto} new</span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["All", "Needs you", "AutoPilot wins"] as FilterTab[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
              borderRadius: 20,
              border: `1px solid ${filter === f ? (f === "Needs you" ? "rgba(239,68,68,0.35)" : f === "AutoPilot wins" ? "rgba(139,92,246,0.35)" : "var(--dw15)") : "var(--dw07)"}`,
              background: filter === f ? (f === "Needs you" ? "rgba(239,68,68,0.1)" : f === "AutoPilot wins" ? "rgba(109,40,217,0.12)" : "var(--dw07)") : "var(--dw03)",
              color: filter === f ? (f === "Needs you" ? "rgb(248,113,113)" : f === "AutoPilot wins" ? "var(--dpurple-text)" : "var(--dtext)") : "var(--dw38)",
              fontSize: 13, fontWeight: filter === f ? 700 : 500, cursor: "pointer",
            }}
          >
            {f === "Needs you"     && <AlertCircle size={12} strokeWidth={2.5} />}
            {f === "AutoPilot wins" && <Zap size={12} strokeWidth={2.5} />}
            {f === "All"            && <Filter size={11} strokeWidth={2} />}
            {f}
          </button>
        ))}
      </div>

      {/* Feed */}
      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--dw2)", fontSize: 13 }}>
          No notifications here
        </div>
      ) : (
        <>
          {/* Needs You group */}
          {(filter === "All" || filter === "Needs you") && needsGroup.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filter === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={13} color="rgb(248,113,113)" strokeWidth={2.5} />
                  <span style={{ color: "rgb(248,113,113)", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Needs your attention</span>
                  {unreadNeeds > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(239,68,68,0.15)", color: "rgb(248,113,113)" }}>{unreadNeeds}</span>
                  )}
                </div>
              )}
              {needsGroup.map(n => (
                <NotifCard key={n.id} n={n} onDismiss={dismiss} />
              ))}
            </div>
          )}

          {/* Spacer between groups */}
          {filter === "All" && needsGroup.length > 0 && autoGroup.length > 0 && (
            <div style={{ height: 4 }} />
          )}

          {/* AutoPilot group */}
          {(filter === "All" || filter === "AutoPilot wins") && autoGroup.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filter === "All" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Zap size={13} color="rgb(167,139,250)" strokeWidth={2.5} />
                  <span style={{ color: "rgb(167,139,250)", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>AutoPilot wins</span>
                  {unreadAuto > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "rgba(139,92,246,0.15)", color: "rgb(167,139,250)" }}>{unreadAuto}</span>
                  )}
                </div>
              )}
              {autoGroup.map(n => (
                <NotifCard key={n.id} n={n} onDismiss={dismiss} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Muted banner */}
      {muteAll && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15,12,30,0.95)", border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 12, padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          zIndex: 200, whiteSpace: "nowrap",
        }}>
          <BellOff size={15} color="rgb(248,113,113)" />
          <span style={{ color: "var(--dw7)", fontSize: 13 }}>Notifications muted</span>
          <button onClick={() => setMuteAll(false)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
            <X size={13} color="var(--dw4)" />
          </button>
        </div>
      )}
    </div>
  );
}
