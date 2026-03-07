---
phase: 03-ai-vision-integration
plan: 01
subsystem: ai-service
tags: [anthropic, ai, tdd, types, mock-mode]
dependency_graph:
  requires: []
  provides: [src/types/ai.ts, src/ai/parseReceipt.ts]
  affects: [03-02-PasswordGate, 03-03-ReviewScreen, 03-04-App-wiring]
tech_stack:
  added: ["@anthropic-ai/sdk"]
  patterns: ["TDD red-green-refactor", "mock mode via VITE_MOCK_MODE", "FileReader base64 conversion", "vi.mock factory with function constructor"]
key_files:
  created:
    - src/types/ai.ts
    - src/ai/parseReceipt.ts
    - src/ai/parseReceipt.test.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "@anthropic-ai/sdk mock in vitest must use a regular function constructor, not an arrow function, so `new Anthropic()` works correctly in jsdom"
  - "anthropicConstructorCallCount counter used instead of vi.spyOn for Test 3 no-call assertion — simpler and avoids mock reset ordering issues"
  - "HEIC/HEIF media type normalized to image/jpeg for Anthropic API (API does not accept heic media type)"
metrics:
  duration: 3min
  completed_date: "2026-03-07"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 3 Plan 1: Anthropic SDK Install + parseReceipt Service Summary

**One-liner:** Anthropic SDK installed, shared AI types defined, and parseReceipt service built TDD-first with mock mode, multi-image API call, subtotal filtering, and error handling.

## What Was Built

- `@anthropic-ai/sdk` installed as a production dependency
- `src/types/ai.ts` — shared type contracts: `ReceiptItem`, `SkippedRegion`, `ParseReceiptResult`
- `src/ai/parseReceipt.ts` — core AI service with:
  - Mock mode (`VITE_MOCK_MODE=true`) returns 6 hardcoded items without any API call
  - Real mode: converts `File[]` to base64 via FileReader, sends multi-image message to `claude-3-5-sonnet-20241022`
  - System prompt explicitly excludes Subtotal/Total lines
  - Filters `Subtotal`/`Total` from returned items (case-insensitive)
  - Returns `skippedRegions` from AI JSON response
  - API errors and invalid JSON throw user-readable `Error` messages
  - HEIC/HEIF media type normalized to `image/jpeg` for Anthropic API compatibility
- `src/ai/parseReceipt.test.ts` — 9 TDD tests covering all behavior branches

## Test Results

All 27 tests pass (9 new parseReceipt tests + 18 existing Phase 2 tests):

| Test | Description | Result |
|------|-------------|--------|
| 1 | Mock mode returns ≥3 items and empty skippedRegions | PASS |
| 2 | Mock schema: every item has non-empty name and positive price | PASS |
| 3 | SDK never instantiated in mock mode | PASS |
| 4 | Real API calls Anthropic with correct model and image blocks | PASS |
| 5 | Response parsing returns correct name and price | PASS |
| 6 | Subtotal and Total filtered from returned items | PASS |
| 7 | skippedRegions returned from AI JSON response | PASS |
| 8 | API errors throw user-readable message | PASS |
| 9 | Invalid JSON throws user-readable message | PASS |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5b0f2a8 | chore | Install @anthropic-ai/sdk and define shared AI types |
| 894f9c7 | test | Add failing tests for parseReceipt (RED) |
| dd15476 | feat | Implement parseReceipt service — all 9 tests GREEN |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock factory using arrow function instead of regular function constructor**

- **Found during:** Task 2 GREEN phase (first test run)
- **Issue:** The original test file used `vi.fn().mockImplementation(() => ({...}))` which produces an arrow-function-based mock. Vitest warned "The vi.fn() mock did not use 'function' or 'class'". Because the implementation calls `new Anthropic(...)`, the mock must be a regular function (constructable). Tests 4-9 all failed with "is not a constructor".
- **Fix:** Rewrote the `vi.mock` factory to use `function MockAnthropic() { return {...} }`. Moved `mockCreate` to module scope so all tests reference the same `vi.fn()` without needing `_mockCreate` attachment. Added `anthropicConstructorCallCount` counter for Test 3 assertion (replaces `MockAnthropic.mockClear()` which is unavailable on a plain function).
- **Files modified:** `src/ai/parseReceipt.test.ts`
- **Commit:** dd15476 (same GREEN commit — test fix was part of making tests pass)

## Self-Check: PASSED

All required files confirmed present:
- FOUND: src/types/ai.ts
- FOUND: src/ai/parseReceipt.ts
- FOUND: src/ai/parseReceipt.test.ts

All task commits verified in git log:
- FOUND: 5b0f2a8 (chore: SDK install + types)
- FOUND: 894f9c7 (test: RED phase)
- FOUND: dd15476 (feat: GREEN phase)
