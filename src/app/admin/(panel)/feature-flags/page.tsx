import { createAdminClient } from "@/lib/supabase/admin";
import { Flag } from "lucide-react";
import { createFlag } from "./actions";
import { FlagToggle, RolloutInput, DeleteFlagButton } from "./FlagControls";

type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_pct: number;
  created_at: string;
};

export default async function AdminFeatureFlagsPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("feature_flags").select("*").order("created_at", { ascending: false });
  const flags = (data ?? []) as FeatureFlag[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Feature Flags</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          Staged rollouts for your own app features. Call <code>isFeatureEnabled(key, shopId)</code> from <code>src/lib/featureFlags.ts</code> anywhere you want to gate something by a flag.
        </p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px" }}>
        <p style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>New flag</p>
        <form action={createFlag} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 5 }}>Key</label>
            <input name="key" placeholder="e.g. new_booking_flow" required style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 9, padding: "9px 12px", color: "rgb(240,240,248)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 5 }}>Name</label>
            <input name="name" placeholder="New booking flow" required style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 9, padding: "9px 12px", color: "rgb(240,240,248)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ flex: "2 1 240px" }}>
            <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 5 }}>Description</label>
            <input name="description" placeholder="Optional" style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 9, padding: "9px 12px", color: "rgb(240,240,248)", fontSize: 13, outline: "none", boxSizing: "border-box",
            }} />
          </div>
          <button type="submit" style={{
            padding: "9px 20px", borderRadius: 9, border: "none", background: "rgb(109,40,217)",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Create
          </button>
        </form>
      </div>

      {flags.length === 0 ? (
        <div style={{ background: "rgb(10,10,12)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flag size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No feature flags yet</p>
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                {["Flag", "Enabled", "Rollout", ""].map(h => (
                  <th key={h} style={{
                    padding: "11px 18px", textAlign: "left",
                    color: "rgba(255,255,255,0.28)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                    borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: i < flags.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "13px 18px" }}>
                    <p style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{f.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11.5, margin: 0, fontFamily: "monospace" }}>{f.key}</p>
                    {f.description && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, margin: "2px 0 0" }}>{f.description}</p>}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <FlagToggle id={f.id} enabled={f.enabled} />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <RolloutInput id={f.id} rolloutPct={f.rollout_pct} />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <DeleteFlagButton id={f.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
