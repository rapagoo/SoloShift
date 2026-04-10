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

## External Verification Still Recommended

- [ ] Run a full manual smoke test from signup to checkout in the deployed environment.
- [ ] Verify `/history` reflects same-day actions correctly after a real workday pass.
- [ ] Test with email confirmation enabled in Supabase.
- [ ] Test with email confirmation disabled in Supabase.
- [ ] Run E2E login and core flow tests against a real Supabase project.

## Post-MVP Product And Architecture

- [ ] Define the office/room/NPC/conversation data model for the next expansion phase.
- [ ] Design how world events or activity-feed style interactions should be stored.
- [ ] Decide whether future character interactions stay rule-based or move to AI-assisted generation.
- [ ] Plan the first post-MVP release scope beyond the day-flow baseline.

## Logging Rule

Whenever a meaningful implementation change is shipped, update these files in the same pass:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`
