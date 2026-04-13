# SoloShift Status

Last updated: 2026-04-13

## Snapshot

SoloShift is no longer just a dashboard-first productivity MVP. The product baseline is now:

- office-first entry flow
- one shared 2D office
- four desks
- large office canvas as the primary screen
- right sidebar for quick work actions, chat, and feed reading
- private authenticated realtime presence
- private realtime chat with speech bubbles
- shared office activity timeline
- dashboard and history as supporting views

The current build supports:

- email signup and login
- onboarding and profile editing
- check-in, status change, focus session, task updates, and check-out
- office-first landing at `/office`
- a dedicated dashboard at `/dashboard`
- daily and weekly history at `/history`
- one shared main office with four visible desks
- a large office-first layout where the floor owns most of the screen
- a right sidebar that now handles quick task entry, office chat, and office-feed reading
- a wide office map with click-to-move movement
- asset-ready sprite slots for background, desks, props, and avatars
- live online presence in the office through Supabase Realtime
- speech bubbles above avatars when users chat
- privacy-safe shared office activity summaries

## Implemented

### Product flow

- Login page at `/login`
- Onboarding page at `/onboarding`
- Office-first landing flow:
  - `/` redirects signed-in users to `/office`
  - `/dashboard` now holds the detailed personal work controls
- History page at `/history`
- Modal-based workday actions from the dashboard
- Dashboard profile edit modal for nickname, timezone, and default check-in time
- Task creation modal from the dashboard
- Task status updates directly from the task board

### Shared office baseline

- One main shared office
- Four desks:
  - `Desk A`
  - `Desk B`
  - `Desk C`
  - `Desk D`
- Office floor rendered as a wider asset-ready 2D/pixel-style shared workspace
- Office screen now favors one large office scene instead of multiple equal-weight cards
- Office canvas now uses a fixed map layout with desks and decor anchors for future sprite replacement
- Users move by clicking the floor, with local avatar coordinates synced through Supabase Presence
- Empty desks remain visible so the office still reads as a small shared space
- Avatar labels and speech bubbles now surface who is present and what they just said
- Office sidebar now includes:
  - quick task creation
  - lightweight office chat
  - lightweight task state updates
  - office activity feed reading
- Dashboard and history are still available, but no longer compete with the office for screen priority

### Realtime and backend

- Supabase Auth email/password flow
- Postgres schema and RLS policies
- Server actions for auth, profile, workday flow, and tasks
- UTC timestamp storage with profile timezone-based local date grouping
- Task and activity-feed schema with dedicated migration and RLS policies
- Dedicated `office_activity_events` storage for the main shared office
- Private authenticated-only Presence channel at `office:soloshift-commons:presence`
- Private broadcast chat on the same office channel
- Realtime client calls `supabase.realtime.setAuth()` before joining the private channel
- Shared office activity writes sanitize descriptions and metadata before insert
- Asset path mapping lives in `src/lib/office/assets.ts` so real sprites can replace placeholders without changing the office logic

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

The connected Supabase project also already has:

- private office-presence policies
- `office_activity_events`
- office-activity privacy redaction

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
- `supabase/migrations/20260410_000005_office_activity_privacy_redaction.sql`

Recommended apply order:

1. `20260409_000001_soloshift_mvp.sql`
2. `20260410_000002_security_hardening.sql`
3. `20260410_000002_tasks_activity_feed.sql`
4. `20260410_000003_office_private_presence.sql`
5. `20260410_000004_office_activity_events.sql`
6. `20260410_000005_office_activity_privacy_redaction.sql`

No new SQL migration was added in the four-desk office-first pass.

## Remaining Gaps

The main remaining work is now:

- run a full manual smoke test from signup to checkout in the deployed environment
- verify `/office` with two or more real sessions using the new four-desk layout
- verify that click-to-move feels natural enough during longer shared sessions
- verify that chat bubbles stay readable when two users talk at the same time
- verify that the asset-ready layout still feels balanced after replacing placeholders with real sprites
- decide whether desk assignment should remain deterministic-in-memory or move to persistent stored assignments
- decide whether NPCs still matter in the new office-first product or should be reduced further
- extend avatar / floor signals:
  - focus timer
  - stronger checked-out treatment
  - lightweight motion or pulse when a status changes
- add lightweight social reactions or ambient signals without turning the product into chat-first UX
- test both email-confirmation-on and email-confirmation-off auth flows
- run real-account E2E verification against the connected Supabase project

## Documentation Process

After each meaningful development pass, update these files together:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`

## Useful Files

- `README.md`: local setup and run instructions
- `docs/PLAN.md`: original cleaned MVP scope
- `docs/NEXT_STEPS.md`: current QA and product backlog
- `docs/SHARED_OFFICE_VISION.md`: current office-first product direction
- `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md`: office realtime security baseline
- `docs/OFFICE_ASSET_CHECKLIST.md`: office asset preparation guide
- `docs/WORK_LOG.md`: dated implementation history
