"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Trash2, Star, Plus } from "lucide-react";
import { createCardSetupIntent, removePaymentMethod, setDefaultPaymentMethod, type SavedCard } from "./actions";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const card: React.CSSProperties = { background: "var(--cust-card-bg)", border: "1px solid var(--cust-card-border)", borderRadius: 16, boxShadow: "var(--cust-shadow)" };

function AddCardForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmSetup({ elements, redirect: "if_required" });
    setSubmitting(false);
    if (confirmError) { setError(confirmError.message ?? "Couldn't save card"); return; }
    onDone();
  };

  return (
    <div style={{ marginTop: 12 }}>
      <PaymentElement />
      {error && <p style={{ color: "rgb(220,38,38)", fontSize: 12.5, margin: "10px 0 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={handleSubmit} disabled={submitting} style={{
          flex: 1, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgb(109,40,217)",
          color: "white", fontSize: 13, fontWeight: 700, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1,
        }}>
          {submitting ? "Saving…" : "Save card"}
        </button>
        <button onClick={onCancel} disabled={submitting} style={{
          padding: "10px 14px", borderRadius: 10, border: "1px solid var(--cust-card-border)",
          background: "transparent", color: "var(--cust-text-sub)", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PaymentMethodsSection({ cards }: { cards: SavedCard[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAdd = async () => {
    setError(null);
    const res = await createCardSetupIntent();
    if (res.error || !res.clientSecret) { setError(res.error ?? "Couldn't start card setup"); return; }
    setClientSecret(res.clientSecret);
    setAdding(true);
  };

  const cancelAdd = () => { setAdding(false); setClientSecret(null); };
  const finishAdd = () => { cancelAdd(); router.refresh(); };

  const handleRemove = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await removePaymentMethod(id);
    setBusyId(null);
    if (res.error) { setError(res.error); return; }
    router.refresh();
  };

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await setDefaultPaymentMethod(id);
    setBusyId(null);
    if (res.error) { setError(res.error); return; }
    router.refresh();
  };

  return (
    <div style={{ ...card, padding: "16px 18px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "var(--cust-text)", fontSize: 13, fontWeight: 700, margin: 0 }}>Payment methods</p>
        {!adding && (
          <button onClick={startAdd} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8,
            border: "1px solid var(--cust-card-border)", background: "transparent", color: "rgb(109,40,217)",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={13} /> Add card
          </button>
        )}
      </div>

      {error && <p style={{ color: "rgb(220,38,38)", fontSize: 12.5, margin: "10px 0 0" }}>{error}</p>}

      {cards.map(c => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", marginTop: 10, borderTop: "1px solid var(--cust-card-border)" }}>
          <CreditCard size={16} color="var(--cust-text-sub)" />
          <span style={{ flex: 1, color: "var(--cust-text)", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
            {c.brand} •••• {c.last4}{" "}
            <span style={{ color: "var(--cust-text-faint)", fontWeight: 400 }}>exp {c.expMonth}/{String(c.expYear).slice(-2)}</span>
          </span>
          {c.isDefault ? (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgb(21,128,86)", background: "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: 20 }}>Default</span>
          ) : (
            <button onClick={() => handleSetDefault(c.id)} disabled={busyId === c.id} title="Make default" style={{
              width: 28, height: 28, borderRadius: 8, border: "1px solid var(--cust-card-border)", background: "transparent",
              color: "var(--cust-text-faint)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Star size={13} />
            </button>
          )}
          <button onClick={() => handleRemove(c.id)} disabled={busyId === c.id} title="Remove card" style={{
            width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
            color: "rgb(220,38,38)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: busyId === c.id ? 0.5 : 1,
          }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {!cards.length && !adding && <p style={{ color: "var(--cust-text-faint)", fontSize: 12.5, margin: "10px 0 0" }}>No saved cards yet.</p>}

      {adding && clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <AddCardForm onDone={finishAdd} onCancel={cancelAdd} />
        </Elements>
      )}
    </div>
  );
}
