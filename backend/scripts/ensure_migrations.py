#!/usr/bin/env python3
"""Bootstrap Alembic on Railway when tables exist without alembic_version."""

from __future__ import annotations

import subprocess
import sys
import time

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError

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

APP_TABLES_DROP_ORDER = [
    "audit_logs",
    "integrations",
    "copilot_messages",
    "copilot_threads",
    "document_chunks",
    "documents",
    "projects",
    "workspaces",
    "organizations",
    "users",
]

MAX_ATTEMPTS = 8
RETRY_SECONDS = 3


def normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def connect_engine(database_url: str):
    last_error: Exception | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        engine = create_engine(
            normalize_url(database_url),
            connect_args={"connect_timeout": 10},
            pool_pre_ping=True,
        )
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return engine
        except OperationalError as exc:
            last_error = exc
            print(f"DB not ready (attempt {attempt}/{MAX_ATTEMPTS}): {exc}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(RETRY_SECONDS)
    raise last_error or RuntimeError("database connection failed")


def current_revision(engine) -> str | None:
    inspector = inspect(engine)
    if "alembic_version" not in inspector.get_table_names():
        return None
    with engine.connect() as conn:
        return conn.execute(text("SELECT version_num FROM alembic_version")).scalar()


def users_id_column_type(engine) -> str | None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return None
    with engine.connect() as conn:
        row = conn.execute(
            text(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                  AND column_name = 'id'
                """
            )
        ).fetchone()
    return row[0] if row else None


def legacy_schema_detected(engine) -> bool:
    """Detect leftover tables (e.g. users.id INTEGER) incompatible with 4CHGM schema."""
    id_type = users_id_column_type(engine)
    if id_type is None:
        return False
    if id_type in ("character varying", "text", "uuid"):
        return False
    print(f"WARN: incompatible legacy users.id type: {id_type}")
    return True


def drop_app_schema(engine) -> None:
    print("Resetting incompatible 4CHGM tables before migration...")
    with engine.begin() as conn:
        for table in APP_TABLES_DROP_ORDER:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
        conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))


def main() -> int:
    settings = get_settings()
    if not settings.database_url:
        print("WARN: DATABASE_URL not set — skipping migrations")
        return 0

    try:
        engine = connect_engine(settings.database_url)
    except Exception as exc:
        print(f"ERROR: could not connect to database: {exc}")
        return 1

    if legacy_schema_detected(engine):
        drop_app_schema(engine)

    tables = set(inspect(engine).get_table_names())
    revision = current_revision(engine)

    try:
        if revision is None and CORE_TABLES.issubset(tables) and not legacy_schema_detected(engine):
            print("Schema present without alembic_version — stamping head")
            subprocess.check_call([sys.executable, "-m", "alembic", "stamp", "head"])
            return 0

        print("Running alembic upgrade head")
        subprocess.check_call([sys.executable, "-m", "alembic", "upgrade", "head"])
        return 0
    except subprocess.CalledProcessError as exc:
        print(f"ERROR: alembic failed with exit code {exc.returncode}")
        # Retry once after dropping partial/legacy schema (e.g. users.id INTEGER vs VARCHAR FK)
        print("Retrying after full schema reset...")
        drop_app_schema(engine)
        try:
            subprocess.check_call([sys.executable, "-m", "alembic", "upgrade", "head"])
            return 0
        except subprocess.CalledProcessError as retry_exc:
            print(f"ERROR: alembic retry failed with exit code {retry_exc.returncode}")
            return retry_exc.returncode or 1


if __name__ == "__main__":
    raise SystemExit(main())
