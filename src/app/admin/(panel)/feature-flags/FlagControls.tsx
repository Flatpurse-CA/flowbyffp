"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toggleFlag, updateRollout, deleteFlag } from "./actions";

export function FlagToggle({ id, enabled }: { id: string; enabled: boolean }) {
  return (
    <form action={toggleFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="enabled" value={String(enabled)} />
      <button type="submit" style={{
        width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: enabled ? "rgb(109,40,217)" : "var(--aw12)",
        position: "relative", transition: "background 0.2s",
      }}>
        <span style={{ position: "absolute", top: 3, left: enabled ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
      </button>
    </form>
  );
}

export function RolloutInput({ id, rolloutPct }: { id: string; rolloutPct: number }) {
  const [value, setValue] = useState(rolloutPct);
  return (
    <form action={updateRollout} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="hidden" name="id" value={id} />
      <input
        type="number" name="rollout_pct" min={0} max={100} value={value}
        onChange={e => setValue(Number(e.target.value))}
        onBlur={e => e.currentTarget.form?.requestSubmit()}
        style={{
          width: 56, background: "var(--aw04)", border: "1px solid var(--aw09)",
          borderRadius: 8, padding: "5px 8px", color: "var(--atext)", fontSize: 12.5, outline: "none",
        }}
      />
      <span style={{ color: "var(--aw3)", fontSize: 12 }}>%</span>
    </form>
  );
}

export function DeleteFlagButton({ id }: { id: string }) {
  return (
    <form action={deleteFlag}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" title="Delete" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28, borderRadius: 8, cursor: "pointer",
        background: "var(--aw04)", border: "1px solid var(--aw08)",
        color: "var(--aw3)", fontFamily: "inherit",
      }}>
        <Trash2 size={12} />
      </button>
    </form>
  );
}
