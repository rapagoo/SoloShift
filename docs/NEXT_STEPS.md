# SoloShift Next Steps

Last updated: 2026-04-10

## Completed In The MVP 100% Pass

- [x] Polish the dashboard layout for daily use.
- [x] Polish the history page so status logs and point events are easier to scan.
- [x] Clean up rough copy and helper text across login, onboarding, dashboard, and history.
- [x] Add profile edit UI for nickname, timezone, and default check-in time.
- [x] Improve mobile-friendly card stacking and dashboard guidance.
- [x] Add clearer empty states for first-time users.
- [x] Add clearer Korean error messages for common auth failures.
- [x] Review modal flows so users always understand the next action.
- [x] Re-check timezone-sensitive weekly summary calculations.
- [x] Re-run `npm run lint`, `npm test`, and `npm run build` after the MVP polish pass.
- [x] Add clearer loading feedback for major submit actions so QA can tell when a request is in progress.
- [x] Polish the new loading-state copy and fix QA issues around modal closing behavior.

## Completed In The Phase 2 Foundation Pass

- [x] Add a task board for the current workday.
- [x] Add task creation and task status updates from the dashboard.
- [x] Add an activity feed that records check-in, status, focus, task, and checkout events.
- [x] Extend history entries so tasks and activity events can be reviewed later.
- [x] Add the second Supabase migration for `tasks` and `activity_feed`.
- [x] Re-run `npx tsc --noEmit`, `npm run lint`, `npm test`, and `npm run build` after the foundation pass.

## External Verification Still Recommended

- [ ] Apply `20260410_000002_security_hardening.sql` to the connected Supabase project if it has not been applied yet.
- [ ] Apply `20260410_000002_tasks_activity_feed.sql` to the connected Supabase project if it has not been applied yet.
- [ ] Run a full manual smoke test from signup to checkout in the deployed environment.
- [ ] Verify `/history` reflects same-day tasks and activity events correctly after a real workday pass.
- [ ] Test with email confirmation enabled in Supabase.
- [ ] Test with email confirmation disabled in Supabase.
- [ ] Run E2E login and core flow tests against a real Supabase project.

## Post-MVP Product And Architecture

- [x] Write the shared office vision and architecture baseline document.
- [x] Turn `docs/SHARED_OFFICE_VISION.md` into the first implementation slice for `/office`.
- [x] Reuse existing workday, task, focus, and activity-feed data as the first office preview data source.
- [x] Add a light realtime presence preview to `/office` so online users and room occupancy are visible.
- [x] Move `/office` Presence onto private authenticated-only Realtime channels.
- [ ] QA `/office` in the deployed environment across before-check-in, active-focus, and checked-out states.
- [ ] QA realtime presence with two or more real browser sessions in the deployed environment.
- [x] Write the private-channel transition plan for office presence.
- [ ] Apply `20260410_000003_office_private_presence.sql` to the connected Supabase project if it has not been applied yet.
- [ ] Decide whether the next office pass should stay config-driven or introduce persistent office tables.
- [ ] Add office-side event storage so room reactions can outgrow the personal activity feed.
- [x] Decide whether the realtime preview should stay on public channels or move to private channels with authorization policies.
- [ ] Decide whether future character interactions stay rule-based or move to AI-assisted generation.
- [ ] Plan the first post-MVP release scope beyond the day-flow baseline.
- [x] Define the smallest safe presence slice for showing other online users by room.
- [ ] Add `office_memberships` when SoloShift introduces a second office, invite-only access, or team-scoped presence visibility.

## Logging Rule

Whenever a meaningful implementation change is shipped, update these files in the same pass:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`


