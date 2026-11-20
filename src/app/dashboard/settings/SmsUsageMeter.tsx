import { smsUsage } from "@/lib/sms/allowance";

/** FL-075: this month's texts vs. the plan allowance. */
export async function SmsUsageMeter({ shopId }: { shopId: string }) {
  const { sent, allowance } = await smsUsage(shopId);
  if (!Number.isFinite(allowance)) return null;
  const pct = Math.min(100, Math.round((sent / allowance) * 100));
  const color = pct >= 100 ? "rgb(220,38,38)" : pct >= 80 ? "rgb(217,119,6)" : "rgb(109,40,217)";
  return (
    <div style={{ margin: "0 0 16px", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--dtext)", fontSize: 13.5, fontWeight: 600 }}>
        <span>Texts this month</span><span>{sent} of {allowance}</span>
      </div>
      <div style={{ height: 8, background: "var(--dsurface3)", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
      <p style={{ color: "var(--dw45)", fontSize: 12, margin: "8px 0 0" }}>
        {pct >= 100 ? "Marketing texts are paused until next month; those clients get email. Booking texts still send." : "Booking texts always send. At 100%, marketing texts switch to email."}
      </p>
    </div>
  );
}
