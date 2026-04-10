# SoloShift

SoloShift is a web MVP for running a solo study or job-search day like a structured workday.
It now covers the full day loop plus a first post-MVP foundation layer for tasks and activity tracking.

## Core Loop

- Check in
- Set today's goal and first task
- Change current status
- Run focus sessions
- Add and update tasks
- Check out with a short review
- Review daily and weekly history

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
- History view at `/history`
- Check-in, status change, focus session, and check-out flows
- Dashboard profile editing for nickname, timezone, and default check-in time
- Light gamification with point events and short company-style feedback
- Korean-labeled timezone picker and Korean auth messaging
- Task board for the current workday
- Activity feed for check-in, status, focus, task, and checkout events
- Improved dashboard guidance and history readability

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

4. Apply the SQL migrations in `supabase/migrations` in filename order.

At minimum, a fresh project should apply:

- `20260409_000001_soloshift_mvp.sql`
- `20260410_000002_tasks_activity_feed.sql`

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

## Notes

- The app renders a setup card instead of crashing when required Supabase env vars are missing.
- Playwright smoke tests are included, but they only run meaningfully when `E2E_EMAIL` and `E2E_PASSWORD` are provided.
- Server writes use the Supabase secret key on the server only. Never expose `SUPABASE_SECRET_KEY` in the browser.
- If you already created a Supabase project before the task/activity pass, apply the second migration before testing the new dashboard sections.
