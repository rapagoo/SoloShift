# SoloShift Status

Last updated: 2026-04-10

## Snapshot

SoloShift is now past the “skeleton only” stage. The MVP day flow is implemented end-to-end and polished enough to be treated as the current product baseline.

The current MVP loop supports:

- email signup and login
- onboarding
- check-in
- current status changes
- focus session start and finish
- check-out with daily review
- daily and weekly history review
- profile editing from the dashboard

## Implemented

### Product flow

- Login page at `/login`
- Onboarding page at `/onboarding`
- Dashboard page at `/`
- History page at `/history`
- Modal-based workday actions from the dashboard
- Dashboard profile edit modal for nickname, timezone, and default check-in time

### UX polish

- Korean timezone dropdown with readable labels
- Korean auth error messages for common login/signup failures
- Top navigation that keeps the current page visible
- Dashboard “flow snapshot” guidance for the next action
- Sidebar states for before check-in, in-progress workdays, and checked-out workdays
- More readable history cards with labeled status logs, focus sessions, and point events
- Loading feedback for major form submissions with spinner buttons and inline progress messaging
- QA fixes for pending-state messaging, modal auto-close on successful actions, and centered weekly summary metrics

### Data and backend

- Supabase public and server environment handling
- Supabase Auth email/password flow
- Postgres schema and RLS policies
- Server actions for auth, profile, and workday flow
- UTC timestamp storage with profile timezone-based local date grouping
- Weekly summary date-range calculation updated to use local-date-safe formatting

### Workday logic

- One workday per user per local date
- Status transition logging with automatic previous status close
- Focus sessions limited to one active session at a time
- Focus sessions blocked unless a productive status is active
- Automatic cleanup of open status/session at checkout
- Checkout lock for the current day after checkout

### Gamification

- Check-in point calculation
- Focus completion points
- Goal completion points
- Daily review points
- Five-day streak bonus
- Rule-based character feedback

## Verified

The following checks passed on the current codebase:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`

User-driven smoke testing has also been started in a real Supabase/Vercel setup.

## Current Setup

Required local environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Current database setup file:

- `supabase/migrations/20260409_000001_soloshift_mvp.sql`

## Remaining Gaps

There are no known blockers left in the MVP day-flow implementation itself.

The main remaining work is now outside the core implementation pass:

- run full manual verification from a fresh account in the deployed environment
- test both email-confirmation-on and email-confirmation-off auth flows
- run real-account E2E verification against the connected Supabase project
- define the next architecture step for office/NPC/conversation expansion

## Documentation Process

After each meaningful development pass, update these files together:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`

## Useful Files

- `README.md`: local setup and run instructions
- `docs/PLAN.md`: cleaned MVP scope and delivery order
- `docs/NEXT_STEPS.md`: current QA and post-MVP checklist
- `docs/WORK_LOG.md`: dated implementation history
- `docs/solo_shift_planning_v1.md`: original product planning document
- `supabase/migrations/20260409_000001_soloshift_mvp.sql`: schema and RLS setup

