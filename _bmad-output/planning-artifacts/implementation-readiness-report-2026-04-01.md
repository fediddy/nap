---
stepsCompleted: [step-01-document-discovery, step-02-prd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review, step-06-final-assessment]
status: complete
documentsAssessed:
  - prd: _bmad-output/planning-artifacts/prd.md
  - architecture: _bmad-output/planning-artifacts/architecture.md
  - epics: _bmad-output/planning-artifacts/epics.md
  - ux: _bmad-output/planning-artifacts/ux-design-specification.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-04-01
**Project:** nap

## Document Inventory

| Document | File | Format | Issues |
|----------|------|--------|--------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | Whole file | None |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Whole file | None |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | Whole file | None |
| UX Design | `_bmad-output/planning-artifacts/ux-design-specification.md` | Whole file | None |

**Duplicates:** None  
**Missing Documents:** None  
**Sharded Documents:** None

---

## PRD Analysis

### Functional Requirements (36 total)

**Business Profile Management**
- FR1: Operator can create an individual business profile with name, address, phone number, business category, and website URL
- FR2: Operator can bulk-import business profiles via CSV file upload
- FR3: Operator can edit any field of an existing business profile
- FR4: Operator can bulk-update existing business profiles via CSV re-import with automatic matching on business name + address
- FR5: Operator can deactivate a business profile to mark it as no longer active
- FR6: Operator can search and filter business profiles by name, category, status, or location
- FR7: Operator can view a complete list of all managed business profiles

**Data Import & Validation**
- FR8: System can validate imported business data for completeness and format correctness (phone format, address format, required fields present)
- FR9: System can detect duplicate business profiles during import based on business name + address matching
- FR10: Operator can fix validation errors inline during the import preview before any submission occurs
- FR11: System can detect and display changes between re-imported data and existing profiles as a diff view

**Directory Submission**
- FR12: Operator can preview the submission plan for a batch of businesses showing which directories each will be submitted to
- FR13: Operator can approve or reject a submission plan before execution (confirmation gate)
- FR14: System can submit business profile data to integrated directory APIs (Bing Places, Facebook Business, Yelp, + 1 TBD)
- FR15: System can queue submissions with per-directory rate limiting and daily submission caps
- FR16: System can automatically retry failed submissions using a backoff strategy
- FR17: System can pause submissions to a specific directory without affecting submissions to other directories
- FR18: Operator can batch-approve submissions for multiple businesses simultaneously

**Update & Propagation**
- FR19: Operator can push profile updates to all directories where a business has active listings
- FR20: System can queue update requests to directories when business profile data changes
- FR21: Operator can override a business name for a specific directory without changing the master profile
- FR22: Operator can initiate listing removal from all directories for deactivated businesses
- FR23: System can automatically remove listings from directories that support delete/unpublish APIs
- FR24: System can flag listings requiring manual removal and provide direct links to each directory listing

**Monitoring & Dashboard**
- FR25: Operator can view a summary dashboard showing overall system status (total sites managed, fully listed count, pending actions count)
- FR26: Operator can view submission status per business per directory (success, pending, failed, requires action)
- FR27: Operator can view an action queue of items requiring manual intervention, prioritized by urgency
- FR28: Operator can view a per-business detail page showing its complete citation profile across all directories
- FR29: Operator can see last-verified timestamps for each directory listing per business
- FR30: Operator can view batch-level status for recent imports showing progress across all submissions in that batch

**Directory Registry**
- FR31: Operator can view all integrated directories and their current health status
- FR32: System can monitor directory API health and detect degradation or outages
- FR33: System can automatically pause submissions to directories experiencing issues (graceful degradation)
- FR34: Operator can add a new directory to the registry with API configuration details

**Reporting & Export**
- FR35: Operator can export all business data and directory statuses to CSV format
- FR36: Operator can view a NAP consistency check for a specific business verifying data matches across all directories

### Non-Functional Requirements (23 total)

**Performance:** NFR1 (page load <3s), NFR2 (navigation <500ms), NFR3 (CSV import 100 rows <30s), NFR4 (dashboard refresh <2s), NFR5 (action queue <1s), NFR6 (search/filter <1s for 1,000 profiles)

**Security:** NFR7 (network-level access restriction), NFR8 (encrypted DB connections), NFR9 (encrypted credentials at rest, never in logs), NFR10 (no sensitive data client-side)

**Scalability:** NFR11 (1,000 profiles without degradation), NFR12 (5,000 queue jobs), NFR13 (schema extensible without migrations), NFR14 (new integration without changing existing code)

**Reliability:** NFR15 (3x auto-retry with backoff), NFR16 (no silent failures), NFR17 (restore+resume from backup), NFR18 (jobs survive restarts), NFR19 (auto-pause after 5 consecutive failures)

**Integration:** NFR20 (directory isolation), NFR21 (per-directory rate limits), NFR22 (logging without credentials), NFR23 (configurable timeouts)

### PRD Completeness Assessment

The PRD is thorough and complete. All 36 FRs are clearly numbered, scoped, and unambiguous. All 23 NFRs have measurable thresholds. User journeys map to capability sets clearly.

**One notable discrepancy flagged for validation:**
- PRD states: "Mobile: Not required" / "basic tablet responsiveness for dashboard monitoring view only"
- Epics.md states: "Fully responsive at 375px, 768px, and 1280px viewports. All features accessible across breakpoints."
- **Source of change:** User explicitly expanded responsive scope during story creation ("make it desktop first but fully respo"). PRD was not updated to reflect this decision.

---

## Epic Coverage Validation

### Coverage Matrix

| FR | PRD Requirement (summary) | Epic | Story | Status |
|----|--------------------------|------|-------|--------|
| FR1 | Create individual business profile | Epic 1 | 1.2 | ✅ Covered |
| FR2 | Bulk CSV import | Epic 1 | 1.5 | ✅ Covered |
| FR3 | Edit any field of existing profile | Epic 1 | 1.4 | ✅ Covered |
| FR4 | Bulk-update via CSV re-import (name+address match) | Epic 2 | 2.4 | ✅ Covered |
| FR5 | Deactivate a business profile | Epic 1 | 1.4 | ✅ Covered |
| FR6 | Search and filter profiles | Epic 1 | 1.3 | ✅ Covered |
| FR7 | View complete list of all profiles | Epic 1 | 1.3 | ✅ Covered |
| FR8 | Validate imported data (format + completeness) | Epic 2 | 2.1 | ✅ Covered |
| FR9 | Detect duplicates during import | Epic 2 | 2.2 | ✅ Covered |
| FR10 | Fix validation errors inline during preview | Epic 2 | 2.3 | ✅ Covered |
| FR11 | Detect and display changes as diff view | Epic 2 | 2.4 | ✅ Covered |
| FR12 | Preview submission plan | Epic 3 | 3.7 | ✅ Covered |
| FR13 | Approve/reject submission plan (confirmation gate) | Epic 3 | 3.7 | ✅ Covered |
| FR14 | Submit to directory APIs/browser | Epic 3 | 3.4, 3.5, 3.6 | ✅ Covered |
| FR15 | Queue with rate limiting + daily caps | Epic 3 | 3.8 | ✅ Covered |
| FR16 | Auto-retry with backoff | Epic 3 | 3.8 | ✅ Covered |
| FR17 | Pause submissions to specific directory | Epic 3 (map) / Epic 4 (actual) | 4.4 | ✅ Covered ⚠️ Label mismatch |
| FR18 | Batch-approve submissions | Epic 3 | 3.7 | ✅ Covered |
| FR19 | Push updates to all active directory listings | Epic 4 | 4.1 | ✅ Covered |
| FR20 | Queue update requests on data change | Epic 4 | 4.1 | ✅ Covered |
| FR21 | Per-directory business name override | Epic 4 | 4.2 | ✅ Covered |
| FR22 | Initiate listing removal for deactivated businesses | Epic 4 | 4.3 | ✅ Covered |
| FR23 | Auto-remove listings where directory supports it | Epic 4 | 4.3 | ✅ Covered |
| FR24 | Flag manual removal with direct listing links | Epic 4 | 4.3 | ✅ Covered |
| FR25 | Summary dashboard (totals, pending actions) | Epic 5 | 5.1 | ✅ Covered |
| FR26 | Status per business per directory | Epic 5 | 5.2 | ✅ Covered |
| FR27 | Action queue prioritized by urgency | Epic 5 | 5.3 | ✅ Covered |
| FR28 | Per-business citation profile detail page | Epic 5 | 5.4 | ✅ Covered |
| FR29 | Last-verified timestamps per directory per business | Epic 5 | 5.4 | ✅ Covered |
| FR30 | Batch-level status tracking | Epic 5 | 5.5 | ✅ Covered |
| FR31 | View all directories + health status | Epic 6 | 6.1 | ✅ Covered |
| FR32 | Monitor directory health + detect degradation | Epic 6 | 6.2 | ✅ Covered |
| FR33 | Auto-pause on degradation (graceful degradation) | Epic 6 | 6.2 | ✅ Covered |
| FR34 | Add new directory to registry | Epic 6 | 6.3 | ✅ Covered |
| FR35 | Export all data to CSV | Epic 7 | 7.1 | ✅ Covered |
| FR36 | NAP consistency check per business | Epic 7 | 7.2 | ✅ Covered |

### Missing Requirements

None. All 36 FRs have traceable story coverage.

### Coverage Statistics

- Total PRD FRs: 36
- FRs covered in epics: 36
- **Coverage: 100%**

### Coverage Notes

1. **FR17 label mismatch:** The FR Coverage Map in `epics.md` assigns FR17 to "Epic 3" but the implementing story (4.4 — Pause & Resume Directory Submissions) lives in Epic 4. This is a cosmetic labeling error only — the FR is fully implemented. Recommend correcting the coverage map label from "Epic 3" to "Epic 4".

2. **FR29 + FR28 shared story:** Both FR28 (per-business detail page) and FR29 (last-verified timestamps) are implemented in Story 5.4. This is appropriate — timestamps are a column on the citation profile table shown in the detail page. No gap.

---

## UX Alignment Assessment

### UX Document Status

Found: `ux-design-specification.md`

### UX ↔ PRD Alignment

| UX Requirement | PRD Support | Status |
|----------------|-------------|--------|
| Color-coded status system (green/yellow/red) | FR25, FR26, FR27 — status visibility at all levels | ✅ Aligned |
| Progressive disclosure — summary first | PRD monitoring efficiency target (<5 min daily) | ✅ Aligned |
| Batch-aware grouping | FR30 (batch-level status tracking) | ✅ Aligned |
| Confirmation gate before submission | FR13 (approve/reject plan) | ✅ Aligned |
| Inline error fixing during import | FR10 | ✅ Aligned |
| Drag-and-drop CSV upload | FR2, FR8 | ✅ Aligned |
| Action queue with what/why/next-step | FR27 (prioritized action queue) | ✅ Aligned |
| Auto-retry transient failures invisible | FR16, NFR15 | ✅ Aligned |
| Bulk operations as first-class | FR18 (batch-approve), FR4 (bulk-update) | ✅ Aligned |
| Desktop-first (1280px+), tablet secondary | PRD specifies same | ✅ Aligned (but see warning below) |

### UX ↔ Architecture Alignment

| UX Requirement | Architecture Support | Status |
|----------------|---------------------|--------|
| React + Vite SPA | Turborepo `apps/web` — Vite + React | ✅ Aligned |
| Coolify VPS deployment | Two-VPS Coolify architecture | ✅ Aligned |
| Page-load refresh model, no WebSocket | Architecture constraint explicitly listed | ✅ Aligned |
| Tailwind CSS styling | Architecture specifies Tailwind + Shadcn/UI | ✅ Aligned |
| Skeleton loaders for loading states | Frontend concern — no architectural conflict | ✅ Aligned |
| Shared types between frontend + backend | `packages/shared` with Zod + TypeScript types | ✅ Aligned |

### Warnings

⚠️ **W1 — Responsive Scope Three-Way Inconsistency (Low Risk — Decision Made)**

| Document | Mobile Position |
|----------|----------------|
| PRD | No mobile required; tablet for monitoring only |
| UX Specification | Desktop primary (1280px+); tablet (768px+) for monitoring only |
| Epics & Stories | **Fully responsive: 375px, 768px, 1280px — all features on all viewports** |

The epics overrode both the PRD and UX based on explicit user direction. The implementation direction is clear. However, the PRD and UX documents are now stale on this point.

**Recommendation:** Update PRD's responsive design section and UX's Platform Strategy section to reflect the fully-responsive decision. Not blocking for development — dev team should follow the epics.

⚠️ **W2 — TanStack Query vs. Page-Load Refresh (Non-Issue — Upgrade)**

UX specifies "page-load refresh model" for simplicity. Stories implement TanStack Query with stale-while-revalidate caching (30-second staleTime). This is a superset of what UX specified — it delivers fresher data without WebSocket complexity. No UX intent violated; the implementation is strictly better.

---

## Epic Quality Review

### Epic Structure Validation

#### User Value Assessment

| Epic | Title Has Technical Language | Delivers User Value | Verdict |
|------|------------------------------|---------------------|---------|
| Epic 1 | "Project Foundation" in title | ✅ Operator can create/import/search/edit/deactivate profiles | ✅ Pass — "Foundation" is acceptable for greenfield Story 1.1 |
| Epic 2 | "Engine" in title | ✅ Operator can bulk-import with validation, dedup, inline fix, diff | ✅ Pass |
| Epic 3 | "Pipeline" in title | ✅ Operator can preview, approve, and submit to directories | ✅ Pass |
| Epic 4 | None | ✅ Operator can push updates, override names, remove listings | ✅ Pass |
| Epic 5 | None | ✅ Operator can monitor portfolio and clear action queue | ✅ Pass |
| Epic 6 | None | ✅ Operator can manage directory registry + health monitoring | ✅ Pass |
| Epic 7 | None | ✅ Operator can export data + run NAP consistency checks | ✅ Pass |

#### Epic Independence Assessment

| Epic | Can Stand Alone? | Dependency | Verdict |
|------|-----------------|------------|---------|
| Epic 1 | ✅ Full CRUD with no dependencies | None | ✅ Pass |
| Epic 2 | ✅ Enhanced import (Epic 1 businesses required) | Epic 1 — natural predecessor | ✅ Pass |
| Epic 3 | ✅ Can submit Epic 1 businesses | Epic 1 businesses (not Epic 2) | ✅ Pass |
| Epic 4 | ✅ Pushes updates to Epic 3 submissions | Epic 3 — natural predecessor | ✅ Pass |
| Epic 5 | ✅ Reads all data from previous epics | Epics 1-4 data as read-only source | ✅ Pass |
| Epic 6 | ✅ Directories table seeded in Story 1.1 | Epic 1 scaffold only | ✅ Pass |
| Epic 7 | ✅ Reads all data for reporting | Epics 1-6 data as read-only source | ✅ Pass |

### Story Quality Assessment

#### Starter Template Requirement

- Architecture specifies: `npx create-turbo@latest nap --example with-vite` ✅
- Story 1.1 opens with this exact command ✅
- Story 1.1 includes: dependency installation, initial configuration, health endpoint, seed script, Pino logger ✅

#### Database Creation Timing

| Table | Created In | First Used In | Verdict |
|-------|-----------|---------------|---------|
| `businesses` | Story 1.1 | Story 1.2 | ✅ Created before first use |
| `directories` | Story 1.1 | Story 1.1 (seed) | ✅ Created when needed |
| `batches` | Story 1.5 | Story 1.5 | ✅ Created by first story that uses it |
| `submissions` | Story 3.7 | Story 3.7 | ✅ Created by first story that uses it |
| `action_queue_items` | Story 3.8 | Story 3.8 | ✅ Created by first story that uses it |

No upfront table creation. All tables created incrementally. ✅

#### AC Quality Spot-Check (high-risk stories)

| Story | GWT Format | Error Conditions | Measurable | Verdict |
|-------|------------|-----------------|------------|---------|
| 1.1 (Scaffolding) | ✅ | N/A (setup) | ✅ Health endpoint, migration confirmation | ✅ Pass |
| 2.3 (Inline Fixing) | ✅ | ✅ (dual-error case covered) | ✅ Badge counts, cell states | ✅ Pass |
| 3.1 (Browser Stack) | ✅ | ✅ (fallback chain) | ✅ DRY_RUN mock result | ✅ Pass |
| 3.7 (Approval Gate) | ✅ | ✅ (cancel path) | ✅ Queue status, redirect | See issue below |
| 3.8 (Queue Infra) | ✅ | ✅ (transient/permanent tracks) | ✅ NFRs cited explicitly | ✅ Pass |
| 6.2 (Health Monitor) | ✅ | ✅ (auto-pause, manual resume) | ✅ NFR19 threshold cited | ✅ Pass |

---

### 🔴 Critical Violations

None found.

---

### 🟠 Major Issues

#### Issue M1: Story 3.7 Has Forward Dependency on Story 3.8

**Location:** Story 3.7 — Submission Plan Preview & Approval Gate

**Problem:** Story 3.7's acceptance criteria states:
> "**And** jobs are dispatched to the appropriate per-directory BullMQ queue"

However, the BullMQ queue infrastructure — the per-directory queues (`queue:bing-places`, `queue:facebook-business`, `queue:yelp`), Redis AOF persistence, worker configuration — is defined in **Story 3.8** which comes AFTER Story 3.7.

A dev agent implementing Story 3.7 cannot dispatch to queues that don't exist yet.

**Impact:** Story 3.7 cannot be fully implemented before Story 3.8 is done. This violates the rule: "Each story builds only on previous stories."

**Recommended Fix (Option A — Reorder):**
Swap stories 3.7 and 3.8: implement Queue Infrastructure first (new 3.7), then Submission Plan Preview (new 3.8). Adapters 3.4–3.6 can still precede queue setup.

**Recommended Fix (Option B — AC Split):**
Revise Story 3.7's AC to: "submission records are created in the `submissions` table with `status: 'queued'`" — and remove the queue dispatch line. Story 3.8's queue worker then picks up `status: 'queued'` records and processes them. The queue infrastructure triggers processing; Story 3.7 just marks intent. This is actually cleaner architecture.

**Preferred:** Option B — it produces better separation of concerns: Story 3.7 owns the approval/record creation, Story 3.8 owns the queue consumption.

---

### 🟡 Minor Concerns

#### Concern m1: Epic 1 Title Contains "Project Foundation"

"Project Foundation" signals technical work, not user value. The stories under this label are entirely correct — Story 1.1 is properly the greenfield setup story, and Stories 1.2–1.5 are pure user-value stories. The naming just leaves a slightly technical impression.

**Recommendation:** Rename Epic 1 to "Business Profile Management & Project Setup" or keep as-is — it's cosmetic only and does not affect implementation.

#### Concern m2: FR17 Coverage Map Label Mismatch

(Already documented in Epic Coverage Validation) — FR17 map says "Epic 3" but Story 4.4 is in Epic 4. Cosmetic only.

#### Concern m3: Story 4.4 Position in Epic 4

Story 4.4 (Pause & Resume) feels like submission pipeline behavior (Epic 3 territory) but was placed in Epic 4. The placement is defensible — pause/resume is a lifecycle management action. No functional gap. Cosmetic.

---

### Best Practices Compliance Summary

| Check | Result |
|-------|--------|
| All epics deliver user value | ✅ Pass |
| Epic independence maintained | ✅ Pass |
| Stories appropriately sized | ✅ Pass |
| Forward dependencies | ⚠️ 1 issue (Story 3.7 → 3.8) |
| Database tables created when needed | ✅ Pass |
| Given/When/Then AC format | ✅ Pass |
| FR traceability | ✅ Pass |
| Starter template in Story 1.1 | ✅ Pass |
| Greenfield setup stories present | ✅ Pass |

---

## Summary and Recommendations

### Overall Readiness Status

**✅ READY — with one required fix before Sprint Planning**

The NAP project planning artifacts are comprehensive, well-structured, and nearly implementation-ready. FR coverage is complete (36/36), epic independence is sound, the architecture aligns with the PRD and UX, and all stories have clear, testable acceptance criteria. One structural issue in Epic 3 must be corrected before a dev agent attempts Story 3.7.

---

### Issues Requiring Action Before Implementation

#### 🟠 M1 — Story 3.7 Forward Dependency on Story 3.8 (FIX REQUIRED)

**What:** Story 3.7's AC dispatches jobs to BullMQ queues that are defined in Story 3.8.

**Fix (Option B — Recommended):** Revise Story 3.7's final AC line:

Remove: `"And jobs are dispatched to the appropriate per-directory BullMQ queue"`

Replace with: `"And submission records are created with status: 'queued' — the queue worker (Story 3.8) picks these up automatically"`

This makes Story 3.7 self-contained (creates records) and Story 3.8 self-contained (processes records). Clean separation.

---

### Recommended Next Steps

1. **Fix Story 3.7** — Apply the AC revision above in `epics.md` before Sprint Planning begins
2. **Update PRD responsive design section** — Change "Mobile: Not required" to reflect fully responsive decision (375px+). Low urgency but keeps docs accurate for future reference.
3. **Update UX Platform Strategy section** — Mirror the same responsive scope update.
4. **Proceed to Sprint Planning** — `/bmad-bmm-sprint-planning` — all planning artifacts are ready once the Story 3.7 fix is applied.

---

### Issue Count Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 0 | None |
| 🟠 Major | 1 | Story 3.7 forward dependency (requires fix) |
| 🟡 Minor | 3 | FR17 map label, Epic 1 title, Story 4.4 placement |
| ⚠️ Warnings | 2 | Responsive scope doc inconsistency, TanStack vs page-load (non-issue) |

**Total issues: 6** — 1 requires action. 5 are cosmetic or already-decided.

---

**Assessment Date:** 2026-04-01
**Assessor:** Implementation Readiness Workflow (BMAD)
**Project:** nap

