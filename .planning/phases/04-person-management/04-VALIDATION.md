---
phase: 4
slug: person-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 + React Testing Library 16 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/components/names/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/names/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | PERS-01, PERS-02, PERS-03 | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | PERS-03 | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | PERS-01 | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 1 | PERS-02 | unit | `npx vitest run src/components/names/NamesModal.test.tsx` | ❌ W0 | ⬜ pending |
| 4-01-05 | 01 | 2 | PERS-01, PERS-02, PERS-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/names/NamesModal.test.tsx` — stubs for PERS-01, PERS-02, PERS-03

*Existing infrastructure covers framework and config — Vitest 4 + RTL + jest-dom already installed and configured.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Names shown correctly in running totals and summary screens | PERS-02 | Requires visual inspection of cross-screen consistency | Open app, set custom names, assign items, verify names appear correctly in swipe UI, totals, and summary |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
