# Vacation Manager — Project Roadmap

## Stack
- **Frontend**: Vue 3 + Vite + Vue Router + Axios + Bootstrap 5
- **Backend**: Node.js + Express + TypeORM + TypeScript
- **Database**: PostgreSQL 16
- **Package manager**: pnpm (monorepo workspace)
- **Testing**: Vitest (frontend) + Jest + Supertest (backend)
- **CI**: GitHub Actions

---

## Milestones

### ✅ Step 1 — Project Scaffold
- [x] Git repository initialized
- [x] pnpm workspace configured (`pnpm-workspace.yaml`)
- [x] Root `package.json` with shared scripts
- [x] `.gitignore`
- [x] `ROADMAP.md`

### ✅ Step 2 — Backend Setup
- [x] `backend/` package scaffolded (TypeScript + Express + TypeORM)
- [x] `tsconfig.json`, `package.json`, `.env`, `.env.test`
- [x] Database connection configured (`src/config/database.ts`)
- [x] `User` and `VacationRequest` TypeORM entities
- [x] Schema auto-sync via TypeORM `synchronize: true`
- [x] Seed script (2 requesters + 1 validator)

### ✅ Step 3 — Backend API
- [x] `POST /api/requests` — submit vacation request
- [x] `GET /api/requests?userId=` — get requests by user
- [x] `GET /api/requests` — get all requests (validator)
- [x] `GET /api/requests?status=` — filter by status
- [x] `PATCH /api/requests/:id` — approve or reject (with comment)
- [x] Input validation + error handling middleware

### ✅ Step 4 — Frontend Setup
- [x] `frontend/` scaffolded with Vite + Vue 3 + TypeScript
- [x] Vue Router configured (Requester / Validator routes)
- [x] Axios base client configured
- [x] Bootstrap 5 integrated
- [x] Vite proxy to backend (`/api` → `localhost:3000`)

### ✅ Step 5 — Requester View
- [x] Vacation request form (start date, end date, reason)
- [x] Client-side validation (required fields, date order)
- [x] My requests list with status badges

### ✅ Step 6 — Validator View
- [x] Dashboard with all requests table
- [x] Filter by status (All / Pending / Approved / Rejected)
- [x] Approve action
- [x] Reject action with modal + required comment field

### ✅ Step 7 — Tests
- [x] Backend: Jest + Supertest integration tests for all endpoints
- [x] Frontend: Vitest unit tests for RequesterView and ValidatorView

### ✅ Step 8 — GitHub Actions CI
- [x] Workflow runs backend tests with a real PostgreSQL service container
- [x] Workflow runs frontend tests

### ✅ Step 9 — README
- [x] Installation & run instructions
- [x] Technical decisions explained
- [x] Known limitations documented

---

## Progress Log
| Date | Completed |
|------|-----------|
| 2026-05-11 | Step 1 — Project scaffold |
| 2026-05-11 | Step 2 — Backend setup (entities, config, seed) |
| 2026-05-11 | Step 3 — Backend REST API |
| 2026-05-11 | Step 4 — Frontend setup (Vite, Vue Router, Axios, Bootstrap) |
| 2026-05-11 | Step 5 — Requester view |
| 2026-05-11 | Step 6 — Validator view |
| 2026-05-11 | Step 7 — Tests (backend + frontend) |
| 2026-05-11 | Step 8 — GitHub Actions CI |
| 2026-05-11 | Step 9 — README |
