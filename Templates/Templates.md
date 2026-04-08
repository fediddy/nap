> Part of [[BRAIN-INDEX]]

# Templates

Reusable note structures for the NAP Citation Engine brain.

## Handoff Template
Use for end-of-session notes:
```
# Handoff NNN — [Brief Title]
**Date**: YYYY-MM-DD
**Session**: [What this session was about]

## What Was Done
[Bullet list of completed work]

## Current State
[What the system looks like right now]

## Next Session Should
[Ordered list of what to tackle next]

## Open Questions
[Anything unresolved]
```

## Directory Adapter Template
Use when documenting a new adapter:
```
# [DirectoryName] Adapter
**Slug**: [slug]
**Type**: api | browser | file_export
**Story**: [story-id]
**Status**: planned | in-progress | complete | broken

## Submission Flow
[Step by step how submission works]

## Auth Requirements
[Login credentials, session management]

## Known Issues
[Fragile selectors, rate limit responses, etc.]
```
