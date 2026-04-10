# SoloShift Work Log

This file records implementation work in chronological order so the project can be resumed quickly in later sessions.

## Logging Rule

For each meaningful development pass, add a dated entry here and sync the summary docs:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`

## 2026-04-09

### Shipped

- Built the initial SoloShift MVP application with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, and Vercel-ready configuration.
- Implemented the core workday loop:
  - email signup/login
  - onboarding
  - check-in
  - status changes
  - focus session start/finish
  - check-out with review
  - daily/weekly history
- Added Supabase schema and RLS migration.
- Added automated verification scaffolding:
  - typecheck
  - lint
  - unit tests
  - production build
- Added project documentation:
  - `docs/STATUS.md`
  - `docs/NEXT_STEPS.md`

### Notes

- The MVP skeleton became functional, but UI polish and real-world usability still needed follow-up.
- The main open gap after the first pass was finishing the MVP loop to the point where it felt stable for real daily use.

## 2026-04-10

### Shipped Before The MVP Completion Pass

- Renamed public Supabase env usage to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` while keeping temporary backward compatibility for the legacy anon key name.
- Updated onboarding timezone input from free text to a Korean-labeled dropdown.
- Localized major auth error messages into Korean.
- Fixed top navigation so the current page does not appear to disappear from the menu.

### MVP Day-Flow Completion Pass

- Added dashboard profile editing for nickname, timezone, and default check-in time.
- Added dashboard overview cards for flow guidance and profile snapshot.
- Added dashboard sidebar states for before check-in, active workdays, and checked-out workdays.
- Improved history readability by labeling status logs, focus sessions, and point events more clearly.
- Updated weekly summary date range handling to use local-date-safe formatting.
- Cleaned and synchronized the main project docs so current status, next work, and implementation history match the codebase.

### Supabase Key Naming Update

- Renamed the server-only Supabase environment variable from `SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_SECRET_KEY`.
- Updated runtime env validation, the admin Supabase client, setup guidance, and project docs to match the current Supabase publishable/secret key model.
- Dropped legacy server key compatibility because the project has not been configured with `service_role` yet.

### QA Feedback Pass

- Added spinner-based loading feedback to the shared submit button so button presses feel immediate.
- Added inline progress messages to login, onboarding/profile save, check-in, status change, focus session start/finish, and checkout flows.
- Updated logout to use the same pending-state button treatment for consistency.

### Verification

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`


