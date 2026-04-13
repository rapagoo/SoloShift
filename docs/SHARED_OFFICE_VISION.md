# SoloShift Shared Office Vision

Last updated: 2026-04-13

## Product Direction

SoloShift is no longer primarily a personal dashboard with an office-like extra view.

The product direction is now:

**a small shared virtual office where being present beside someone helps you keep working**

The goal is not to simulate a giant MMO office. The goal is to create a believable, compact, daily-use online office where a very small group can feel:

- we are in the same place
- we can see whether the other person is working
- our desks and presence create soft accountability

## Current Baseline

The current office-first product baseline is:

- `/office` as the main entry screen
- `/dashboard` as a supporting detailed control page
- `/history` as the record view
- one main shared office
- four desks only
- private authenticated realtime presence
- privacy-safe shared office feed
- large office canvas with a right sidebar

## Why One Small Office

For early testing, one small office is stronger than many rooms.

Reasons:

- a two-person household test should not feel empty
- four desks are enough to feel shared without making the scene look abandoned
- “my desk” becomes easier to understand than constant room switching
- the office reads more like a place and less like a dashboard skin

## Spatial Principles

The office should feel more like:

- a compact pixel coworking room
- clear desk ownership or desk expectation
- visible status above each desk
- a central walkway and a few environmental props

The office should feel less like:

- many empty rooms
- free movement with no purpose
- a game map that happens to have work UI on top

## Desk-Centered UX

The desk is the key unit of the experience.

We want each desk to communicate:

- who is there
- whether they are working, resting, away, or checked out
- whether that desk is empty
- whether it is my current seat

The “why” of the office is not movement by itself. The value is that seeing another person at their desk changes how your own work feels.

## Main Screen Strategy

`/office` should keep behaving like the primary product surface.

That means:

- the office canvas gets most of the screen
- quick work actions live in the right sidebar
- detailed controls still exist, but they do not dominate the product

The intended hierarchy is:

1. shared office first
2. personal controls second
3. history as review

## Visual Direction

The main office should move toward:

- a 2D pixel office look
- larger desks with more believable furniture silhouettes
- windows, boards, shelves, and a small coffee area for context
- strong seat-level status badges

This aligns with the product thesis behind virtual-office tools such as Gather and WorkAdventure, where a visible shared map, clear desks, and immediate teammate presence help remote work feel more like being in the office.

## Near-Term Priorities

### Phase A: Seat-Level Clarity

Goals:

- larger and more believable desks
- seat status above each occupied desk
- stronger “my desk” affordance
- empty seats that still look intentional

### Phase B: Lightweight Social Signals

Goals:

- quick ambient reactions
- low-friction acknowledgements
- no heavy chat-first UX

### Phase C: Persistent Desk Ownership

Goals:

- decide whether desks should stay deterministic or become stored assignments
- make “my desk” feel stable across sessions

### Phase D: Richer Avatar Presentation

Goals:

- move from simple desk markers toward small character presence
- keep readability high and avoid visual clutter

## Data Direction

The current baseline can still run on:

- private Presence
- shared office activity events

Additional models should only be introduced when they become necessary.

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
- privacy-safe office feed

That narrowness is a feature, not a limitation. It gives the product a realistic way to test whether a shared office truly improves focus and consistency in daily use.
