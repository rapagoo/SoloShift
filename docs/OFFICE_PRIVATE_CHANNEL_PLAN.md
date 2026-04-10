# SoloShift Office Private Channel Plan

Last updated: 2026-04-10

## Purpose

This document explains the security path for `/office` presence:

1. public preview
2. private authenticated-only
3. membership-based office authorization

The repository is now at step 2.

## Current State

The current office presence implementation now uses:

- a dedicated topic: `office:soloshift-commons:presence`
- a private Realtime channel on the client
- authenticated-only `realtime.messages` policies for Presence reads and writes

This gives SoloShift a safer default without introducing office membership tables yet.

## What The Current Pass Protects

The new baseline protects the office presence channel so that:

- anonymous visitors cannot join the office Presence channel
- authenticated clients can only read and write Presence on the dedicated office topic
- the app no longer depends on public Realtime channel access for `/office`

This is the right intermediate step because SoloShift still has:

- one shared office
- one shared office Presence topic
- no invite-only teams
- no private offices yet

## Why `office_memberships` Is Not Required Yet

`office_memberships` becomes necessary when the product needs to answer:

- Which office is this user allowed to enter?
- Which office Presence should this user be allowed to see?
- Can user A see office B if they are only a member of office A?

Right now SoloShift still has one shared office for every signed-in user, so a full membership model would add schema and policy complexity before it adds product value.

## Recommended Trigger For `office_memberships`

Add `office_memberships` when at least one of these becomes true:

1. There is more than one office.
2. Offices become invite-only, team-based, or private.
3. Presence visibility must be segmented by workspace.
4. Office-specific chat, events, or permissions need to differ by membership.

Until one of those is true, the private authenticated-only step is the cleanest baseline.

## Topic Naming

Recommended naming pattern:

- `office:soloshift-commons:presence`
- `office:soloshift-commons:broadcast`
- `office:soloshift-commons:room:lobby`

This keeps the current Presence topic compatible with future broadcast or room-level expansion.

## Current SQL Scope

The current migration only authorizes Presence traffic for one topic:

- `office:soloshift-commons:presence`

The policies intentionally do not cover:

- broadcast
- room chat
- room event streams
- multi-office membership checks

Those should be added only when the product starts using those features.

## Next Security Step

The next security step is not another Realtime tweak by default.

It is a product decision:

- If SoloShift stays as one shared office for all signed-in users, keep the current model.
- If SoloShift introduces multiple offices or segmented visibility, add `offices` and `office_memberships`.

## Success Criteria

This phase is successful when:

- `/office` Presence works without relying on public Realtime channels
- signed-out users cannot join the Presence topic
- signed-in users can still see room occupancy and online coworkers
- the repo is ready for membership-based authorization later without renaming the current topic again
