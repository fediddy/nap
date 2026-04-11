# NAP Citation Engine

> Internal citation management engine for automating NAP submissions across 26+ directories for local service businesses at scale.

**Created**: 2026-04-08
**Owner**: Fediddy (Solo lead gen operator)

## Folders
- [[Vision]] - Product purpose, economics, strategic goals, phased roadmap
- [[Build]] - Tech stack, architecture, deployment, Coolify setup
- [[Epics]] - Epic breakdown, story tracking, implementation status
- [[Directories]] - Directory registry, automation strategies, niche-specific lists
- [[Pipeline]] - Submission workflow, BullMQ queue, adapters, rate limiting
- [[Monitoring]] - Dashboard design, KPIs, action queue, success metrics
- [[Assets]] - Images, diagrams, diagrams, screenshots, files
- [[Handoffs]] - Session continuity notes
- [[Templates]] - Reusable note templates

## Root Files
- [[CLAUDE.md]] - Brain DNA and agent instructions
- [[Execution-Plan]] - Current build priority and next steps

## Agents
- [[builder]] - Implements features end-to-end across the monorepo stack
- [[strategist]] - Directory expansion, niche targeting, pipeline strategy
- [[debugger]] - Deployment, queue, and integration failure diagnosis

## Templates
- [[Templates]] - Reusable note structures

## Session Log
- **Session 0**: Brain initialized. Epics 1-7 planned (all marked done in sprint-status). Story 1.1-1.5 actually implemented. 2026-04-08
- **Session 1**: App shell verified — all pages + backend routes already built, build clean. Phase 1 complete. Epic 3 is next. 2026-04-08
- **Session 2**: Facebook multi-account session relay built — directory_accounts table, /api/session-relay endpoints, Facebook adapter rewritten with LRU account pool. 2026-04-11
