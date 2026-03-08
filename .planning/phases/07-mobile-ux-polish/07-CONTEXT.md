# Phase 7: Mobile UX Polish - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the existing full flow (capture → swipe → summary) for smooth iPhone Safari use. Fix viewport layout issues, touch target sizing, iOS-specific rendering bugs, safe area insets for Dynamic Island/home indicator, and add animated screen-to-screen transitions. No new capabilities — this phase makes what's built feel right on mobile.

</domain>

<decisions>
## Implementation Decisions

### PasswordGate
- Keep the gate as-is — it's not a real login, just a one-time per-session API key unlock
- UX-04 ("no login required") is satisfied — there are no user accounts or credentials
- No changes to the gate in this phase

### Screen transitions
- **Direction:** Slide left (new screen enters from right) for all forward navigation
- **Speed:** 350ms — moderate, deliberate feel
- **Back navigation:** Slide right (screen exits to right) for Adjust → back to swipe
- **All Done → Summary:** Slide left (same as forward flow — the 1.5s pause is the punctuation, the slide is the transition)
- **Start Over:** No specific requirement — can cut or fade (Claude's discretion)

### Touch targets
- Back arrow and three-dots buttons in SwipeScreen: expand invisible hit area to 44×44px minimum — keep the icon visually small, only the tappable zone grows
- Pencil edit icon in SummaryScreen: larger invisible tap area around the existing small icon — visual design unchanged
- All other h-11 (44px) buttons already meet the requirement — no changes needed

### Viewport / iOS Safari layout
- CaptureScreen: switch from `min-h-screen` to `h-dvh flex flex-col` (matches SwipeScreen pattern)
- SummaryScreen: switch from `min-h-screen` to `h-dvh flex flex-col` — full screen locked with internal scroll on item lists
- SwipeScreen already uses `h-dvh` — no change needed

### iOS Safari polish (thorough)
- Remove default iOS tap highlight flash: `-webkit-tap-highlight-color: transparent` globally
- Prevent double-tap zoom on price numbers and interactive elements: `touch-action: manipulation` on buttons and cards
- Prevent iOS rubber-band/overscroll on full-screen locked views: `overscroll-behavior: none` on `h-dvh` screens

### Safe area insets (iPhone 16 / Dynamic Island)
- Apply `env(safe-area-inset-top)` top padding to all screens — prevents content from sitting behind Dynamic Island cutout
- Apply `env(safe-area-inset-bottom)` bottom padding to all screens — prevents bottom buttons from sitting behind home indicator bar
- Use `padding-bottom: env(safe-area-inset-bottom)` on the fixed bottom action rows (SwipeScreen split button area, SummaryScreen Adjust/Start Over row)
- Viewport meta tag must include `viewport-fit=cover` for safe area insets to work

### Claude's Discretion
- Exact CSS implementation for transition animations (CSS transitions vs. React state-based class toggling vs. a lightweight animation library)
- Whether transitions are implemented globally in App.tsx or per-screen
- Start Over transition style (cut or fade)
- Exact `overscroll-behavior` application scope

</decisions>

<specifics>
## Specific Ideas

- Slide left transitions mirror iOS native navigation — users will recognize the pattern immediately
- 350ms is moderate — not rushed, not slow
- "Reliability over fancy animations" (PROJECT.md) — transitions should be smooth and correct, not theatrical
- The All Done ✔ pause (1.5s) already signals the phase boundary — slide left after it is the natural follow-through
- User has iPhone 16 (Dynamic Island) — safe area is a real UX need, not hypothetical

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/index.css` `@theme` block: already has `--color-person-a/b` tokens — add safe area and transition CSS variables or utilities here
- `src/components/ui/button.tsx`: shadcn/ui Button already h-11 (44px) — compliant. Ghost/sm variants need hit area expansion via wrapper or className
- `@keyframes cardEnter` already defined in `src/index.css` — transition keyframes can go in the same file

### Established Patterns
- `h-dvh flex flex-col overflow-hidden` — SwipeScreen pattern, extend to CaptureScreen and SummaryScreen
- `max-w-md mx-auto w-full` — centered mobile layout on all screens, preserve this
- `flex-shrink-0` on top/bottom fixed bars — already used in SwipeScreen, apply same to other screens' fixed sections

### Integration Points
- `App.tsx` owns screen transitions — `appState` state machine is where transition direction logic lives
- `index.html`: viewport meta tag needs `viewport-fit=cover` added for safe area CSS to activate
- `src/index.css`: global iOS fixes (`-webkit-tap-highlight-color`, `overscroll-behavior`, `touch-action`) go in `@layer base`

### Existing transition infrastructure
- `cardEnter` keyframe already exists for card entrance in SwipeScreen — pattern to follow for screen transitions
- No existing screen-to-screen animation infrastructure — needs to be built in Phase 7

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-mobile-ux-polish*
*Context gathered: 2026-03-08*
