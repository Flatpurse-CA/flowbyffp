# Appointment Detail & Close-out — Build Log

Scope: `src/app/dashboard/` (owner-facing dashboard). Implements PRD §15b (Appointment Detail) and §15c (Close-out Modal), the two pieces of the "core transactional loop" that were missing.

File touched: `src/app/dashboard/appointments/page.tsx` only.

## What existed before

- Day / Week / List views of bookings, all static mock data.
- A "New Booking" overlay (multi-step wizard) — already built, unchanged.
- Booking rows in Day and List view were visually styled as clickable (`cursor: pointer`) but had no `onClick` — tapping a booking did nothing.
- No way to view a single appointment's details, reschedule it, cancel it, or collect payment for it.

## Step 1 — Extended the mock data with detail fields

`Booking` type (Day view) and the `LIST_BOOKINGS` array (List view) each gained:
- `phone`, `email` — client contact info
- `notes` — client/service notes shown in the detail view
- `depositAmount` (optional) — for bookings where a deposit was already collected at booking time (e.g. Zara Johnson, C$40)

`LIST_BOOKINGS` also gained a `duration` field (it previously only existed on Day view bookings).

## Step 2 — Unified appointment record type

Day view and List view stored appointments in two differently-shaped arrays (one keyed by hour/min, one by date/time strings). Added a shared type and two normalizer functions so both views can feed the same detail component:

```ts
type ApptRecord = {
  id, name, initials, color,
  service, stylist, price, duration,
  dateLabel, time, status,
  phone, email, notes, depositAmount?
};

dayBookingToAppt(booking)   // Day view → ApptRecord
listBookingToAppt(booking)  // List view → ApptRecord
```

Also extended `STATUS_STYLE` with `completed` and `cancelled` variants (previously only `confirmed` / `pending` / `deposit` existed).

## Step 3 — Appointment Detail overlay (PRD §15b)

New `AppointmentDetail` component, full-screen overlay matching the existing Client Profile overlay's visual style (dark card, rounded 24px, same spacing/typography):

- **Header**: avatar, name, date + time, status badge, deposit-paid badge if applicable
- **Client card**: phone/email + Message/Call quick-action buttons
- **Service card**: service, stylist, duration, price
- **Client notes card**: free-text notes, or a muted "No notes on file" fallback
- **Reschedule**: toggles an inline panel with a date picker + time-slot grid; "Confirm new time" is disabled until both are set
- **Cancel**: toggles an inline confirmation ("Cancel this appointment? ... [Never mind] [Cancel appointment]"); confirming sets local status to `cancelled`, which replaces the action footer with a "This appointment has been cancelled" notice
- **Primary action**: "Mark as completed →" — opens the Close-out modal

## Step 4 — Close-out Modal (PRD §15c)

New `CloseOutModal` component, opened from the Appointment Detail's primary action:

- **Gratuity selector**: No tip / 15% / 18% / 20% / Custom (percentages apply to the service price; Custom accepts a raw dollar amount)
- **Total breakdown card**: service price, deposit already paid (subtracted, shown in green), gratuity, total due
- **Payment method** (2×2 grid, matches PRD's four methods):
  - Tap to Pay — NFC/contactless
  - Payment Link — reveals an SMS / WhatsApp / Email channel picker
  - Card on File — shows the saved card ("Visa •••• 4242")
  - Cash — collected in person
- **Receipt toggle**: "Text receipt to client" (defaults on), shows the client's phone number
- **Primary CTA**: "Complete · Collect C$X" (disabled until a method is picked) — the exact button copy specified in the PRD
- **Processing state**: method-specific icon with an NFC-style pulse ring and status line ("Hold card or phone near reader…", "Sending payment link…", etc.)
- **Success state**: green checkmark, "C$X collected", method-specific confirmation line, receipt-sent confirmation, "Done" button that closes both overlays and returns to the Bookings list

## Step 5 — Wiring

- `DayView` and `ListView` now take an `onSelect(appt: ApptRecord)` prop; booking rows call it with the normalized record on click (List view rows also gained `cursor: pointer`, which they were missing).
- `BookingsPage` holds `selectedAppt` and `closingOut` state:
  - Selecting a booking → `AppointmentDetail` renders
  - "Mark as completed" → swaps to `CloseOutModal` (same `selectedAppt`)
  - Closing the close-out modal without completing → returns to `AppointmentDetail`
  - Completing payment → clears both, back to the Bookings list

## What's still mock / not wired

Consistent with the rest of the dashboard at this stage: no Supabase calls. Reschedule, cancel, and payment collection all update local component state only — nothing persists, and no real Twilio/Stripe calls are made. This matches the PRD's suggested build order, where the transactional-loop UI comes before backend wiring.

## Verification

- `npx tsc --noEmit` — clean
- `npm run build` — clean production build, all 42 routes generated
- Manual click-through via a scripted headless-browser pass (auth temporarily bypassed locally for testing only, then reverted via `git checkout` — no bypass code was committed):
  1. Open Bookings (Day view) → click a booking → Appointment Detail opens
  2. Toggle Reschedule panel open/closed
  3. Mark as completed → Close-out modal opens
  4. Select 20% gratuity + Card on File → Complete · Collect C$168.00
  5. Processing animation → success screen ("C$168.00 collected", receipt confirmation) → Done → back to Bookings
  6. Switch to List view → click a different booking → Cancel → confirm → "This appointment has been cancelled" shown

All steps passed with no console/page errors.
