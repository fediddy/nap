# Story 1.2: Create Individual Business Profile

Status: done

## Story

As an operator,
I want to create a single business profile by filling in a form,
So that I can add a new lead gen site to the system for future directory submission.

## Acceptance Criteria

1. **Given** the operator navigates to `/businesses/new`
   **When** the form renders
   **Then** fields shown: business name, street address, city, state, zip, phone (required), website (optional)
   **And** the form is fully responsive at 375px, 768px, 1280px viewports

2. **Given** the operator submits the form with all required fields valid
   **When** `POST /api/businesses` is called
   **Then** a new record is created with `status = 'active'`
   **And** operator is redirected to the business detail page
   **And** a success toast confirms creation

3. **Given** the operator submits with a missing required field
   **When** the form validates
   **Then** inline errors appear on the specific field(s) without page reload
   **And** no API call is made until form is valid

4. **Given** the operator enters a phone number
   **When** Zod validates it
   **Then** formats accepted: (555) 555-5555, 555-555-5555, 5555555555, +15555555555
   **And** invalid formats show "Enter a valid US phone number"

5. **Given** `POST /api/businesses` receives a valid request
   **When** business is created
   **Then** response: `{ data: { id, name, address, phone, category, website, status, createdAt }, meta: {} }`

## Tasks / Subtasks

- [x] **Task 1 — Install frontend dependencies**
  - [x] react-router-dom v7, @tanstack/react-query, react-hook-form, @hookform/resolvers
  - [x] Tailwind CSS, tailwind-merge, clsx
  - [x] sonner (toast notifications)

- [x] **Task 2 — Tailwind + app shell setup**
  - [x] Configure tailwind.config.ts and index.css in apps/web
  - [x] App.tsx with QueryClientProvider + Router + Toaster

- [x] **Task 3 — POST /api/businesses endpoint (AC: 2, 5)**
  - [x] Create apps/api/src/routes/businesses.routes.ts
  - [x] Validate body with businessProfileSchema (from @nap/shared)
  - [x] Insert into DB, return { data, meta: {} }
  - [x] Register route in server.ts

- [x] **Task 4 — BusinessForm component (AC: 1, 3, 4)**
  - [x] apps/web/src/features/businesses/components/BusinessForm.tsx
  - [x] react-hook-form + zodResolver(businessProfileSchema)
  - [x] Responsive layout

- [x] **Task 5 — /businesses/new page + mutation hook (AC: 2)**
  - [x] apps/web/src/features/businesses/hooks/useCreateBusiness.ts (TanStack mutation)
  - [x] apps/web/src/features/businesses/pages/NewBusinessPage.tsx
  - [x] apps/web/src/features/businesses/pages/BusinessDetailPage.tsx (redirect target)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- All 5 tasks complete; both apps type-check clean
- Tailwind configured with custom primary color palette
- react-hook-form + zodResolver reuses the shared businessProfileSchema — no duplicate validation
- POST /api/businesses returns 201 { data, meta: {} } on success, 400 with field-level details on validation failure
- BusinessDetailPage is a stub — full detail view in Story 1.3

### File List

- `apps/web/tailwind.config.ts`
- `apps/web/postcss.config.js`
- `apps/web/src/index.css`
- `apps/web/src/App.tsx` (updated — QueryClientProvider + Router + Toaster)
- `apps/web/src/main.tsx` (updated — CSS import)
- `apps/web/src/lib/utils.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/features/businesses/components/BusinessForm.tsx`
- `apps/web/src/features/businesses/hooks/useCreateBusiness.ts`
- `apps/web/src/features/businesses/pages/NewBusinessPage.tsx`
- `apps/web/src/features/businesses/pages/BusinessDetailPage.tsx`
- `apps/api/src/routes/businesses.routes.ts`
- `apps/api/src/server.ts` (updated — businessesRoutes registered)
