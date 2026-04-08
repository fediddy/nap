> Part of [[Directories]]

# Aggregator Strategy

## What Are Aggregators?
Data aggregators collect business data and distribute it to hundreds of downstream directories automatically. A single submission to an aggregator = citations in 50-150+ directories without building individual adapters.

## The Big Three
| Aggregator | Reach | Access | Cost |
|-----------|-------|--------|------|
| Data Axle (Infogroup) | 100+ directories | API (paid) / inquiry | ~$30-80/listing |
| Foursquare | Apps + maps platforms | Dashboard (browser) | Free claim |
| Neustar Localeze | Telecom + GPS systems | API (paid) / inquiry | ~$30-80/listing |

## Why Prioritize Aggregators
- **80% citation value with 20% engineering effort**
- Cascades to directories you'd never build individual adapters for
- Neustar Localeze specifically feeds GPS systems (car nav, Siri, Alexa)
- Data Axle feeds Apple Maps, Bing, Yelp (as data source)

## Current Status
- All three seeded in directory registry
- Type set to `api` (Data Axle, Neustar) or `browser` (Foursquare)
- No actual integration built — Tier 2b decision pending Tier 1 ROI data

## Decision Gate
Before paying for aggregator partnerships:
1. Run Tier 1 free submissions for 60 days
2. Measure local search impression lift via GSC
3. Calculate cost/site for aggregator vs citations delivered
4. If GBP verification rate improves materially → aggregators are worth the per-listing fee

## Free Foursquare Path
Foursquare has a free business claim process at foursquare.com. Browser automation feasible.
Foursquare data is used by Uber, Snapchat, Twitter, and many mapping apps — high cascade value.
