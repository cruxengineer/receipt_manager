# ReceiptSplit

## What This Is

A mobile-first web app for two people to split restaurant receipts using AI-powered receipt scanning and an intuitive swipe interface. Users upload a receipt photo, AI extracts the items, and they swipe through cards to assign each item to Person A, Person B, or split it equally. No login, no backend—just a shareable URL that works smoothly on any device.

## Core Value

Fast, frictionless receipt splitting that feels natural on mobile and produces accurate totals every time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can upload or capture receipt photo via camera
- [ ] AI vision API extracts line items with names and prices from receipt image
- [ ] User sees extracted items as swipeable cards (one at a time)
- [ ] Swipe left assigns item to Person A, swipe right to Person B, tap center to split equally
- [ ] Running totals for each person visible throughout the swipe flow
- [ ] Summary screen shows itemized breakdown and totals for both people
- [ ] Works smoothly on iPhone Safari with natural touch gestures
- [ ] Static web app (no server required, client-side only)
- [ ] Mock mode for testing without real receipt upload
- [ ] Can complete full receipt split in under 2 minutes

### Out of Scope

- More than two people splitting — defer to future version
- User accounts or saved history — stateless, single-session only
- Currency conversion — single currency per receipt
- Payment app integration (Venmo, etc.) — just shows amounts owed
- Itemized tax per item — tax shown as separate line if present
- Native mobile app — PWA-friendly web app sufficient for v1

## Context

**Motivation:** Personal need (split bills with friends frequently), learning opportunity (explore AI vision APIs and mobile-first web patterns), and portfolio piece.

**Target users:** Anyone splitting restaurant bills with one other person. Should be shareable via URL and immediately usable without explanation.

**Key interaction:** The swipe gesture is central to the UX. It should feel responsive and natural, though doesn't need to be Tinder-level polish—focus on reliability over fancy animations.

**AI dependency:** Receipt OCR is the critical path. AI must reliably extract items and prices from various receipt formats (different restaurants, lighting conditions, handwriting vs printed).

## Constraints

- **Deployment**: Static hosting (no backend) — keeps costs zero and deployment simple
- **Timeline**: Moderate urgency — want to use it soon, but not at the expense of quality
- **Mobile-first**: Must work perfectly on iPhone Safari — this is the primary use case
- **Session-based**: No persistence required — each session is independent
- **API costs**: Vision API calls should be optimized (single call per receipt, proper error handling)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side only architecture | No backend needed for v1, simplifies deployment and keeps costs at zero | — Pending |
| Two-person limit for v1 | Simplifies UX and data model, can expand later if needed | — Pending |
| Swipe interface for assignment | Natural mobile gesture, faster than tapping buttons for each item | — Pending |
| AI vision API (TBD) | Need to evaluate options for cost, accuracy, and speed | — Pending |

---
*Last updated: 2026-03-03 after initialization*
