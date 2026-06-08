#!/bin/sh
set -e

PORT="${PORT:-8000}"

# Migrations en arrière-plan — ne bloque pas le healthcheck Railway
if [ -n "$DATABASE_URL" ]; then
  echo "Running alembic migrations (background)..."
  (alembic upgrade head && echo "Migrations OK") || echo "WARN: migrations failed — API still starting" &
else
  echo "WARN: DATABASE_URL not set — skipping migrations"
fi

echo "Starting uvicorn on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
