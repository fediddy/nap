> Part of [[BRAIN-INDEX]]

# NAP Citation Engine - Agent Instructions

## What Is This Brain?

NAP is an internal citation engine that automates business directory submissions for local service websites at scale. It's part of the AeliseIntelligence lead gen platform. The core loop: import business profiles via CSV → validate → queue submissions → automate directory submissions via API or browser automation → track status.

## Owner
- **Role**: Solo lead gen operator (Fediddy)
- **Context**: Runs hundreds of local service websites across all niches (roofing, HVAC, plumbing, electrical, etc.) — needs citations at industrial scale with near-zero marginal cost per site
- **Goals**: <2 min hands-on per site from import to submission queued; >90% submission success; 500+ sites managed; fully integrated into site launch pipeline

## Brain Structure
- [[Vision]] — Product purpose, economics, phased roadmap
- [[Build]] — Tech stack, Coolify deployment, monorepo structure
- [[Epics]] — Epic breakdown, story status, what's actually built vs planned
- [[Directories]] — 26+ directory registry, automation strategies, niche lists
- [[Pipeline]] — BullMQ queue, adapter pattern, rate limiting, retry logic
- [[Monitoring]] — Dashboard KPIs, action queue, success metrics
- [[Assets]] — Files, screenshots, diagrams
- [[Handoffs]] — Session continuity notes

## Tech Stack (Critical Context)
- **Monorepo**: Turborepo — `apps/api` (Fastify + Drizzle + BullMQ + PostgreSQL + Redis), `apps/web` (React + Vite + Tailwind v4), `packages/shared` (must build to `dist/` first)
- **Tailwind**: v4 — use `@import "tailwindcss"` NOT v3 directives; PostCSS plugin is `@tailwindcss/postcss`
- **API prefix**: All frontend fetches use `${API_BASE}` — exported from `apps/web/src/lib/api.ts`, sourced from `VITE_API_URL` env var
- **Deployment**: Coolify at `nap.fediddy.com`, `npm ci --include=dev` in Docker (Coolify injects NODE_ENV=production)
- **Drizzle migrations**: Raw SQL files need manual journal updates in `meta/_journal.json`

## Conventions
- Use [[wikilinks]] for all cross-references — only link to files that exist
- Update [[Handoffs]] at the end of every work session
- Reference [[Execution-Plan]] for current build priority
- Check [[Assets]] for diagrams and screenshots when working on UI

## Agent Personas
- [[builder]] — Feature implementation across the full stack
- [[strategist]] — Directory expansion, niche strategy, pipeline architecture decisions
- [[debugger]] — Deployment failures, queue issues, integration problems

## Commands
- /resume-braintree — Resume from last handoff
- /wrap-up-braintree — End session with proper handoff note
- /status-braintree — View current progress dashboard
