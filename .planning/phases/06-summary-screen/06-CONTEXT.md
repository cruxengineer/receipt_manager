# Phase 6: Summary Screen - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Display the final itemized breakdown for both people after all items have been assigned. Show each person's items, their totals, and split items (shown in both lists). Provide navigation to adjust assignments or start over with a new receipt. The swipe flow is Phase 5 — this is the read-only results screen.

</domain>

<decisions>
## Implementation Decisions

### Layout structure
- **Top section**: Side-by-side totals bar — Tom's total (blue, left) and Jerry's total (green, right), prominently displayed. Same visual style as the running totals bar on the swipe screen for continuity.
- **Bottom section**: Stacked itemized lists — Tom's full item list, then Jerry's full item list, scrollable if needed.
- This gives the "at a glance" total at top, with the breakdown below for anyone who wants to verify.

### Split items display
- Split items appear in **both** people's lists at half price.
- Each split item shows a "Split ½" tag/label next to it to indicate it's shared.
- Example: A $18.50 steak split equally → Tom's list shows "Steak $9.25 Split ½", Jerry's list shows "Steak $9.25 Split ½".
- No separate "Shared items" section — each person's list is self-contained.

### Totals
- Large, prominent side-by-side totals at the top of the screen.
- Use the existing `--color-person-a` (blue) and `--color-person-b` (green) tokens — consistent with swipe screen.
- Person's name above their total.

### Navigation buttons
- Two equal-width buttons at the bottom of the screen, side by side.
- **Adjust** (left): Returns to swipe screen with item 1, clears all assignments, names preserved. App.tsx sets appState back to `'swipe'` and resets assignments/currentIndex.
- **Start Over** (right): Clears everything — assignments, items, names reset to defaults — and returns to `'capture'` screen for a new receipt. Destructive; style accordingly (muted or outlined vs. Adjust's primary).

### Name editing
- Subtle name-edit affordance — a small tappable edit link/icon next to each person's name in the totals bar.
- Not a prominent button — just a small pencil icon or "(edit)" link.
- Tapping opens the NamesModal (already built in Phase 4) to update names without losing assignments.
- Already decided in Phase 4; carrying forward.

### Math verification (SUMM-05)
- The math is always correct (derived from assignments array, not user-entered).
- No explicit "Verified ✓" badge needed — the numbers just add up.
- Claude's discretion on whether to show a subtle receipt total at the bottom (e.g., "Receipt total: $52.50").

### Claude's Discretion
- Exact card/section border styling (dividers, cards, or flat sections)
- "Split ½" tag visual design (badge, muted text, icon)
- Whether a small receipt grand total appears at the very bottom for verification
- Scroll behavior (whether screen scrolls or sections are fixed-height with internal scroll)
- Animation/transition from swipe screen to summary (fade, slide, etc.)

</decisions>

<specifics>
## Specific Ideas

- The totals bar at top should match the visual style of the swipe screen's running totals bar — users will recognize it as the same numbers they were watching
- "Adjust" takes you back to item 1 (not a specific card) — full re-swipe
- "Start Over" is the destructive action — visual distinction from Adjust (e.g., outlined vs. filled, or different color weight)
- NamesModal already exists — reuse it for the name-edit flow rather than building new UI

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/swipe.ts`: `ItemAssignment { item: ReceiptItem, assignee: 'A'|'B'|'split' }` and `SwipeAssignments` — this is the data shape SummaryScreen receives
- `src/components/names/NamesModal.tsx`: Already built — reuse for name editing from summary
- `src/components/ui/button.tsx`: shadcn/ui Button (h-11, 44px) — use for Adjust and Start Over
- `--color-person-a` / `--color-person-b` CSS tokens — totals bar coloring
- `lucide-react`: Pencil icon for name-edit affordance

### Established Patterns
- `max-w-md mx-auto` centered mobile layout — SummaryScreen follows same constraint
- App.tsx owns all state; SummaryScreen receives props: `assignments: SwipeAssignments`, `personAName`, `personBName`, `onAdjust`, `onStartOver`, `onEditNames`
- Lifted state pattern: SummaryScreen emits callbacks, App.tsx handles transitions
- TDD: write failing tests first (established in Phases 2-5)

### Integration Points
- App.tsx: `appState === 'summary'` currently shows placeholder with `{assignments.length} items assigned`
- Replace placeholder with `<SummaryScreen assignments={assignments} personAName={personAName} personBName={personBName} onAdjust={...} onStartOver={...} />`
- `onAdjust`: App.tsx resets `assignments = []`, `currentIndex = 0`, sets `appState = 'swipe'`
- `onStartOver`: App.tsx resets all state (assignments, items, names to defaults), sets `appState = 'capture'`
- `onEditNames`: App.tsx shows NamesModal (set `appState = 'names'` or use a local modal state)

### Data derivation (in SummaryScreen)
- Tom's items: `assignments.filter(a => a.assignee === 'A' || a.assignee === 'split')`
  - For split items: show `a.item.price / 2` with "Split ½" tag
- Jerry's items: `assignments.filter(a => a.assignee === 'B' || a.assignee === 'split')`
  - For split items: show `a.item.price / 2` with "Split ½" tag
- Tom total: `assignments.reduce(...)` using `price` for 'A' and `price/2` for 'split' (same logic as SwipeScreen)
- Jerry total: same pattern with 'B'

</code_context>

<deferred>
## Deferred Ideas

- **Multi-receipt combining**: User asked about scanning multiple separate receipts and combining their items into one swipe session. The capture screen already accepts multiple photos (parsed together by AI), but combining items from separate scan sessions is a new flow. Noted for backlog.
- **Payment integration**: Showing Venmo/payment links from summary — v2 requirement (PAY-01, PAY-02), already in backlog.

</deferred>

---

*Phase: 06-summary-screen*
*Context gathered: 2026-03-08*
