import { createAdminClient } from "@/lib/supabase/admin";
import { History } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const ACTION_LABELS: Record<string, string> = {
  ban_user: "Banned user",
  unban_user: "Unbanned user",
  delete_user: "Deleted user",
  change_user_plan: "Changed plan",
  create_feature_flag: "Created feature flag",
  toggle_feature_flag: "Toggled feature flag",
  update_feature_flag_rollout: "Updated flag rollout",
  delete_feature_flag: "Deleted feature flag",
  create_experiment: "Created experiment",
  start_experiment: "Started experiment",
  pause_experiment: "Paused experiment",
  rollout_experiment_winner: "Rolled out experiment winner",
  archive_experiment: "Archived experiment",
  update_guardrail_threshold: "Updated guardrail threshold",
  delete_waitlist_entry: "Deleted waitlist entry",
  bulk_delete_waitlist_entries: "Bulk-deleted waitlist entries",
  add_admin: "Added admin",
  remove_admin: "Removed admin",
  update_own_password: "Updated own password",
  create_sequence_email: "Created sequence email",
  update_sequence_email: "Updated sequence email",
  toggle_sequence_email: "Toggled sequence email",
  delete_sequence_email: "Deleted sequence email",
  trigger_send_now: "Manually triggered send",
  send_email_blast: "Sent email blast",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AuditLogPage() {
  const admin = createAdminClient();

  const { data: entries } = await admin
    .from("admin_audit_log")
    .select("id, admin_email, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Audit Log</h1>
        <p style={{ color: "var(--aw38)", fontSize: 13, margin: 0 }}>Every mutating action taken from this admin panel, most recent first.</p>
      </div>

      <div style={{ background: "var(--am1)", border: "1px solid var(--aw09)", borderRadius: 16, overflow: "hidden" }}>
        {!entries || entries.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <History size={22} color="var(--aw2)" style={{ marginBottom: 10 }} />
            <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>No admin actions logged yet.</p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={e.id} style={{
              display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 20px",
              borderBottom: i < entries.length - 1 ? "1px solid var(--aw05)" : "none",
            }}>
              <div style={{ width: 130, flexShrink: 0, color: "var(--aw3)", fontSize: 12 }}>{fmtDate(e.created_at as string)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--atext2)", fontSize: 13.5, fontWeight: 600, margin: "0 0 2px" }}>
                  {ACTION_LABELS[e.action as string] ?? e.action}
                  {e.target_id ? <span style={{ color: "var(--aw35)", fontWeight: 400 }}> · {e.target_type} {String(e.target_id).slice(0, 8)}</span> : null}
                </p>
                <p style={{ color: "var(--aw3)", fontSize: 12, margin: 0 }}>
                  by {e.admin_email}
                  {e.details ? ` — ${JSON.stringify(e.details)}` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
