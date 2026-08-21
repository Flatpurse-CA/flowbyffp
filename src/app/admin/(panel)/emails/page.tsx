import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { ToggleButton, DeleteButton } from "./SequenceActions";

const T = {
  bg:      "var(--am1)",
  border:  "var(--aw09)",
  text:    "var(--atext2)",
  muted:   "var(--aw35)",
  dim:     "var(--aw18)",
  purple:  "rgb(139,92,246)",
  purpleBg:"rgba(139,92,246,0.12)",
};

export default async function AdminEmailsPage() {
  const admin = createAdminClient();

  const { data: sequences } = await admin
    .from("email_sequences")
    .select("id, name, subject, delay_days, position, is_active, created_at")
    .order("position", { ascending: true });

  const { data: sendCounts } = await admin
    .from("email_sends")
    .select("sequence_id, status");

  const countMap: Record<string, { sent: number; pending: number; failed: number }> = {};
  for (const row of sendCounts ?? []) {
    if (!countMap[row.sequence_id]) countMap[row.sequence_id] = { sent: 0, pending: 0, failed: 0 };
    if (row.status === "sent")    countMap[row.sequence_id].sent++;
    if (row.status === "pending") countMap[row.sequence_id].pending++;
    if (row.status === "failed")  countMap[row.sequence_id].failed++;
  }

  const list = sequences ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>
            Email Sequences
          </h1>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
            {list.length} emails in the drip · ordered by delay
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/emails/subscribers" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10,
            background: "var(--aw05)",
            border: `1px solid ${T.border}`,
            color: T.muted, fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>
            <Mail size={14} /> Subscribers
          </Link>
          <Link href="/admin/emails/send" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10,
            background: "var(--aw05)",
            border: `1px solid ${T.border}`,
            color: T.muted, fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>
            Send blast
          </Link>
          <Link href="/admin/emails/new" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10,
            background: T.purple,
            color: "#fff", fontSize: 13, fontWeight: 700,
            textDecoration: "none",
          }}>
            <Plus size={14} /> New email
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        {list.length === 0 ? (
          <div style={{ padding: "72px 0", textAlign: "center" }}>
            <Mail size={28} color={T.dim} strokeWidth={1.3} style={{ margin: "0 auto 12px" }} />
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>No emails yet</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["#", "Name", "Subject", "Delay", "Sent", "Pending", "Status", ""].map((h) => (
                  <th key={h} style={{
                    padding: "12px 18px", textAlign: "left",
                    fontSize: 11, fontWeight: 600, color: T.muted,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((seq, i) => {
                const counts = countMap[seq.id] ?? { sent: 0, pending: 0, failed: 0 };
                return (
                  <tr key={seq.id} style={{ borderBottom: i < list.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <td style={{ padding: "14px 18px", color: T.dim, fontSize: 13 }}>{seq.position}</td>
                    <td style={{ padding: "14px 18px", color: T.text, fontSize: 13, fontWeight: 600 }}>{seq.name}</td>
                    <td style={{ padding: "14px 18px", color: T.muted, fontSize: 13, maxWidth: 240 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {seq.subject}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: T.purple,
                        background: T.purpleBg, padding: "3px 9px", borderRadius: 6,
                      }}>
                        Day {seq.delay_days}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgb(52,211,153)" }}>
                        <CheckCircle size={13} /> {counts.sent}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgb(251,191,36)" }}>
                        <Clock size={13} /> {counts.pending}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <ToggleButton id={seq.id} isActive={seq.is_active} />
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/admin/emails/${seq.id}/edit`} style={{
                          fontSize: 12, fontWeight: 600, color: T.muted,
                          textDecoration: "none", padding: "5px 10px",
                          border: `1px solid ${T.border}`, borderRadius: 7,
                        }}>Edit</Link>
                        <DeleteButton id={seq.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Failed sends warning */}
      {Object.values(countMap).some(c => c.failed > 0) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 12,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          color: "rgb(248,113,113)", fontSize: 13,
        }}>
          <XCircle size={15} />
          Some sends have failed. Check the{" "}
          <Link href="/admin/emails/subscribers" style={{ color: "rgb(248,113,113)", fontWeight: 600 }}>
            subscriber queue
          </Link>{" "}
          to retry them.
        </div>
      )}
    </div>
  );
}
