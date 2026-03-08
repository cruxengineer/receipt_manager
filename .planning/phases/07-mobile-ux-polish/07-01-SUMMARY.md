---
phase: 07-mobile-ux-polish
plan: 01
subsystem: ui
tags: [react, tailwind, ios-safari, pwa, mobile, safe-area]

# Dependency graph
requires:
  - phase: 06-summary-screen
    provides: SummaryScreen component that needed h-dvh layout upgrade
  - phase: 02-receipt-capture-interface
    provides: CaptureScreen component that needed h-dvh layout upgrade
provides:
  - viewport-fit=cover meta tag enabling CSS env(safe-area-inset-*) on iOS
  - Global iOS Safari tap highlight removal via -webkit-tap-highlight-color: transparent
  - Touch-action manipulation on buttons/inputs to prevent double-tap zoom
  - Overscroll-behavior: none on html/body to eliminate rubber-band scroll
  - Safe area utility classes: pt-safe, pb-safe, pt-safe-4, pb-safe-6
  - CaptureScreen using h-dvh locked layout with safe area header and bottom spacer
  - SummaryScreen using h-dvh locked layout with pt-safe totals bar and pb-safe-6 bottom row
affects:
  - 07-mobile-ux-polish (remaining plans)
  - SwipeScreen (already correct h-dvh pattern, reference implementation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "h-dvh flex flex-col overflow-hidden root div for full-screen locked screens"
    - "pt-safe-4 on first child header to clear Dynamic Island"
    - "pb-safe-6 on bottom action row to clear home indicator"
    - "pb-safe spacer div at bottom when no button row needed"
    - "@layer utilities for custom safe-area CSS classes in Tailwind v4"

key-files:
  created: []
  modified:
    - index.html
    - src/index.css
    - src/components/capture/CaptureScreen.tsx
    - src/components/summary/SummaryScreen.tsx

key-decisions:
  - "Safe area utilities go in @layer utilities (Tailwind v4 pattern) — not in @layer base"
  - "pt-safe on totals bar (first visible element in SummaryScreen) pushes content below Dynamic Island"
  - "pb-safe spacer div used in CaptureScreen (no button row), pb-safe-6 used in SummaryScreen (has button row)"

patterns-established:
  - "Full-screen screens: h-dvh bg-{color} flex flex-col overflow-hidden as root"
  - "Top safe area: pt-safe-4 on header/first-child element (clears Dynamic Island)"
  - "Bottom safe area: pb-safe-6 on bottom action row OR pb-safe spacer div"

requirements-completed:
  - UX-01
  - UX-02
  - UX-04

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 7 Plan 01: iOS Safari Viewport and Safe Area Polish Summary

**Global iOS Safari fixes: viewport-fit=cover, tap highlight removal, overscroll lock, and h-dvh safe-area layout for CaptureScreen and SummaryScreen targeting iPhone 16 Dynamic Island**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T18:28:55Z
- **Completed:** 2026-03-08T18:32:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added `viewport-fit=cover` to `index.html` viewport meta, enabling `env(safe-area-inset-*)` CSS functions across all screens
- Added global iOS CSS rules: tap highlight removal, touch-action manipulation on interactive elements, overscroll-behavior none
- Added four safe area utility classes (`pt-safe`, `pb-safe`, `pt-safe-4`, `pb-safe-6`) in `@layer utilities`
- Converted CaptureScreen from `min-h-screen` to `h-dvh` locked layout with `pt-safe-4` header and `pb-safe` bottom spacer
- Converted SummaryScreen from `min-h-screen` to `h-dvh` with `pt-safe` on totals bar and `pb-safe-6` on bottom action row
- All 85 existing tests remain GREEN (layout changes are DOM-based, not viewport-sensitive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Viewport meta + global iOS CSS rules** - `9b6fa7e` (chore)
2. **Task 2: Switch CaptureScreen and SummaryScreen to h-dvh layout** - `cba9b95` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `index.html` - Added `viewport-fit=cover` to viewport meta tag
- `src/index.css` - Added global iOS rules in `@layer base` + 4 safe area utilities in `@layer utilities`
- `src/components/capture/CaptureScreen.tsx` - h-dvh layout, pt-safe-4 header, pb-safe bottom spacer
- `src/components/summary/SummaryScreen.tsx` - h-dvh layout, pt-safe totals bar, pb-safe-6 bottom action row

## Decisions Made
- Safe area utilities placed in `@layer utilities` (not `@layer base`) per Tailwind v4 custom utilities convention
- `pt-safe` on totals bar in SummaryScreen (first child) correctly clears Dynamic Island without adding top safe area to root — consistent with SwipeScreen pattern
- `pb-safe` (no min) used in CaptureScreen bottom spacer; `pb-safe-6` (with 1.5rem min) used in SummaryScreen bottom action row where visible content needs guaranteed clearance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three app screens (CaptureScreen, SummaryScreen, SwipeScreen) now use the consistent h-dvh safe-area layout pattern
- Ready for remaining Phase 7 plans (touch target sizing, animation polish)
- No blockers

---
*Phase: 07-mobile-ux-polish*
*Completed: 2026-03-08*
