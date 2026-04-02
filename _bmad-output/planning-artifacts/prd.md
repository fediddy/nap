---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain-skipped, step-06-innovation-skipped, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments: [product-brief-nap-2026-02-15.md]
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
  projectContext: 0
classification:
  projectType: web_app
  domain: general
  complexity: low-medium
  projectContext: greenfield
---

# Product Requirements Document - nap

**Author:** Fediddy
**Date:** 2026-02-15

## Executive Summary

NAP (Name, Address, Phone) is an internal citation management engine for Fediddy's lead generation business, built as a module within the AeliseIntelligence platform. It automates the submission of business profiles to major online directories (Bing Places, Facebook Business, Yelp) at scale — replacing manual citation work that currently doesn't happen due to cost and time constraints.

**Problem:** Lead gen websites need directory citations for local SEO authority and Google Business Profile (GBP) verification readiness. Commercial citation services cost $150K–$900K/year at target scale (500+ sites). Manual submission is prohibitively time-consuming.

**Solution:** A queue-based citation engine that bulk-imports business profiles via CSV, validates data, submits to directory APIs with rate limiting, and provides a monitoring dashboard — with full lifecycle management (create, update, remove listings).

**Target User:** Solo operator (Fediddy) managing ~10 sites today, scaling to hundreds per month across all service niches.

**Key Differentiator:** Built for internal scale economics — batch operations, queue-based automation, and bidirectional data management that commercial tools don't offer at < $5K/year total cost.

**Technical Approach:** React + Vite SPA frontend, Node.js backend with BullMQ job queue, PostgreSQL database. Two-VPS Coolify deployment (App VPS + Database VPS).

## Success Criteria

### User Success

- **Core success moment:** Import 10 businesses via CSV, hit submit, and see them successfully listed across all integrated directories within 48 hours
- **Operational efficiency:** < 2 minutes hands-on time per site from import to submission queued
- **Batch capability:** Process 50+ sites in a single import session
- **Monitoring efficiency:** Daily dashboard check completes in < 5 minutes
- **Submission reliability:** > 90% success rate across all Tier 1 directories
- **Action clarity:** When submissions fail, the reason and next action are immediately obvious

### Business Success

- **3-month:** Tier 1 MVP operational, 50+ sites with citation profiles, infrastructure cost < $200/month
- **6-month:** 200+ sites managed, measurable before/after data on citation impact, Tier 2 go/no-go decision made
- **12-month:** 500+ sites managed, cost per site < $0.50, citations fully integrated into site launch pipeline
- **Economic validation:** Total annual cost (infrastructure + maintenance time) stays under $5,000 — vs $150,000+ for commercial tools at equivalent scale

### Technical Success

- **API reliability:** Directory API integrations maintain > 95% uptime measured weekly
- **Queue resilience:** Failed jobs retry automatically without manual intervention; no silent failures
- **Data integrity:** Business profiles remain consistent — what's in the database matches what's submitted to directories; no data drift
- **Recovery:** If the system goes down, it can be restored and resume queued jobs without re-importing data
- **Performance:** CSV import of 100 businesses completes processing (validation + queue) in < 30 seconds

### Measurable Outcomes

| Metric | MVP Target | Method |
|--------|-----------|--------|
| Sites with complete citation profiles | 10 (launch gate) → 50 (60-day) | Dashboard count |
| Submission success rate | > 90% | Successful / attempted per directory |
| Hands-on time per site | < 2 minutes | Timed during batch operations |
| Daily monitoring time | < 5 minutes | Self-reported |
| Infrastructure cost | < $200/month | Monthly cloud billing |
| Directory integrations live | 3+ (Bing, Facebook, Yelp) | Integration health check |

## Product Scope

### MVP - Minimum Viable Product

1. **Business Profile Manager** — CSV bulk import with data validation (phone, address, duplicate detection), individual add/edit, full CRUD
2. **Directory Submission Engine** — API integrations for Bing Places, Facebook Business, Yelp + 1 TBD; queue-based with rate limiting, daily caps, retry logic
3. **Review & Submit Workflow** — Preview submission plan per business, confirmation gate, batch approve
4. **Status Dashboard** — Real-time status per business × directory, action queue for failures, batch view, summary stats
5. **Directory Registry** — Extensible database of supported directories with health monitoring

**MVP is DONE when:** 10 sites successfully submit to all integrated directories and appear as verified/listed.

### Growth & Vision

See **Project Scoping & Phased Development** for detailed phase timelines, risk mitigation, and the complete post-MVP roadmap. High-level:

- **Phase 2 (Growth):** New directory backfill, Google Search Console integration, AI-generated descriptions, browser automation for non-API directories
- **Phase 3 (Automation):** Aggregator partnerships, proxy rotation, niche-specific directory intelligence
- **Phase 4 (Platform):** Full pipeline integration, GBP management module, predictive analytics

## User Journeys

### Journey 1: "The First Batch Launch" (Onboarding + Core Happy Path)

**Fediddy — Monday morning, Week 1 with NAP**

Fediddy has just built 15 new lead gen sites over the weekend — plumbers in Oakland, electricians in Fremont, HVAC in San Jose. He's been doing this for months but never had a way to get them listed on directories. Until now.

He opens the NAP dashboard, clicks "Import," and drags in his CSV — 15 rows of business names, addresses, phone numbers, categories, and website URLs. The system runs validation instantly: 14 pass clean, 1 flags a phone number that's missing a digit. Fediddy fixes it right there in the preview screen.

He hits "Review Plan." The system shows him exactly what will happen: each business will be submitted to Bing Places, Facebook Business, and Yelp. He scans the data one more time — business names look right, addresses match, categories are correct. He clicks "Approve & Submit."

The dashboard shows 15 businesses × 3 directories = 45 submissions queued. Status: "Processing." Fediddy closes the tab and goes back to building more sites.

**48 hours later:** He checks the dashboard. 42 of 45 submissions show green — successfully submitted. 3 show yellow — "Awaiting email verification" on Yelp. He clicks into the action queue, sees the 3 Yelp confirmations need him to click a link in his email. He does it in 2 minutes. All green.

**Feeling:** Relief. For the first time, his lead gen sites have directory presence. It took less than 10 minutes of his time for 15 sites. He's already thinking about the next batch.

**Capabilities revealed:** CSV import, data validation with inline editing, submission plan preview, batch approval, queued submission, status dashboard, action queue with clear next steps.

### Journey 2: "The Monday Morning Monitor" (Daily Operations + Error Recovery)

**Fediddy — 3 weeks in, 80 sites managed**

It's 8:15 AM. Fediddy grabs his coffee and opens the NAP dashboard — his daily 5-minute check. The summary bar at the top shows: **78 sites fully listed, 2 with pending actions.**

He clicks into the action queue. Two items:
1. **Bing Places API returned 429 (rate limited)** for a submission yesterday — system auto-scheduled retry for tonight. No action needed.
2. **Facebook rejected a submission** — "Business name doesn't match page name." Fediddy clicks in, sees the issue: the CSV had "Mike's Plumbing LLC" but Facebook wants "Mike's Plumbing." He edits the business name for that directory only, clicks re-submit.

He glances at the batch view for last week's import — all 25 sites show green across all directories. Done. He closes the dashboard. Total time: 3 minutes.

**But then Thursday hits.** He opens the dashboard and sees red: Yelp integration health is flagged as "Degraded." Last 10 Yelp submissions all failed with the same error. The directory health monitor caught it — Yelp changed something on their end. The system automatically paused Yelp submissions to prevent wasted attempts. Fediddy sees the alert, knows he can't fix the Yelp integration himself right now, but all other directories are still running fine. He flags it for investigation later.

**Feeling:** In control. The dashboard tells him what needs attention without him having to dig. The auto-retry handles transient failures. The health monitor catches systemic issues before they waste submissions.

**Capabilities revealed:** Summary dashboard, action queue with prioritization, auto-retry for transient errors, per-directory name overrides, directory health monitoring, graceful degradation when a directory is down.

### Journey 3: "The Phone Number Change" (Update & Re-submit)

**Fediddy — Month 2, 150 sites managed**

Fediddy gets a new batch of phone numbers from his VoIP provider. 12 of his existing lead gen sites need updated phone numbers. This is the nightmare scenario with manual citations — you'd have to log into every directory for every site and update each one individually. At 12 sites × 3 directories = 36 manual updates.

In NAP, Fediddy opens the Business Profile Manager, searches for the 12 businesses, and bulk-updates their phone numbers via a quick CSV re-import (same business names, new phone numbers — the system matches on business name + address and detects the change).

The system shows a diff: "12 businesses have updated phone numbers. These businesses are listed on the following directories:" and shows the full matrix — which directories each business is currently listed on.

Fediddy clicks "Push Updates." The system queues re-submission requests to every directory where each business has an active listing. 36 update jobs queued.

**72 hours later:** 33 of 36 updates confirmed. 3 directories required re-verification. Fediddy handles them through the action queue. NAP consistency across the web is restored.

**Feeling:** Powerful. What would have been a full day of tedious manual work took 5 minutes. And he KNOWS every directory got updated — no stragglers with old phone numbers confusing Google.

**Capabilities revealed:** Bulk profile updates via CSV re-import, change detection (diff), update propagation to all active listings, re-submission queue for updates, consistency tracking across directories.

### Journey 4: "The New Directory Expansion" (Adding a Directory + Backfill)

**Fediddy — Month 3, 200 sites managed, Tier 1 validated**

The 60-day validation is done. Tier 1 is working great. Fediddy decides to add a new directory — he finally remembered which one it was (the big service business directory). He wants all 200 existing sites submitted to it.

He opens the Directory Registry, clicks "Add Directory," and fills in the details: directory name, API endpoint, authentication method, rate limits, category mapping. NAP saves it as a new registry entry.

Now the power move: Fediddy clicks "Backfill All." The system shows him: "200 businesses will be submitted to [New Directory]. Estimated completion: 20-40 days (at 5-10 submissions per day rate limit)." He approves.

The submissions trickle out over the next month, rate-limited and staggered. Fediddy doesn't think about it — the queue handles everything. He just sees the numbers climb on the dashboard: 50 submitted... 100... 150... 200. Done.

**Feeling:** Scale. A single click queued 200 submissions. The system respects rate limits so nothing gets flagged. Adding a new directory to the operation is trivial.

**Capabilities revealed:** Directory registry management, new directory onboarding, bulk backfill of existing businesses to new directory, rate-limited long-running queue, progress tracking over extended periods.

### Journey 5: "The Cleanup" (Deactivation + Listing Removal)

**Fediddy — Month 4**

10 lead gen sites didn't work out — the niches were too competitive, no leads coming in. Fediddy wants to shut them down and clean up their directory listings so stale data doesn't pollute the web.

He selects the 10 businesses in the Profile Manager, clicks "Deactivate." The system asks: "Remove listings from all directories? This will attempt to delete or unpublish listings where the directory API supports it." Fediddy confirms.

The system queues removal requests. For directories with delete APIs — done automatically. For directories without — the system flags them in the action queue as "Manual removal recommended" with direct links to each listing.

**Capabilities revealed:** Business deactivation, automated listing removal where supported, manual removal guidance with direct links, clean data lifecycle.

### Journey 6: "The Audit" (Citation Check for a Specific Site)

**Fediddy** wants to check on one specific site — his best-performing plumber in Oakland — before attempting GBP verification. He searches for it in the dashboard and opens its detail view.

He sees a complete citation profile: listed on Bing Places (verified), Facebook (active), Yelp (active). NAP data is consistent across all three — same name, address, phone, category. Last verified: 2 days ago.

He's confident the NAP footprint is solid. Time to go claim the GBP.

**Capabilities revealed:** Per-business detail view, citation profile summary, consistency verification, last-verified timestamps.

### Journey 7: "The Export" (Reporting + Data Export)

**Fediddy** needs to pull data for his own records — a spreadsheet of all businesses and their directory statuses. He clicks "Export" on the dashboard, selects format (CSV), and downloads a complete report: business name, address, phone, category, and status per directory.

**Capabilities revealed:** Data export to CSV, comprehensive reporting across all businesses and directories.

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---------|--------------------------|
| First Batch Launch | CSV import, validation, preview, batch approve, queued submission, status tracking |
| Monday Monitor | Summary dashboard, action queue, auto-retry, directory health monitoring |
| Phone Number Change | Bulk profile updates, change detection, update propagation, consistency tracking |
| New Directory Expansion | Directory registry management, backfill, rate-limited long-running queues |
| The Cleanup | Business deactivation, automated + manual listing removal |
| The Audit | Per-business detail view, citation profile, consistency check |
| The Export | CSV export, comprehensive reporting |

*Note: Journeys 3 and 5 confirmed that bidirectional data management (create, update, remove) is MVP-essential. This is reflected in the Functional Requirements (FR19-FR24) and MVP Must-Have Capabilities (#6, #7).*

## Web App Specific Requirements

### Project-Type Overview

NAP is a **Single-Page Application (SPA)** dashboard deployed via Coolify on a VPS, serving as an internal operations tool for lead generation citation management. The frontend communicates with a backend API that manages business profiles, directory submissions, and job queues.

### Technical Architecture Considerations

**Application Type:** SPA (Single-Page Application)
**Frontend Framework:** React (aligns with AeliseIntelligence's existing Vite + React stack)
**Deployment:** Coolify-managed on dedicated VPS
**Data Refresh:** Page-load refresh model — no real-time WebSocket connections needed for MVP
**API Pattern:** REST API backend serving the SPA frontend

### Browser Support

| Browser | Support Level |
|---------|--------------|
| Chrome | Full support (primary) |
| Firefox | Full support |
| Safari | Full support |
| Edge | Full support |

No IE11 support required. Modern browser features (ES2020+, Fetch API, CSS Grid/Flexbox) can be used freely.

### Responsive Design

**Primary target:** Desktop browser (1280px+ viewport)
**Secondary:** Tablet (768px+) for occasional monitoring
**Mobile:** Not required — batch operations and CSV imports are desktop activities
**Approach:** Desktop-first design, basic tablet responsiveness for dashboard monitoring view only

### Performance Targets

See **NFR1–NFR6** in Non-Functional Requirements for authoritative performance thresholds. Key targets: page load < 3s, SPA navigation < 500ms, CSV import (100 rows) < 30s, dashboard refresh < 2s.

### SEO Strategy

N/A — Internal tool, not indexed by search engines. Robots.txt set to disallow all.

### Accessibility

Baseline accessibility only — semantic HTML, keyboard navigation for core workflows, sufficient color contrast. No WCAG compliance target required for solo internal tool.

### Implementation Considerations

- **Two-VPS architecture:**
  - **VPS 1 (App):** Coolify-managed — NAP SPA frontend, Node.js backend API, Redis + BullMQ job queue
  - **VPS 2 (Database):** Coolify-managed — PostgreSQL instance, isolated for reliability and independent backups
- **Inter-VPS networking:** Secure connection between app and database VPS via private network or firewall-restricted public IP (PostgreSQL port open only to App VPS IP)
- **Coolify MCP integration:** Programmatic setup, deployment management, and database provisioning via Coolify MCP
- **SPA frontend:** React + Vite, served as static build from backend or separate Coolify service
- **No CDN needed** — single user, single location
- **No authentication for MVP** — internal tool, access restricted at network level
- **Backup strategy:** Coolify-managed PostgreSQL backups on VPS 2 + automated dumps to external storage
- **Deployment workflow:** Git push → Coolify auto-deploys → zero-downtime updates

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — the minimum feature set that solves the core operational problem (citation submission at scale) while maintaining data integrity (ability to fix mistakes and clean up dead sites).

**Resource Requirements:** Solo developer (Fediddy), leveraging existing React/Node.js expertise and AeliseIntelligence patterns. Coolify simplifies deployment and infrastructure management.

**Key Principle:** If broken data can be submitted, broken data must be fixable. CRUD applies to both the local database AND the remote directory listings.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
1. Journey 1 — First Batch Launch (import → validate → review → submit)
2. Journey 2 — Monday Morning Monitor (dashboard → action queue → resolve)
3. Journey 3 — Phone Number Change (update profile → push to all directories)
4. Journey 5 — The Cleanup (deactivate → remove listings)
5. Journey 6 — The Audit (per-business citation profile view)
6. Journey 7 — The Export (CSV data export)

**Deferred to Phase 2:**
- Journey 4 — New Directory Expansion (backfill existing businesses to new directory)

**Must-Have Capabilities:**

| # | Capability | Justification |
|---|-----------|---------------|
| 1 | CSV bulk import with data validation | Core workflow — cannot operate without it |
| 2 | Submission plan preview + confirmation gate | Prevents bad data propagation — critical safety net |
| 3 | Directory API integrations (Bing, Facebook, Yelp + 1 TBD) | Core value — automated submission |
| 4 | Queue-based submission with rate limiting + retry | Scale and reliability — prevents bans |
| 5 | Status dashboard with action queue | Monitoring — need to know what succeeded/failed |
| 6 | Business profile update + change propagation to directories | Data integrity — must fix broken submissions |
| 7 | Business deactivation + listing removal | Data hygiene — must clean up dead sites |
| 8 | Per-business citation profile detail view | Audit — need to verify before GBP attempts |
| 9 | CSV data export | Reporting and record-keeping |
| 10 | Directory registry with health monitoring | Extensibility + operational awareness |

### Post-MVP Features

**Phase 2 — Growth (Month 3-6):**
- New directory backfill (Journey 4 — add directory, submit all existing businesses)
- Google Search Console integration for outcome tracking
- AI-generated unique business descriptions per directory
- NAP consistency auditing across web
- Directory authority scoring

**Phase 3 — Automation Expansion (Month 6-9):**
- Browser automation (Tier 2) for directories without APIs
- Proxy rotation + anti-detection infrastructure
- Aggregator partnerships (Tier 2b) for cascade distribution
- Niche-specific directory intelligence (Tier 3)

**Phase 4 — Platform Integration (Month 9-12):**
- Full pipeline: site creation → citation submission → monitoring
- GBP management as separate AeliseIntelligence module
- Review request automation
- API endpoint for external tool integration

### Risk Mitigation Strategy

**Technical Risks:**
- *Directory APIs change or break* → Directory health monitoring detects failures automatically; graceful degradation pauses submissions to broken directories without affecting others
- *Rate limiting / IP bans* → Per-directory daily caps, staggered scheduling, retry with exponential backoff
- *Bad data propagation* → Mandatory validation + preview gate before submission; update propagation to fix mistakes

**Market Risks:**
- *Citations don't impact local SEO as expected* → 60-day validation gate measures actual impact before expanding scope; MVP cost is low enough that even partial value justifies the build
- *Directories block automated submissions* → API-first approach uses officially supported submission methods; browser automation deferred to Phase 3

**Resource Risks:**
- *Solo developer bandwidth* → MVP scoped to 10 must-have capabilities; Coolify reduces DevOps overhead; React/Node.js leverages existing skills
- *Maintenance burden grows* → Directory registry tracks each integration as independent item; health monitoring alerts before issues cascade

## Functional Requirements

### Business Profile Management

- **FR1:** Operator can create an individual business profile with name, address, phone number, business category, and website URL
- **FR2:** Operator can bulk-import business profiles via CSV file upload
- **FR3:** Operator can edit any field of an existing business profile
- **FR4:** Operator can bulk-update existing business profiles via CSV re-import with automatic matching on business name + address
- **FR5:** Operator can deactivate a business profile to mark it as no longer active
- **FR6:** Operator can search and filter business profiles by name, category, status, or location
- **FR7:** Operator can view a complete list of all managed business profiles

### Data Import & Validation

- **FR8:** System can validate imported business data for completeness and format correctness (phone format, address format, required fields present)
- **FR9:** System can detect duplicate business profiles during import based on business name + address matching
- **FR10:** Operator can fix validation errors inline during the import preview before any submission occurs
- **FR11:** System can detect and display changes between re-imported data and existing profiles as a diff view

### Directory Submission

- **FR12:** Operator can preview the submission plan for a batch of businesses showing which directories each will be submitted to
- **FR13:** Operator can approve or reject a submission plan before execution (confirmation gate)
- **FR14:** System can submit business profile data to integrated directory APIs (Bing Places, Facebook Business, Yelp, + 1 TBD)
- **FR15:** System can queue submissions with per-directory rate limiting and daily submission caps
- **FR16:** System can automatically retry failed submissions using a backoff strategy
- **FR17:** System can pause submissions to a specific directory without affecting submissions to other directories
- **FR18:** Operator can batch-approve submissions for multiple businesses simultaneously

### Update & Propagation

- **FR19:** Operator can push profile updates to all directories where a business has active listings
- **FR20:** System can queue update requests to directories when business profile data changes
- **FR21:** Operator can override a business name for a specific directory without changing the master profile
- **FR22:** Operator can initiate listing removal from all directories for deactivated businesses
- **FR23:** System can automatically remove listings from directories that support delete/unpublish APIs
- **FR24:** System can flag listings requiring manual removal and provide direct links to each directory listing

### Monitoring & Dashboard

- **FR25:** Operator can view a summary dashboard showing overall system status (total sites managed, fully listed count, pending actions count)
- **FR26:** Operator can view submission status per business per directory (success, pending, failed, requires action)
- **FR27:** Operator can view an action queue of items requiring manual intervention, prioritized by urgency
- **FR28:** Operator can view a per-business detail page showing its complete citation profile across all directories
- **FR29:** Operator can see last-verified timestamps for each directory listing per business
- **FR30:** Operator can view batch-level status for recent imports showing progress across all submissions in that batch

### Directory Registry

- **FR31:** Operator can view all integrated directories and their current health status
- **FR32:** System can monitor directory API health and detect degradation or outages
- **FR33:** System can automatically pause submissions to directories experiencing issues (graceful degradation)
- **FR34:** Operator can add a new directory to the registry with API configuration details

### Reporting & Export

- **FR35:** Operator can export all business data and directory statuses to CSV format
- **FR36:** Operator can view a NAP consistency check for a specific business verifying data matches across all directories

## Non-Functional Requirements

### Performance

- **NFR1:** Dashboard initial page load completes within 3 seconds
- **NFR2:** SPA view-to-view navigation completes within 500ms
- **NFR3:** CSV import of 100 business profiles completes validation and queuing within 30 seconds
- **NFR4:** Dashboard data refresh completes within 2 seconds
- **NFR5:** Action queue view loads within 1 second
- **NFR6:** Search and filter operations on business profiles return results within 1 second for up to 1,000 profiles

### Security

- **NFR7:** Application access is restricted at the network level — no public-facing access without firewall rules
- **NFR8:** Database connections between App VPS and Database VPS are encrypted in transit
- **NFR9:** Directory API credentials are stored encrypted at rest, never exposed in logs or API responses
- **NFR10:** No sensitive data (API keys, credentials) appears in client-side code or browser storage

### Scalability

- **NFR11:** System supports managing up to 1,000 business profiles without performance degradation
- **NFR12:** Job queue handles up to 5,000 pending submission jobs without memory or processing issues
- **NFR13:** Database schema supports adding new directories without schema migrations
- **NFR14:** Adding a new directory integration does not require changes to existing integration code

### Reliability

- **NFR15:** Failed submission jobs retry automatically up to 3 times with exponential backoff before surfacing as manual action items
- **NFR16:** No silent failures — every failed job produces an actionable entry in the action queue
- **NFR17:** System can be restored from backup and resume queued jobs without data loss or re-import
- **NFR18:** Queue processing survives application restarts — pending jobs persist across server reboots
- **NFR19:** Directory health monitoring detects API failures within 5 consecutive failed requests and automatically pauses submissions

### Integration

- **NFR20:** Each directory integration operates independently — failure in one does not block or affect others
- **NFR21:** Directory API rate limits are respected per-directory with configurable daily submission caps
- **NFR22:** API responses from directories are logged for debugging without storing sensitive credentials in logs
- **NFR23:** Directory integrations support configurable timeout values per directory
