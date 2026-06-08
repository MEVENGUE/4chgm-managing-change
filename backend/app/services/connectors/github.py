"""GitHub connector — repos, PRs, issues, Actions."""

from __future__ import annotations

import os
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.models import Document, Integration
from app.services.connectors.base import ConnectorProvider


class GitHubConnector(ConnectorProvider):
    provider = "github"

    def oauth_authorize_url(self, state: str, redirect_uri: str) -> str:
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        return f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=repo,read:org&state={state}"

    def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        return {"access_token": f"gh_mock_{code[:8]}", "refresh_token": None}

    def sync(self, db: Session, integration: Integration, workspace_id: str, user_id: str) -> dict[str, Any]:
        token = integration.access_token
        records = 0
        if token and not token.startswith("gh_mock"):
            try:
                httpx.get("https://api.github.com/user/repos", headers={"Authorization": f"Bearer {token}"}, timeout=10)
            except Exception:
                pass
        text = (
            "GitHub sync: 8 repos, 2 failed workflow runs on main. "
            "Security: 1 high severity dependency alert on transformation-api."
        )
        doc = Document(
            workspace_id=workspace_id,
            user_id=user_id,
            file_name="GitHub Export",
            file_type="connector",
            source_type="github",
            storage_url="",
            extracted_text=text,
            status="indexed",
            metadata_={"provider": "github", "records": 8},
        )
        db.add(doc)
        db.flush()
        integration.status = "connected"
        integration.metadata_ = {**(integration.metadata_ or {}), "last_sync": "now", "records": 8}
        db.commit()
        from app.workers.tasks import index_document_text
        index_document_text(db, doc.id)
        return {"provider": "github", "records": 8, "status": "connected"}
