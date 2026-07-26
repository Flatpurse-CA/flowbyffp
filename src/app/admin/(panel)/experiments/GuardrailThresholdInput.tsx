"use client";

import { useState } from "react";
import { updateGuardrailThreshold } from "./actions";

export function GuardrailThresholdInput({ id, threshold }: { id: string; threshold: number }) {
  const [value, setValue] = useState(threshold);
  return (
    <form action={updateGuardrailThreshold} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5 }}>Threshold</span>
      <input
        type="number" name="threshold" value={value} step="0.1"
        onChange={e => setValue(Number(e.target.value))}
        onBlur={e => e.currentTarget.form?.requestSubmit()}
        style={{
          width: 60, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 8, padding: "5px 8px", color: "rgb(240,240,248)", fontSize: 12.5, outline: "none",
        }}
      />
    </form>
  );
}
