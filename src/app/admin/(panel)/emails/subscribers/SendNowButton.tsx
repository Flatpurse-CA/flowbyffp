"use client";

import { useState } from "react";
import { triggerSendNow } from "../actions";

export function SendNowButton({ sendId }: { sendId: string }) {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    const result = await triggerSendNow(sendId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
    }
  }

  if (done) return <span style={{ fontSize: 12, color: "rgb(52,211,153)" }}>Sent ✓</span>;

  return (
    <div>
      <button onClick={handle} disabled={loading} style={{
        fontSize: 12, fontWeight: 600,
        padding: "5px 12px", borderRadius: 7,
        border: "none",
        background: "var(--astatus-purple-bg)",
        color: "var(--astatus-purple-fg)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "inherit",
      }}>
        {loading ? "Sending…" : "Send now"}
      </button>
      {error && <p style={{ fontSize: 11, color: "rgb(248,113,113)", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}
