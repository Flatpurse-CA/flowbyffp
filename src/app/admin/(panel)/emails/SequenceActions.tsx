"use client";

import { useState } from "react";
import { toggleSequenceEmail, deleteSequenceEmail } from "./actions";

const T = {
  border: "rgba(255,255,255,0.09)",
  muted:  "rgba(255,255,255,0.35)",
};

export function ToggleButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await toggleSequenceEmail(id, !active);
    setActive(v => !v);
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      style={{
        fontSize: 11, fontWeight: 700,
        padding: "3px 10px", borderRadius: 6,
        border: "none", cursor: loading ? "not-allowed" : "pointer",
        background: active ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
        color: active ? "rgb(52,211,153)" : T.muted,
        opacity: loading ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("Delete this email from the sequence?")) return;
    setLoading(true);
    await deleteSequenceEmail(id);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      style={{
        fontSize: 12, fontWeight: 600,
        padding: "5px 10px", borderRadius: 7,
        border: "1px solid rgba(239,68,68,0.25)",
        background: "rgba(239,68,68,0.07)",
        color: "rgb(248,113,113)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
