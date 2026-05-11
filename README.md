# Vacation Manager

A full-stack web application for managing employee vacation requests, built as part of a recruitment home assignment.

---

## Features

- **Requester Interface** — submit vacation requests and track their status
- **Validator Interface** — review, approve, or reject requests with filters and comments
- Responsive UI with Bootstrap 5
- RESTful API with input validation and error handling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite + Vue Router + Axios + Bootstrap 5 |
| Backend | Node.js + Express + TypeScript |
| ORM | TypeORM |
| Database | PostgreSQL 16 |
| Package manager | pnpm (monorepo workspace) |
| Testing | Vitest (frontend) + Jest + Supertest (backend) |
| CI | GitHub Actions |

---

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL 16 running locally

---

## Setup & Run

### 1. Clone the repository

```bash
git clone <repo-url>
cd vacation-manager
```

### 2. Install all dependencies

```bash
pnpm install
```

### 3. Create the databases

```bash
psql -U postgres -c "CREATE DATABASE vacation_manager;"
psql -U postgres -c "CREATE DATABASE vacation_manager_test;"
```

### 4. Configure environment

The backend ships with a default `.env`. Edit `backend/.env` if your PostgreSQL credentials differ:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=vacation_manager
PORT=3000
```

### 5. Seed users

```bash
pnpm --filter backend seed
```

This creates:
- **Alice Martin** (Requester)
- **Bob Smith** (Requester)
- **Carol Jones** (Validator)

### 6. Start the application

In two separate terminals:

```bash
# Terminal 1 — backend (port 3000)
pnpm dev:backend

# Terminal 2 — frontend (port 5173)
pnpm dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Tests

```bash
# All tests
pnpm test

# Backend only
pnpm --filter backend test

# Frontend only
pnpm --filter frontend test
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/requests` | Submit a vacation request |
| GET | `/api/requests` | Get all requests (optionally filter by `?userId=` or `?status=`) |
| PATCH | `/api/requests/:id` | Approve or reject a request |

---

## Technical Decisions

### Vite instead of Vue CLI
Vue CLI is in maintenance mode. Vite is the officially recommended build tool for Vue 3 — faster dev server and build times.

### TypeORM with `synchronize: true`
For this assignment the schema is auto-synced from entities on startup. In production, proper migrations would replace this.

### pnpm workspace
Both `backend/` and `frontend/` are managed from the root, allowing shared scripts (`pnpm test`, `pnpm dev:backend`) without duplication.

### Bootstrap 5 for UI
Chosen for responsive grid, pre-built components (badges, modals, tables), and Inspinia-style admin aesthetics — no extra UI library overhead.

### Supertest for backend tests
Integration tests hit a real test database (`vacation_manager_test`), matching the production code path exactly. No mocking of TypeORM.

---

## Known Limitations

- No authentication — users are selected from a dropdown for demonstration purposes
- `synchronize: true` is development-only and should be replaced with TypeORM migrations before production deployment
- No pagination on the validator dashboard
