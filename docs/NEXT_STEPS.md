# SoloShift Next Steps

Last updated: 2026-04-13

## Office-First Baseline Completed

- [x] Move the product baseline from dashboard-first to office-first.
- [x] Redirect signed-in users from `/` to `/office`.
- [x] Add a dedicated `/dashboard` route for detailed personal controls.
- [x] Replace the old room-emphasis office preview with one small main office.
- [x] Reduce the shared office to a four-desk layout for early real-world testing.
- [x] Keep private authenticated-only office Presence as the realtime baseline.
- [x] Keep the shared office pulse powered by privacy-safe office activity events.

## External Verification Still Recommended

- [ ] Run a full manual smoke test from signup to checkout in the deployed environment.
- [ ] Verify `/dashboard` still supports the full workday loop after the office-first routing change.
- [ ] Verify `/history` reflects same-day tasks and activity events correctly after a real workday pass.
- [ ] Verify `/office` with at least two real browser sessions using the new four-desk layout.
- [ ] Check that both users keep understandable desk assignments during a longer shared session.
- [ ] Test with email confirmation enabled in Supabase.
- [ ] Test with email confirmation disabled in Supabase.
- [ ] Run E2E login and core flow tests against a real Supabase project.

## Product Decisions To Make Next

- [ ] Decide whether desk assignment should stay deterministic-in-memory or move to a persistent stored seat model.
- [ ] Decide whether `office_memberships` should be introduced now for desk ownership or saved for the first invite-only office pass.
- [ ] Decide whether NPCs remain part of the product or should be removed from the main office experience entirely.
- [ ] Decide whether the next pass should prioritize seat-level visual status or lightweight social reactions.

## Best Next Build Candidates

- [ ] Add seat-level state on the floor:
  - focus timer
  - away badge
  - checked-out badge
- [ ] Add richer avatar rendering so users feel more present than a label on a desk.
- [ ] Add lightweight ambient reactions:
  - wave
  - good luck
  - nice work
- [ ] Add persistent desk ownership once the small shared-office test feels right.
- [ ] Decide whether strangers/public offices should exist later, or whether the product should stay small-group-first.

## Logging Rule

Whenever a meaningful implementation change is shipped, update these files in the same pass:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`
