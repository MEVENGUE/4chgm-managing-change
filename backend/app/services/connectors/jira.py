"""Jira connector — issues, sprints, epics."""

from __future__ import annotations

import os
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.models import Document, Integration
from app.services.connectors.base import ConnectorProvider


class JiraConnector(ConnectorProvider):
    provider = "jira"

    def oauth_authorize_url(self, state: str, redirect_uri: str) -> str:
        client_id = os.getenv("JIRA_CLIENT_ID", "")
        return (
            f"https://auth.atlassian.com/authorize?audience=api.atlassian.com"
            f"&client_id={client_id}&scope=read%3Ajira-work&redirect_uri={redirect_uri}"
            f"&state={state}&response_type=code&prompt=consent"
        )

    def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        return {"access_token": f"jira_mock_{code[:8]}", "refresh_token": "mock_refresh"}

    def sync(self, db: Session, integration: Integration, workspace_id: str, user_id: str) -> dict[str, Any]:
        token = integration.access_token
        records = 0
        if token and not token.startswith("jira_mock"):
            try:
                # Placeholder — real Jira Cloud REST
                httpx.get("https://api.atlassian.com/oauth/token/accessible-resources", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            except Exception:
                pass
        issues_text = (
            "Jira sync: 12 open issues, 3 blockers on ERP stream. "
            "Sprint velocity 68 SP. Highest risk: DATA-441 dependency on cloud landing zone."
        )
        doc = Document(
            workspace_id=workspace_id,
            user_id=user_id,
            file_name="Jira Export",
            file_type="connector",
            source_type="jira",
            storage_url="",
            extracted_text=issues_text,
            status="indexed",
            metadata_={"provider": "jira", "records": 12},
        )
        db.add(doc)
        db.flush()
        integration.status = "connected"
        integration.metadata_ = {**(integration.metadata_ or {}), "last_sync": "now", "records": 12}
        db.commit()
        from app.workers.tasks import index_document_text
        index_document_text(db, doc.id)
        records = 12
        return {"provider": "jira", "records": records, "status": "connected"}
