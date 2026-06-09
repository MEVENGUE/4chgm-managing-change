# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

**4CHGM** is a Next.js 14 frontend SaaS app for change management. The **default dev mode** runs frontend-only with mock data in `localStorage` — no database or backend required.

An optional **FastAPI backend** in `backend/` adds PostgreSQL, JWT auth, RAG copilot, etc. See `backend/README.md` for full-stack setup.

### Services

| Service | Port | Required for default dev? |
|---------|------|---------------------------|
| Next.js (`npm run dev`) | 3000 | Yes |
| FastAPI (`uvicorn`) | 8000 | No (only if `NEXT_PUBLIC_API_URL` is set) |
| PostgreSQL + pgvector | 5432 | No (backend only) |
| Redis | 6379 | No (optional Celery broker) |

### Standard commands

See `README.md` and `package.json`:

- **Install:** `npm install`
- **Dev server:** `npm run dev` → http://localhost:3000
- **Build:** `npm run build` (includes ESLint + TypeScript checks during build)
- **Lint:** `npm run lint` — requires a `.eslintrc.json` file; the repo currently has none, so `next lint` prompts interactively. Use `npm run build` for non-interactive lint/type validation, or add `{"extends": "next/core-web-vitals"}` to `.eslintrc.json`.
- **Start production:** `npm run start`

### Demo authentication

Any email + password with **≥ 4 characters** works in default mock mode (see `src/services/auth/authService.ts`).

### Environment variables

Copy `.env.example` → `.env.local` (optional). All vars are optional for local frontend-only dev.

### Full-stack backend (optional)

```bash
cd backend
docker compose up -d          # PostgreSQL + Redis
pip install -r requirements.txt
cp .env.example .env
# run migrations, then:
./start.sh                    # or: uvicorn app.main:app --reload --port 8000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local` to wire frontend to backend.

### Gotchas

- Node.js **≥ 18.17** required (`package.json` engines).
- The 3D neural globe on `/login` uses React Three Fiber with `dynamic(..., { ssr: false })` — if build fails on Three.js, confirm Node 18+.
- `npm run dev` should run in a persistent session (tmux); it blocks the terminal.
- No automated test suite is configured in this repo.
