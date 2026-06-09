"""Convert legacy pgvector embedding column to JSON (Railway recovery)

Revision ID: 002
Revises: 001
Create Date: 2026-06-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    row = conn.execute(
        sa.text(
            """
            SELECT udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'document_chunks'
              AND column_name = 'embedding'
            """
        )
    ).fetchone()

    if not row:
        return

    if row[0] == "vector":
        op.execute("ALTER TABLE document_chunks DROP COLUMN embedding")
        op.add_column("document_chunks", sa.Column("embedding", sa.JSON(), nullable=True))


def downgrade() -> None:
    pass
