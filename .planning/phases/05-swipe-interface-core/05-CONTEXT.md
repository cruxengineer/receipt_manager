# Phase 5: Swipe Interface Core - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the card-based swipe UI for assigning receipt items to Tom (Person A) or Jerry (Person B), or splitting equally. One item card displayed at a time. Running totals visible throughout. Swipe left = Tom, swipe right = Jerry, center button = equal split. Summary screen is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Card design
- Name + price only on each card — big, readable, no extra info
- White card with soft shadow and rounded corners — clean and minimal
- Card should be the majority of screen height on mobile (dominant element)
- No colored accent edge on the card itself — color comes from drag feedback only

### Screen layout (top to bottom)
- **Running totals bar** (top): Tom: $X · Jerry: $Y, color-coded (blue/green)
- **Progress counter**: "Item X of Y" between totals bar and card
- **Item card** (centered, majority of screen)
- **Split button** (centered below card): "Split equally" or similar label
- This puts totals and progress out of the way of the user's thumb during swiping

### Drag visual feedback
- Card tilts/rotates slightly as dragged (physical, Tinder-like feel)
- Color tint fades in behind card as user drags (blue tint for left/Tom, green tint for right/Jerry)
- Name label appears on card as user drags toward that side ("Tom" on left drag, "Jerry" on right drag)
- Both tint and label appear together — not mutually exclusive
- Feedback intensity increases with drag distance (more tilt + stronger tint as card goes further)

### Split math
- When an item is split equally, half is added to each person's running total
- No separate "shared" bucket — totals bar always shows each person's actual amount owed
- Example: $18.50 item split → Tom +$9.25, Jerry +$9.25

### Undo and restart
- **Back button**: undo one card at a time (primary undo — always visible)
- **Three-dots menu (⋯)**: reveals "Start over" option for full restart
- Three-dots goes in a standard top-corner position (Claude's discretion on exact placement)
- Full restart clears all assignments and returns to item 1

### First swipe hint
- First item only: brief hint text below the card reading "← Tom · Split · Jerry →"
- Disappears after first swipe (not shown for remaining items)
- Subtle styling — not a banner, just small instructional text

### End of flow
- After last card is swiped: brief "All done!" state with a checkmark (~1.5 seconds)
- Auto-advances to summary screen without user action
- No explicit "See summary →" button needed — the auto-advance is the transition

### Claude's Discretion
- Exact drag threshold percentage before card commits and flies off screen
- Swipe animation timing and easing curves
- Three-dots menu exact position (top-left or top-right)
- Split button exact label text ("Split equally", "Split 50/50", etc.)
- Color tint opacity levels at various drag distances
- Back button styling and exact position

</decisions>

<specifics>
## Specific Ideas

- Card should feel dominant on screen — this is the core interaction, not a small element
- The tilt + tint combo should feel physical and satisfying, but not overdone ("focus on reliability over fancy animations" — from PROJECT.md)
- Running totals at top keeps them visible without interfering with thumb swiping
- "← Tom · Split · Jerry →" hint only on first card — users learn fast, don't need a tutorial

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: shadcn/ui Button (h-11, 44px) — use for split button and back button
- `src/lib/utils.ts`: cn() for class merging
- `--color-person-a` / `--color-person-b` CSS tokens in `src/index.css` — use for tint color and totals bar color coding
- `lucide-react`: already installed — use for back arrow, three-dots (MoreHorizontal), and checkmark icons

### Established Patterns
- `max-w-md mx-auto` centered layout — SwipeScreen follows same constraint
- App.tsx owns all state, screens receive props — `confirmedItems`, `personAName`, `personBName` already passed through
- Lifted state pattern: SwipeScreen emits final assignments array to App.tsx → passed to Phase 6 SummaryScreen
- TDD approach: write failing tests first, then implement (established in Phases 3 and 4)

### Integration Points
- App.tsx: `appState === 'swipe'` placeholder exists — replace with `<SwipeScreen>` component
- `confirmedItems: ReceiptItem[]` already held in App.tsx state (set by ReviewScreen in Phase 3)
- `personAName` / `personBName` already in App.tsx state — pass as props to SwipeScreen
- SwipeScreen emits: `onComplete(assignments: ItemAssignment[])` where each assignment has itemIndex + assignee ('A' | 'B' | 'split')
- App.tsx will add `'summary'` state after `'swipe'` — Phase 6 builds SummaryScreen

### Data Shape
- Input: `ReceiptItem[]` (name: string, price: number) from `src/types/ai.ts`
- Output: `ItemAssignment[]` — new type to define: `{ item: ReceiptItem, assignee: 'A' | 'B' | 'split' }`
- Running totals derived from assignments array in real-time

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-swipe-interface-core*
*Context gathered: 2026-03-07*
