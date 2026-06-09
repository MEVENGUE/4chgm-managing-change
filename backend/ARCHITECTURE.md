# 4CHGM — Enterprise AI Backend Architecture

## Overview

Production FastAPI backend: auth, document intelligence, vector memory (pgvector), RAG copilot with SSE streaming, connectors, AI agents, PDF/PPT exports.

```
Vercel (Next.js) ──► Railway FastAPI (/api/v1)
                         ├── PostgreSQL + pgvector
                         ├── Redis + Celery workers
                         ├── Cloudflare R2
                         └── OpenAI (GPT + embeddings)
```

## Implementation Status

| Phase | Status | Deliverables |
|-------|--------|--------------|
| **1** | ✅ | PostgreSQL, JWT auth, uploads, R2, REST API |
| **2** | ✅ | Parsing, chunking, embeddings, hybrid search |
| **3** | ✅ | RAG copilot, SSE streaming, thread persistence |
| **4** | ✅ | Jira/GitHub/Notion connectors, sync jobs |
| **5** | ✅ | 6 AI agents, PDF/PPT export engine |

## API Endpoints

### Auth `/api/v1/auth`
- `POST /register`, `/login`, `/refresh`
- `GET /me`

### Projects `/api/v1/projects`
- CRUD initiatives

### Documents `/api/v1/documents`
- `POST /upload`, `GET /`, `GET /search/semantic`

### Knowledge `/api/v1/knowledge`
- `GET /search` — hybrid retrieval

### Copilot `/api/v1/copilot`
- `GET /threads`
- `POST /chat` — RAG answer
- `POST /chat/document`
- `POST /chat/stream` — SSE streaming

### Analytics `/api/v1/analytics`
- `GET /dashboard` — live metrics from DB

### Integrations `/api/v1/integrations`
- `GET /` — connector catalog
- `POST /{provider}/connect` — OAuth URL
- `GET /{provider}/callback`
- `POST /{provider}/sync`
- `DELETE /{provider}`

### Exports `/api/v1/exports`
- `POST /executive` — PDF or PPTX to R2
- `GET /executive/download` — PDF download
- `POST /agents/run` — Executive, Finance, Risk, Scrum, DevOps, Transformation

### Legacy (frontend compat)
- `POST /api/ai/chat`, `/analyze-document`, `/mermaid`

## RAG Pipeline

```
User question → intent detection → hybrid_retrieve (vector + keyword + projects)
              → context assembly → OpenAI → citations + actions
```

Streaming: `POST /api/v1/copilot/chat/stream` emits SSE `token` and `done` events.

## Ingestion Pipeline

```
Upload → R2/local → parse (PDF/DOCX/XLSX/OCR) → chunk → embed → PostgreSQL JSON
Connector sync → document row → index_document_text
```

## AI Agents

| Agent | Focus |
|-------|-------|
| executive | Strategic summaries |
| finance | Budget & forecast |
| risk | Risk detection |
| scrum | Sprint analysis |
| devops | Pipeline failures |
| transformation | Adoption & change |

## Local Dev

```bash
cd backend && docker compose up -d
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000
celery -A app.workers.celery_app.celery_app worker -Q ingestion,embeddings -l info
```

## Railway Variables

```
DATABASE_URL          # PostgreSQL plugin
REDIS_URL             # Redis plugin
JWT_SECRET
CORS_ORIGINS
OPENAI_API_KEY
OPENAI_MODEL
CLOUDFLARE_R2_ACCESS_KEY
CLOUDFLARE_R2_SECRET_KEY
CLOUDFLARE_R2_ACCOUNT_ID
GITHUB_CLIENT_ID      # optional OAuth
JIRA_CLIENT_ID
NOTION_CLIENT_ID
```
