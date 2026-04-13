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
- Corrected the docs to explicitly include `20260410_000002_security_hardening.sql` in the recommended migration order.
- Updated the office room-switch and top occupancy labels so failed realtime joins show connection-state messaging instead of stale static headcounts.
- Added an explicit `supabase.realtime.setAuth()` call before subscribing so private Presence channels can authorize against the current browser session more reliably.
- Added more specific client-side error detail for private Presence joins so session-token failures and policy failures are easier to diagnose during QA.
- Aligned the office Realtime policies more closely with Supabase's topic-authorization examples by using `(select realtime.topic())` and allowing topic-scoped Presence/Broadcast checks on the office channel.

### Office Activity Storage Pass

- Added `supabase/migrations/20260410_000004_office_activity_events.sql` for a dedicated shared office timeline in the single main office.
- Added `OfficeActivityEvent` to the shared app model and introduced `OFFICE_SLUG` so office-specific data can share one consistent identity across Realtime and Postgres.
- Expanded `recordActivityEvent()` so every check-in, status change, focus update, task event, and checkout also writes a best-effort office event without risking the core workday flow if the new table is not present yet.
- Added room derivation rules for office events so checkout lands in the lounge, focus events land in the focus room, and the rest of the shared office timeline defaults to the lobby.
- Updated the `/office` data loader so it reads `office_activity_events` first and falls back to the current user's dashboard activity feed when the new table is not available yet.
- Updated the office pulse UI so recent office reactions now show actor nickname and room label, making the shared timeline feel distinct from the personal dashboard feed.
- Added a domain test that verifies the office pulse prefers shared office activity over the current user's personal activity feed.
- Applied the new office-activity migration to the connected Supabase project and verified that the table and authenticated RLS policies exist.

### Office Activity Privacy Pass

- Split office-event redaction into a pure helper in `src/lib/domain/office-activity.ts` so shared office copy can be tested without server-only dependencies.
- Changed office event writes so the shared office timeline now stores summary-level descriptions rather than exact task titles, daily goals, review text, or freeform memos from personal work logs.
- Kept only safe metadata in shared office events, such as `statusType`, `durationMinutes`, `goalCompleted`, and `lateMinutes`.
- Added `supabase/migrations/20260410_000005_office_activity_privacy_redaction.sql` so previously stored office events are sanitized in place.
- Applied the privacy-redaction SQL to the connected Supabase project and confirmed that existing office events now show generic shared-office copy.

## 2026-04-13

### Spatial Office Prototype Pass

- Restored and expanded `src/lib/office/types.ts` so the office layer now has first-class room-map rectangles, avatar coordinates, NPC map positions, and a richer Presence member model.
- Added `src/lib/office/spatial.ts` and `src/lib/office/spatial.test.ts` to keep avatar-position clamping and room-default logic testable.
- Extended the shared office config so the single main office now has one floor layout with three mapped rooms:
  - lobby
  - focus room
  - lounge
- Added room-local default avatar positions and fixed NPC anchor positions for the first spatial pass.
- Refactored `src/components/office/use-office-presence.ts` so the private Realtime channel stays subscribed while room, status, and avatar position updates are sent through `track()`.
- Extended the Presence payload with room-local coordinates and normalized those coordinates into the shared member list.
- Added `src/components/office/office-floor.tsx` as the first interactive 2D office board.
- Wired `/office` so users can:
  - click another room to move there
  - click inside the current room to reposition their avatar
  - see NPC markers in every room
  - see other online users rendered directly on the floor map
- Kept the previous office cards, pulse, conversation, and dashboard-linking panels intact so the new spatial layer augments the existing office slice instead of replacing it all at once.
- No new SQL migration was required for this pass because the prototype reuses the existing private Presence channel and office event timeline.

### Office-First Reframe Pass

- Reframed SoloShift from a dashboard-first productivity app into an office-first shared workspace.
- Added `/dashboard` as the detailed personal control surface.
- Changed `/` so signed-in users now land on `/office` first.
- Updated login and onboarding success redirects so the shared office is the first destination after entering the product.
- Rebuilt `/office` around one small main office rather than multiple rooms.
- Replaced room-switching and free click-movement emphasis with a four-desk layout meant for real shared use by a very small group.
- Added desk models and deterministic desk assignment helpers.
- Replaced the earlier floor prototype with a desk-centric pixel-style office board.
- Rewrote the presence side panel so it now focuses on:
  - desk occupancy
  - online users
  - empty seats
- Updated the office pulse feed to show actor and desk context instead of leaning on old room labels.
- Added tests around desk assignment and desk occupancy helpers.

### Office Canvas + Sidebar Pass

- Restructured `/office` so the shared office floor now dominates the page visually instead of competing with many equal-weight cards.
- Added a dedicated office sidebar that feels closer to a lightweight chat/work column than a second dashboard.
- Moved quick task creation into that sidebar so users can stay inside the office while adding work.
- Added lightweight task state updates in the sidebar for the first few tasks of the day.
- Restyled the office feed into a chat-like stream inside the sidebar.
- Expanded the office page width so the floor can breathe as the main scene.
- Revalidated `/office` and `/dashboard` in task actions so sidebar task updates refresh the new office-first layout correctly.

### Desk Realism + Seat Status Pass

- Reworked the shared office floor to feel closer to a believable compact pixel office instead of a rough placeholder sketch.
- Enlarged the desk pods so each seat reads like a real workstation rather than a tiny tile.
- Added more environmental context to the floor:
  - windows
  - board area
  - coffee bar
  - storage / shelf blocks
- Added seat-level status badges above occupied desks so users can read work state directly from the floor.
- Added clearer “my desk” treatment and better occupied / empty desk labeling.
- Cleaned the main office shell, sidebar, office config, and presence error strings so visible Korean copy is readable again.

### Asset-Ready Movement + Chat Pass

- Added `docs/OFFICE_ASSET_CHECKLIST.md` so the office art pipeline now has a concrete list of required assets, slot names, and recommended file sizes.
- Added `src/lib/office/assets.ts` as the sprite-slot mapping file for future background, desk, prop, and avatar images.
- Expanded office-domain types with:
  - asset slots
  - decor items
  - office chat messages
  - speech-bubble data
- Added fixed decor anchors so the office map can keep the same layout when placeholder graphics are replaced by real art.
- Reworked the office floor from a mostly seat-centric board into a wider click-to-move office map.
- Added local avatar movement interpolation so the user moves smoothly toward the clicked target instead of snapping instantly.
- Shifted avatar rendering to realtime presence coordinates, making the floor ready for broader office movement rather than just desk occupancy.
- Added private Realtime broadcast chat on the office channel and rendered recent chat as temporary speech bubbles above avatars.
- Added an office chat card to the right sidebar so quick coworking-style messages can be sent without leaving the main office.
- Added a movement helper test so avatar interpolation can be changed later without losing the current behavior.

### Movement + Chat Usability Pass

- Fixed the movement loop so click-to-move no longer advances only a tiny amount per click.
- Added arrow-key movement for longer office navigation without repeated clicking.
- Expanded the office sidebar width so chat can behave more like a readable coworking log.
- Made office chat send on `Enter` from the chat textarea while preserving the rest of the form behavior.
- Enlarged speech bubbles and added a minimum width so very short Korean messages no longer wrap awkwardly one character per line.
- Turned the sidebar chat history into a taller scrollable panel so recent conversation is easier to review.

### Verification

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`



