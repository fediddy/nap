# Story 1.4: Edit & Deactivate Business Profile

Status: done

## Story

As an operator,
I want to edit any field on an existing business profile and deactivate businesses I no longer need,
So that I can keep my data accurate and mark dead sites without deleting history.

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List
- GET/PUT/DELETE /api/businesses/:id added to businesses.routes.ts
- DELETE is a soft-delete (sets status='deactivated'), record never removed
- BusinessDetailPage fully rewritten with view/edit/confirm-dialog modes
- BusinessForm gained optional defaultValues + submitLabel props
- api.ts gained put + del helpers
- Both apps type-check clean

### File List
- apps/api/src/routes/businesses.routes.ts (updated)
- apps/web/src/lib/api.ts (updated — put + del added)
- apps/web/src/features/businesses/hooks/useBusinessById.ts (created)
- apps/web/src/features/businesses/hooks/useUpdateBusiness.ts (created)
- apps/web/src/features/businesses/hooks/useDeactivateBusiness.ts (created)
- apps/web/src/features/businesses/components/BusinessForm.tsx (updated — defaultValues + submitLabel)
- apps/web/src/features/businesses/pages/BusinessDetailPage.tsx (rewritten)
