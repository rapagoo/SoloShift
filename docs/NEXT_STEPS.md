# SoloShift Next Steps

Last updated: 2026-04-09

## How To Use This File

Use this as the working checklist after reviewing `docs/STATUS.md`.

- Mark items as done when they are implemented and tested.
- If scope changes, update this file first so the next session starts with the same assumptions.
- Keep completed items for history until the next major milestone is reached.

## Immediate Tasks

- [ ] Polish the dashboard layout for daily use.
- [ ] Polish the history page so status logs and point events are easier to scan.
- [ ] Clean up rough copy and helper text across login, onboarding, dashboard, and history.
- [ ] Add profile edit UI for nickname, timezone, and default check-in time.
- [ ] Improve mobile spacing and action layout on the main dashboard.

## UX And Validation

- [ ] Add clearer empty states for first-time users.
- [ ] Add clearer error messages for failed auth, failed saves, and invalid workday actions.
- [ ] Review modal flows so users always understand the next action.
- [ ] Confirm check-in, focus, and checkout forms behave well after refresh or repeat clicks.

## Data And Logic Checks

- [ ] Re-check point rules against the latest product intent.
- [ ] Verify late check-in scoring is still correct for 0 minutes, 1-10 minutes, and 11+ minutes late.
- [ ] Verify five-day streak bonus behavior matches the intended reward cadence.
- [ ] Review history summary calculations for timezone edge cases.

## Test Pass

- [ ] Run a full manual smoke test from signup to checkout.
- [ ] Verify `/history` reflects the same-day actions correctly.
- [ ] Test with email confirmation enabled in Supabase.
- [ ] Test with email confirmation disabled in Supabase.
- [ ] Run E2E login and core flow tests against a real Supabase project.
- [ ] Re-run `npm run lint`, `npm test`, and `npm run build` after the next UI pass.

## Suggested Order

1. Dashboard and history UI polish
2. Profile edit UI
3. Validation and error-state improvements
4. Manual smoke test pass
5. E2E test pass

## Done When

This checklist can be considered complete for the current MVP pass when:

- The main dashboard feels stable and readable on desktop and mobile
- Profile values can be updated without going through first-run onboarding
- Manual end-to-end testing succeeds without confusion or broken states
- Core automated verification passes again
