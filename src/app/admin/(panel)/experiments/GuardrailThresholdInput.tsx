"use client";

import { useState } from "react";
import { updateGuardrailThreshold } from "./actions";

export function GuardrailThresholdInput({ id, threshold }: { id: string; threshold: number }) {
  const [value, setValue] = useState(threshold);
  return (
    <form action={updateGuardrailThreshold} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <span style={{ color: "var(--aw3)", fontSize: 11.5 }}>Threshold</span>
      <input
        type="number" name="threshold" value={value} step="0.1"
        onChange={e => setValue(Number(e.target.value))}
        onBlur={e => e.currentTarget.form?.requestSubmit()}
        style={{
          width: 60, background: "var(--aw04)", border: "1px solid var(--aw09)",
          borderRadius: 8, padding: "5px 8px", color: "var(--atext)", fontSize: 12.5, outline: "none",
        }}
      />
    </form>
  );
}
