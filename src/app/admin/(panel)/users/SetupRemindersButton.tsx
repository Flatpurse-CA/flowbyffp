"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { sendSetupRemindersToAll } from "./actions";

// Emails every verified owner who never created a shop. Confirms first, then
// reports what happened; anyone reminded in the last 3 days is skipped.
export function SetupRemindersButton({ eligible }: { eligible: number }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  if (eligible === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {result && <span style={{ color: "var(--aw45)", fontSize: 12.5 }}>{result}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          if (!confirm(`Email ${eligible} owner${eligible === 1 ? "" : "s"} who signed up but never set up a shop? Anyone reminded in the last 3 days is skipped.`)) return;
          setPending(true);
          const r = await sendSetupRemindersToAll();
          setPending(false);
          setResult(`Sent ${r.sent}${r.skipped ? `, skipped ${r.skipped} (recently reminded)` : ""}${r.failed ? `, ${r.failed} failed` : ""}`);
        }}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9,
          cursor: pending ? "default" : "pointer", background: "var(--asurface1)", border: "1px solid var(--aw08)",
          color: "var(--atext2)", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
          opacity: pending ? 0.6 : 1, whiteSpace: "nowrap",
        }}
      >
        <Send size={13} />
        {pending ? "Sending…" : `Remind ${eligible} to finish setup`}
      </button>
    </div>
  );
}
