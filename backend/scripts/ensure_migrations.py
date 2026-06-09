#!/usr/bin/env python3
"""Bootstrap Alembic on Railway when tables exist without alembic_version."""

from __future__ import annotations

import subprocess
import sys

from sqlalchemy import create_engine, inspect, text

from app.config import get_settings

CORE_TABLES = frozenset(
    {
        "users",
        "organizations",
        "workspaces",
        "projects",
        "documents",
        "document_chunks",
        "copilot_threads",
        "copilot_messages",
        "integrations",
        "audit_logs",
    }
)


def normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def current_revision(engine) -> str | None:
    inspector = inspect(engine)
    if "alembic_version" not in inspector.get_table_names():
        return None
    with engine.connect() as conn:
        return conn.execute(text("SELECT version_num FROM alembic_version")).scalar()


def main() -> int:
    settings = get_settings()
    if not settings.database_url:
        print("WARN: DATABASE_URL not set — skipping migrations")
        return 0

    engine = create_engine(normalize_url(settings.database_url))
    tables = set(inspect(engine).get_table_names())
    revision = current_revision(engine)

    if revision is None and CORE_TABLES.issubset(tables):
        print("Schema present without alembic_version — stamping head")
        subprocess.check_call([sys.executable, "-m", "alembic", "stamp", "head"])
        return 0

    print("Running alembic upgrade head")
    subprocess.check_call([sys.executable, "-m", "alembic", "upgrade", "head"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
