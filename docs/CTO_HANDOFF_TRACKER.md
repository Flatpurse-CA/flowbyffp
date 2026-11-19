# CTO Handoff Tracker (Nov 2026)

Source: CTO Build Spec v5 FINAL + Spec Parts 2/3 + Developer Backlog v2 (118 tasks).
Status was first set from a code scan on 2026-11-19 and should be confirmed per task.

Legend: DONE = built, verify only · PARTIAL = something exists, needs finishing · TODO = not built · NEEDS YOU = decision, account, vendor, or non-code work

## Fix order (what gets built, in this sequence)

### Batch 1: Billing + trial (launch blockers)
| ID | Task | Status |
|---|---|---|
| FL-032 | Remove Family Hours everywhere; no website builder | TODO |
| FL-082 | Remove "no card required" copy; cookie banner; pixels only after consent | PARTIAL |
| FL-020 | Plan never activates without a confirmed card (Stripe webhook) | PARTIAL |
| FL-021 | 14-day trial, card up front: SetupIntent then subscription with trial_end = Day 14 | PARTIAL |
| FL-025 | Plan selection screen fixes (10.1 items 1-9) | TODO |
| FL-022 | Founders coupon server-side (40% yr 1, then 25%) + live counter | PARTIAL (counter live) |
| FL-023 | One trial per business, phone, card | TODO |
| FL-024 | Dunning: Smart Retries + emails day 0/3/5/7, pause after final retry | TODO |
| FL-116-118 | Renewal reminders (monthly, annual, Founders price change) | TODO |
| FL-070/071 | Day 11 trial-end screens + reminder text/email + Day 12-13 banner | TODO |

### Batch 2: AutoPilot completion
| ID | Task | Status |
|---|---|---|
| FL-048 | Engine: trigger, wait, re-check, send, attribute; per-flow toggles | DONE (built 2026-11-18, cron live 11-19) |
| FL-050-054 | No-show, Slot Filler, Win-Back, Rebook, Birthday flows | PARTIAL (no +24h no-show follow-up, no waitlist tier, no auto-applied 15%/10% offers) |
| FL-007 | Frequency caps 1/day, 2/7 days per client across flows | PARTIAL (7-day cooldown per flow only) |
| FL-049 | "Ask me first" approval queue for first 14 days | TODO |
| FL-055 | Activity feed + revenue recovered counters | PARTIAL |
| FL-006 | CASL consent ledger + STOP/HELP | PARTIAL |
| FL-029/061 | First-send rules; imported clients transactional-only by default | TODO |

### Batch 3: Booking, payments, cancel/save
| ID | Task | Status |
|---|---|---|
| FL-040/041 | Client booking page flow + reschedule/cancel within policy | PARTIAL |
| FL-037 | Deposits, cancellation window, late-cancel/no-show fees | PARTIAL |
| FL-038/039 | Refunds w/ reason, dispute alerts, payout report CSV | PARTIAL |
| FL-033/034/035 | Connect Express, application fee, tips, cash, receipts | PARTIAL |
| FL-042 | Rooms/equipment resources | TODO |
| FL-043/044 | Intake forms, insurance-ready receipts | PARTIAL |
| FL-045 | 3-tap staff booking | TODO |
| FL-046/047 | Send Times (tappable slots) + rules | TODO |
| FL-066-069 | Cancel flow + save offers, pause/downgrade, emails, account deletion | TODO |

### Batch 4: Onboarding, Home, email, team, SMS, admin
| ID | Task | Status |
|---|---|---|
| FL-026/027/028/030/031 | Wow onboarding 1A, card step, contacts path, win screen, setup checklist | PARTIAL |
| FL-072/073 | Home goal ring, feed, streak, payment celebration | PARTIAL |
| FL-062-065 | Email domain/streams, client + owner sequence E0-E12, staff emails | PARTIAL |
| FL-074 | Staff invites, roles, weekly hours | DONE (verify) |
| FL-075 | SMS allowances per plan, 80% warning, email fallback | TODO |
| FL-077 | Offline read-only today's schedule | TODO |
| FL-078/079 | Admin console v1 + "view as owner" | PARTIAL |
| FL-056/057 | AI Front Desk SMS + web chat, guardrails, take over | PARTIAL |
| FL-058/059 | Mobile Mode core + Pro (ETA, running late, route) | TODO |
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
| FL-011 | Optional 2-step; required for payouts/export | TODO |
| FL-012/013 | Server-side roles; audit log | PARTIAL |
| FL-016 | Strings into translation files | TODO |
| FL-017 | Product analytics events (IDs only) | PARTIAL |
| FL-018 | Legal acceptance record (version, time, IP) + unticked marketing box | PARTIAL |
| FL-019 | Test suite + CI + seed data | TODO |

### P2 (month 1 after launch)
FL-087 schedules/time off · FL-088 commissions (PARTIAL) · FL-089 staff performance · FL-090 Daily Brief push/email (PARTIAL) · FL-091 weekly/monthly emails · FL-092 nudges · FL-093 reviews (PARTIAL) · FL-094 Operations Score (PARTIAL) · FL-095 annual plan (PARTIAL) · FL-096 referral (DONE, verify) · FL-097-099 wow screens · FL-100 Flow Coach (PARTIAL) · FL-101 AI help assistant

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
