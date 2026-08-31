"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { restartAllTrials } from "./actions";

// Bulk action affecting every shop on the platform — confirm before firing,
// unlike the per-row trial actions which are scoped to one account.
export function RestartAllTrialsButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm("Restart the trial clock for every user on the platform? This resets everyone's remaining trial+grace window to a fresh 7+7 days as of right now.")) return;
        setPending(true);
        await restartAllTrials();
        setPending(false);
      }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 9, cursor: pending ? "default" : "pointer",
        background: "var(--astatus-purple-bg)", border: "1px solid var(--astatus-purple-border)",
        color: "var(--astatus-purple-fg)", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
        opacity: pending ? 0.6 : 1, whiteSpace: "nowrap",
      }}
    >
      <RotateCcw size={13} />
      {pending ? "Restarting…" : "Restart all trials"}
    </button>
  );
}
