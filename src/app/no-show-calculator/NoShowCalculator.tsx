"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Inputs = { staff: number; perDay: number; ticket: number; rate: number; days: number; recovery: number };

// Defaults match the worked example in /guides/cost-of-no-shows.
const DEFAULTS: Inputs = { staff: 4, perDay: 6, ticket: 70, rate: 5, days: 22, recovery: 50 };

const FIELDS: { key: keyof Inputs; label: string; min: number; max: number; step: number; prefix?: string; suffix?: string }[] = [
  { key: "staff", label: "Stylists, barbers or providers", min: 1, max: 30, step: 1 },
  { key: "perDay", label: "Appointments per person per day", min: 1, max: 20, step: 1 },
  { key: "ticket", label: "Average ticket", min: 10, max: 500, step: 5, prefix: "$" },
  { key: "rate", label: "No-show and late-cancel rate", min: 1, max: 30, step: 0.5, suffix: "%" },
  { key: "days", label: "Working days per month", min: 4, max: 31, step: 1 },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-CA")}`;

export function NoShowCalculator({ planMonthly }: { planMonthly: number }) {
  const [v, setV] = useState<Inputs>(DEFAULTS);

  // Numbers live in the URL so an owner can bookmark or share their result.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS) as (keyof Inputs)[]) {
      const n = Number(p.get(k));
      if (p.has(k) && isFinite(n) && n > 0) next[k] = n;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    setV(next);
  }, []);

  const set = (k: keyof Inputs, raw: string) => {
    const n = Number(raw);
    if (!isFinite(n) || n < 0) return;
    const next = { ...v, [k]: n };
    setV(next);
    // Only on user edits, so a shared link is never overwritten by the defaults.
    const p = new URLSearchParams(Object.entries(next).map(([key, val]) => [key, String(val)]));
    window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
  };

  const missedPerMonth = v.staff * v.perDay * v.days * (v.rate / 100);
  const lostMonth = missedPerMonth * v.ticket;
  const lostYear = lostMonth * 12;
  const recoveredYear = lostYear * (v.recovery / 100);
  const planYear = planMonthly * 12;
  const multiple = planYear > 0 ? recoveredYear / planYear : 0;

  return (
    <div className="nsc">
      <div className="nsc-inputs">
        {FIELDS.map(f => (
          <label key={f.key} className="nsc-field">
            <span className="nsc-label">{f.label}</span>
            <span className="nsc-row">
              <input type="range" min={f.min} max={f.max} step={f.step} value={Math.min(f.max, v[f.key])} onChange={e => set(f.key, e.target.value)} aria-label={f.label} />
              <span className="nsc-num">
                {f.prefix}
                <input type="number" inputMode="decimal" min={0} step={f.step} value={v[f.key]} onChange={e => set(f.key, e.target.value)} aria-label={`${f.label} value`} />
                {f.suffix}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="nsc-results" aria-live="polite">
        <div className="nsc-big">
          <span className="nsc-kicker">No-shows cost you about</span>
          <strong>{money(lostYear)}</strong>
          <span>a year</span>
        </div>
        <dl className="nsc-stats">
          <div><dt>Per month</dt><dd>{money(lostMonth)}</dd></div>
          <div><dt>Missed appointments a year</dt><dd>{Math.round(missedPerMonth * 12).toLocaleString("en-CA")}</dd></div>
          <div><dt>Per person a year</dt><dd>{money(lostYear / Math.max(1, v.staff))}</dd></div>
        </dl>

        <div className="nsc-recover">
          <label className="nsc-field">
            <span className="nsc-label">If Flow wins back {v.recovery}% of them</span>
            <input type="range" min={10} max={80} step={5} value={v.recovery} onChange={e => set("recovery", e.target.value)} aria-label="Share of no-shows recovered" />
          </label>
          <p>
            You keep <strong>{money(recoveredYear)}</strong> a year. Pro+ costs {money(planYear)} a year, so that&apos;s
            about <strong>{multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}×</strong> what you pay.
          </p>
          <Link className="button" href="/signup">Start recovering no-shows</Link>
        </div>
      </div>
    </div>
  );
}
