---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments: []
date: 2026-02-15
author: Fediddy
---

# Product Brief: nap

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

NAP (Name, Address, Phone) is an internal citation engine module for AeliseIntelligence — an automated system that rapidly builds consistent business directory listings across the web for lead generation websites at scale. Operating at a volume of hundreds of new sites per month across all service niches, NAP eliminates the prohibitive cost of existing citation tools ($200-$1,000+/yr per location) by bringing directory submission automation in-house. The tool's primary strategic purpose is establishing a corroborating digital footprint of legitimate business presence across the web — strengthening trust signals for search engines, enabling smoother GBP verification (based on strong practitioner evidence), and generating direct visibility through directory presence itself.

---

## Core Vision

### Problem Statement

Lead generation operators who build and manage hundreds of local service websites face a fundamental local SEO bottleneck: there is no affordable, scalable way to build citation authority across business directories. Each new lead gen site launches with zero local authority signals — no directory presence, no NAP consistency, and no foundation for Google Business Profile verification. This means sites rank poorly in local search, leads flow slowly, and GBP claims face verification friction due to the absence of corroborating business data across the web.

### Problem Impact

- **Revenue delay**: Every day a lead gen site lacks directory citations is a day it underperforms in local search rankings, directly reducing lead volume and revenue
- **GBP verification friction**: Google cross-references business information across the web during GBP verification — without consistent citations, verification is slower, harder, and more likely to fail
- **Scale impossibility**: At hundreds of sites per month, manual directory submission is physically impossible (estimated 3,000+ hours/year at 15 min per submission across 10 directories per site)
- **Cost prohibition**: Existing tools like Yext ($199-$999/yr), BrightLocal ($29-$79/mo), and Moz Local ($14-$20/mo) charge per location — at scale this translates to $20,000-$100,000+/month, making them financially unviable
- **Human labor doesn't scale reliably**: VA-based submission is error-prone, inconsistent, and creates NAP discrepancies that actively harm local SEO. Automation ensures data accuracy and consistency that human labor cannot guarantee at scale

### Why Existing Solutions Fall Short

- **Yext, BrightLocal, Moz Local**: Per-location pricing models designed for single businesses or small agencies — completely uneconomical at industrial lead gen scale
- **Manual submission**: Physically impossible at hundreds of sites per month — would require multiple full-time employees doing nothing but form filling
- **Freelancer/VA services**: Inconsistent quality, no NAP accuracy guarantees, no tracking, and doesn't scale reliably
- **No solution addresses the full pipeline**: Existing tools treat citation building as an isolated task, not as a strategic precursor to GBP verification at scale

### Proposed Solution

An internal citation engine built as a module within AeliseIntelligence that:

1. **Ingests business profiles** (NAP + category + service area) in bulk via CSV or API
2. **Intelligently selects directories** based on business niche — universal directories for every site, plus niche-specific directories (e.g., Angi/HomeAdvisor for home services, Avvo for legal, Healthgrades for medical)
3. **Automates submissions** via direct API integrations where available (Bing Places, Facebook, Apple Maps, data aggregators) and browser automation (Playwright) for directories without APIs
4. **Maintains NAP consistency** across all directories for every business profile
5. **Tracks submission status** with a dashboard showing progress, successes, and failures across all sites
6. **Risk-mitigated GBP strategy**: Citations build authority independent of GBP — even if GBP listings face verification challenges or suspensions, directory presence continues generating direct traffic, backlink authority, and local search signals through the directories themselves
7. **Aggregator-first architecture**: Prioritize data aggregator submissions (Foursquare, Data Axle, Neustar/Localeze) which cascade to 100+ directories automatically, delivering 80% of citation value with minimal engineering complexity

### Key Differentiators

- **Built for volume**: Designed from the ground up for hundreds of submissions per month, not single-business use cases
- **Zero per-location cost**: Internal tool eliminates the $200-$1,000/yr per location that commercial tools charge
- **Niche-intelligent**: AI-powered directory selection based on business category ensures each site gets submitted to the directories that matter most for its vertical
- **GBP pipeline strategy**: Unlike standalone citation tools, NAP is purpose-built as the first stage in a GBP verification pipeline — citations are the means, GBP approval is the goal
- **AeliseIntelligence integration**: Lives inside an existing AI-powered SEO platform, leveraging shared infrastructure, data, and AI capabilities for unique description generation and category mapping
- **Accuracy at scale**: Unlike human labor, automated submissions guarantee NAP consistency across every directory for every site — eliminating the data discrepancies that damage local SEO
- **Aggregator-first ROI**: Architecture prioritizes the 3-4 data aggregators that cascade to hundreds of smaller directories, maximizing citation coverage with minimal direct integration cost

### Implementation Tiers

**Tier 1 — Direct Free Directory Submissions (MVP):**
Direct free directory submissions via API where available: Bing Places, Facebook Business, plus free claim processes on high-authority directories (Yelp, Yellow Pages, BBB). Data aggregator submissions included where free bulk pathways exist. Focus: establish presence on the directories with highest domain authority and Google trust at zero per-listing cost.

**Tier 2 — Browser Automation Expansion:**
Browser automation (Playwright) for high-authority directories without APIs: Apple Maps Connect and any Tier 1 directories where free claim requires form interaction. Requires proxy rotation and anti-detection infrastructure. **Note: Each automated directory is an ongoing maintenance commitment — directory UI changes require scraper updates. Budget ~5-10 hrs/month for maintenance at scale.**

**Tier 2b — Aggregator Partnerships:**
Paid data aggregator feeds (Data Axle, Foursquare, Neustar/Localeze) for cascade distribution to 100+ secondary directories. Requires partnership agreements or per-listing fees ($30-80/listing). Evaluate ROI once Tier 1 impact is measured.

**Tier 3 — Niche Intelligence:**
AI-powered niche-specific directory selection and submission. Industry vertical directory database with automated category mapping.

### Core User Workflow

1. **Import** — Bulk CSV upload of business profiles (NAP + category + service area + website URL)
2. **Review** — Preview submission plan per business showing which directories will be targeted and with what data
3. **Submit** — Queue batch submissions with rate limiting and staggered scheduling
4. **Monitor** — Dashboard showing real-time status across all sites and directories
5. **Intervene** — Handle failures, manual verifications, and email confirmations through action queue

### Business Data Assumptions

NAP assumes business profiles arrive with complete data: business name, physical address or service area, phone number, business category, website URL, and hours of operation. Business identity creation is out of scope — NAP handles distribution, not generation.

### Risk Mitigation Strategy

**Data Integrity:**
- Mandatory data validation before any submission: phone number format check, address verification via USPS/Google Maps API, duplicate detection across existing profiles
- Review step is un-skippable — confirmation gate required before batch submissions execute

**Anti-Detection & Rate Limiting:**
- Per-directory daily submission caps (max 5-10 new listings/day per directory)
- Mandatory proxy rotation for all browser automation
- Randomized submission timing with human-like delays
- Directory-specific cooldown periods between submissions

**Scraper Maintenance:**
- Tier 1 (API-only) must be validated for impact before any Tier 2 browser automation is built
- Each Tier 2 directory scraper tracked as an independent maintenance item with health monitoring
- Automated alerts when a scraper fails or directory changes are detected

**Outcome Tracking:**
- Directory authority scoring in the registry (domain authority, Google crawl status)
- Track outcome metrics (local search impressions, ranking changes) not just output metrics (submissions completed)
- 60-day impact measurement period after Tier 1 launch before expanding scope

**GBP Boundary:**
- NAP handles citation distribution only
- GBP creation and management is explicitly a separate future module with its own risk strategy (account diversification, staggered creation, unique descriptions)

### Economic Justification

At industrial lead gen scale, the economics of building vs buying citation tools are definitive:

- **Commercial tools (linear cost):** $14-$83/location/month, scaling to $20,000-$100,000+/month at volume
- **Internal tool (fixed cost):** One-time build + ~$200/month infrastructure, near-zero marginal cost per site
- **Break-even point:** ~50-100 active locations
- **Annual savings at 1,000+ sites:** $150,000-$900,000+/year
- **Strategic value:** Lower cost structure than any competitor relying on commercial citation tools — an economic moat for the lead gen operation

### Value Chain

The ultimate value chain NAP enables:

**Citations → GBP Verification → Map Pack Presence → High-Intent Local Leads → Revenue**

NAP is the first domino. Without a corroborating web presence, GBP verification faces higher scrutiny. Without GBP, there is no map pack presence. Without map pack, the highest-intent local search traffic is unreachable. NAP's economic moat compounds: the fixed-cost tool structure means every additional site added has near-zero marginal cost, while competitors using commercial tools face linear cost growth.

## Target Users

### Primary Users

**Persona: "The Lead Gen Operator" (Fediddy)**

- **Role:** Solo lead generation business owner running hundreds of local service websites across all niches
- **Environment:** Managing the full pipeline — site creation, SEO optimization, citation building, and lead monetization — single-handedly
- **Technical skill:** Intermediate — comfortable with CSV data, web dashboards, and understanding API concepts but not maintaining complex infrastructure daily
- **Motivation:** Maximize the number of ranking, lead-generating sites with minimal per-site time investment. Every minute spent on citations is a minute not spent on scaling the portfolio
- **Current pain:** Skips citations entirely because there's no viable way to do it at scale alone. Knows it's hurting rankings and GBP verification but has no solution

**Usage Mode A — "The Batch Launcher"**
Fediddy has spun up a new batch of 20-50 lead gen sites this week. He needs to import their business profiles, review the submission plans, and fire off citations to directories. This happens in concentrated bursts — heavy import/submit activity followed by quiet periods. Speed and bulk efficiency are everything in this mode.

**Usage Mode B — "The Monitor"**
Between launches, Fediddy checks in on submission status. What succeeded? What failed? What needs manual intervention (email confirmations, phone verifications)? This is a quick daily check — scan the dashboard, handle the action queue, move on. Minimal time investment, maximum situational awareness.

### Secondary Users

N/A — This is a strictly internal tool for a solo operator. No team members, no external clients, and no stakeholders require access or visibility into citation status. If the operation scales to include team members in the future, multi-user access can be revisited.

### User Journey

**Discovery:** N/A — Internal tool built by and for the operator.

**Onboarding:**
Fediddy's first experience is importing a CSV of 10 existing lead gen sites and submitting them to Tier 1 directories. Success = seeing those 10 sites show up as "submitted" or "verified" on the dashboard within 24-48 hours. This validates the tool works before scaling.

**Core Usage (Weekly Cycle):**
1. **Monday/Tuesday** — Import new batch of sites created that week (CSV upload, 20-50 businesses)
2. **Tuesday** — Review submission plans, confirm data accuracy, approve batch
3. **Tuesday-Friday** — Submissions execute automatically via queue (rate-limited, staggered)
4. **Daily (2-5 min)** — Quick dashboard check: scan for failures, handle action queue items
5. **Monthly** — Review outcome metrics: which directories are producing results, citation consistency scores across the portfolio

**Success Moment ("Aha!"):**
The first time Fediddy imports 50 businesses, hits "submit," and walks away — then checks the dashboard 48 hours later to see 250+ directory submissions completed automatically with 90%+ success rate. What used to be impossible is now a background process.

**Long-term Integration:**
NAP becomes an automatic step in the lead gen site creation pipeline. New site created → business profile added to NAP → citations fire automatically → foundation laid for GBP verification. Fediddy stops thinking about citations entirely — the system handles it.

## Success Metrics

### User Success Metrics (Operational)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time per site (hands-on) | < 2 minutes | From CSV import to submission queued — total manual interaction time |
| Batch processing capacity | 50+ sites per batch | Number of businesses imported and submitted in a single session |
| Submission success rate | > 90% on Tier 1 directories | Successful submissions / total attempted per directory |
| Daily monitoring time | < 5 minutes | Time spent on dashboard check + action queue per day |
| Action queue resolution | < 24 hours | Time from failure flagged to manual intervention completed |

**"Worth it" indicator:** Fediddy spends less than 2 hours/week total on citations for 100+ sites. Current Legiit approach was time-consuming and had unmeasurable results — NAP must be dramatically faster AND provide visibility into outcomes.

### Business Objectives

**3-Month Milestones:**
- Tier 1 MVP operational with 3+ directory integrations (Bing Places, Facebook, one free aggregator pathway)
- 50+ sites with complete Tier 1 citation profiles
- Baseline outcome data collected (ranking positions, GBP verification attempts)
- Total tool infrastructure cost < $200/month

**6-Month Milestones:**
- 200+ sites with active citation profiles
- Measurable before/after data: citation impact on local search impressions for sites with citations vs without
- GBP verification success rate tracked and compared to pre-citation baseline
- Decision made on Tier 2 expansion based on 60-day Tier 1 impact data

**12-Month Milestones:**
- 500+ sites managed in NAP
- Clear data-driven answer to "do citations help my lead gen sites rank and get GBP verified?"
- Cost per site < $0.50 (infrastructure cost / active sites)
- Full operational integration: citations are an automatic step in the site launch pipeline

### Key Performance Indicators

**Leading Indicators (predict future success):**
- Citation coverage rate: % of target directories with verified listing per site
- NAP consistency score: % of listings with matching business data across all directories
- Submission queue health: ratio of successful to failed submissions per week
- Directory uptime: % of automated integrations functioning without intervention

**Lagging Indicators (prove actual impact):**
- Local search impression delta: sites with citations vs sites without (measured via Google Search Console)
- GBP verification success rate: % of sites that pass GBP verification on first attempt after citation profile is established
- Time-to-first-lead: average days from site launch to first lead, comparing pre-NAP vs post-NAP cohorts
- Cost per citation profile: total monthly infrastructure cost / number of sites with complete profiles

**Anti-Vanity Metric Rule:**
Total submissions completed is an OUTPUT metric, not a SUCCESS metric. The tool succeeds when it produces measurable OUTCOMES: better rankings, faster GBP verification, more leads. Track submissions for operational health — but judge success by business impact.

## MVP Scope

### Core Features

**1. Business Profile Manager**
- CSV bulk import of business profiles (name, address, phone, category, service area, website URL, hours)
- Mandatory data validation on import: phone format check, address verification, duplicate detection
- Individual business profile add/edit via dashboard
- Business profile database with full CRUD operations

**2. Directory Submission Engine**
- Direct API integrations for MVP directories:
  - Bing Places
  - Facebook Business
  - Yelp (free claim/submission process)
  - 4th directory TBD (major service business directory — to be confirmed)
- Queue-based submission with rate limiting and staggered scheduling
- Per-directory daily submission caps (5-10 per directory per day)
- Retry logic with exponential backoff for failed submissions

**3. Review & Submit Workflow**
- Preview submission plan per business before execution: which directories, what data
- Confirmation gate — no batch submits without explicit approval
- Ability to edit/correct business data before submission fires
- Batch approve: review once, submit all

**4. Status Dashboard**
- Real-time submission status per business × directory (pending, submitted, verified, failed, needs-action)
- Action queue: failed submissions and manual intervention items surfaced prominently
- Batch view: see all businesses from a CSV import as a group
- Summary stats: total sites managed, submission success rate, directories covered

**5. Directory Registry**
- Database of supported directories with submission method, API details, rate limits
- Extensible design: adding a new directory = adding a registry entry + integration code
- Directory health monitoring: flag when an integration is failing

### Out of Scope for MVP

| Feature | Reason for Deferral | Target Phase |
|---------|---------------------|--------------|
| Niche-specific directory selection | Requires building industry directory database — validate universal directories first | Tier 3 |
| Browser automation (Playwright) | High maintenance burden — validate API-only impact first per 60-day rule | Tier 2 |
| Aggregator partnerships (Data Axle, Foursquare, Neustar) | Requires paid agreements — evaluate ROI after Tier 1 | Tier 2b |
| Outcome tracking (rankings, GSC integration) | Valuable but not needed to submit citations — add after baseline submissions are running | Phase 2 |
| GBP creation & management | Explicitly separate module with own risk strategy | Future module |
| AI-generated unique descriptions per directory | Enhancement — MVP uses operator-provided descriptions | Phase 2 |
| Proxy rotation / anti-detection | Only needed for browser automation (Tier 2) | Tier 2 |
| Multi-user access / team features | Solo operator for now — revisit if team grows | Future |
| Mobile interface | Desktop dashboard sufficient for batch operations | Future |

### MVP Success Criteria

**Launch Gate (Tier 1 operational):**
- 3+ directory integrations functional and tested (Bing Places, Facebook, Yelp minimum)
- Successfully submit 10 existing sites to all integrated directories as validation
- Submission success rate > 90% across all directories
- CSV import → review → submit workflow completes in < 2 minutes hands-on per site

**60-Day Validation Gate:**
- 50+ sites with complete Tier 1 citation profiles
- Dashboard accurately reflects submission status across all sites
- Daily monitoring routine takes < 5 minutes
- No critical failures requiring tool rebuild or architecture changes
- Decision: expand to Tier 2 or stay with Tier 1 based on measured impact

**Go/No-Go Signal:**
- IF submission success rate holds above 90% AND hands-on time stays under 2 min/site → proceed to scale
- IF directories are blocking or rate-limiting submissions → investigate and adapt before scaling
- IF after 60 days there is no observable impact on local search visibility → reassess citation strategy before investing in Tier 2

### Future Vision

**Phase 2 — Intelligence Layer (Month 3-6):**
- Outcome tracking: Google Search Console integration to measure citation impact on rankings and impressions
- AI-generated unique business descriptions per directory to avoid duplicate content
- NAP consistency auditing: scan existing listings and flag discrepancies
- Directory authority scoring to prioritize high-impact directories

**Phase 3 — Automation Expansion (Month 6-9):**
- Browser automation (Tier 2) for directories without APIs, if Tier 1 impact justifies maintenance cost
- Aggregator partnerships (Tier 2b) for cascade distribution, if ROI supports per-listing fees
- Niche-specific directory intelligence (Tier 3) with AI-powered category matching

**Phase 4 — Platform Integration (Month 9-12):**
- Full pipeline automation: site creation → NAP profile → citation submission → monitoring
- GBP management as a separate module within AeliseIntelligence
- Review request automation tied to citation-verified businesses
- API endpoint for external tool integration with the lead gen site builder

**Long-term (12+ months):**
- Self-healing scrapers with AI-assisted form detection for Tier 2 directories
- Predictive analytics: which directories drive the most value per niche
- Citation portfolio optimization: automatically add/remove directories based on performance data
