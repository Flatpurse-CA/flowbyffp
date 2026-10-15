"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { setDemoRequestStatus } from "./actions";
import { DEMO_STATUSES, DEMO_STATUS_STYLE, type DemoStatus } from "./statuses";

// Same pill-select treatment as the Users table plan picker. Saves on
// change; reverts the pill if the save fails.
export function StatusSelect({ id, status }: { id: string; status: DemoStatus }) {
  const [value, setValue] = useState<DemoStatus>(status);
  const [pending, startTransition] = useTransition();
  const style = DEMO_STATUS_STYLE[value] ?? DEMO_STATUS_STYLE.new;

  return (
    <span style={{ display: "inline-block", position: "relative", opacity: pending ? 0.6 : 1 }}>
      <select
        aria-label="Status"
        value={value}
        disabled={pending}
        className="admin-plan-select"
        onChange={e => {
          const next = e.target.value as DemoStatus;
          const prev = value;
          setValue(next);
          startTransition(async () => {
            const res = await setDemoRequestStatus(id, next);
            if (res.error) setValue(prev);
          });
        }}
        style={{
          appearance: "none", WebkitAppearance: "none",
          width: 112, height: 26, padding: "0 26px 0 11px",
          background: style.bg, color: style.fg,
          border: "none", borderRadius: 7,
          fontSize: 11.5, fontWeight: 700, fontFamily: "inherit",
          cursor: "pointer", outline: "none",
        }}
      >
        {DEMO_STATUSES.map(s => <option key={s} value={s}>{DEMO_STATUS_STYLE[s].label}</option>)}
      </select>
      <ChevronDown size={13} strokeWidth={2.5} color={style.fg}
        style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.85 }} />
    </span>
  );
}
