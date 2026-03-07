---
phase: 03-ai-vision-integration
plan: 03
subsystem: ui
tags: [react, vitest, canvas, tailwind]

requires:
  - phase: 03-01
    provides: ReceiptItem, SkippedRegion, ParseReceiptResult types from src/types/ai.ts
provides:
  - ReviewScreen component — post-AI review/edit screen with item add/remove and skipped-region crops
  - SkippedRegionCrop component — canvas-based crop rendering from File + boundingBox fractions
affects:
  - 03-04 (App.tsx wiring consumes ReviewScreen)

tech-stack:
  added: []
  patterns: [canvas-drawImage-from-File, vi.spyOn-Image-with-function-mock, max-w-md-card-layout]

key-files:
  created:
    - src/components/review/ReviewScreen.tsx
    - src/components/review/ReviewScreen.test.tsx
    - src/components/review/SkippedRegionCrop.tsx
    - src/components/review/SkippedRegionCrop.test.tsx
  modified: []

key-decisions:
  - "vi.spyOn(globalThis, 'Image') mock must use function() not arrow function — Vitest requires constructor-compatible implementations"
  - "SkippedRegionCrop guards sourceFiles[region.imageIndex] existence to handle empty sourceFiles in tests"
  - "ReviewScreen owns editedItems state — onConfirm only called on Start splitting, not on every edit"

patterns-established:
  - "Image mock pattern: vi.spyOn(globalThis, 'Image').mockImplementation(function() { ... } as unknown as typeof Image)"
  - "Canvas testing: mock getContext on HTMLCanvasElement.prototype, use Proxy to intercept onload/src setters"

requirements-completed:
  - AI-01
  - AI-03
  - AI-04

duration: 15min
completed: 2026-03-06
---

# Plan 03-03: ReviewScreen Summary

**Canvas-crop review screen: item list with add/remove, SkippedRegionCrop per unreadable region, 15 tests green**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-03-06
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- SkippedRegionCrop: canvas drawImage from File via URL.createObjectURL, boundingBox fractions × natural dimensions, scale to max 320px, revokeObjectURL on unmount
- ReviewScreen: item list with remove, add form with validation, skipped-region section with amber styling, Start splitting → onConfirm
- 15 tests total: 5 SkippedRegionCrop + 10 ReviewScreen, all green

## Task Commits

1. **Task 1 RED: SkippedRegionCrop tests** - `c472962` (test)
2. **Task 1 GREEN: SkippedRegionCrop impl** - `98c93a5` (feat)
3. **Task 2 RED: ReviewScreen tests** - `a56e142` (test)
4. **Task 2 GREEN: ReviewScreen impl** - `edeeb6e` (feat)

## Files Created/Modified
- `src/components/review/SkippedRegionCrop.tsx` — Canvas crop component: File → ObjectURL → Image → drawImage with fraction coordinates
- `src/components/review/SkippedRegionCrop.test.tsx` — 5 tests: renders canvas, drawImage coords, canvas dimensions, clamping, URL lifecycle
- `src/components/review/ReviewScreen.tsx` — Review/edit screen: item list, add form, skipped crops, Start splitting button
- `src/components/review/ReviewScreen.test.tsx` — 10 tests: render, remove, add, validation, confirm, crops, no-crops, price format, count heading

## Decisions Made
- Arrow function mock for `Image` doesn't work as constructor — switched to `function()` with `as unknown as typeof Image` cast
- SkippedRegionCrop guards `sourceFiles[region.imageIndex]` to handle empty arrays in test contexts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Image mock arrow function not usable as constructor**
- **Found during:** Task 1 GREEN (running SkippedRegionCrop tests)
- **Issue:** `vi.spyOn(globalThis, 'Image').mockImplementation(() => {...})` — arrow functions can't be constructors; Vitest throws "is not a constructor"
- **Fix:** Changed to `function() { ... } as unknown as typeof Image`
- **Files modified:** src/components/review/SkippedRegionCrop.test.tsx
- **Verification:** All 5 tests green
- **Committed in:** `98c93a5` (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required fix for test infrastructure correctness. No scope creep.

## Issues Encountered
None beyond the Image mock constructor issue documented above.

## Next Phase Readiness
- ReviewScreen exported and typed — ready for App.tsx wiring in 03-04
- Props interface: `{ items, skippedRegions, sourceFiles, onConfirm }`
- No external dependencies added

---
*Phase: 03-ai-vision-integration*
*Completed: 2026-03-06*
