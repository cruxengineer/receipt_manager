# Phase 3: AI Vision Integration - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the `handleSubmit` stub in App.tsx with a real Anthropic Vision API call. Phase 3 delivers:
1. Password gate screen (simple passphrase, protects API key from casual discovery)
2. AI vision call (send receipt image(s) to Claude, parse structured item list)
3. Review screen (user sees extracted items, adds any missed items, then proceeds to swipe flow)

AI processing accuracy, prompt engineering, and error handling are in scope. The swipe gesture UI (Phase 5) and person management (Phase 4) are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Access control
- Simple password gate using `VITE_APP_PASSWORD` env var
- Entered password checked against env var; on match, stored in `sessionStorage` (clears on tab close)
- Gate shown before anything else — App.tsx checks sessionStorage first
- No accounts, no backend, no persistent sessions — stays fully static
- Personal use only; URL not shared publicly

### API key handling
- `VITE_ANTHROPIC_API_KEY` in `.env.local` (already git-ignored)
- Client-side call accepted for personal use — key visible in devtools but app is gated
- No proxy, no backend needed for v1

### Item response schema
- Each item: `{ name: string, price: number }` — no quantity field
- Tax and tip included as named line items when present (e.g., `{ name: "Tax", price: 2.50 }`, `{ name: "Tip", price: 8.00 }`)
- Subtotal and Total are **not** included as items — they're derived values, not assignments
- AI prompt must explicitly exclude subtotal/total lines from the item list

### Multi-image handling
- All uploaded receipt images sent in a single API call (multiple image blocks in one message)
- Simpler, cheaper, and faster than sequential calls
- Edge case: if images are from different receipts, items will be merged — acceptable for v1

### Ambiguous item handling
- Skip items the AI cannot confidently read (blurry, unreadable price, etc.)
- Show a count of skipped items after extraction: e.g., "2 items couldn't be read — add them manually below"
- Never hallucinate a price — if uncertain, skip the item entirely

### Review screen (after AI extraction)
- Shown after AI call completes, before navigating to swipe flow
- Displays: extracted item list (name + price), skipped item count/message if any
- User can manually add missed items (name + price fields + add button)
- User can remove incorrectly extracted items
- "Start splitting →" CTA navigates to Phase 5 swipe flow
- Phase 5 receives the final reviewed item list (post any manual edits)

### Claude's Discretion
- Exact prompt wording and few-shot examples for receipt parsing
- Review screen layout (list density, edit affordances)
- Password gate UI (fullscreen modal vs. dedicated route)
- Loading state design during AI call (already handled by CaptureScreen's `isProcessing` prop)
- Error message copy for unreadable receipts

</decisions>

<specifics>
## Specific Ideas

- Password gate should feel lightweight — not a login page, more like a PIN/passphrase entry that disappears once entered
- Review screen is a "sanity check" moment, not a heavy editor — most of the time the AI will be correct and the user just taps proceed
- "2 items couldn't be read" message should be actionable, not alarming — user knows to add tip/tax manually if missing

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: shadcn/ui Button (h-11, 44px) — use for password submit, add item, start splitting
- `src/lib/utils.ts`: cn() utility for class merging
- `CaptureScreen` props: `isProcessing`, `error`, `onRetry`, `onSubmit(files: File[])` — Phase 3 fills `onSubmit`

### Established Patterns
- `max-w-md mx-auto` centered card layout — all new screens follow this
- Tailwind v4 @theme CSS-first config — no tailwind.config.js
- Lifted state pattern: App.tsx owns state, screens receive props (continue this for ReviewScreen)
- `VITE_` prefix for all client-side env vars (already established)

### Integration Points
- `App.tsx:handleSubmit(files: File[])` — replace the 1.5s setTimeout stub with real AI call
- App.tsx will need a new state machine: `'gate' | 'capture' | 'processing' | 'review' | 'swipe'`
- ReviewScreen receives `items: { name: string, price: number }[]` and `skippedCount: number`
- ReviewScreen emits final `items` to App.tsx → passed to Phase 5 SwipeScreen

### New Env Vars Needed
- `VITE_APP_PASSWORD` — passphrase for the password gate
- `VITE_MOCK_MODE` — already decided in Phase 1; mock returns a hardcoded item list matching the schema above

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-vision-integration*
*Context gathered: 2026-03-06*
