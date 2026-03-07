---
phase: 04-person-management
plan: 02
subsystem: ui
tags: [react, typescript, state-machine, names-modal, session-storage]

# Dependency graph
requires:
  - phase: 04-01
    provides: NamesModal component with defaultNameA/defaultNameB/onConfirm props
  - phase: 03-04
    provides: App.tsx state machine (gate → capture → processing → review → swipe)
provides:
  - "'names' state inserted between 'gate' and 'capture' in App.tsx AppState union"
  - "personAName / personBName state (defaults: 'Tom' / 'Jerry') available throughout App"
  - "handleNamesConfirm handler wires NamesModal into state machine"
  - "NamesModal render branch in App.tsx — rendered after password gate, before capture"
  - "personAName/personBName threaded into swipe placeholder (Phase 5/6 can consume via props)"
affects:
  - phase-05-swipe-interface
  - phase-06-summary-screen

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "App.tsx state machine extended by inserting new state between existing states (no restructuring required)"
    - "Lazy useState initializer pattern: returning users bypass 'names' state by checking sessionStorage on mount"
    - "Name fallback in handler: nameA.trim() || 'Tom' — handler defensively guards against empty submissions"

key-files:
  created: []
  modified:
    - src/App.tsx

key-decisions:
  - "Returning users (sessionStorage already set) skip 'names' state via lazy useState initializer — go directly to 'capture' with default names. Intentional per CONTEXT.md."
  - "Human verify confirmed all 9 steps: names screen appears after gate, blue/green color coding visible, custom names stored, session bypass works, no console errors."

patterns-established:
  - "State machine insertion pattern: add new AppState literal, add render branch, add handler — no teardown of existing branches"
  - "Name props contract for Phase 5/6: personAName: string, personBName: string available at swipe placeholder"

requirements-completed: [PERS-01, PERS-02, PERS-03]

# Metrics
duration: 15min
completed: 2026-03-07
---

# Phase 4 Plan 02: NamesModal Wired into App.tsx State Machine Summary

**'names' state inserted into App.tsx between 'gate' and 'capture', with personAName/personBName props threading through to the swipe placeholder — human-verified on device with all 9 steps passing**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-07T17:51Z (approx)
- **Completed:** 2026-03-07
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 1 (src/App.tsx)

## Accomplishments
- Extended AppState union with 'names' literal (gate | names | capture | processing | review | swipe)
- Added personAName/personBName state initialized to 'Tom'/'Jerry'
- Added handleNamesConfirm handler with trim-or-default fallback
- Updated handleUnlock to route to 'names' instead of 'capture' for first-time users
- Added NamesModal render branch in App.tsx between gate and review branches
- Threaded personAName/personBName into the swipe placeholder text for Phase 5/6 consumption
- Human-verified on device: all 9 verification steps passed (approved)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend App.tsx with 'names' state and NamesModal wiring** - `5a3557b` (feat)
2. **Task 2: Human verify NamesModal flow on device** - checkpoint approved (no code changes)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/App.tsx` - Extended AppState union, added personAName/personBName state, handleNamesConfirm handler, NamesModal render branch, updated handleUnlock to route to 'names'

## Decisions Made
- Returning users (sessionStorage already set) bypass 'names' state via the lazy useState initializer — they land directly on 'capture' with default names ('Tom'/'Jerry'). This is correct per CONTEXT.md: session users already named their people in a prior session.
- Name fallback in handleNamesConfirm uses `nameA.trim() || 'Tom'` — guards empty-string submissions defensively without touching NamesModal's own submit guard.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Human Verification Results

All 9 steps passed (user response: "approved"):

1. Dev server started and app loaded
2. Private/incognito window opened, passphrase entered
3. "Who's splitting this?" names screen appeared after gate
4. Inputs pre-filled with "Tom" and "Jerry"
5. Person 1 input has BLUE border/label; Person 2 input has GREEN border/label
6. Clicking "Let's go" with defaults lands on capture screen
7. Custom names test: "Alice" and "Bob" typed, "Let's go" proceeds to capture
8. Session bypass test: refresh without clearing sessionStorage goes directly to capture (names screen skipped)
9. No browser console errors throughout

## Next Phase Readiness

Phase 4 is now complete. Phase 5 (Swipe Interface) and Phase 6 (Summary Screen) can consume person names via:
- `personAName: string` — Person A's display name
- `personBName: string` — Person B's display name

These will be passed as props when Phase 5's SwipeScreen and Phase 6's SummaryScreen are wired into App.tsx.

---
*Phase: 04-person-management*
*Completed: 2026-03-07*
