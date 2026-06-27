import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, Send } from "lucide-react";
import { SendNowButton } from "./SendNowButton";

const T = {
  bg:     "rgb(10,10,12)",
  border: "rgba(255,255,255,0.09)",
  text:   "rgb(245,245,252)",
  muted:  "rgba(255,255,255,0.35)",
  dim:    "rgba(255,255,255,0.18)",
  purple: "rgb(139,92,246)",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  sent:    { color: "rgb(52,211,153)",  background: "rgba(16,185,129,0.1)",  border: "1px solid rgba(16,185,129,0.2)"  },
  pending: { color: "rgb(251,191,36)",  background: "rgba(245,158,11,0.1)",  border: "1px solid rgba(245,158,11,0.2)"  },
  failed:  { color: "rgb(248,113,113)", background: "rgba(239,68,68,0.08)",  border: "1px solid rgba(239,68,68,0.2)"   },
};

const STATUS_ICON = {
  sent:    <CheckCircle size={12} />,
  pending: <Clock size={12} />,
  failed:  <XCircle size={12} />,
};

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const admin = createAdminClient();

  const { data: sends } = await admin
    .from("email_sends")
    .select(`
      id, status, scheduled_at, sent_at, error_message,
      waitlist:subscriber_id ( id, email, name ),
      email_sequences:sequence_id ( id, name, subject, delay_days )
    `)
    .order("scheduled_at", { ascending: true });

  const allSends = (sends ?? []) as {
    id: string;
    status: string;
    scheduled_at: string;
    sent_at: string | null;
    error_message: string | null;
    waitlist: { id: string; email: string; name: string | null } | null;
    email_sequences: { id: string; name: string; subject: string; delay_days: number } | null;
  }[];

  const filtered = filterStatus
    ? allSends.filter(s => s.status === filterStatus)
    : allSends;

  const counts = allSends.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/emails" style={{ color: T.muted, display: "flex", alignItems: "center" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
              Subscriber Queue
            </h1>
            <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>{allSends.length} total sends</p>
          </div>
        </div>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 8 }}>
        {[undefined, "pending", "sent", "failed"].map((s) => (
          <Link key={String(s)} href={s ? `?status=${s}` : "?"} style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
            textDecoration: "none",
            background: filterStatus === s ? T.purple : "rgba(255,255,255,0.05)",
            color:      filterStatus === s ? "#fff"   : T.muted,
            border: `1px solid ${filterStatus === s ? T.purple : T.border}`,
          }}>
            {s ? `${s} (${counts[s] ?? 0})` : `All (${allSends.length})`}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "72px 0", textAlign: "center" }}>
            <Send size={28} color={T.dim} strokeWidth={1.3} style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>No sends {filterStatus ? `with status "${filterStatus}"` : "yet"}</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Subscriber", "Email", "Day", "Scheduled", "Status", ""].map((h) => (
                  <th key={h} style={{
                    padding: "12px 18px", textAlign: "left",
                    fontSize: 11, fontWeight: 600, color: T.muted,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((send, i) => {
                const style = STATUS_STYLE[send.status] ?? STATUS_STYLE.pending;
                const icon  = STATUS_ICON[send.status as keyof typeof STATUS_ICON];
                return (
                  <tr key={send.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <td style={{ padding: "13px 18px", color: T.text, fontSize: 13, fontWeight: 600 }}>
                      {send.waitlist?.name ?? "—"}
                    </td>
                    <td style={{ padding: "13px 18px", color: T.muted, fontSize: 13 }}>
                      {send.waitlist?.email ?? "—"}
                    </td>
                    <td style={{ padding: "13px 18px", color: T.muted, fontSize: 13 }}>
                      <span style={{ display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {send.email_sequences?.name ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px", color: T.muted, fontSize: 12 }}>
                      {new Date(send.scheduled_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 9px", borderRadius: 6,
                        ...style,
                      }}>
                        {icon} {send.status}
                      </span>
                      {send.error_message && (
                        <p style={{ fontSize: 11, color: "rgb(248,113,113)", margin: "4px 0 0" }}>{send.error_message}</p>
                      )}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      {(send.status === "pending" || send.status === "failed") && (
                        <SendNowButton sendId={send.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
