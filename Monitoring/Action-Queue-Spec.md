> Part of [[Monitoring]]

# Action Queue Spec

## Purpose
Surface items that require manual intervention and make them easy to resolve quickly. Daily check should take < 5 minutes.

## What Goes In The Action Queue
- **Email confirmation needed**: Directory sent confirm email to business address
- **Phone verification needed**: Directory requires live phone call
- **CAPTCHA encountered**: Automation hit a CAPTCHA — manual submission needed
- **Account suspended**: Directory account blocked — needs new account + resubmit
- **Listing rejected**: Directory rejected the submission with a reason
- **Data mismatch**: Business data on directory doesn't match profile (NAP inconsistency)

## Queue Item Fields
- Business name + directory name
- Issue type (from list above)
- Error message / details
- Direct link to directory listing page
- Submitted at timestamp
- Age (how long it's been waiting)
- Priority (urgent = account suspended; normal = email confirm)

## Resolution Actions
Each queue item should have a one-click action:
- "Mark resolved" — manual action completed, retry submission
- "Dismiss" — won't fix, skip this directory for this business
- "Resubmit" — queue a fresh submission attempt
- "Open directory" — direct link to directory

## SLA Target
Action queue items resolved within 24 hours of appearance.
Alert (UI badge) if any item is > 48 hours old.
