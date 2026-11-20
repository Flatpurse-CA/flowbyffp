"use client";

import { useState, useTransition } from "react";
import { keepPlan, resumePlan } from "./settings/cancel/actions";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

/** "Your plan ends on {date}. [Keep my plan]" / paused banner with one-tap undo (FL-066/067). */
export function PlanStatusBanner({ cancelAt, pausedUntil }: { cancelAt: string | null; pausedUntil: string | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const paused = Boolean(pausedUntil);
  const run = () => start(async () => { const r = await (paused ? resumePlan() : keepPlan()); setError(r.error ?? null); });

  return (
    <div style={{ background: paused ? "rgb(180,83,9)" : "rgb(185,28,28)", color: "#fff", padding: "10px 16px", fontSize: 13.5, fontWeight: 600, display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
      <span>{paused ? `Your plan is paused until ${fmt(pausedUntil!)}. Booking page and AutoPilot are off.` : `Your plan ends on ${fmt(cancelAt!)}.`}</span>
      <button type="button" disabled={pending} onClick={run} style={{ background: "#fff", color: "#111", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        {pending ? "Working..." : paused ? "Resume now" : "Keep my plan"}
      </button>
      {error && <span>{error}</span>}
    </div>
  );
}
