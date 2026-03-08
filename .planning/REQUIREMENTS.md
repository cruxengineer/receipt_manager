# Requirements: ReceiptSplit

**Defined:** 2026-03-03
**Core Value:** Fast, frictionless receipt splitting that feels natural on mobile and produces accurate totals every time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Receipt Capture

- [x] **CAPT-01**: User can upload receipt photo from device
- [x] **CAPT-02**: User can capture receipt photo using device camera
- [x] **CAPT-03**: User can upload multiple receipt images from same meal
- [x] **CAPT-04**: User sees loading state while AI processes image
- [x] **CAPT-05**: User sees clear error with retry option if receipt is unreadable

### AI Processing

- [x] **AI-01**: App extracts items (name + price) from receipt image via AI vision API
- [ ] **AI-02**: App returns structured item list within 5 seconds
- [ ] **AI-03**: App extracts subtotal, tax, tip, and total if present on receipt
- [ ] **AI-04**: App handles ambiguous items with best-guess extraction
- [ ] **AI-05**: Mock mode available for testing without API calls

### Item Assignment (Swipe UI)

- [x] **SWIP-01**: User sees one item card at a time, centered on screen
- [x] **SWIP-02**: User can swipe left to assign item to Person A
- [x] **SWIP-03**: User can swipe right to assign item to Person B
- [x] **SWIP-04**: User can tap center button to split item equally
- [x] **SWIP-05**: Card follows finger/mouse with natural drag feel
- [x] **SWIP-06**: Card animates off screen when swiped past threshold
- [x] **SWIP-07**: User can undo/go back to previous card
- [x] **SWIP-08**: Progress indicator shows items remaining
- [x] **SWIP-09**: Running totals for both people visible at bottom throughout

### Person Management

- [x] **PERS-01**: User can set names for Person A and Person B
- [x] **PERS-02**: Color coding consistently differentiates Person A vs Person B
- [x] **PERS-03**: Default names provided if user doesn't customize

### Summary

- [x] **SUMM-01**: Summary screen shows Person A's itemized list with prices
- [x] **SUMM-02**: Summary screen shows Person B's itemized list with prices
- [x] **SUMM-03**: Summary screen shows split items clearly
- [x] **SUMM-04**: Summary screen shows each person's total amount owed
- [x] **SUMM-05**: Summary math is always correct (assigned + split = receipt total)
- [x] **SUMM-06**: User can go back and adjust assignments from summary
- [x] **SUMM-07**: User can start over with new receipt from summary

### UX & Platform

- [ ] **UX-01**: App is mobile-first and works smoothly on iPhone Safari
- [ ] **UX-02**: All touch targets are thumb-friendly (large enough)
- [ ] **UX-03**: Full receipt split completable in under 2 minutes
- [ ] **UX-04**: No login required (stateless, session-based)

### Deployment

- [x] **DEPL-01**: App hosted as static web app (no server required)
- [x] **DEPL-02**: App accessible via URL on any device
- [x] **DEPL-03**: App is PWA-friendly (can be saved to iPhone home screen)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multi-receipt & Advanced

- **MULT-01**: Support for 3+ people splitting
- **MULT-02**: Custom split percentages (not just equal split)
- **MULT-03**: Persistent session history/saved receipts

### Payments

- **PAY-01**: Venmo/payment app integration
- **PAY-02**: Send payment request directly from summary

### International

- **INTL-01**: Currency conversion support
- **INTL-02**: Multi-language support

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts or saved history | Stateless for v1 simplicity, no backend needed |
| More than two people splitting | Keeps UX and data model simple for initial release |
| Currency conversion | Single currency sufficient for v1 |
| Payment app integration | Just show amounts owed, manual payment for v1 |
| Itemized tax per item | Tax as separate line item if present |
| Native mobile app | PWA-friendly web app meets the need |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPT-01 | Phase 2 | Complete |
| CAPT-02 | Phase 2 | Complete |
| CAPT-03 | Phase 2 | Complete |
| CAPT-04 | Phase 2 | Complete |
| CAPT-05 | Phase 2 | Complete |
| AI-01 | Phase 3 | Complete |
| AI-02 | Phase 3 | Pending |
| AI-03 | Phase 3 | Pending |
| AI-04 | Phase 3 | Pending |
| AI-05 | Phase 3 | Pending |
| SWIP-01 | Phase 5 | Complete |
| SWIP-02 | Phase 5 | Complete |
| SWIP-03 | Phase 5 | Complete |
| SWIP-04 | Phase 5 | Complete |
| SWIP-05 | Phase 5 | Complete |
| SWIP-06 | Phase 5 | Complete |
| SWIP-07 | Phase 5 | Complete |
| SWIP-08 | Phase 5 | Complete |
| SWIP-09 | Phase 5 | Complete |
| PERS-01 | Phase 4 | Complete |
| PERS-02 | Phase 4 | Complete |
| PERS-03 | Phase 4 | Complete |
| SUMM-01 | Phase 6 | Complete |
| SUMM-02 | Phase 6 | Complete |
| SUMM-03 | Phase 6 | Complete |
| SUMM-04 | Phase 6 | Complete |
| SUMM-05 | Phase 6 | Complete |
| SUMM-06 | Phase 6 | Complete |
| SUMM-07 | Phase 6 | Complete |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-04 | Phase 7 | Pending |
| DEPL-01 | Phase 1 | Complete |
| DEPL-02 | Phase 1 | Complete |
| DEPL-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after initial definition*
