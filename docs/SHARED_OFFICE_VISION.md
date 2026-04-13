# SoloShift Shared Office Vision

Last updated: 2026-04-13

## Product Direction

SoloShift is no longer mainly a personal dashboard with an office-like extra page.

The direction is now:

**a small shared virtual office where seeing someone else present makes it easier to keep going**

The goal is not a giant multiplayer office. The goal is a believable, compact, daily-use office for a very small group.

## Current Baseline

The current baseline is:

- `/office` as the main entry screen
- `/dashboard` as a supporting detailed control page
- `/history` as the record view
- one main shared office
- four desks only
- private authenticated realtime presence
- private realtime office chat
- privacy-safe shared office feed
- large office canvas with a right sidebar
- click-to-move movement inside the shared office

## Why One Small Office

For early testing, one small office is stronger than many rooms.

Reasons:

- a two-person household test should not feel empty
- four desks are enough to feel shared without making the scene look abandoned
- “my desk” is easier to understand than room switching
- the office reads more like a place and less like a dashboard skin

## Spatial Principles

The office should feel more like:

- a compact pixel coworking room
- visible desks and props
- a central walkway and environmental context
- avatars moving through one shared space
- brief visible reactions such as speech bubbles

The office should feel less like:

- many empty rooms
- movement without meaning
- a productivity dashboard with decorative background art

## Desk-Centered UX

The desk is still the anchor of the experience, even as movement becomes more important.

We want the office to communicate:

- who is present
- where they are
- whether they are working, resting, away, or checked out
- where the natural home desks are

The point of movement is not to “play a game.” The point is that a real shared map makes coworking feel more alive than static cards.

## Main Screen Strategy

`/office` remains the dominant screen.

That means:

- the office canvas owns most of the page
- quick work actions and chat live in the right sidebar
- detailed work controls still exist, but they do not dominate the product

Hierarchy:

1. shared office first
2. personal controls second
3. history as review

## Visual Direction

The office should move toward:

- a 2D pixel office look
- a larger floor with fixed desks and furniture
- clear sprite slots for real art replacement
- visible avatar states
- lightweight speech bubbles for social presence

The art should support the feeling of a quiet shared coworking room, not a noisy game lobby.

## Near-Term Priorities

### Phase A: Asset-Ready Spatial Office

Goals:

- fixed map layout
- click-to-move movement
- replaceable sprite slots for desk, background, props, and avatars
- stable visual anchors for later art passes

### Phase B: Lightweight Social Presence

Goals:

- quick office chat
- speech bubbles above avatars
- low-friction ambient coworking feeling
- no heavy chat-first UX

### Phase C: Persistent Desk Ownership

Goals:

- decide whether desks should stay deterministic or become stored assignments
- make “my desk” feel stable across sessions

### Phase D: Richer Avatar Presentation

Goals:

- direction-aware sprites
- walking frames
- better silhouette and personality without losing readability

## Data Direction

The current baseline can still run on:

- private Presence
- private Broadcast chat
- shared office activity events

Likely future additions:

- `office_memberships`
- `desk_assignments`
- `office_reactions`

## Conclusion

SoloShift is now best understood as:

**a small online office where shared presence improves follow-through**

The current implementation is intentionally narrow:

- one office
- four desks
- office-first entry
- private realtime presence
- private realtime chat
- privacy-safe office feed

That narrowness is a feature. It gives the product a realistic path to test whether a small shared office really changes how consistently people work.
