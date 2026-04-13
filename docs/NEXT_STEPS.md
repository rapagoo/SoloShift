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
- [x] Rebalance `/office` into a large main office canvas plus a right sidebar for quick work actions.
- [x] Add quick task creation directly inside the office sidebar.
- [x] Enlarge the desk composition and add seat-level status badges on the office floor.
- [x] Add click-to-move office movement and speech-bubble chat.
- [x] Add asset slot wiring so real sprites can replace placeholders later.

## External Verification Still Recommended

- [ ] Run a full manual smoke test from signup to checkout in the deployed environment.
- [ ] Verify `/dashboard` still supports the full workday loop after the office-first routing change.
- [ ] Verify `/history` reflects same-day tasks and activity events correctly after a real workday pass.
- [ ] Verify `/office` with at least two real browser sessions using the new four-desk layout.
- [ ] Check that both users keep understandable movement and placement during a longer shared session.
- [ ] Verify that arrow-key movement feels good on real keyboards and does not conflict with text inputs.
- [ ] Verify the new office sidebar flow feels natural enough that `/dashboard` can stay secondary.
- [ ] Verify that the wide office layout still feels balanced on smaller laptop screens.
- [ ] Verify that chat bubbles stay readable with two or more live users.
- [ ] Verify that Enter-to-send chat feels natural and Shift+Enter is still available for multiline drafts if needed later.
- [ ] Verify that placeholder props can be swapped for real assets without layout surprises.
- [ ] Test with email confirmation enabled in Supabase.
- [ ] Test with email confirmation disabled in Supabase.
- [ ] Run E2E login and core flow tests against a real Supabase project.

## Product Decisions To Make Next

- [ ] Decide whether desk assignment should stay deterministic-in-memory or move to a persistent stored seat model.
- [ ] Decide whether “my desk” should remain just a soft home-base or become a true owned seat.
- [ ] Decide whether `office_memberships` should be introduced now for desk ownership or saved for the first invite-only office pass.
- [ ] Decide whether NPCs remain part of the product or should be removed from the main office experience entirely.
- [ ] Decide whether the next pass should prioritize focus timers on avatars, lightweight social reactions, or real sprite animation.
- [ ] Decide whether the office sidebar should eventually absorb more dashboard actions or stay intentionally lightweight.

## Best Next Build Candidates

- [ ] Add richer avatar rendering:
  - idle sprite
  - walk sprite
  - direction-aware facing
- [ ] Add floor-level work signals:
  - focus timer
  - stronger checked-out treatment
  - status-change pulse
- [ ] Add lightweight ambient reactions:
  - wave
  - good luck
  - nice work
- [ ] Add a second asset pass after the first sprite drop:
  - background polish
  - desk/prop alignment tuning
  - avatar anchor tuning
- [ ] Add persistent desk ownership once the small shared-office test feels right.
- [ ] Decide whether strangers/public offices should exist later, or whether the product should stay small-group-first.

## Logging Rule

Whenever a meaningful implementation change is shipped, update these files in the same pass:

- `docs/STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/WORK_LOG.md`
