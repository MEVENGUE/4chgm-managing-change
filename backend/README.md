# 4CHGM Enterprise AI Backend

FastAPI backend for **4CHGM — Managing Change**: PostgreSQL, JWT auth, document ingestion, pgvector, OpenAI copilot, Cloudflare R2.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design.

## Quick Start

```bash
cd backend
cp .env.example .env
docker compose up -d    # PostgreSQL + Redis + API
```

Or without Docker:

```bash
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Railway

1. Root Directory: `backend`
2. Add **PostgreSQL** + **Redis** plugins
3. Set variables from `.env.example`
4. Deploy — migrations run automatically via `railway.toml`

## Frontend Connection

In Vercel, set:

```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

Register/login will use `/api/v1/auth/*`. Projects and document uploads sync to PostgreSQL.
