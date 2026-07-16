"use client";

import { changeUserPlan } from "./actions";
import { PLAN_COLORS, PLAN_BG } from "@/lib/plans";

const PLAN_OPTIONS = ["starter", "pro", "unlimited", "founders"];

export function PlanSelect({ userId, plan }: { userId: string; plan: string }) {
  return (
    <form action={changeUserPlan} style={{ display: "inline" }}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="plan"
        defaultValue={plan}
        style={{
          background: PLAN_BG[plan] ?? "rgba(255,255,255,0.06)",
          border: `1px solid ${PLAN_COLORS[plan] ?? "rgba(255,255,255,0.15)"}33`,
          borderRadius: 20,
          color: PLAN_COLORS[plan] ?? "rgba(255,255,255,0.35)",
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
          <option key={p} value={p} style={{ background: "#1a1a1a", textTransform: "capitalize" }}>{p}</option>
        ))}
      </select>
    </form>
  );
}
