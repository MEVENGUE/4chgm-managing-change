# NEXORA OS — Backend (FastAPI)

Optional API backend. The Next.js frontend works without it (local mock data),
and switches to this API when `NEXT_PUBLIC_API_URL` is set.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # then edit values
uvicorn main:app --reload --port 8000
```

## Connect the frontend

Create `.env.local` at the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart `npm run dev`. Services now call the API and fall back to mock on failure.

## Endpoints

| Method | Path                   | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/health`              | Health check                         |
| GET    | `/api/dashboard`       | Full dashboard data                  |
| GET    | `/api/dashboard/health`| Health score                         |
| POST   | `/api/ai/chat`         | AI copilot (OpenAI if key set, else mock) |

## Real AI

Set `OPENAI_API_KEY` in `.env` to enable real responses on `/api/ai/chat`.
Without a key, the endpoint returns deterministic mock answers.
