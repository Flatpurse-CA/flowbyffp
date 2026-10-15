"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { changeUserPlan } from "./actions";
import { ADMIN_PLAN_BADGE, planLabel } from "@/lib/plans";

const PLAN_OPTIONS = ["starter", "pro", "pro_plus", "enterprise"];

// Native <select> (keyboard + mobile pickers for free) with the browser
// chrome stripped: fixed width so every row lines up, our own chevron, and
// the pill colour follows the current choice instead of the saved one.
export function PlanSelect({ userId, plan }: { userId: string; plan: string }) {
  const [value, setValue] = useState(plan);
  const [saved, setSaved] = useState(plan);
  const badge = ADMIN_PLAN_BADGE[value];

  return (
    <form action={changeUserPlan} style={{ display: "inline-block", position: "relative" }}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="plan"
        value={value}
        aria-label="Plan"
        onChange={e => setValue(e.target.value)}
        onBlur={e => {
          if (value === saved) return;
          setSaved(value);
          e.currentTarget.closest("form")?.requestSubmit();
        }}
        className="admin-plan-select"
        style={{
          appearance: "none", WebkitAppearance: "none",
          width: 112, height: 26, padding: "0 26px 0 11px",
          background: badge?.bg ?? "var(--aw3)",
          border: "none", borderRadius: 7,
          color: badge?.fg ?? "rgb(255,255,255)",
          fontSize: 11.5, fontWeight: 700, fontFamily: "inherit",
          cursor: "pointer", outline: "none",
        }}
      >
        {PLAN_OPTIONS.map(p => (
          <option key={p} value={p}>{planLabel(p)}</option>
        ))}
      </select>
      <ChevronDown
        size={13}
        strokeWidth={2.5}
        color={badge?.fg ?? "rgb(255,255,255)"}
        style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.85 }}
      />
    </form>
  );
}
