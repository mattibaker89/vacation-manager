# Vacation Manager — Claude Context

## What this project is
A full-stack vacation request management app built as a recruitment home assignment. Two interfaces: Requester (submit requests) and Validator (approve/reject). See ROADMAP.md for full milestone history.

## Stack
- **Frontend**: Vue 3 + Vite + Vue Router + Axios + Bootstrap 5 — in `frontend/`
- **Backend**: Node.js + Express + TypeORM + TypeScript — in `backend/`
- **Database**: PostgreSQL 16 (local)
- **Package manager**: pnpm monorepo workspace
- **Tests**: Vitest (frontend), Jest + Supertest (backend)
- **CI**: GitHub Actions at `.github/workflows/ci.yml`

## Running the project
```bash
# Install all deps
pnpm install

# Create DBs (first time only)
psql -U postgres -c "CREATE DATABASE vacation_manager;"
psql -U postgres -c "CREATE DATABASE vacation_manager_test;"

# Seed users (first time only)
pnpm --filter backend seed

# Dev servers
pnpm dev:backend   # Express on :3000
pnpm dev:frontend  # Vite on :5173

# Tests
pnpm test
```

## Key files
- `backend/src/index.ts` — Express app entry, also exports `app` for tests
- `backend/src/config/database.ts` — TypeORM DataSource (uses `.env` / `.env.test`)
- `backend/src/entity/User.ts` — User entity (id, name, role: Requester|Validator)
- `backend/src/entity/VacationRequest.ts` — VacationRequest entity
- `backend/src/routes/requests.ts` — POST / GET / PATCH endpoints
- `backend/src/seed.ts` — seeds Alice, Bob (Requester), Carol (Validator)
- `frontend/src/api/requests.ts` — all Axios calls + TypeScript types
- `frontend/src/views/RequesterView.vue` — submit form + my requests list
- `frontend/src/views/ValidatorView.vue` — dashboard + approve/reject modal
- `frontend/src/router/index.ts` — Vue Router (/ → /requester, /validator)

## Environment
- `backend/.env` — dev DB config
- `backend/.env.test` — test DB (`vacation_manager_test`, port 3001)
- Vite proxies `/api` → `http://localhost:3000`

## Current state
All steps in ROADMAP.md are complete. The project has not been committed to git yet — next step is first commit and push to GitHub/Bitbucket.

## Known limitations (documented in README)
- No auth — user identity is selected from a dropdown for demo purposes
- TypeORM `synchronize: true` is dev-only (no migrations)
- No pagination on validator dashboard
