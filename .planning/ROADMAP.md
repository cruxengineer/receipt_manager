# Roadmap: ReceiptSplit

**Created:** 2026-03-03
**Granularity:** Standard (8 phases)
**Core Value:** Fast, frictionless receipt splitting that feels natural on mobile and produces accurate totals every time.

---

## Phase 1: Project Foundation

**Goal:** Establish tech stack, project structure, and development environment for a mobile-first static web app.

**Requirements:**
- DEPL-01, DEPL-02, DEPL-03

**Plans:** 1/3 plans executed

Plans:
- [ ] 01-01-PLAN.md — Project scaffold with Vite + React + TypeScript and Tailwind CSS
- [ ] 01-02-PLAN.md — UI foundation with shadcn/ui and Person A/B color tokens
- [ ] 01-03-PLAN.md — Deployment pipeline and PWA configuration

**Success Criteria:**
1. Tech stack selected and documented (framework, build tool, AI vision provider)
2. Project scaffolded with working dev server
3. Basic routing structure in place (home → capture → swipe → summary)
4. Deployed to static hosting with CI/CD pipeline
5. PWA manifest configured for home screen installation

**Estimated Complexity:** Low

---

## Phase 2: Receipt Capture Interface

**Goal:** Enable users to upload or photograph receipts with clear feedback and error handling.

**Requirements:**
- CAPT-01, CAPT-02, CAPT-03, CAPT-04, CAPT-05

**Plans:** [To be planned]

**Success Criteria:**
1. User can trigger camera on mobile devices
2. User can select image file(s) from device
3. User can add multiple receipt images to single session
4. Loading spinner shows while processing
5. Clear error message with retry button when upload fails or image is unreadable

**Estimated Complexity:** Medium

---

## Phase 3: AI Vision Integration

**Goal:** Extract line items from receipt images reliably and quickly via AI vision API.

**Requirements:**
- AI-01, AI-02, AI-03, AI-04, AI-05

**Plans:** [To be planned]

**Success Criteria:**
1. App sends receipt image to AI vision API with structured prompt
2. AI returns items list (name + price) in under 5 seconds for typical receipt
3. Subtotal, tax, tip, and total extracted when present on receipt
4. Ambiguous items included with best-guess extraction (no hallucination)
5. Mock mode available (hardcoded item list) for testing without API calls
6. API errors handled gracefully with user-friendly messages

**Estimated Complexity:** High

---

## Phase 4: Person Management

**Goal:** Let users customize person names and establish consistent visual identity for each person.

**Requirements:**
- PERS-01, PERS-02, PERS-03

**Plans:** [To be planned]

**Success Criteria:**
1. User can set custom names for Person A and Person B before or during assignment
2. Default names shown if user doesn't customize ("You" / "Partner" or similar)
3. Color coding established (e.g., blue for Person A, green for Person B)
4. Colors used consistently across swipe UI, running totals, and summary

**Estimated Complexity:** Low

---

## Phase 5: Swipe Interface Core

**Goal:** Build intuitive card-based swipe interface for assigning items to people.

**Requirements:**
- SWIP-01, SWIP-02, SWIP-03, SWIP-04, SWIP-05, SWIP-06, SWIP-07, SWIP-08, SWIP-09

**Plans:** [To be planned]

**Success Criteria:**
1. One item card displayed at a time, centered on screen
2. Swipe left gesture assigns item to Person A
3. Swipe right gesture assigns item to Person B
4. Tap center button splits item equally between both
5. Card follows finger/mouse drag with natural feel
6. Card flies off screen smoothly when swiped past threshold
7. Back button or gesture allows undoing to previous card
8. Progress indicator shows "Item X of Y"
9. Running totals for both people visible and update in real-time at bottom

**Estimated Complexity:** High

---

## Phase 6: Summary Screen

**Goal:** Show clear itemized breakdown and totals for both people with navigation options.

**Requirements:**
- SUMM-01, SUMM-02, SUMM-03, SUMM-04, SUMM-05, SUMM-06, SUMM-07

**Plans:** [To be planned]

**Success Criteria:**
1. Person A's items listed with individual prices
2. Person B's items listed with individual prices
3. Split items shown clearly (either in both lists or separate section)
4. Each person's total prominently displayed
5. Math verified correct: all assigned amounts + split amounts = receipt total
6. "Adjust" button returns user to swipe flow to change assignments
7. "Start Over" button clears session and returns to receipt capture

**Estimated Complexity:** Medium

---

## Phase 7: Mobile UX Polish

**Goal:** Optimize touch interactions, performance, and visual design for mobile-first experience.

**Requirements:**
- UX-01, UX-02, UX-03, UX-04

**Plans:** [To be planned]

**Success Criteria:**
1. App tested and working smoothly on iPhone Safari (primary target)
2. All touch targets minimum 44x44pt (thumb-friendly)
3. Full receipt split flow (capture → swipe → summary) completable in under 2 minutes
4. No login or authentication required (session-based, stateless)
5. Responsive design works well on both mobile and desktop

**Estimated Complexity:** Medium

---

## Phase 8: Testing & Launch Prep

**Goal:** Validate end-to-end flows, handle edge cases, and prepare for real-world usage.

**Requirements:**
- (Cross-cutting validation of all requirements)

**Plans:** [To be planned]

**Success Criteria:**
1. Test with real receipts from various restaurants (printed, handwritten, different formats)
2. Edge cases handled: blurry images, $0 items, tax/tip assignment, quantity items
3. Performance benchmarked: AI response < 5 seconds, UI interactions < 100ms
4. Error scenarios tested: network failures, API errors, invalid images
5. Documentation written: README with setup instructions, API key configuration
6. App shared with test users, feedback incorporated

**Estimated Complexity:** Medium

---

## Summary

| Phase | Requirements | Complexity | Dependencies |
|-------|--------------|------------|--------------|
| 1 | 1/3 | In Progress|  |
| 2 | 5 | Medium | Phase 1 |
| 3 | 5 | High | Phase 1 |
| 4 | 3 | Low | Phase 1 |
| 5 | 9 | High | Phase 2, 3, 4 |
| 6 | 7 | Medium | Phase 5 |
| 7 | 4 | Medium | Phase 5, 6 |
| 8 | 0 (validation) | Medium | All phases |

**Total:** 8 phases covering 32 v1 requirements

**Critical path:** Phase 1 → Phase 3 (AI integration) → Phase 5 (Swipe UI) → Phase 6 (Summary)

**Parallel opportunities:** Phase 2, 3, and 4 can partially overlap after Phase 1 completes.

---

*Roadmap created: 2026-03-03*
*Last updated: 2026-03-03 after Phase 1 planning*
