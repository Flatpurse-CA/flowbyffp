"use client";

import { useRef } from "react";
import { CalendarPlus } from "lucide-react";
import { addTrialDays } from "./actions";

// "+N days" control, shown as a row in the Users table's actions menu.
// Submits, then clears back to a blank input so it's ready for the next
// adjustment instead of showing a stale number that looks like a running total.
export function AddTrialDaysForm({ userId }: { userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={addTrialDays}
      onSubmit={() => setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 0)}
      className="admin-menu-row"
    >
      <input type="hidden" name="userId" value={userId} />
      <CalendarPlus size={13} style={{ flexShrink: 0, color: "var(--aw45)" }} />
      <input
        ref={inputRef}
        name="days"
        type="number"
        placeholder="± days"
        title="Add (or remove, with a negative number) days from the trial"
        style={{
          flex: 1, minWidth: 0, height: 28, borderRadius: 7, padding: "0 8px",
          background: "var(--asurface1)", border: "1px solid var(--aw08)",
          color: "var(--atext2)", fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          height: 28, padding: "0 10px", borderRadius: 7, cursor: "pointer", border: "none",
          background: "var(--astatus-purple-bg)", color: "var(--astatus-purple-fg)",
          fontSize: 11.5, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap",
        }}
      >
        Add
      </button>
    </form>
  );
}
