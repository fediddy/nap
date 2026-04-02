---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: [product-brief-nap-2026-02-15.md, prd.md]
---

# UX Design Specification nap

**Author:** Fediddy
**Date:** 2026-02-16

---

## Executive Summary

### Project Vision

NAP is an internal citation management dashboard for a solo lead generation operator, built as a module within AeliseIntelligence. The UX must serve two distinct usage modes — concentrated batch import sessions (weekly) and quick daily monitoring scans — through a desktop-first SPA that makes status across hundreds of businesses instantly comprehensible.

### Target Users

Solo operator (Fediddy), intermediate technical skill, managing 10-1,000+ lead gen business profiles across all service niches. Two usage modes: "Batch Launcher" (weekly high-volume import/review/submit) and "Monitor" (daily 5-minute dashboard scan + exception handling). Desktop-primary, with basic tablet responsiveness for monitoring only.

### Key Design Challenges

1. **Information density at scale** — 1,500-4,000+ status data points must be scannable in < 5 minutes daily
2. **Dual-mode interface** — Batch import workflow (deliberate, multi-step) and monitoring workflow (quick-scan, action-driven) must coexist without friction
3. **CSV import wizard** — Multi-step flow (upload → validate → fix → preview → approve) must feel fast AND safe
4. **Action queue clarity** — Failures must surface with immediate context: what, why, and next action

### Design Opportunities

1. **Progressive disclosure** — Summary-first with drill-down; aggregate counts and alerts at top level, detail on demand
2. **Color-coded status system** — Green/yellow/red visual language for instant health comprehension at a glance
3. **Batch-aware grouping** — Track imports as cohesive batches, not scattered individual items

## Core User Experience

### Defining Experience

NAP's core experience is an **operations control center** with two interaction modes:

- **Batch Mode (weekly):** Import → validate → review → approve → submit. High-volume, deliberate, multi-step workflow where accuracy and speed both matter. This is where value is created.
- **Monitor Mode (daily):** Open dashboard → scan summary → handle exceptions → close. Quick-scan, exception-driven workflow where instant comprehension matters most. This is where trust is maintained.

The defining interaction is the **daily dashboard scan** — the most frequent touchpoint that determines whether the operator trusts the system enough to keep scaling.

### Platform Strategy

- **Platform:** Desktop-first SPA (React + Vite), served via Coolify on VPS
- **Input:** Mouse/keyboard — no touch optimization needed
- **Primary viewport:** 1280px+ desktop
- **Secondary:** Tablet (768px+) for monitoring view only
- **Offline:** Not required — always-connected workstation tool
- **Refresh model:** Page-load refresh, no real-time WebSocket for MVP

### Effortless Interactions

| Interaction | Effortless Target |
|-------------|-------------------|
| CSV import | Drag-and-drop with instant validation, inline error fixing |
| Daily monitoring | Glance at summary bar → see health → close tab (90 seconds on a good day) |
| Batch approval | Review once, approve all — not per-business clicking |
| Error handling | Transient failures retry automatically; operator never sees them |
| Update propagation | Change data once, system pushes to all directories |
| Background processing | Queue, retries, rate limits, health monitoring — all invisible |

### Critical Success Moments

1. **The First Green Wall** — First batch completes, dashboard shows wall of green. NAP earns trust.
2. **The 90-Second Morning** — Dashboard scan, no red, close tab. NAP earns daily usage.
3. **The Phone Number Fix** — Bulk update propagates to all directories. NAP proves lifecycle management.
4. **The Clean Shutdown** — Deactivated sites cleaned up across directories. NAP proves full CRUD.

### Experience Principles

1. **Summary first, detail on demand** — Every view answers "is everything okay?" before showing data
2. **Batch is the default** — Bulk operations are first-class; single-business is the exception
3. **The system works while you don't** — Background automation handles everything it can; operator intervenes only when asked
4. **Red means act, green means forget** — Color is the primary communication layer
5. **Safe by design** — No data reaches a directory without explicit preview and approval

## Desired Emotional Response

### Primary Emotional Goals

**In control and confident.** Every interaction should reinforce that Fediddy knows exactly what's happening across his entire citation portfolio. The system surfaces what matters, handles what it can, and clearly asks for help when it can't.

**Powerful through automation.** Tasks that used to be impossible (or required hiring people on Legiit) now happen with a few clicks. The emotional shift from "I can't do this at scale" to "the system handles this for me" is the core value proposition felt as emotion.

### Emotional Journey Mapping

| Stage | Target Emotion | Design Driver |
|-------|---------------|---------------|
| First use (onboarding) | **Relief + excitement** | First batch succeeds, wall of green checkmarks |
| Batch import | **Efficient + safe** | Fast workflow with mandatory safety gate before submission |
| Daily monitoring | **Calm + informed** | Summary-first dashboard, instant health comprehension |
| Error/failure | **Clear-headed, not panicked** | System explains what, why, and next action — no guesswork |
| Update propagation | **Powerful** | One change cascades everywhere automatically |
| Deactivation/cleanup | **Responsible** | Clean lifecycle — no abandoned data polluting the web |
| Returning daily | **Trust** | System kept working while you were away; status is accurate |

### Micro-Emotions

| Spectrum | Target | Avoid |
|----------|--------|-------|
| **Confidence ↔ Confusion** | Confidence — every status is unambiguous | Confusion — unclear what a status means or what to do |
| **Trust ↔ Skepticism** | Trust — submitted data matches what was approved | Skepticism — "did it actually submit?" |
| **Accomplishment ↔ Frustration** | Accomplishment — batch completes, numbers climb | Frustration — repetitive manual steps or unclear errors |
| **Calm ↔ Anxiety** | Calm — system handles failures gracefully | Anxiety — fear of bad data propagation |

### Design Implications

| Emotional Goal | UX Design Approach |
|----------------|-------------------|
| **Control** | Status visible at every level (summary → batch → business → directory). No hidden states. |
| **Confidence** | Confirmation gate with full preview before any submission. Data diff on updates. |
| **Calm during failures** | Action queue items show: what failed, why, and explicit next step. Auto-retry handles transient issues invisibly. |
| **Power** | Bulk operations everywhere — bulk import, bulk approve, bulk update, bulk deactivate. Single-item is the exception. |
| **Trust** | Transparent job queue — you can see what's processing, what's pending, what's done. No black boxes. |
| **No anxiety** | Color system (green/yellow/red) replaces ambiguity. You never wonder "is this good or bad?" |

### Emotional Design Principles

1. **Transparency builds trust** — Show the system's work: queue status, retry counts, health checks. Never hide what's happening.
2. **Safety prevents anxiety** — The confirmation gate is the emotional safety net. Preview everything before it goes out. Errors caught before submission feel like the system protecting you.
3. **Automation creates power** — Every manual task the system absorbs is a moment of "I can't believe it does that for me."
4. **Clarity prevents overwhelm** — When something goes wrong, the answer to "what do I do?" is always one click away. No investigation required.
5. **Progress creates accomplishment** — Watching submission counts climb, green checkmarks fill in, and batch progress track forward — these are small dopamine hits that reinforce daily usage.
