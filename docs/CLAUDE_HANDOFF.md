# FlatPurse Flow: handoff for a new Claude session

Read this first. It is short on purpose. Open other files only when a task needs them.

## What this is
Salon/barber/spa booking + payments + AutoPilot (automated win-back texts/emails) for Canada.
- Live: https://flow.flatpurse.com (Vercel, deploys from `main`, region yul1)
- Repo: Flatpurse-CA/flowbyffp. Owner/decision maker: George.
- Stack: Next.js 16.4.6 (App Router, `src/proxy.ts` not middleware), Supabase (Postgres, auth, RLS), Stripe (Billing + Connect direct charges), Resend (email), Twilio (SMS).
- Next 16 differs from training data: check `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).

## Rules (user's standing instructions)
- Never add Claude/AI as author or co-author (no `Co-Authored-By`, no "Generated with" lines). Commits use the user's git identity.
- Push to GitHub after every commit.
- No em-dashes in copy, UI or comments. Solid fill colors only, never translucent tints.
- Never commit the handoff zip in `public/` (untracked on purpose).
- Keep `PLATFORM_FEE_ENABLED` and `DATA_DELETION_ENABLED` off unless George says otherwise.
- Ask before big refactors. FL-002 (multi-location) and FL-016 (French/i18n) are planned for after launch: new tables should carry `location_id`, new screens should use translation-ready strings.
- The user watches usage: keep turns lean, batch edits, short reports.
- Never store secrets in files or memory. Ask the user for credentials each time.

## Where things are
| Area | Files |
|---|---|
| Plans, prices, Founders | `src/lib/plans.ts`, `src/lib/founders.ts`, `src/lib/billing/trialCheckout.ts`, `scripts/stripe-setup-billing.js` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| Card fee / app fee | `src/lib/billing/platformFee.ts` |
| Card-up-front gate | `src/lib/billing/cardGate.ts`, `src/app/signup/card/` |
| Emails (templates editable in admin) | `src/lib/resend.ts`, lifecycle E0-E3 `src/lib/lifecycleEmails.ts`, digests `src/lib/digests.ts` |
| Scheduler + jobs | `src/lib/scheduler.ts`, `src/lib/jobs.ts`, `/api/cron/jobs` |
| Message log | `src/lib/messageLog.ts`, admin `/admin/messages` |
| AutoPilot engine | `src/lib/autopilot/engine.ts`, attribution `src/lib/dashboard/autopilotAttribution.ts` |
| SMS + quiet hours | `src/lib/sms/allowance.ts` (`sendShopSms`) |
| Commissions | `src/lib/commissions.ts`, `/dashboard/team/commissions` |
| Client import | `src/app/dashboard/migrate/`, `src/lib/migrate/normalize.ts` |
| Deletion + retention | `src/lib/billing/lifecycle.ts`, SQL `purge_shop()` |
| Admin view-as-owner | `src/app/admin/(panel)/view/[shopId]/`, `users/supportActions.ts` |
| Backlog status | `docs/CTO_HANDOFF_TRACKER.md` (118 items, DONE/PARTIAL notes) |

## Database
- Migrations in `supabase/migrations/` (latest 0077). All are applied to production (ref `navceclnjivngtjysxpw`).
- To apply a new one: Supabase SQL editor or Management API, then record it:
  `insert into supabase_migrations.schema_migrations(version,name) values ('00NN','name');`
- Key tables added late: `attributions` (revenue ledger), `scheduled_jobs`, `message_log`, `lifecycle_emails`, `retained_tax_records`, `retained_intake_records`.
- `shops.timezone` is set from province by trigger. Use it for anything time-of-day.

## How scheduling works (important)
- Vercel crons are daily only (vercel.json): billing, autopilot, lifecycle, setup reminders, jobs backstop.
- Supabase pg_cron `flow-jobs-runner` calls `/api/cron/jobs` every 10 min with a token from Supabase Vault (`verify_jobs_token`). That runner seeds and sends the Daily Brief (7am shop time, Pro+/trial), the weekly recap (Monday 7am) and the monthly recap (1st, 7am), plus texts held by quiet hours (9pm to 8am shop time).
- pg_cron `prune-retained-records` deletes expired archived tax/intake records nightly.
- Tests must build times with `zonedTime()`: newer tzdata changed Alberta's offset, so hardcoded UTC times break in CI.

## Revenue recovered rule
A booking counts only once completed. A DB trigger on `appointments` sets `autopilot_events.amount` on completion and clears it on cancel/no-show. Attribution windows: no-show 7d, filler 48h, win-back 14d, rebook 14d, birthday 30d, front desk 7d.

## Founders
Separate Stripe prices (no coupons), all 6 IDs in Vercel as `STRIPE_PRICE_FOUNDERS_*`. Starter 29/290, Pro 66/660, Pro+ 139/1390 (CAD). Regular 39/390, 89/890, 189/1890. Cap 40 or Jan 31 2027 23:59 MT. Spot claimed at the first paid invoice (`claim_founder_spot`). Admin can hold a spot for in-person testers (counts toward 40).

## Commands
- `npm test` (vitest, 25 tests), `npm run typecheck`, `npm run lint` (0 errors required by CI), `npm run build`
- `npm run e2e` (Playwright). Public tests need nothing. Seeded tests need a NON-production Supabase seeded with `npm run seed:demo` (script refuses production).
- CI: `.github/workflows/` runs typecheck, tests, lint on push/PR.

## Open items (as of Nov 24 2026)
- George: verify `mail.flatpurse.com` in Resend and set `RESEND_FROM_EMAIL`. Until then founder emails (E0-E3) fail to send.
- George: decide "direct billing to insurers" claim on the pricing page (remove or build).
- Lawyer: privacy s.7 end-customer bullet conflicts with the fixed 7-year intake rule; reword with the source of the rule.
- User: revoke the Supabase personal access token used during the Nov build.
- 3 shops have bad provinces (Ogun, Canada, "St johns") and default to Edmonton time.
- Not built: event bus (FL-003), Daily Brief push, lifecycle emails E4-E18, Daily Brief hour picker UI, staff menu link to Payments, team 2-step check on every navigation (only on dashboard load).
- After launch: FL-002 multi-location, FL-016 French, then P3: memberships, gift cards, packages, Reviews-with-Google, Flow Voice, Zapier, insurer billing, multi-location, Founder Hour, native app, leaderboard.
