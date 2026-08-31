"use client";

import { useState } from "react";
import { toggleSequenceEmail, deleteSequenceEmail } from "./actions";

const T = {
  border: "var(--aw09)",
  muted:  "var(--aw35)",
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
        background: active ? "var(--astatus-green-bg)" : "var(--aw06)",
        color: active ? "var(--astatus-green-fg)" : T.muted,
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
        border: "none",
        background: "var(--astatus-red-bg)",
        color: "var(--astatus-red-fg)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
