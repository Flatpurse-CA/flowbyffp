"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, X, LogOut, Gift } from "lucide-react";
import type { AppointmentStatus } from "@/app/dashboard/appointments/actions";
import type { MyBooking } from "./actions";
import { cancelMyBooking, updateBirthday, type SavedCard } from "./actions";
import { customerLogout } from "../actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PaymentMethodsSection } from "./PaymentMethodsSection";

const STATUS_LABEL: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "var(--cust-text-sub)", bg: "var(--cust-card-border)" },
  confirmed: { label: "Confirmed", color: "rgb(21,128,86)",      bg: "rgba(16,185,129,0.12)"  },
  pending:   { label: "Pending",   color: "rgb(180,120,10)",     bg: "rgba(245,158,11,0.12)"  },
  deposit:   { label: "Deposit paid", color: "rgb(180,120,10)",  bg: "rgba(245,158,11,0.12)"  },
  cancelled: { label: "Cancelled", color: "var(--cust-text-faint)", bg: "var(--cust-card-border)" },
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n.toLocaleString()}` : `C$${n.toFixed(2)}`;
}

const card: React.CSSProperties = { background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", borderRadius: 16, boxShadow: "var(--cust-shadow)" };

export function AccountClient({ customerName, bookings, dateOfBirth, cards }: { customerName: string; bookings: MyBooking[]; dateOfBirth: string | null; cards: SavedCard[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [birthday, setBirthday] = useState(dateOfBirth ?? "");
  const [savingBirthday, setSavingBirthday] = useState(false);
  const [birthdaySaved, setBirthdaySaved] = useState(false);

  const handleSaveBirthday = async () => {
    setSavingBirthday(true);
    setBirthdaySaved(false);
    const res = await updateBirthday(birthday);
    setSavingBirthday(false);
    if (res.error) { setError(res.error); return; }
    setBirthdaySaved(true);
  };

  const now = new Date();
  const upcoming = bookings.filter(b => b.status !== "cancelled" && b.status !== "completed" && new Date(b.starts_at) >= now);
  const past = bookings.filter(b => b.status === "completed" || b.status === "cancelled" || new Date(b.starts_at) < now);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    setError(null);
    try {
      await cancelMyBooking(id);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't cancel that booking");
    } finally {
      setCancellingId(null);
    }
  };

  const Row = ({ b }: { b: MyBooking }) => {
    const s = STATUS_LABEL[b.status];
    const canCancel = b.status !== "cancelled" && b.status !== "completed" && new Date(b.starts_at) >= now;
    return (
      <div style={{ ...card, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(109,40,217,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Calendar size={17} color="rgb(109,40,217)" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "var(--cust-text)", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{b.service_name}</p>
          <p style={{ color: "var(--cust-text-sub)", fontSize: 12.5, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={11} /> {fmtDate(b.starts_at)}{b.stylist_name ? ` · ${b.stylist_name}` : ""}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ color: "var(--cust-text)", fontSize: 14, fontWeight: 800, margin: "0 0 4px" }}>{fmtPrice(Number(b.price))}</p>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>
        </div>
        {canCancel && (
          <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id} title="Cancel booking" style={{
            width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.06)", color: "rgb(220,38,38)", cursor: cancellingId === b.id ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: cancellingId === b.id ? 0.5 : 1,
          }}>
            <X size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cust-bg)", fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ color: "var(--cust-text)", fontSize: 24, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" }}>My bookings</h1>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Signed in as {customerName}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <ThemeToggle />
            <form action={customerLogout}>
              <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", color: "var(--cust-text-sub)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <LogOut size={13} /> Sign out
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(185,28,28)", fontSize: 12.5, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <PaymentMethodsSection cards={cards} />

        <div style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109,40,217,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Gift size={16} color="rgb(109,40,217)" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ color: "var(--cust-text)", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>Birthday (optional)</p>
            <p style={{ color: "var(--cust-text-sub)", fontSize: 11.5, margin: 0 }}>Add it and shops you visit can send you a birthday offer.</p>
          </div>
          <input
            type="date"
            value={birthday}
            onChange={e => { setBirthday(e.target.value); setBirthdaySaved(false); }}
            style={{
              padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--cust-input-border)",
              background: "var(--cust-input-bg)", color: "var(--cust-text)", fontSize: 16, outline: "none", fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSaveBirthday}
            disabled={savingBirthday || birthday === (dateOfBirth ?? "")}
            style={{
              padding: "8px 14px", borderRadius: 8, border: "none", background: "rgb(109,40,217)", color: "white",
              fontSize: 12.5, fontWeight: 700, cursor: savingBirthday ? "default" : "pointer",
              opacity: savingBirthday || birthday === (dateOfBirth ?? "") ? 0.5 : 1,
            }}
          >
            {savingBirthday ? "Saving…" : birthdaySaved ? "Saved" : "Save"}
          </button>
        </div>

        <p style={{ color: "var(--cust-text-sub)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Upcoming</p>
        {upcoming.length === 0 ? (
          <div style={{ ...card, padding: "30px 20px", textAlign: "center", color: "var(--cust-text-faint)", fontSize: 13, marginBottom: 28 }}>No upcoming bookings</div>
        ) : (
          <div style={{ marginBottom: 28 }}>{upcoming.map(b => <Row key={b.id} b={b} />)}</div>
        )}

        <p style={{ color: "var(--cust-text-sub)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 10px" }}>Past</p>
        {past.length === 0 ? (
          <div style={{ ...card, padding: "30px 20px", textAlign: "center", color: "var(--cust-text-faint)", fontSize: 13 }}>No past bookings yet</div>
        ) : (
          <div>{past.map(b => <Row key={b.id} b={b} />)}</div>
        )}
      </div>
    </div>
  );
}
