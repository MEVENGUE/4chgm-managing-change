# 4CHGM Enterprise AI Backend

FastAPI backend for **4CHGM — Managing Change**: PostgreSQL, JWT auth, document ingestion, semantic search (JSON embeddings), OpenAI copilot, Cloudflare R2.

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
2. Add **PostgreSQL** + **Redis** plugins (standard Railway Postgres works — no pgvector extension required)
3. Set variables from `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, optional `OPENAI_API_KEY`)
4. Deploy — `start.sh` starts uvicorn immediately (healthcheck `/health`), migrations run in background

**Note:** Embeddings are stored as JSON arrays in PostgreSQL so deployments work on Railway's default Postgres. Migrations are idempotent (`IF NOT EXISTS`) and recover automatically if tables exist without `alembic_version` (common after a failed first deploy).

If migrations remain stuck, reset the Railway PostgreSQL plugin and redeploy.

## Frontend Connection

In Vercel, set:

```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```

Register/login will use `/api/v1/auth/*`. Projects and document uploads sync to PostgreSQL.
