# SoloShift

SoloShift is a web MVP for running a solo study or job-search day like a structured workday.
It focuses on a simple loop:

- Check in
- Set today's goal and first task
- Change current status
- Run focus sessions
- Check out with a short review
- Review daily and weekly history

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel-ready deployment setup

## Implemented MVP

- Email/password login flow
- First-run onboarding for nickname, timezone, and default check-in time
- Dashboard at `/`
- History view at `/history`
- Check-in, status change, focus session, and check-out flows via server actions
- Light gamification with point events and short company-style feedback
- Supabase schema + RLS migration in `supabase/migrations/20260409_000001_soloshift_mvp.sql`
- Unit tests, linting, and production build setup

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy env values.

```bash
cp .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

4. Apply the SQL migration in your Supabase project.

5. Run the app.

```bash
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```

## Notes

- The app renders a setup card instead of crashing when Supabase env vars are missing.
- Playwright smoke tests are included, but they only run meaningfully when `E2E_EMAIL` and `E2E_PASSWORD` are provided.

