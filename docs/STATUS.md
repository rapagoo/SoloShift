# SoloShift Status

Last updated: 2026-04-10

## Snapshot

SoloShift is now beyond the MVP-only baseline. The full day-flow MVP is complete, and the first post-MVP foundation layer has started with a task board and activity feed.

The current product baseline now supports:

- email signup and login
- onboarding and profile editing
- check-in
- current status changes
- focus session start and finish
- task creation and task status updates
- check-out with daily review
- dashboard activity feed for the current day
- daily and weekly history review

## Implemented

### Product flow

- Login page at `/login`
- Onboarding page at `/onboarding`
- Dashboard page at `/`
- History page at `/history`
- Modal-based workday actions from the dashboard
- Dashboard profile edit modal for nickname, timezone, and default check-in time
- Task creation modal from the dashboard
- Task status updates directly from the task board

### UX polish

- Korean timezone dropdown with readable labels
- Korean auth error messages for common login/signup failures
- Top navigation that keeps the current page visible
- Dashboard flow guidance for the next action
- Sidebar states for before check-in, in-progress workdays, and checked-out workdays
- More readable history cards with labeled status logs, focus sessions, point events, tasks, and activity feed
- Loading feedback for major form submissions with spinner buttons and inline progress messaging
- QA fixes for pending-state messaging, modal auto-close on successful actions, and centered weekly summary metrics

### Data and backend

- Supabase public and server environment handling
- Supabase Auth email/password flow
- Postgres schema and RLS policies
- Server actions for auth, profile, workday flow, and tasks
- UTC timestamp storage with profile timezone-based local date grouping
- Weekly summary date-range calculation updated to use local-date-safe formatting
- Task and activity-feed schema with dedicated migration and RLS policies

### Workday logic

- One workday per user per local date
- Status transition logging with automatic previous status close
- Focus sessions limited to one active session at a time
- Focus sessions blocked unless a productive status is active
- Automatic cleanup of open status/session at checkout
- Checkout lock for the current day after checkout
- Activity feed events for check-in, status changes, focus sessions, task changes, and checkout

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

Current database setup files:

- `supabase/migrations/20260409_000001_soloshift_mvp.sql`
- `supabase/migrations/20260410_000002_tasks_activity_feed.sql`

## Remaining Gaps

There are no known blockers in the MVP day-flow itself.

The main remaining work is now:

- apply the second migration to any existing Supabase project that was created before the task/activity pass
- run a full manual smoke test from a fresh account in the deployed environment
- verify `/history` reflects task and activity-feed updates correctly after a real workday pass
- test both email-confirmation-on and email-confirmation-off auth flows
- run real-account E2E verification against the connected Supabase project
- define the next architecture step for office, room, NPC, and conversation expansion

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
- `supabase/migrations/20260409_000001_soloshift_mvp.sql`: MVP schema and RLS setup
- `supabase/migrations/20260410_000002_tasks_activity_feed.sql`: tasks and activity feed schema
