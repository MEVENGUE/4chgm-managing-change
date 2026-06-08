# 4CHGM — Backend (FastAPI)

Optional API for the Next.js frontend. Without it, the app uses browser mock data.

## Railway deployment

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select `MEVENGUE/4chgm-enterprise-os`
3. **Settings → Root Directory** → `backend`
4. **Variables** (required):

| Variable | Example |
|---|---|
| `CORS_ORIGINS` | `https://4chgm.vercel.app` (your Vercel URL, comma-separated if multiple) |

| Variable | Optional |
|---|---|
| `OPENAI_API_KEY` | Real AI on `/api/ai/chat` |
| `OPENAI_MODEL` | `gpt-4o-mini` (default) |

5. Deploy → copy the public URL (e.g. `https://4chgm-api.up.railway.app`)
6. In **Vercel**, set `NEXT_PUBLIC_API_URL` to that URL (no trailing slash)

Health check: `GET /health` → `{ "status": "ok" }`

## Local development

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Root `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (Railway) |
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/dashboard/health` | Health score |
| POST | `/api/ai/chat` | AI copilot |
