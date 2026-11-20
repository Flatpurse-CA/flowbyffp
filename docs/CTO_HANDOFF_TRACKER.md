# CTO Handoff Tracker (Nov 2026)

Source: CTO Build Spec v5 FINAL + Spec Parts 2/3 + Developer Backlog v2 (118 tasks).
Status was first set from a code scan on 2026-11-19 and should be confirmed per task.

Legend: DONE = built, verify only · PARTIAL = something exists, needs finishing · TODO = not built · NEEDS YOU = decision, account, vendor, or non-code work

## Fix order (what gets built, in this sequence)

### Batch 1: Billing + trial (launch blockers)
| ID | Task | Status |
|---|---|---|
| FL-032 | Remove Family Hours everywhere; no website builder | DONE (no references left) |
| FL-082 | Remove "no card required" copy; cookie banner; pixels only after consent | DONE (pixels + PostHog consent-gated; waitlist beta "No credit card" kept, decision for CEO) |
| FL-020 | Plan never activates without a confirmed card (Stripe webhook) | PARTIAL |
| FL-021 | 14-day trial, card up front: SetupIntent then subscription with trial_end = Day 14 | PARTIAL |
| FL-025 | Plan selection screen fixes (10.1 items 1-9) | DONE except item 1 (Starter Founders, waiting on D3) |
| FL-022 | Founders coupon server-side (40% yr 1, then 25%) + live counter | PARTIAL (counter live) |
| FL-023 | One trial per business, phone, card | DONE (migration 0051 applied; needs Stripe settings) |
| FL-024 | Dunning: Smart Retries + emails day 0/3/5/7, pause after final retry | DONE (migration 0051 applied; needs Stripe settings) |
| FL-116-118 | Renewal reminders (monthly, annual, Founders price change) | DONE (migration 0051 applied; needs Stripe settings) |
| FL-070/071 | Day 11 trial-end screens + reminder text/email + Day 12-13 banner | DONE (migration 0051 applied; needs Stripe settings) |

### Batch 2: AutoPilot completion
| ID | Task | Status |
|---|---|---|
| FL-048 | Engine: trigger, wait, re-check, send, attribute; per-flow toggles | DONE (built 2026-11-18, cron live 11-19) |
| FL-050-054 | No-show, Slot Filler, Win-Back, Rebook, Birthday flows | DONE except client waitlist tier (no client waitlist exists yet); offer % editable in DB only, no settings UI |
| FL-007 | Frequency caps 1/day, 2/7 days per client across flows | DONE |
| FL-049 | "Ask me first" approval queue for first 14 days | DONE |
| FL-055 | Activity feed + revenue recovered counters | PARTIAL |
| FL-006 | CASL consent ledger + STOP/HELP | DONE (quiet hours now 8am-9pm) |
| FL-029/061 | First-send rules; imported clients transactional-only by default | DONE (importer does not yet read a consent column) |

### Batch 3: Booking, payments, cancel/save
| ID | Task | Status |
|---|---|---|
| FL-040/041 | Client booking page flow + reschedule/cancel within policy | DONE (manage link /a/token in confirmation email; reschedule outside window, late fee shown + charged inside) |
| FL-037 | Deposits, cancellation window, late-cancel/no-show fees | DONE (migration 0058; Booking policy page; no-show fee after staff confirm, needs card consent at booking) |
| FL-038/039 | Refunds w/ reason, dispute alerts, payout report CSV | DONE (migration 0059; owner refunds on Payments; dispute email with deadline; CSV from Stripe balance transactions) |
| FL-033/034/035 | Connect Express, application fee, tips, cash, receipts | DONE (app fee behind PLATFORM_FEE_ENABLED; receipt page /a/token/receipt with GST/HST #; tips by staff on Payments) |
| FL-042 | Rooms/equipment resources | DONE (migration 0057; capacity check in slot finder; owner page under Services) |
| FL-043/044 | Intake forms, insurance-ready receipts | DONE (migration 0061; AES-GCM answers, needs INTAKE_ENCRYPTION_KEY env; view log; registration # on receipts) |
| FL-045 | 3-tap staff booking | DONE (Quick book page; due = past usual gap, usual service, usual-time/gap-filler ranking) |
| FL-046/047 | Send Times (tappable slots) + rules | DONE (manual send; no deposit step, Mobile Mode, segments or SMS allowance yet) |
| FL-066-069 | Cancel flow + save offers, pause/downgrade, emails, account deletion | DONE (purge gated by DATA_DELETION_ENABLED; export is direct download, not emailed link) |

### Batch 4: Onboarding, Home, email, team, SMS, admin
| ID | Task | Status |
|---|---|---|
| FL-026/027/028/030/031 | Wow onboarding 1A, card step, contacts path, win screen, setup checklist | PARTIAL |
| FL-072/073 | Home goal ring, feed, streak, payment celebration | PARTIAL |
| FL-062-065 | Email domain/streams, client + owner sequence E0-E12, staff emails | PARTIAL |
| FL-074 | Staff invites, roles, weekly hours | DONE (verify) |
| FL-075 | SMS allowances per plan, 80% warning, email fallback | DONE (migration 0062; placeholder 200/1000/3000 via SMS_ALLOWANCE env; meter on Settings) |
| FL-077 | Offline read-only today's schedule | DONE (service worker serves /offline.html with schedule saved every 5 min) |
| FL-078/079 | Admin console v1 + "view as owner" | PARTIAL |
| FL-056/057 | AI Front Desk SMS + web chat, guardrails, take over | PARTIAL |
| FL-058/059 | Mobile Mode core + Pro (ETA, running late, route) | DONE (migration 0063; area by postal prefix, flat travel fee, drive buffer; Today's route with ETA/late texts; no live GPS ETA) |
| FL-060 | CSV migration w/ undo | PARTIAL |
| FL-083/085 | Quebec French waitlist; Google booking link tip | PARTIAL |
| FL-084 | Help centre + in-app ? + status page | PARTIAL |

### Batch 5: Foundations (refactors, do alongside)
| ID | Task | Status |
|---|---|---|
| FL-002 | Organisation -> Location data model | TODO |
| FL-003/004/005 | Event bus, local-time scheduler, unified messaging log | PARTIAL |
| FL-008 | AI gateway (templates, logging, cost, PII redaction) | PARTIAL |
| FL-009/010 | Attribution ledger, nightly metrics engine | PARTIAL |
| FL-011 | Optional 2-step; required for payouts/export | DONE (Supabase TOTP on Settings > Security; gates export + payout changes; needs MFA enabled in Supabase Auth) |
| FL-012/013 | Server-side roles; audit log | DONE (migration 0065; shop activity log for refunds, fees, policy, export, cancel/pause, staff, deletion; owner page) |
| FL-016 | Strings into translation files | TODO |
| FL-017 | Product analytics events (IDs only) | PARTIAL |
| FL-018 | Legal acceptance record (version, time, IP) + unticked marketing box | DONE (migration 0064; LEGAL_VERSION const in signup actions) |
| FL-019 | Test suite + CI + seed data | PARTIAL (vitest money/policy/tax/area tests + GitHub CI; no seed data or E2E yet) |

### P2 (month 1 after launch)
FL-087 schedules/time off (DONE: migration 0066, Team > Time off, blocks booking) · FL-088 commissions (PARTIAL) · FL-089 staff performance · FL-090 Daily Brief push/email (PARTIAL) · FL-091 weekly/monthly emails (DONE: Monday + 1st-of-month recap via billing cron) · FL-092 nudges · FL-093 reviews (PARTIAL) · FL-094 Operations Score (PARTIAL) · FL-095 annual plan (PARTIAL) · FL-096 referral (DONE, verify) · FL-097-099 wow screens · FL-100 Flow Coach (PARTIAL) · FL-101 AI help assistant

### P3 (later)
FL-102/103 Flow Voice · FL-104-106 gift cards, packages, memberships · FL-107/108 API + Zapier · FL-109 Reserve with Google · FL-110 native apps · FL-111 multi-location · FL-112 Founder Hour · FL-113 leaderboard · FL-114 insurer billing · FL-115 French translation

## NEEDS YOU (not code, or needs a decision first)
- FL-001 Canadian region: check Supabase region for `navceclnjivngtjysxpw` and Vercel function region; move if not Canada.
- FL-014 Backups (30 days) + tested restore: Supabase plan setting.
- FL-015 Secrets manager: Vercel env is fine; confirm no keys in code.
- FL-036 Tap to Pay native app: Apple Tap to Pay entitlement application (apply now, slow).
- FL-076 Register Canadian sending numbers with Twilio.
- FL-080 External penetration test. FL-081 breach runbook (lawyer review).
- FL-086 Pick 3 beta shops for staging tests.
- Decision: Starter Founders price (spec 10.1 #1 says yes, CEO D3 said Pro/Pro+ only).
- Decision: Flow Voice minute cap and overage (later).
