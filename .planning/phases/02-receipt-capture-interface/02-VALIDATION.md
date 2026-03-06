---
phase: 2
slug: receipt-capture-interface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library (Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates this |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | CAPT-01,02,03,04,05 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | CAPT-01,02 | unit | `npx vitest run src/hooks/useReceiptFiles.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | CAPT-03 | unit | `npx vitest run src/hooks/useReceiptFiles.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | CAPT-04 | unit | `npx vitest run src/components/capture/CaptureScreen.test.tsx` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | CAPT-05 | unit | `npx vitest run src/components/capture/CaptureScreen.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom` — install test framework
- [ ] `vitest.config.ts` — configure jsdom environment and setup file
- [ ] `src/test/setup.ts` — `@testing-library/jest-dom` matchers
- [ ] `src/hooks/useReceiptFiles.test.ts` — stubs for CAPT-01, CAPT-03
- [ ] `src/components/capture/CaptureScreen.test.tsx` — stubs for CAPT-02, CAPT-04, CAPT-05

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iOS action sheet shows camera + photo library options | CAPT-02 | Requires physical iPhone Safari | Open app on iPhone, tap "Add Receipt Photo", verify action sheet shows "Take Photo" and "Photo Library" |
| Camera file picker returns image on mobile | CAPT-01,02 | Requires device camera | Take photo on iPhone Safari, verify thumbnail appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
