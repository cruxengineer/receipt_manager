# Phase 4: Person Management - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Let users set custom names for Person A and Person B. Colors are already established (blue for A, green for B — CSS tokens in `index.css`). This phase adds name state, a name setup modal, and threads names through the swipe flow (Phase 5) and summary screen (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Name prompt timing
- Appears immediately after the password gate unlocks, before the capture screen
- A quick modal/overlay — not a full dedicated screen
- App.tsx adds a new state: `'names'` between `'gate'` and `'capture'`
- Once names are set (or skipped), proceeds to capture screen

### Default names
- Default to **"Tom"** and **"Jerry"** — memorable, fun placeholders
- Not generic ("Person A/B") and not assumptive ("You/Them")
- Users who don't customize still get a usable, non-bland experience

### Name setup UI
- Quick modal/overlay — lightweight, not a full page like PasswordGate or CaptureScreen
- Two text inputs side-by-side (or stacked), one per person, each color-coded to their Person A/B color
- A "Let's go →" button confirms names; tapping outside or pressing skip also works
- Should feel faster than the password gate — 5 seconds to fill in, not a form to study

### Name editability
- Names are **not** prominently editable mid-swipe — don't interrupt the flow
- The summary screen (Phase 6) will include a way to change names if needed, but it should be subtle (small edit link, not a button)
- Names live in App.tsx state and are passed as props throughout — no separate store needed

### Color assignment
- Colors are already locked: Person A = blue (`--color-person-a`), Person B = green (`--color-person-b`)
- The name inputs in the modal should be tinted with their person's color to reinforce the association from the start
- No color customization — colors are fixed

### Claude's Discretion
- Exact modal animation (fade in, slide up, etc.)
- Whether the modal has a backdrop or just overlays the gate-transition
- Input placeholder text ("Enter name…" etc.)
- Whether "skip" is a button or just tapping the CTA with default names already filled

</decisions>

<specifics>
## Specific Ideas

- "Tom & Jerry" as defaults — fun and immediately clear this is a two-person thing
- The modal should feel quick and lightweight, not like a settings screen
- Names should be visible in the swipe UI (Phase 5) — labels on left/right swipe directions use person names, not "A/B"
- Summary screen (Phase 6) gets a subtle name-edit affordance — not a big "Edit" button, more like a small pencil or tappable name

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — shadcn/ui Button for the "Let's go →" CTA
- `src/lib/utils.ts` — cn() for conditional class merging
- `--color-person-a` / `--color-person-b` CSS variables (and light/dark variants) already in `src/index.css`

### Established Patterns
- App.tsx owns all state, screens receive props — names follow the same pattern: `personAName`, `personBName` in App.tsx state
- `max-w-md mx-auto` card layout established — modal can use same width constraint
- sessionStorage used for gate persistence — names do NOT need sessionStorage, they live in App.tsx state for the session

### Integration Points
- App.tsx state machine: add `'names'` state between `'gate'` and `'capture'`
- Names are passed as props to SwipeScreen (Phase 5) and SummaryScreen (Phase 6)
- The name modal is a new component: `src/components/names/NamesModal.tsx` (or similar)
- Phase 5 (swipe) uses names as swipe direction labels ("← Tom" / "Jerry →")
- Phase 6 (summary) receives names for section headers and the subtle edit affordance

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-person-management*
*Context gathered: 2026-03-07*
