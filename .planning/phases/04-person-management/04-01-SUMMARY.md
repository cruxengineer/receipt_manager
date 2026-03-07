---
phase: 04-person-management
plan: "01"
subsystem: person-management
tags: [tdd, component, names, color-tokens]
dependency_graph:
  requires: []
  provides: [NamesModal component, NamesModalProps interface]
  affects: [App.tsx state machine (Plan 04-02)]
tech_stack:
  added: []
  patterns: [TDD red-green, inline style color tokens, controlled form, named export]
key_files:
  created:
    - src/components/names/NamesModal.tsx
    - src/components/names/NamesModal.test.tsx
  modified: []
decisions:
  - inline-style for color tokens (var(--color-person-a) / var(--color-person-b)) on wrapper divs so labels inherit color
  - cn() for className merging, focus:outline-none only (no ring utilities to avoid Tailwind v4 ring variable uncertainty)
  - fallback logic in handleSubmit (trim() || default) not in test
  - layout mirrors PasswordGate exactly (min-h-screen bg-gray-50 card)
  - named export NamesModal (not default) to match project conventions
metrics:
  duration: 4min
  completed_date: "2026-03-07"
  tasks_completed: 2
  files_changed: 2
---

# Phase 4 Plan 1: NamesModal Component Summary

**One-liner:** NamesModal controlled form with Tom/Jerry defaults, CSS token color-coding, and empty-input fallback via TDD.

## What Was Built

`NamesModal.tsx` — a controlled form component that collects Person A and Person B names before the receipt capture flow. Delivers PERS-01 (name input), PERS-02 (color-coded UI), and PERS-03 (default names "Tom"/"Jerry") in a single component.

`NamesModal.test.tsx` — 6 Vitest + RTL tests covering renders, defaults, custom names, submit defaults, empty fallback, and color token styling.

## Key Decisions

- **Inline style color tokens:** `style={{ color: 'var(--color-person-a)' }}` on wrapper `<div>` elements so labels inherit the color. The `borderColor` on inputs is separate. Test 6 uses `document.querySelector('[style*="--color-person-a"]')` which finds the wrapper div.
- **`var(--color-person-a)` not `var(--person-a)`:** Used the `@theme` token (project standard) per plan instructions. Both tokens exist with identical values, but `@theme` is the correct reference.
- **Empty fallback in component:** `nameA.trim() || defaultNameA` in `handleSubmit` — not applied in tests, which simply verify the component behavior.
- **`focus:outline-none` only:** Avoided ring utilities to sidestep Tailwind v4 ring variable name uncertainty (documented in Phase 02-03 decisions).
- **Layout mirrors PasswordGate:** `min-h-screen bg-gray-50 p-4 flex items-center` / `max-w-md mx-auto w-full` / `bg-white rounded-lg shadow p-6` — consistent established pattern.
- **Named export:** `export function NamesModal` (not `export default`) — matches project conventions.

## Test Results

6/6 NamesModal tests GREEN. Full suite: 48/48 GREEN (42 pre-existing + 6 new).

## Files Created

- `src/components/names/NamesModal.tsx` — 65 lines
- `src/components/names/NamesModal.test.tsx` — 62 lines

## Commits

- `5199dc5` — test(04-01): add failing NamesModal tests (RED phase)
- `47983d3` — feat(04-01): implement NamesModal component (GREEN phase)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/components/names/NamesModal.tsx` — FOUND
- `src/components/names/NamesModal.test.tsx` — FOUND
- Commit `5199dc5` — FOUND
- Commit `47983d3` — FOUND
