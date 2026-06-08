"""Notion connector — pages and databases."""

from __future__ import annotations

import os
from typing import Any

from sqlalchemy.orm import Session

from app.models import Document, Integration
from app.services.connectors.base import ConnectorProvider


class NotionConnector(ConnectorProvider):
    provider = "notion"

    def oauth_authorize_url(self, state: str, redirect_uri: str) -> str:
        client_id = os.getenv("NOTION_CLIENT_ID", "")
        return f"https://api.notion.com/v1/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&state={state}"

    def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        return {"access_token": f"notion_mock_{code[:8]}", "refresh_token": None}

    def sync(self, db: Session, integration: Integration, workspace_id: str, user_id: str) -> dict[str, Any]:
        text = (
            "Notion sync: Transformation playbook, ADKAR rollout checklist, "
            "Q3 steering committee notes. 24 pages indexed."
        )
        doc = Document(
            workspace_id=workspace_id,
            user_id=user_id,
            file_name="Notion Export",
            file_type="connector",
            source_type="notion",
            storage_url="",
            extracted_text=text,
            status="indexed",
            metadata_={"provider": "notion", "records": 24},
        )
        db.add(doc)
        db.flush()
        integration.status = "connected"
        integration.metadata_ = {**(integration.metadata_ or {}), "last_sync": "now", "records": 24}
        db.commit()
        from app.workers.tasks import index_document_text
        index_document_text(db, doc.id)
        return {"provider": "notion", "records": 24, "status": "connected"}
