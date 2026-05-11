# Vacation Manager

A full-stack web application for managing employee vacation requests.

---

## Features

- **Requester Interface** — submit vacation requests (with optional single-day shortcut) and track their status in real time
- **Validator Dashboard** — charts showing requests by month, approved vacations by month, and status breakdown
- **Request Management** — review all requests, filter by status, approve with one click, or reject with a required comment
- **Users Page** — view all users and add new ones via a modal form
- Responsive UI with Bootstrap 5 (Inspinia-inspired admin theme)
- RESTful API with input validation, error handling, and conflict protection
- Full test suite: integration tests (backend) + component tests (frontend)
- GitHub Actions CI pipeline

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Frontend        | Vue 3 + Vite + Vue Router + Axios + Bootstrap 5 |
| Backend         | Node.js + Express + TypeScript                  |
| ORM             | TypeORM                                         |
| Database        | PostgreSQL 16                                   |
| Package manager | pnpm (monorepo workspace)                       |
| Testing         | Vitest (frontend) + Jest + Supertest (backend)  |
| CI              | GitHub Actions                                  |

---

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL 16 running locally

---

## Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/mattibaker89/vacation-manager.git
cd vacation-manager
```

### 2. Install all dependencies

```bash
pnpm install
```

### 3. Configure environment

Copy the example env file:

**macOS / Linux**
```bash
cp backend/.env.example backend/.env
```

**Windows**
```cmd
copy backend\.env.example backend\.env
```

Then edit `backend/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your_postgres_username>
DB_PASSWORD=<your_postgres_password>
DB_NAME=vacation_manager
PORT=3000
```

> **`DB_USERNAME`**
> - **macOS (Homebrew):** your system username — run `whoami` to find it
> - **Windows / Linux:** typically `postgres`
>
> **`DB_PASSWORD`**
> - **macOS (Homebrew):** usually no password — leave `DB_PASSWORD=` empty
> - **Windows:** the password you set during PostgreSQL installation
> - **Linux:** depends on your setup; blank is common for local dev installs

If you also want to run the test suite, apply the same username and password to `backend/.env.test`.

### 4. Start the application

In two separate terminals:

```bash
# Terminal 1 — backend (port 3000)
pnpm dev:backend

# Terminal 2 — frontend (port 5173)
pnpm dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> The database and seed users are created automatically on first startup — no extra steps needed.

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

## Project Structure

```
vacation-manager/
├── backend/
│   └── src/
│       ├── config/database.ts        # TypeORM DataSource
│       ├── entity/
│       │   ├── User.ts               # User entity (id, name, role)
│       │   └── VacationRequest.ts    # VacationRequest entity
│       ├── middleware/
│       │   └── errorHandler.ts       # Global Express error handler
│       ├── routes/
│       │   ├── requests.ts           # POST / GET / PATCH request endpoints
│       │   └── users.ts              # GET + POST /api/users
│       ├── test/
│       │   ├── globalSetup.js        # Creates test DB before Jest runs
│       │   └── requests.test.ts      # Supertest integration tests
│       ├── ensureDatabase.ts         # Auto-creates DB on startup if missing
│       ├── index.ts                  # Express app entry point
│       ├── seed.ts                   # User seeding (startup + CLI)
│       └── types.ts                  # Shared TypeScript types
└── frontend/
    └── src/
        ├── api/
        │   ├── client.ts             # Axios instance (proxied to backend)
        │   └── requests.ts           # Typed API call functions
        ├── components/
        │   ├── ValidatorStats.vue    # Stat cards + charts for the dashboard
        │   └── __tests__/           # Vitest component tests
        ├── router/index.ts           # Vue Router
        ├── views/
        │   ├── RequesterView.vue     # Submit form + my requests list
        │   ├── ValidatorDashboardView.vue  # Charts + stat cards
        │   ├── ValidatorView.vue     # All requests table + approve/reject
        │   └── UsersView.vue         # User list + add user modal
        ├── App.vue                   # Root layout (sidebar + router-view)
        └── types.ts                  # Shared TypeScript interfaces
```

---

## API Reference

| Method | Endpoint            | Description                                                       |
| ------ | ------------------- | ----------------------------------------------------------------- |
| GET    | `/api/users`        | List all users                                                    |
| POST   | `/api/users`        | Create a new user (`name`, `role`)                                |
| POST   | `/api/requests`     | Submit a vacation request                                         |
| GET    | `/api/requests`     | Get all requests (optionally filter by `?userId=` or `?status=`) |
| PATCH  | `/api/requests/:id` | Approve or reject a request                                       |

---

## Technical Decisions

### Vite instead of Vue CLI

Vue CLI is in maintenance mode. Vite is the officially recommended build tool for Vue 3 — faster dev server and build times.

### TypeORM with `synchronize: true`

The schema is auto-synced from entities on startup for development convenience. In production, proper migrations would replace this.

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
- No pagination on the All Requests page
