"""Connector base — OAuth, sync, webhook ingestion."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from sqlalchemy.orm import Session

from app.models import Document, Integration


class ConnectorProvider(ABC):
    provider: str = "base"

    @abstractmethod
    def oauth_authorize_url(self, state: str, redirect_uri: str) -> str:
        ...

    @abstractmethod
    def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        ...

    @abstractmethod
    def sync(self, db: Session, integration: Integration, workspace_id: str, user_id: str) -> dict[str, Any]:
        ...


def get_connector(provider: str) -> ConnectorProvider:
    from app.services.connectors import CONNECTOR_REGISTRY

    cls = CONNECTOR_REGISTRY.get(provider)
    if not cls:
        raise ValueError(f"Unknown provider: {provider}")
    return cls()
