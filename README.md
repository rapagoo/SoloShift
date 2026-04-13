# SoloShift

SoloShift is a web MVP for running a solo study or job-search day like a structured workday.
It now centers on a small shared online office rather than a dashboard-first layout.

## Core Experience

- Sign in and enter the shared office at `/office`
- See who is online and which desks are occupied
- Use `/dashboard` for detailed work controls:
  - check-in
  - status change
  - focus sessions
  - tasks
  - check-out
- Review daily and weekly history at `/history`

## Current Product Status

The current baseline includes:

- Email/password login flow
- First-run onboarding
- Office-first landing flow
- Shared office at `/office`
- Detailed dashboard at `/dashboard`
- History view at `/history`
- Large office canvas as the primary visual surface
- Right sidebar for quick tasks and office-feed reading
- Check-in, status change, focus session, and check-out flows
- Dashboard profile editing for nickname, timezone, and default check-in time
- Task board for the current workday
- Activity feed for check-in, status, focus, task, and checkout events
- Private authenticated office presence on `/office` using Supabase Realtime Presence
- Privacy-safe shared office activity events that power the office pulse
- One small shared office with four desks for early real-world testing

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel-ready deployment setup

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
- `docs/NEXT_STEPS.md`: remaining QA and product backlog
- `docs/WORK_LOG.md`: dated implementation history
- `docs/PLAN.md`: original cleaned MVP plan
- `docs/SHARED_OFFICE_VISION.md`: current office-first product direction
- `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md`: current office presence security baseline

## Notes

- The app renders a setup card instead of crashing when required Supabase env vars are missing.
- Playwright smoke tests are included, but they only run meaningfully when `E2E_EMAIL` and `E2E_PASSWORD` are provided.
- Server writes use the Supabase secret key on the server only. Never expose `SUPABASE_SECRET_KEY` in the browser.
- If you already created a Supabase project before the private office-presence pass, apply `20260410_000003_office_private_presence.sql` before testing `/office`.
- If you already created a Supabase project before the shared office-event pass, apply `20260410_000004_office_activity_events.sql` before expecting the office pulse to show shared event history.
- If you already created a Supabase project before the office privacy-redaction pass, apply `20260410_000005_office_activity_privacy_redaction.sql` so old office events stop exposing exact task and goal text.
- `/office` now uses a private Presence topic. If the live panel shows an authorization warning, check the Realtime policies from `20260410_000003_office_private_presence.sql` and confirm the user is signed in.
