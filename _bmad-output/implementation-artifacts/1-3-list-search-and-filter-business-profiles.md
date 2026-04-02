# Story 1.3: List, Search & Filter Business Profiles

Status: done

## Story

As an operator,
I want to view, search, and filter all my business profiles in one place,
So that I can quickly find specific businesses and understand my portfolio at a glance.

## Acceptance Criteria

1. `/businesses` shows sortable table: Business Name, Address, Category, Phone, Status, Created Date. Skeleton loader while fetching.
2. Search input debounced 300ms filters by name or address. Results < 1s for 1,000 profiles.
3. Category + Status filters combinable simultaneously.
4. Column header click sorts asc/desc (toggle). Sort persists in session.
5. Empty state shown when no businesses exist.
6. `GET /api/businesses?status=&category=&search=&sortBy=&sortDir=` returns `{ data: [], meta: { count: N } }`.

## Tasks / Subtasks

- [x] **Task 1 — GET /api/businesses endpoint**
  - [x] Filter by status, category (ilike), search (ilike name or address)
  - [x] sortBy + sortDir query params
  - [x] Returns { data, meta: { count } }

- [x] **Task 2 — useBusinesses hook + BusinessesListPage**
  - [x] TanStack Query with search/filter/sort params
  - [x] Skeleton loader (not spinner)
  - [x] Sortable table with empty state

- [x] **Task 3 — Wire /businesses route into App.tsx**

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- GET /api/businesses supports status, category (ilike), search (ilike name OR address), sortBy, sortDir
- Parallel Promise.all for rows + count — single round-trip cost
- Frontend debounces search 300ms; TanStack Query re-fetches automatically on param change
- Skeleton is 5 animated rows matching table columns — no spinner
- Empty state branches: no filters (prompt to create) vs filters active (prompt to adjust)
- Address, Phone columns not sortable (not in SORTABLE_COLUMNS); sortable: name, category, status, createdAt

### File List

- `apps/api/src/routes/businesses.routes.ts` (updated — GET added)
- `apps/web/src/hooks/useDebounce.ts`
- `apps/web/src/lib/api.ts` (updated — get + patch added)
- `apps/web/src/features/businesses/hooks/useBusinesses.ts`
- `apps/web/src/features/businesses/pages/BusinessesListPage.tsx`
- `apps/web/src/App.tsx` (updated — /businesses route added)
