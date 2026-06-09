"""Initial enterprise schema (portable Postgres — JSON embeddings, no pgvector)

Revision ID: 001
Revises:
Create Date: 2026-06-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), server_default=""),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("role", sa.String(64), server_default="member"),
        sa.Column("locale", sa.String(16), server_default="en"),
        sa.Column("company", sa.String(255), server_default=""),
        sa.Column("username", sa.String(64), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )
    op.create_index("ix_users_email", "users", ["email"], if_not_exists=True)

    op.create_table(
        "organizations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("industry", sa.String(128), server_default=""),
        sa.Column("size", sa.String(64), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "workspaces",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("workspace_type", sa.String(64), server_default="transformation"),
        if_not_exists=True,
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("status", sa.String(32), server_default="planning"),
        sa.Column("risk_score", sa.Integer(), server_default="0"),
        sa.Column("impact_score", sa.Integer(), server_default="0"),
        sa.Column("health_score", sa.Integer(), server_default="0"),
        sa.Column("budget_planned", sa.Float(), server_default="0"),
        sa.Column("budget_spent", sa.Float(), server_default="0"),
        sa.Column("progress", sa.Integer(), server_default="0"),
        sa.Column("owner", sa.String(128), server_default=""),
        sa.Column("phase", sa.String(64), server_default="Discovery"),
        sa.Column("start_date", sa.String(16), server_default=""),
        sa.Column("due_date", sa.String(16), server_default=""),
        sa.Column("tags", sa.JSON(), server_default="[]"),
        sa.Column("dependencies", sa.JSON(), server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("file_name", sa.String(512), nullable=False),
        sa.Column("file_type", sa.String(64), nullable=False),
        sa.Column("source_type", sa.String(64), server_default="upload"),
        sa.Column("storage_url", sa.String(1024), server_default=""),
        sa.Column("storage_key", sa.String(512), server_default=""),
        sa.Column("extracted_text", sa.Text(), server_default=""),
        sa.Column("status", sa.String(32), server_default="pending"),
        sa.Column("metadata", sa.JSON(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "document_chunks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("embedding", sa.JSON(), nullable=True),
        sa.Column("metadata", sa.JSON(), server_default="{}"),
        if_not_exists=True,
    )

    op.create_table(
        "copilot_threads",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), server_default="New thread"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "copilot_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("thread_id", sa.String(36), sa.ForeignKey("copilot_threads.id"), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("citations", sa.JSON(), server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "integrations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("workspace_id", sa.String(36), sa.ForeignKey("workspaces.id"), nullable=False),
        sa.Column("provider", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), server_default="disconnected"),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action", sa.String(128), nullable=False),
        sa.Column("details", sa.JSON(), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        if_not_exists=True,
    )


def downgrade() -> None:
    for table in [
        "audit_logs", "integrations", "copilot_messages", "copilot_threads",
        "document_chunks", "documents", "projects", "workspaces", "organizations", "users",
    ]:
        op.drop_table(table)
