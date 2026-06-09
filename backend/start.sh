#!/bin/sh
set -e

PORT="${PORT:-8000}"
export PYTHONPATH="${PYTHONPATH:-/app}"

# Migrations en arrière-plan — Uvicorn doit répondre vite au healthcheck Railway (/health)
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations (background)..."
  (
    if python scripts/ensure_migrations.py; then
      echo "Migrations OK"
    else
      echo "WARN: migrations failed — check deploy logs; API still running"
    fi
  ) &
else
  echo "WARN: DATABASE_URL not set — skipping migrations"
fi

echo "Starting uvicorn on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
