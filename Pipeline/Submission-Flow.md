> Part of [[Pipeline]]

# Submission Flow

## Full Pipeline

```
1. IMPORT
   CSV upload → parse → validate (phone format, address, required fields)
   → duplicate check (name + address matching)
   → create/update businesses table

2. PLAN
   For each business, determine which directories to submit to
   → Universal directories for all businesses
   → Niche-specific directories based on business.category
   → Show preview: "Business X will be submitted to N directories"

3. APPROVE (confirmation gate — mandatory)
   Operator reviews submission plan
   → Can edit business data before submit
   → Batch approve all or approve individually
   → Creates submissions records (status: pending)

4. QUEUE
   BullMQ jobs created per business × directory combination
   → Per-directory rate limits applied
   → Jobs staggered with human-like delays
   → Daily cap respected (5-10 per directory per day)

5. EXECUTE
   Worker picks up job → loads appropriate adapter → submits
   → Success: update submission status = submitted/verified
   → Failure: update status = failed, log error, schedule retry
   → Needs action: flag for manual intervention (email confirm, phone verify)

6. RETRY
   Exponential backoff on failures
   → Attempt 1: immediate
   → Attempt 2: 5 min
   → Attempt 3: 30 min
   → Attempt 4: 2 hours
   → After max attempts: status = failed, surfaced in action queue

7. MONITOR
   Dashboard: status matrix per business × directory
   Action queue: items needing manual intervention
   Directory health: auto-pause if failure rate exceeds threshold
```

## Status States
- `pending` — queued, not yet attempted
- `submitted` — submission sent, awaiting verification
- `verified` — confirmed listed by directory
- `failed` — max retries exceeded
- `needs_action` — requires manual step (email click, phone verify, CAPTCHA)
- `paused` — directory is paused, submission deferred
