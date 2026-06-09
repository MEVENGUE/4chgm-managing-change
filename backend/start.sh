#!/bin/sh
set -e

PORT="${PORT:-8000}"

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  if python scripts/ensure_migrations.py; then
    echo "Migrations OK"
  else
    echo "ERROR: migrations failed — check DATABASE_URL and logs"
    exit 1
  fi
else
  echo "WARN: DATABASE_URL not set — skipping migrations"
fi

echo "Starting uvicorn on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
