"use client";

import { changeUserPlan } from "./actions";
import { ADMIN_PLAN_BADGE, planLabel } from "@/lib/plans";

const PLAN_OPTIONS = ["starter", "pro", "pro_plus", "enterprise"];

export function PlanSelect({ userId, plan }: { userId: string; plan: string }) {
  const badge = ADMIN_PLAN_BADGE[plan];
  return (
    <form action={changeUserPlan} style={{ display: "inline" }}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="plan"
        defaultValue={plan}
        style={{
          background: badge?.bg ?? "var(--aw3)",
          border: `1px solid ${badge?.bg ?? "var(--aw3)"}`,
          borderRadius: 20,
          color: badge?.fg ?? "rgb(255,255,255)",
          fontSize: 10.5,
          fontWeight: 700,
          padding: "3px 8px",
          cursor: "pointer",
          outline: "none",
          fontFamily: "inherit",
          textTransform: "capitalize",
          letterSpacing: "0.03em",
        }}
        onBlur={(e) => {
          const form = e.currentTarget.closest("form");
          if (form) form.requestSubmit();
        }}
      >
        {PLAN_OPTIONS.map(p => (
          <option key={p} value={p} style={{ background: "#1a1a1a" }}>{planLabel(p)}</option>
        ))}
      </select>
    </form>
  );
}
