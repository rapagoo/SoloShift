# SoloShift

SoloShift is a web MVP for running a solo study or job-search day like a structured workday.
It now covers the full day loop, a task/activity foundation layer, a shared-office preview, a private authenticated realtime presence layer, a shared office-event timeline, and the first spatial office floor prototype.

## Core Loop

- Check in
- Set today's goal and first task
- Change current status
- Run focus sessions
- Add and update tasks
- Check out with a short review
- Review daily and weekly history
- Enter the office preview and switch rooms
- Open rule-based NPC conversations based on the current day state
- See who is online in the office and which room they are currently in
- Move your avatar around the main office floor and see other online users on the map

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel-ready deployment setup

## Current Product Status

The core MVP day flow is implemented and usable:

- Email/password login flow
- First-run onboarding
- Dashboard at `/`
- Office preview at `/office`
- History view at `/history`
- Check-in, status change, focus session, and check-out flows
- Dashboard profile editing for nickname, timezone, and default check-in time
- Light gamification with point events and short company-style feedback
- Korean-labeled timezone picker and Korean auth messaging
- Task board for the current workday
- Activity feed for check-in, status, focus, task, and checkout events
- Improved dashboard guidance and history readability
- Office preview with room switching, NPC summaries, and short conversation threads
- Private authenticated office presence on `/office` using Supabase Realtime Presence
- Shared office activity events that power the office pulse separately from the personal dashboard feed
- Shared office activity events are intentionally sanitized so other users do not see your exact goal text, task titles, or private review copy
- `/office` now includes a 2D main-office floor with three mapped rooms, click-to-move avatar placement, and live user markers

## Local Setup

1. Install dependencies.

```bash
npm install
```

On Windows PowerShell, `npm.cmd` may be more reliable than `npm` depending on execution policy.

2. Copy env values.

```bash
cp .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

4. Apply the SQL migrations in the recommended order below.

At minimum, a fresh project should apply:

- `20260409_000001_soloshift_mvp.sql`
- `20260410_000002_security_hardening.sql`
- `20260410_000002_tasks_activity_feed.sql`
- `20260410_000003_office_private_presence.sql`
- `20260410_000004_office_activity_events.sql`
- `20260410_000005_office_activity_privacy_redaction.sql`

Note:

- There are currently two files with the `20260410_000002_*` prefix.
- Apply them in the order listed above, not by a naive filename sort.

5. Run the app.

```bash
npm run dev
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Docs

- `docs/STATUS.md`: current project state
- `docs/NEXT_STEPS.md`: remaining QA and post-MVP backlog
- `docs/WORK_LOG.md`: dated implementation history
- `docs/PLAN.md`: cleaned MVP plan reference
- `docs/SHARED_OFFICE_VISION.md`: next-phase office and multiplayer direction
- `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md`: current office presence security baseline and membership trigger

## Notes

- The app renders a setup card instead of crashing when required Supabase env vars are missing.
- Playwright smoke tests are included, but they only run meaningfully when `E2E_EMAIL` and `E2E_PASSWORD` are provided.
- Server writes use the Supabase secret key on the server only. Never expose `SUPABASE_SECRET_KEY` in the browser.
- If you already created a Supabase project before the task/activity pass, apply both `20260410_000002_security_hardening.sql` and `20260410_000002_tasks_activity_feed.sql` before testing the newer dashboard sections.
- If you already created a Supabase project before the private office-presence pass, apply the third migration before testing `/office`.
- If you already created a Supabase project before the shared office-event pass, apply `20260410_000004_office_activity_events.sql` before expecting the office pulse to show shared event history.
- If you already created a Supabase project before the office privacy-redaction pass, apply `20260410_000005_office_activity_privacy_redaction.sql` so old office events stop exposing exact task and goal text.
- `/office` now uses a private Presence topic. If the live panel shows an authorization warning, check the Realtime policies from `20260410_000003_office_private_presence.sql` and confirm the user is signed in.
- `/office` falls back to the current user's dashboard activity feed if `office_activity_events` has not been created yet, but the intended baseline is the dedicated shared office-event timeline.


