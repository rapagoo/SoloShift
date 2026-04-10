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

### QA Follow-Up Fixes

- Fixed pending-state messages so they render as real Korean copy instead of escaped unicode text.
- Updated modal auto-close logic so status-change and focus-session dialogs close reliably after a successful submit.
- Center-aligned weekly summary metrics in the history view for better visual balance.

### Phase 2 Foundation Pass

- Added `tasks` and `activity_feed` types to the shared app model.
- Added `src/app/actions/tasks.ts` for task creation and task status updates.
- Added `src/lib/server/activity-feed.ts` to centralize activity-feed writes.
- Added `supabase/migrations/20260410_000002_tasks_activity_feed.sql` for the new schema and RLS policies.
- Extended dashboard data loading so today’s task board and activity feed render from Supabase.
- Extended history data loading so older workdays include tasks and activity events.
- Added the dashboard task board and activity feed panels.
- Added a dashboard task-creation modal and linked task state changes into the live UI.
- Recorded activity-feed events for check-in, status changes, focus sessions, task updates, and checkout.
- Cleaned up Korean copy again in shared constants and form components so the new UI surfaces do not show mojibake.

### Shared Office Vision Pass

- Added `docs/SHARED_OFFICE_VISION.md` as the product and architecture baseline for the next major phase.
- Defined the recommended screen strategy as `dashboard 유지 + /office 추가` before any home-screen replacement.
- Split the office roadmap into NPC-first, presence-first, and real shared-office phases.
- Drafted the next-step data model for offices, rooms, memberships, NPCs, conversations, and office activity events.
- Documented the recommended branching strategy for the shared-office implementation phase.

### Phase 3A Office Preview Pass

- Added `src/app/office/page.tsx` and a new `/office` route that follows the same auth/profile guard flow as the dashboard and history pages.
- Added office-domain types, config, and data composition helpers so the office view can be powered by existing workday data without a new database schema.
- Added `src/components/office/office-shell.tsx` to render:
  - room switching
  - room ambience panels
  - NPC summaries
  - short rule-based conversation threads
  - an office pulse view based on tasks, focus time, points, and activity feed
- Added office-domain tests covering room resolution and room-safe NPC conversation selection.
- Extended the top navigation with an `오피스` entry so the first shared-office slice is reachable from the main product shell.
- Synced the office branch with a pending-copy fix by restoring plain Korean loading messages in the dashboard modals.
- Applied a QA follow-up contrast fix so room-switch cards and NPC conversation CTA buttons remain readable on the office screen.
- Applied a second office contrast sweep so strong badges, selected-room pills, conversation headers, user-message bubbles, and the dashboard-return CTA all use the same readable accent treatment.

### Phase 3B Presence Preview Pass

- Added `src/components/office/office-presence-panel.tsx` as a client-side realtime panel for `/office`.
- Added `src/lib/office/presence.ts` and `src/lib/office/presence.test.ts` to normalize Supabase Presence state and derive room counts in a testable way.
- Added a shared office realtime topic constant and new office presence payload/member types.
- Wired `/office` to publish the current user’s nickname, room, and top-level work state into a Supabase Realtime Presence channel.
- Added live room occupancy counts, a same-room coworker list, and an overall online-user panel to the office screen.
- Added fallback copy for cases where the realtime channel fails, so the preview degrades more clearly in environments where public realtime access is restricted.
- Refactored presence subscription logic into a shared hook so the room-switch cards, top occupancy badge, and live panel all render from the same realtime counts.

### Office Security Planning Pass

- Added `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md` to explain what private channels and Realtime authorization mean for SoloShift.
- Documented the recommended transition path:
  - public preview
  - private authenticated-only channels
  - membership-based office authorization
- Recorded recommended topic naming and the minimal policy scope needed for a future private-channel rollout.

### Phase 3B Private Channel Pass

- Renamed the shared office Presence topic to `office:soloshift-commons:presence` so it matches the long-term topic naming plan.
- Switched the `/office` Presence client to `private: true` and reset stale member state whenever a channel reconnect begins or fails.
- Rewrote the office presence panel copy so connection failures now point to auth and Realtime authorization issues instead of public-channel settings.
- Added `supabase/migrations/20260410_000003_office_private_presence.sql` with authenticated-only `realtime.messages` select/insert policies for Presence on the office topic.
- Updated status, next-step, README, and office security docs so the repo now treats private authenticated-only presence as the current baseline.
- Clarified that `office_memberships` should be introduced when SoloShift gains multiple offices, invite-only spaces, or membership-scoped visibility.

### Verification

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`



