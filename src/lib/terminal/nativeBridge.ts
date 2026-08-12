import { Capacitor, registerPlugin } from "@capacitor/core";

// JS-side wrapper for the native TerminalPlugin (ios/App/App/TerminalPlugin.swift).
// Only does anything inside the Capacitor iOS shell — on the regular website
// (Capacitor.isNativePlatform() === false) every function here rejects with
// a clear "not available" error instead of touching native APIs that don't
// exist, so nothing about the existing web checkout flow is affected.
interface TerminalNativePlugin {
  provideConnectionToken(opts: { secret?: string; errorMessage?: string }): Promise<void>;
  discoverAndConnect(opts: { locationId: string }): Promise<{ readerId: string }>;
  collectAndConfirmPayment(opts: { clientSecret: string }): Promise<{ paymentIntentId: string; status: string }>;
  addListener(eventName: "connectionTokenRequested", listenerFunc: () => void): Promise<{ remove: () => void }>;
  addListener(eventName: string, listenerFunc: (data: Record<string, unknown>) => void): Promise<{ remove: () => void }>;
}

const TerminalNative = registerPlugin<TerminalNativePlugin>("Terminal");

let listenerAttached = false;

// Wires the native "connectionTokenRequested" event to an authenticated
// fetch against /api/terminal/connection-token (runs inside the WKWebView,
// so it carries the logged-in shop owner/staff session cookie automatically
// — the native Swift side has no way to do this fetch itself). Call this
// once, e.g. from the dashboard layout, before any Tap to Pay action.
export function initTerminalBridge() {
  if (!Capacitor.isNativePlatform() || listenerAttached) return;
  listenerAttached = true;

  TerminalNative.addListener("connectionTokenRequested", async () => {
    try {
      const res = await fetch("/api/terminal/connection-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.secret) {
        await TerminalNative.provideConnectionToken({ errorMessage: data.error ?? "Failed to fetch connection token" });
        return;
      }
      await TerminalNative.provideConnectionToken({ secret: data.secret });
    } catch (err) {
      await TerminalNative.provideConnectionToken({ errorMessage: err instanceof Error ? err.message : "Network error" });
    }
  });
}

function assertNative() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Tap to Pay is only available in the FLOWBYFFP iOS app, not the website.");
  }
}

// Full in-person charge flow for a given amount, tied to an appointment.
// Discovers + connects to this iPhone's own Tap to Pay reader, then walks
// the customer through tapping their card, then captures the charge.
export async function chargeInPerson(opts: { amount: number; appointmentId?: string; locationId: string }) {
  assertNative();

  const createRes = await fetch("/api/terminal/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: opts.amount, appointmentId: opts.appointmentId }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(createData.error ?? "Failed to create payment");

  await TerminalNative.discoverAndConnect({ locationId: opts.locationId });

  const collected = await TerminalNative.collectAndConfirmPayment({ clientSecret: createData.clientSecret });

  const captureRes = await fetch("/api/terminal/capture-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId: collected.paymentIntentId }),
  });
  const captureData = await captureRes.json();
  if (!captureRes.ok) throw new Error(captureData.error ?? "Failed to capture payment");

  return captureData;
}
