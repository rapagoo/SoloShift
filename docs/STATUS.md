# SoloShift Status

Last updated: 2026-04-10

## Snapshot

SoloShift is now beyond the MVP-only baseline. The full day-flow MVP is complete, the task/activity foundation layer is in place, and the shared-office branch now includes the first `/office` slice, a private authenticated realtime presence layer, and a persistent office-side event timeline.

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
- office room switching and rule-based NPC conversations at `/office`
- realtime office presence showing who is online and which room they are in
- private authenticated-only office presence channels for signed-in users
- shared office activity events that power the office pulse independently from the personal dashboard feed

## Implemented

### Product flow

- Login page at `/login`
- Onboarding page at `/onboarding`
- Dashboard page at `/`
- Office page at `/office`
- History page at `/history`
- Modal-based workday actions from the dashboard
- Dashboard profile edit modal for nickname, timezone, and default check-in time
- Task creation modal from the dashboard
- Task status updates directly from the task board
- Query-driven office room switching and NPC conversation panels
- Live office presence panel powered by Supabase Realtime Presence

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
- Office preview still keeps rooms and NPCs config-driven, while shared office pulse data now has a dedicated event schema
- Dedicated `office_activity_events` storage for the main shared office, with authenticated read access and server-side writes

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

### Shared office preview

- Static office configuration with three rooms:
  - lobby
  - focus room
  - lounge
- Rule-based room selection driven by current workday state
- Three NPC personas with room-based summaries and short conversation threads
- Office pulse panel that reframes task, focus, point, and activity-feed data as room ambience
- Office pulse now reads from `office_activity_events` first, so recent room reactions are shared across signed-in users instead of being limited to the current user's dashboard feed
- Office snapshot panel that links the new space view back to the current dashboard flow
- QA follow-up contrast fix for office room cards and conversation CTA buttons
- QA follow-up contrast sweep for office strong badges, conversation headers, user bubbles, and dashboard-return CTA
- Office pulse cards now show actor nickname and room label for each shared office event

### Shared office realtime preview

- Supabase Realtime Presence channel for the shared office preview
- Dedicated presence topic at `office:soloshift-commons:presence`
- Live room counts by lobby, focus room, and lounge
- Online user list with current room and current work state
- Same-room coworker panel for the currently selected office room
- Private-channel client config with authenticated-only `realtime.messages` policies on the office topic, aligned with Supabase Realtime authorization checks
- Realtime client now calls `supabase.realtime.setAuth()` before joining the private office Presence channel
- Graceful error copy when the realtime channel cannot be joined because of missing auth or missing Realtime authorization
- Shared presence state now drives both the room-switch cards and the right-side live panel so occupancy counts stay consistent
- Room-switch cards and the top occupancy badge now show realtime connection state instead of falling back to misleading static counts when presence is unavailable
- The live panel now surfaces more specific private-channel error detail so auth/session problems are easier to distinguish from policy problems

## Verified

The following checks passed on the current codebase:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`

User-driven smoke testing has also been started in a real Supabase/Vercel setup.
The connected Supabase project now also has the private office-presence policies and `office_activity_events` table applied.

## Current Setup

Required local environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Current database setup files:

- `supabase/migrations/20260409_000001_soloshift_mvp.sql`
- `supabase/migrations/20260410_000002_security_hardening.sql`
- `supabase/migrations/20260410_000002_tasks_activity_feed.sql`
- `supabase/migrations/20260410_000003_office_private_presence.sql`
- `supabase/migrations/20260410_000004_office_activity_events.sql`

Recommended apply order:

1. `20260409_000001_soloshift_mvp.sql`
2. `20260410_000002_security_hardening.sql`
3. `20260410_000002_tasks_activity_feed.sql`
4. `20260410_000003_office_private_presence.sql`
5. `20260410_000004_office_activity_events.sql`

There are two `20260410_000002_*` files, so follow the order above instead of relying on filename sorting alone.

## Remaining Gaps

There are no known blockers in the MVP day-flow itself.

The main remaining work is now:

- run a full manual smoke test from a fresh account in the deployed environment
- verify `/history` reflects task and activity-feed updates correctly after a real workday pass
- verify `/office` across before-check-in, active-focus, and checked-out states in the deployed environment
- verify realtime presence with two or more real sessions in the deployed environment
- verify that office pulse cards show shared events from more than one signed-in user after the new office-activity migration is applied
- test both email-confirmation-on and email-confirmation-off auth flows
- run real-account E2E verification against the connected Supabase project
- decide how far the next pass should go between richer NPC dialogue, room-level broadcast interactions, and `office_memberships`

## Documentation Process

After each meaningful development pass, update these files together:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`

## Useful Files

- `README.md`: local setup and run instructions
- `docs/PLAN.md`: cleaned MVP scope and delivery order
- `docs/NEXT_STEPS.md`: current QA and post-MVP checklist
- `docs/SHARED_OFFICE_VISION.md`: shared office product and architecture direction
- `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md`: next security step for office presence
- `docs/WORK_LOG.md`: dated implementation history
- `docs/solo_shift_planning_v1.md`: original product planning document
- `supabase/migrations/20260409_000001_soloshift_mvp.sql`: MVP schema and RLS setup
- `supabase/migrations/20260410_000002_tasks_activity_feed.sql`: tasks and activity feed schema
- `supabase/migrations/20260410_000003_office_private_presence.sql`: authenticated-only private Realtime Presence policies for `/office`
- `supabase/migrations/20260410_000004_office_activity_events.sql`: shared office event timeline for the single main office


