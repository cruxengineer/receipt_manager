# Phase 4: Person Management - Research

**Researched:** 2026-03-07
**Domain:** React state management, modal UI patterns, TypeScript prop threading
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Name prompt appears immediately after the password gate unlocks, before the capture screen
- A quick modal/overlay — not a full dedicated screen
- App.tsx adds a new state: `'names'` between `'gate'` and `'capture'`
- Once names are set (or skipped), proceeds to capture screen
- Default names: **"Tom"** and **"Jerry"**
- Name setup UI: quick modal/overlay, two color-coded text inputs, a "Let's go →" CTA button, tapping outside or pressing skip also works
- Names are NOT prominently editable mid-swipe
- Summary screen (Phase 6) gets a subtle edit affordance, not a prominent button
- Names live in App.tsx state and are passed as props — no separate store
- Colors are already locked: Person A = blue (`--color-person-a`), Person B = green (`--color-person-b`)
- No color customization — colors are fixed

### Claude's Discretion
- Exact modal animation (fade in, slide up, etc.)
- Whether the modal has a backdrop or just overlays the gate-transition
- Input placeholder text ("Enter name…" etc.)
- Whether "skip" is a button or just tapping the CTA with default names already filled

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERS-01 | User can set names for Person A and Person B | NamesModal component with two text inputs + App.tsx state `personAName` / `personBName` |
| PERS-02 | Color coding consistently differentiates Person A vs Person B | CSS tokens `--color-person-a` / `--color-person-b` already exist in `src/index.css`; apply via Tailwind `text-[--color-person-a]` inline style pattern |
| PERS-03 | Default names provided if user doesn't customize | Initialize state with `"Tom"` / `"Jerry"`; modal pre-fills defaults; user can submit without typing anything |
</phase_requirements>

---

## Summary

Phase 4 is a lightweight state-threading exercise. The colors are already done (CSS tokens in `src/index.css`), so the entire phase reduces to: (1) adding two new string state values to App.tsx, (2) inserting a `'names'` step in the state machine, (3) building a single NamesModal component, and (4) passing names as props forward to future phases.

The decision to place names in App.tsx state (not a separate store, not sessionStorage) keeps implementation minimal and consistent with the existing architecture. All prior components — PasswordGate, CaptureScreen, ReviewScreen — follow the same pattern: App.tsx owns state, screens receive props. NamesModal follows this pattern exactly.

The biggest planning consideration is prop-forwarding surface: names need to be threaded into Phase 5 (SwipeScreen) and Phase 6 (SummaryScreen) interfaces now, even though those components don't exist yet. Defining the prop types correctly in this phase prevents rework.

**Primary recommendation:** Build NamesModal as a pure controlled component (receives `defaultA`, `defaultB`, `onConfirm`). App.tsx wires it into the `'names'` state. Pass `personAName`/`personBName` forward as typed props. Done in one plan.

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | ^19.2.0 | Component + state | Project foundation |
| TypeScript 5.9 | ~5.9.3 | Type safety for props | Project foundation |
| Tailwind CSS v4 | ^4.2.1 | Styling via CSS tokens | Project foundation |
| shadcn/ui Button | installed | "Let's go →" CTA | Already used in PasswordGate |
| `cn()` utility | installed | Conditional class merging | Already used everywhere |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React `useState` | built-in | Local modal input state | Input values before confirm |
| React `useRef` | built-in | Auto-focus first input | UX polish, optional |
| CSS custom properties | built-in | Person color tokens | `--color-person-a`, `--color-person-b` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| App.tsx state | React Context | Context adds indirection; App.tsx is simpler for 2 values |
| App.tsx state | sessionStorage | sessionStorage would persist across page loads — not wanted (names are per-session intent) |
| Inline modal | Radix UI Dialog | Radix adds dependency for a single lightweight modal — overkill here |
| CSS tokens | Tailwind color classes | CSS tokens (`--color-person-a`) are already defined and used — stay consistent |

**No new packages needed.** This phase is zero new dependencies.

---

## Architecture Patterns

### Recommended File Structure
```
src/
├── components/
│   └── names/
│       ├── NamesModal.tsx          # The modal component
│       └── NamesModal.test.tsx     # Component tests
├── App.tsx                         # Add 'names' state + personAName/personBName
└── types/
    └── names.ts                    # (optional) PersonNames type alias
```

### Pattern 1: App.tsx State Machine Extension

The existing AppState union type is:
```typescript
type AppState = 'gate' | 'capture' | 'processing' | 'review' | 'swipe'
```

Add `'names'` between `'gate'` and `'capture'`:
```typescript
type AppState = 'gate' | 'names' | 'capture' | 'processing' | 'review' | 'swipe'
```

The `handleUnlock` handler currently jumps straight to `'capture'`:
```typescript
const handleUnlock = () => {
  sessionStorage.setItem(SESSION_KEY, 'true')
  setAppState('capture')   // <-- change to 'names'
}
```

After change:
```typescript
const handleUnlock = () => {
  sessionStorage.setItem(SESSION_KEY, 'true')
  setAppState('names')
}
```

**Important edge case:** When sessionStorage is already set (returning user within same tab), App.tsx initializes directly to `'capture'`, skipping `'gate'`. This means `'names'` is also skipped — the user keeps their session-default names ("Tom" / "Jerry"). This is correct behavior: names only need to be set once per fresh session start.

### Pattern 2: NamesModal Component Interface

```typescript
// src/components/names/NamesModal.tsx
interface NamesModalProps {
  defaultNameA: string  // "Tom"
  defaultNameB: string  // "Jerry"
  onConfirm: (nameA: string, nameB: string) => void
}
```

NamesModal owns its own `useState` for the two input values, pre-filled with defaults. On confirm, it calls `onConfirm` with the current values (which may be the defaults if user didn't type). This is the same controlled-component pattern as PasswordGate.

### Pattern 3: Props Threading

App.tsx adds name state alongside existing state:
```typescript
const [personAName, setPersonAName] = useState('Tom')
const [personBName, setPersonBName] = useState('Jerry')

const handleNamesConfirm = (nameA: string, nameB: string) => {
  setPersonAName(nameA.trim() || 'Tom')
  setPersonBName(nameB.trim() || 'Jerry')
  setAppState('capture')
}
```

Names passed forward (Phase 5 and 6 will consume them):
```typescript
// In appState === 'swipe' block (Phase 5):
// <SwipeScreen personAName={personAName} personBName={personBName} ... />

// In appState === 'summary' block (Phase 6):
// <SummaryScreen personAName={personAName} personBName={personBName} ... />
```

### Pattern 4: Color Application in NamesModal

The Tailwind v4 CSS token approach (consistent with project style). Use inline `style` for dynamic color application from CSS custom properties:

```tsx
// Person A input — blue tint on border + label
<label style={{ color: 'hsl(var(--person-a))' }}>
  {nameA || 'Tom'}
</label>
<input
  style={{ borderColor: 'hsl(var(--person-a))', outlineColor: 'hsl(var(--person-a))' }}
  ...
/>
```

Alternatively, use Tailwind's arbitrary value syntax with CSS variables:
```tsx
<input className="border-[--color-person-a] focus:ring-[--color-person-a]" />
```

The project already uses `@theme` tokens as `--color-person-a` (with `hsl()` already included), so the arbitrary class `text-[--color-person-a]` would work in Tailwind v4 since `--color-person-a` is defined as `hsl(...)`. Verify this renders correctly — fall back to `style={{ color: 'var(--color-person-a)' }}` if Tailwind arbitrary class doesn't resolve.

**HIGH confidence:** CSS `var(--color-person-a)` as inline style always works regardless of Tailwind class resolution.

### Pattern 5: Modal Layout

The PasswordGate establishes the card pattern. NamesModal should mirror it:
```tsx
<div className="min-h-screen bg-gray-50 p-4 flex items-center">
  <div className="max-w-md mx-auto w-full">
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
      <p className="text-gray-500 mt-1 text-sm">Who's splitting this?</p>
    </div>
    {/* Card */}
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* two inputs + button */}
    </div>
  </div>
</div>
```

This reuses the exact same outer structure as PasswordGate, making the transition feel seamless.

### Anti-Patterns to Avoid
- **Full-screen route for names:** CONTEXT.md explicitly says modal/overlay, not a dedicated screen — avoid React Router or page-level navigation for this.
- **Storing names in sessionStorage:** Not needed and not wanted — names are in-session state in App.tsx only.
- **Validating name length/format:** Overkill for this simple use case — trim whitespace, fall back to default if empty, done.
- **Requiring name entry:** The user must be able to skip by clicking "Let's go →" with defaults pre-filled.
- **Making color tokens mutable:** Colors are fixed. No color picker, no color selection UI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Person color tokens | Custom color management | `--color-person-a` / `--color-person-b` CSS vars | Already defined in `src/index.css` |
| CTA button | Custom button element | `<Button>` from `@/components/ui/button` | Already exists, handles h-11 touch targets |
| Class merging | String concatenation | `cn()` from `@/lib/utils` | Already used everywhere |
| Focus management | Manual DOM focus | `autoFocus` on first input | Native browser, zero code |

**Key insight:** Every primitive needed for this phase already exists. The only new code is NamesModal itself and the App.tsx wiring.

---

## Common Pitfalls

### Pitfall 1: Empty Name Submission
**What goes wrong:** User clears default name, submits blank — names become empty strings displayed in swipe UI.
**Why it happens:** Uncontrolled trim/fallback logic.
**How to avoid:** In `handleNamesConfirm`, always apply `nameA.trim() || 'Tom'` before setting state.
**Warning signs:** Empty labels appearing on swipe cards in Phase 5.

### Pitfall 2: Session Bypass Skips Names Screen
**What goes wrong:** If developer initializes appState to `'capture'` directly (e.g., for fast development), names state is never set.
**Why it happens:** The sessionStorage check in App.tsx lazy initializer jumps to `'capture'`, bypassing `'names'`.
**How to avoid:** Initialize `personAName`/`personBName` to `'Tom'`/`'Jerry'` in useState — they always have valid defaults even when the names screen is skipped.
**Warning signs:** `undefined` or empty string appearing where names should render.

### Pitfall 3: CSS Token Naming Mismatch
**What goes wrong:** Using `--person-a` (CSS `:root` variable) vs `--color-person-a` (Tailwind `@theme` variable) inconsistently.
**Why it happens:** `src/index.css` defines BOTH `--person-a` (in `:root`) and `--color-person-a` (in `@theme`). They have the same values but different names.
**How to avoid:** For inline styles and direct CSS, use `var(--color-person-a)` — the `@theme` token. For Tailwind utility classes, use `text-person-a` or `bg-person-a` (Tailwind v4 generates these from `@theme`). Be consistent within one component.
**Warning signs:** Colors not applying, or appearing as raw `hsl()` strings instead of resolved colors.

### Pitfall 4: Tailwind v4 Arbitrary Value Syntax
**What goes wrong:** Using `text-[var(--color-person-a)]` from Tailwind v3 muscle memory — may not resolve correctly in v4.
**Why it happens:** Tailwind v4 CSS-first config changes how custom properties work with arbitrary values.
**How to avoid:** Prefer inline `style={{ color: 'var(--color-person-a)' }}` for the color-coded inputs in NamesModal. This is guaranteed to work. Only use Tailwind arbitrary syntax if you've verified it renders.

### Pitfall 5: Over-engineering the Modal
**What goes wrong:** Adding animation libraries, portal rendering, focus trapping, close-on-escape, accessibility roles — turning a 5-second form into a complex component.
**Why it happens:** Modal "best practices" lists are long.
**How to avoid:** This is a non-dismissible step in the app flow (user must click "Let's go →" or equivalent). It's NOT a popup over existing content — it IS the current screen content. No portal needed. No backdrop dismiss needed. No focus trap needed (it's the only interactive element on screen). Keep it simple.

---

## Code Examples

### App.tsx Extension (complete changes)

```typescript
// Add 'names' to AppState union
type AppState = 'gate' | 'names' | 'capture' | 'processing' | 'review' | 'swipe'

// Add name state (with defaults)
const [personAName, setPersonAName] = useState('Tom')
const [personBName, setPersonBName] = useState('Jerry')

// handleUnlock now goes to 'names' instead of 'capture'
const handleUnlock = () => {
  sessionStorage.setItem(SESSION_KEY, 'true')
  setAppState('names')
}

// New handler: names confirmed
const handleNamesConfirm = (nameA: string, nameB: string) => {
  setPersonAName(nameA.trim() || 'Tom')
  setPersonBName(nameB.trim() || 'Jerry')
  setAppState('capture')
}

// New render branch (between 'gate' and 'capture' checks):
if (appState === 'names') {
  return (
    <NamesModal
      defaultNameA={personAName}
      defaultNameB={personBName}
      onConfirm={handleNamesConfirm}
    />
  )
}
```

### NamesModal Component (minimal)

```tsx
// src/components/names/NamesModal.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NamesModalProps {
  defaultNameA: string
  defaultNameB: string
  onConfirm: (nameA: string, nameB: string) => void
}

export function NamesModal({ defaultNameA, defaultNameB, onConfirm }: NamesModalProps) {
  const [nameA, setNameA] = useState(defaultNameA)
  const [nameB, setNameB] = useState(defaultNameB)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(nameA, nameB)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ReceiptSplit</h1>
          <p className="text-gray-500 mt-1 text-sm">Who's splitting this?</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Person A input */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-person-a)' }}>
                Person 1
              </label>
              <input
                autoFocus
                type="text"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="Enter name…"
                className={cn('w-full px-3 py-2 border rounded-md text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2')}
                style={{ borderColor: 'var(--color-person-a)', '--tw-ring-color': 'var(--color-person-a)' } as React.CSSProperties}
              />
            </div>
            {/* Person B input */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-person-b)' }}>
                Person 2
              </label>
              <input
                type="text"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="Enter name…"
                className={cn('w-full px-3 py-2 border rounded-md text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2')}
                style={{ borderColor: 'var(--color-person-b)', '--tw-ring-color': 'var(--color-person-b)' } as React.CSSProperties}
              />
            </div>
            <Button type="submit" className="w-full">
              Let's go →
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

### Test Structure (mirrors PasswordGate.test.tsx pattern)

```tsx
// src/components/names/NamesModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NamesModal } from './NamesModal'

describe('NamesModal', () => {
  it('renders two text inputs pre-filled with defaults', () => { ... })
  it('calls onConfirm with entered names when form submitted', () => { ... })
  it('calls onConfirm with defaults when user submits without typing', () => { ... })
  it('calls onConfirm with default if input is cleared/empty', () => { ... })
  it('Person A input is pre-filled with defaultNameA', () => { ... })
  it('Person B input is pre-filled with defaultNameB', () => { ... })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate names page/route | Modal/overlay in same screen flow | Decision in CONTEXT.md | No routing needed, simpler state |
| Generic "Person A/B" labels | Named defaults ("Tom"/"Jerry") | Decision in CONTEXT.md | Better UX for users who skip |
| localStorage for persistence | App.tsx state only (session) | Decision in CONTEXT.md | Zero storage complexity |

**Nothing deprecated for this phase.** All tooling (React, Tailwind v4, shadcn/ui, Vitest) is current and already installed.

---

## Open Questions

1. **Ring color with inline style on shadcn/ui inputs**
   - What we know: `--tw-ring-color` can be set as a CSS custom property via inline style for Tailwind utility ring classes
   - What's unclear: Whether Tailwind v4 still uses `--tw-ring-color` or changed the ring variable name
   - Recommendation: Use `outline` or `box-shadow` directly in inline style as fallback; or simply use `focus:ring-[--color-person-a]` in Tailwind v4 syntax (test during implementation)

2. **`autoFocus` on first input in jsdom tests**
   - What we know: `autoFocus` works in real browsers; jsdom may not honor it
   - What's unclear: Whether tests need to manually `focus()` the input for focus-dependent assertions
   - Recommendation: Don't test focus behavior specifically — test input values and form submission instead (as PasswordGate tests do)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4 + React Testing Library 16 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run src/components/names/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERS-01 | NamesModal renders two inputs; onConfirm called with typed names | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | Wave 0 |
| PERS-02 | Person A input has blue color token applied; Person B has green | unit (style assertion) | `npx vitest run src/components/names/NamesModal.test.tsx` | Wave 0 |
| PERS-03 | Inputs pre-filled with "Tom"/"Jerry"; submitting with no changes calls onConfirm with defaults | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/names/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/names/NamesModal.test.tsx` — covers PERS-01, PERS-02, PERS-03

*(No framework or config gaps — Vitest 4 + RTL + jest-dom already installed and configured)*

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/App.tsx` — current state machine, state variables, handler patterns
- Direct code inspection: `src/index.css` — CSS custom property names and values
- Direct code inspection: `src/components/gate/PasswordGate.tsx` — established component pattern
- Direct code inspection: `src/components/ui/button.tsx` — Button component API
- Direct code inspection: `src/components/gate/PasswordGate.test.tsx` — established test pattern
- Direct code inspection: `vitest.config.ts` — test configuration
- Direct code inspection: `package.json` — installed dependency versions

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions — all architectural choices locked by user decisions

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed, versions confirmed in package.json
- Architecture: HIGH — patterns directly read from existing codebase
- Pitfalls: HIGH (CSS token naming), MEDIUM (Tailwind v4 ring variable name)
- Test strategy: HIGH — follows identical pattern to existing PasswordGate tests

**Research date:** 2026-03-07
**Valid until:** 2026-06-07 (stable stack, no fast-moving dependencies in this phase)
