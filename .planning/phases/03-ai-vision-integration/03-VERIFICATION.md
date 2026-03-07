---
phase: 03-ai-vision-integration
verified: 2026-03-06T12:00:00Z
status: human_needed
score: 14/16 truths verified
re_verification: false
gaps: []
human_verification:
  - test: "Real API response timing (AI-02)"
    expected: "Single receipt image processed and ReviewScreen rendered with item list within 5 seconds from button tap"
    why_human: "Cannot verify sub-5-second API round-trip programmatically without running the app with a real API key"
  - test: "AI-03 tax/tip/subtotal/total extraction"
    expected: "Tax and Tip appear as named items; Subtotal and Total are excluded from the item list"
    why_human: "The implementation includes Tax/Tip as items and filters Subtotal/Total per plan spec — the REQUIREMENTS.md phrasing 'extracts subtotal, tax, tip, and total' is ambiguous; human must verify the design intent is met"
  - test: "AI-04 ambiguous item handling"
    expected: "Items with unreadable prices appear in skippedRegions section with canvas crop so user can manually enter them"
    why_human: "Best-guess extraction is not implemented — ambiguous items go to skippedRegions instead. Human must confirm this satisfies the requirement intent with a real receipt"
  - test: "End-to-end mock mode flow on device"
    expected: "PasswordGate shown on first load, correct passphrase advances to CaptureScreen, Process Receipts shows ReviewScreen with 6 mock items, Start splitting shows Phase 5 placeholder, page refresh skips gate"
    why_human: "Browser session behavior and UI rendering can only be validated by running the app"
---

# Phase 3: AI Vision Integration — Verification Report

**Phase Goal:** Extract line items from receipt images reliably and quickly via AI vision API.
**Verified:** 2026-03-06
**Status:** human_needed — all automated checks pass; 4 items require human testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | parseReceipt(files) returns { name, price } items from receipt images | VERIFIED | `src/ai/parseReceipt.ts` line 55 — function signature; line 130 maps to `{ name, price }` |
| 2 | Tax and tip lines included as named items when present | VERIFIED | SYSTEM_PROMPT line 40: "Include Tax and Tip as named items if present"; mock items include Tax and Tip |
| 3 | Subtotal and Total excluded from returned item list | VERIFIED | `EXCLUDED_NAMES = new Set(['subtotal', 'total'])` at line 123; case-insensitive filter at line 127 |
| 4 | VITE_MOCK_MODE=true bypasses API and returns hardcoded items | VERIFIED | Line 57: `if (import.meta.env.VITE_MOCK_MODE === 'true') return { items: MOCK_ITEMS, skippedRegions: [] }` |
| 5 | Skipped regions returned as { imageIndex, boundingBox } objects | VERIFIED | Lines 134–136 parse `parsed.skippedRegions` from AI JSON; `SkippedRegion` type defined in `src/types/ai.ts` |
| 6 | API errors throw with user-readable message | VERIFIED | Lines 102–108: catch block throws `'Could not reach the AI service…'`; JSON parse failure throws `'AI returned an unreadable response…'` |
| 7 | User sees passphrase entry screen before any other content | VERIFIED | `App.tsx` line 57–59: `if (appState === 'gate') return <PasswordGate ...>` — gate state is the initial state unless sessionStorage already set |
| 8 | Correct passphrase calls onUnlock; incorrect shows error | VERIFIED | `PasswordGate.tsx` lines 17–23: compares trimmed value vs `VITE_APP_PASSWORD`; onUnlock called on match, error state set on mismatch |
| 9 | Input is type=password, submit works via Enter or button | VERIFIED | Line 43: `type="password"`; wrapped in `<form onSubmit={handleSubmit}>` handles Enter key |
| 10 | User sees extracted items list and can edit (remove/add) | VERIFIED | `ReviewScreen.tsx` renders `editedItems` with remove buttons (lines 84–104) and add form (lines 114–139) |
| 11 | Tapping Start splitting calls onConfirm with final items | VERIFIED | Line 41–43: `handleConfirm` calls `onConfirm(editedItems)`; button at line 142 is wired to `handleConfirm` |
| 12 | Skipped regions show canvas crop of unreadable area | VERIFIED | `SkippedRegionCrop.tsx`: `URL.createObjectURL` + `canvas.drawImage` with boundingBox fractions × natural dimensions |
| 13 | App wires gate→capture→processing→review→swipe state machine | VERIFIED | `App.tsx` defines `AppState = 'gate' | 'capture' | 'processing' | 'review' | 'swipe'`; all transitions implemented |
| 14 | sessionStorage persists gate unlock across page refresh | VERIFIED | Line 14–16: lazy init reads `sessionStorage.getItem(SESSION_KEY)`; line 26: `setItem` on unlock |
| 15 | Real API call returns items within 5 seconds (AI-02) | HUMAN NEEDED | Cannot verify programmatically — requires running app with real API key |
| 16 | Mock mode verifiably bypasses API in end-to-end browser flow | HUMAN NEEDED | Automated tests confirm no SDK call; browser E2E flow requires human verification |

**Score:** 14/16 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/ai.ts` | ReceiptItem, SkippedRegion, ParseReceiptResult types | VERIFIED | All 3 interfaces present, exact spec match, 26 lines |
| `src/ai/parseReceipt.ts` | parseReceipt service with mock + real API | VERIFIED | 139 lines; mock mode, FileReader base64, Anthropic messages.create, filter logic, error handling |
| `src/ai/parseReceipt.test.ts` | 9 TDD tests covering all behavior branches | VERIFIED | 9 tests covering mock mode (3), real API (4), filtering (1), skipped regions (1), errors (2) |
| `src/components/gate/PasswordGate.tsx` | Passphrase entry component | VERIFIED | 71 lines; exports `PasswordGate`; password input, form submit, error state, VITE_APP_PASSWORD comparison |
| `src/components/gate/PasswordGate.test.tsx` | 6 tests for gate behavior | VERIFIED | 6 tests: renders, correct password, wrong password, Enter key, empty submit, input type |
| `src/components/review/ReviewScreen.tsx` | Review/edit screen | VERIFIED | 155 lines; exports `ReviewScreen`; item list, remove, add form, skipped-region section, onConfirm |
| `src/components/review/ReviewScreen.test.tsx` | 9 tests for review screen | VERIFIED | 10 tests (plan said 9; Test 4b added for non-numeric price validation — exceeds spec) |
| `src/components/review/SkippedRegionCrop.tsx` | Canvas crop component | VERIFIED | 56 lines; exports `SkippedRegionCrop`; URL.createObjectURL, canvas drawImage, revokeObjectURL on unmount |
| `src/components/review/SkippedRegionCrop.test.tsx` | 4 tests for canvas crop | VERIFIED | 5 tests (plan said 4; Test 3b added for narrow-crop no-clamping case — exceeds spec) |
| `src/App.tsx` | Full state machine: gate/capture/processing/review/swipe | VERIFIED | 96 lines; all 5 states handled; sourceFiles threaded; all handlers wired |
| `.env.local` | VITE_APP_PASSWORD, VITE_ANTHROPIC_API_KEY, VITE_MOCK_MODE stubs | VERIFIED | All 3 vars present; VITE_MOCK_MODE=true |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/ai/parseReceipt.ts` | `@anthropic-ai/sdk` | `new Anthropic` constructor | WIRED | Line 1: `import Anthropic from '@anthropic-ai/sdk'`; line 61: `const client = new Anthropic({...})` |
| `src/ai/parseReceipt.ts` | `import.meta.env.VITE_MOCK_MODE` | env var check before API call | WIRED | Line 57: `if (import.meta.env.VITE_MOCK_MODE === 'true')` — early return before any Anthropic instantiation |
| `src/components/gate/PasswordGate.tsx` | `import.meta.env.VITE_APP_PASSWORD` | env var comparison in onSubmit | WIRED | Line 17: `if (trimmed === import.meta.env.VITE_APP_PASSWORD)` |
| `src/App.tsx` | `src/components/gate/PasswordGate.tsx` | rendered when appState === 'gate' | WIRED | Line 3: import; line 57–59: `if (appState === 'gate') return <PasswordGate onUnlock={handleUnlock} />` |
| `src/components/review/ReviewScreen.tsx` | `src/types/ai.ts` | imports ReceiptItem and SkippedRegion | WIRED | Line 4: `import type { ReceiptItem, SkippedRegion } from '@/types/ai'` — used in props interface and state |
| `src/components/review/ReviewScreen.tsx` | `src/components/review/SkippedRegionCrop.tsx` | rendered once per skipped region | WIRED | Line 5: import; lines 72–77: `<SkippedRegionCrop file={file} boundingBox={region.boundingBox} />` inside skippedRegions.map |
| `src/App.tsx` | `src/ai/parseReceipt.ts` | called in handleSubmit replacing setTimeout stub | WIRED | Line 5: import; line 35: `const result = await parseReceipt(files)` — result.items and result.skippedRegions both consumed |
| `src/App.tsx` | `src/components/review/ReviewScreen.tsx` | rendered when appState === 'review', passes sourceFiles | WIRED | Line 61–69: `if (appState === 'review') return <ReviewScreen items={reviewItems} skippedRegions={skippedRegions} sourceFiles={sourceFiles} onConfirm={handleConfirm} />` |
| `src/App.tsx` | `sessionStorage` | stores 'unlocked' flag on gate pass, checks it on mount | WIRED | Line 15: `sessionStorage.getItem(SESSION_KEY)`; line 26: `sessionStorage.setItem(SESSION_KEY, 'true')` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AI-01 | 03-01, 03-02, 03-03, 03-04 | App extracts items (name + price) from receipt image via AI vision API | SATISFIED | `parseReceipt.ts` calls Anthropic vision API, parses response to `ReceiptItem[]`, wired in `App.tsx` |
| AI-02 | 03-04 | App returns structured item list within 5 seconds | NEEDS HUMAN | System prompt and model `claude-3-5-sonnet-20241022` are configured for speed; actual timing requires real API call — human checkpoint approved but timing step (steps 14–18) requires real key |
| AI-03 | 03-01, 03-03, 03-04 | App extracts subtotal, tax, tip, and total if present | NEEDS HUMAN | Tax + Tip: included as named items per plan spec and system prompt. Subtotal + Total: intentionally excluded. REQUIREMENTS.md says "extracts…total" but plan design filters totals. Human must confirm design intent satisfies requirement |
| AI-04 | 03-01, 03-03, 03-04 | App handles ambiguous items with best-guess extraction | PARTIAL | Ambiguous items with unreadable prices go to `skippedRegions` (shown as canvas crops for manual entry). System prompt says "never guess" — this is skip-not-guess behavior. Requirements says "best-guess extraction" which conflicts with the plan's explicit no-guess decision. Human must confirm acceptance |
| AI-05 | 03-01, 03-04 | Mock mode available for testing without API calls | SATISFIED | `VITE_MOCK_MODE=true` bypasses Anthropic SDK entirely, returns 6 hardcoded items; `.env.local` has `VITE_MOCK_MODE=true` set by default |

**Orphaned requirements from REQUIREMENTS.md mapped to Phase 3 but not appearing in any plan:** None. All 5 (AI-01 through AI-05) are claimed in at least one plan's `requirements` field.

**Note on REQUIREMENTS.md status fields:** REQUIREMENTS.md marks AI-02 through AI-05 as unchecked (`[ ]`) and AI-01 as checked (`[x]`). The traceability table marks AI-01 as "Complete" and AI-02–05 as "Pending". The code implementation for AI-02–05 is present; the checkbox status likely reflects pending human verification rather than missing implementation.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/App.tsx` | 54 | `console.log('Phase 5 placeholder — confirmed items ready:', items)` | Info | Forward-reference debug log; intentional; should be removed before Phase 5 ships but does not affect Phase 3 functionality |
| `src/App.tsx` | 73, 77 | Phase 5 swipe placeholder UI | Info | Intentional placeholder for unimplemented Phase 5 SwipeScreen — correctly scoped and documented as placeholder |
| `.env.local` | 2 | Possible real Anthropic API key committed in plaintext | SECURITY WARNING | `.env.local` contains what appears to be a real API key (value starting with `sk-ant-api03-`). This file should be in `.gitignore`. If it is not, the key is at risk of being committed to version control. Verify `.gitignore` includes `.env.local` and rotate the key if it has been committed. |

---

## Human Verification Required

### 1. Real API Response Timing (AI-02)

**Test:** Set `VITE_MOCK_MODE=false` and add real `VITE_ANTHROPIC_API_KEY` in `.env.local`, run `npm run dev`, upload a single clear receipt photo, tap "Process Receipts"
**Expected:** ReviewScreen renders with extracted item list within 5 seconds of tapping the button (check Network tab in DevTools — time from request to ReviewScreen appearing)
**Why human:** Sub-5-second API latency requires a live API call and real-time observation; cannot be verified statically

### 2. AI-03 Tax/Tip/Subtotal/Total Extraction Intent

**Test:** Use a real receipt containing Tax, Tip, Subtotal, and Total lines; process with real API (VITE_MOCK_MODE=false)
**Expected:** Tax and Tip appear as named items in ReviewScreen list; Subtotal and Total do NOT appear
**Why human:** The REQUIREMENTS.md wording ("extracts subtotal, tax, tip, and total") conflicts with the plan's explicit design decision to filter Subtotal/Total. Human must confirm the implemented behavior (tax/tip in, subtotal/total out) is the accepted interpretation of AI-03

### 3. AI-04 Ambiguous Item Handling

**Test:** Upload a receipt with at least one partially obscured or illegible price; process with real API
**Expected:** Unreadable items appear in the amber "couldn't be read" section with a canvas crop of the receipt area; legible items appear in the main list; the user can manually type in the missed items
**Why human:** "Best-guess extraction" vs "skip ambiguous items" is a behavioral difference; human must confirm the skip-and-crop approach satisfies the requirement intent for this project

### 4. End-to-End Mock Mode Flow on Device

**Test:** Run `npm run dev` with `VITE_MOCK_MODE=true`; open in browser (ideally iPhone Safari)
**Expected:**
1. PasswordGate shown on first load
2. Wrong passphrase shows error; correct passphrase advances to CaptureScreen
3. Add receipt photo(s), tap "Process Receipts" — spinner appears briefly, ReviewScreen shows 6 items (Margherita Pizza $14.00, Caesar Salad $9.50, Sparkling Water $3.00, Tiramisu $7.00, Tax $2.75, Tip $5.00)
4. Remove one item — disappears from list
5. Add manual item — appears in list
6. Tap "Start splitting" — Phase 5 placeholder screen shown with correct item count
7. Refresh page — gate NOT re-shown (sessionStorage persists)
8. New tab — gate IS shown (sessionStorage is per-tab)
**Why human:** Browser session behavior and UI rendering require live interaction; jsdom tests do not cover sessionStorage across page refreshes or multi-tab behavior

---

## SDK Installation Verification

`@anthropic-ai/sdk` version `^0.78.0` is declared in `package.json` dependencies (not devDependencies — correct for production use) and the package exists at `node_modules/@anthropic-ai/sdk/`. The SDK is imported and used in `src/ai/parseReceipt.ts`.

---

## Test Count Verification

| Test File | Plan Expected | Actual | Delta |
|-----------|---------------|--------|-------|
| `parseReceipt.test.ts` | 9 | 9 | 0 |
| `PasswordGate.test.tsx` | 6 | 6 | 0 |
| `SkippedRegionCrop.test.tsx` | 4 | 5 | +1 (Test 3b: narrow-crop no-clamping) |
| `ReviewScreen.test.tsx` | 9 | 10 | +1 (Test 4b: non-numeric price validation) |
| **Total** | **28** | **30** | **+2 (both additions improve coverage)** |

All extra tests are valid coverage expansions, not deviations.

---

## Security Note

`.env.local` at the project root contains `VITE_ANTHROPIC_API_KEY` with a value that appears to be a real API key (beginning with `sk-ant-api03-`). Verify:
1. `.env.local` is listed in `.gitignore` — if not, add it immediately
2. If the file has ever been committed to git history, the key should be rotated via the Anthropic console
3. The key is sent directly from the browser (`dangerouslyAllowBrowser: true`) — this is by design per the plan, but means anyone who inspects network traffic can capture the key

This is a pre-existing architectural decision (client-side key, protected by PasswordGate), not a Phase 3 regression. Flagged for awareness.

---

## Gaps Summary

No blocking gaps found. All Phase 3 code artifacts are present, substantive, and wired correctly. The 4 human verification items are standard sign-off steps, not missing implementation:
- AI-02 timing was always a human checkpoint (Plan 03-04 Task 2 steps 14–18)
- AI-03 and AI-04 interpretation questions are design-level, not code-level defects
- End-to-end browser flow was approved in Plan 03-04 human checkpoint (reported as passing in 03-04-SUMMARY.md)

The ROADMAP.md still shows Phase 3 as "2/4 plans executed" — this is stale metadata; all 4 plans have SUMMARYs and the code is fully implemented.

---

_Verified: 2026-03-06_
_Verifier: Claude (gsd-verifier)_
