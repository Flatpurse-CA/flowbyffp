"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { addTrialDays } from "./actions";

// Small inline "+N days" control — submits, then clears back to a blank
// input so it's ready for the next adjustment instead of showing a stale
// number that looks like a running total.
export function AddTrialDaysForm({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={addTrialDays}
      onSubmit={() => setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 0)}
      style={{ display: "flex", alignItems: "center", gap: 3 }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input
        ref={inputRef}
        name="days"
        type="number"
        placeholder="days"
        title="Add (or remove, with a negative number) days from the trial"
        style={{
          width: 46, height: 28, borderRadius: 8, textAlign: "center",
          background: "var(--aw04)", border: "1px solid var(--aw08)",
          color: "var(--atext2)", fontSize: 11.5, fontFamily: "inherit",
          outline: "none",
        }}
      />
      <button
        type="submit"
        title="Add days to trial"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: 8, cursor: "pointer",
          background: "var(--aw04)", border: "1px solid var(--aw08)",
          color: "var(--aw3)", fontFamily: "inherit",
        }}
      >
        <Plus size={12} />
      </button>
    </form>
  );
}
