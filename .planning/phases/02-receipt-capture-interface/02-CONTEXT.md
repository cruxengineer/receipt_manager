# Phase 2: Receipt Capture Interface - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

The entry point of the app — how users get a receipt photo into the system. Covers the capture/upload UI, multi-image support, loading state while AI processes, and error handling with retry. AI processing itself is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Entry point
- App opens directly to the capture screen — no separate welcome/landing screen
- Keep it immediate: one clear action to start

### Upload vs camera
- Claude's Discretion: single button or two options — optimize for mobile (native file picker on iOS includes camera option)

### Multiple receipts (CAPT-03)
- Claude's Discretion: add before or after processing — keep it simple

### Image preview
- Claude's Discretion: preview or immediate submission

### Claude's Discretion
- Loading state design (spinner, skeleton, progress — Claude decides)
- Error message copy for unreadable receipts
- Exact layout of capture screen within max-w-md card pattern

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: shadcn/ui Button (h-11, 44px touch target) — use for upload/capture CTAs
- `src/lib/utils.ts`: cn() utility for class merging

### Established Patterns
- `max-w-md mx-auto` centered card layout (App.tsx) — capture screen should follow this
- Tailwind v4 @theme CSS-first config — no tailwind.config.js
- Person A blue / Person B green color tokens already defined

### Integration Points
- App.tsx is currently a test shell — Phase 2 replaces it with real capture screen
- No routing yet — single screen for now (routing comes when multi-screen flow exists)

</code_context>

<specifics>
## Specific Ideas

- Primary use case: iPhone Safari — native `<input type="file" accept="image/*" capture="environment">` triggers camera directly on mobile
- Must feel immediate and simple — "open app, tap, take photo, done"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-receipt-capture-interface*
*Context gathered: 2026-03-05 (brief — skipped discuss-phase)*
