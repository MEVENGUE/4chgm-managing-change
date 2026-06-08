import secrets
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import Integration, User
from app.services.connectors import CONNECTOR_REGISTRY, get_connector
from app.services.workspace import get_user_org_workspace
from app.workers.tasks import enqueue_connector_sync

router = APIRouter(prefix="/integrations", tags=["integrations"])

OAUTH_STATES: dict[str, str] = {}


class IntegrationResponse(BaseModel):
    id: str
    provider: str
    status: str
    records: int = 0
    lastSync: str | None = None


class ConnectResponse(BaseModel):
    authorizeUrl: str
    state: str


@router.get("", response_model=list[IntegrationResponse])
def list_integrations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    rows = db.query(Integration).filter(Integration.workspace_id == ws.id).all()
    catalog = []
    for provider in CONNECTOR_REGISTRY:
        existing = next((r for r in rows if r.provider == provider), None)
        meta = (existing.metadata_ or {}) if existing else {}
        catalog.append(
            IntegrationResponse(
                id=existing.id if existing else f"pending-{provider}",
                provider=provider,
                status=existing.status if existing else "available",
                records=meta.get("records", 0),
                lastSync=meta.get("last_sync"),
            )
        )
    return catalog


@router.post("/{provider}/connect", response_model=ConnectResponse)
def connect_provider(
    provider: str,
    redirect_uri: str = Query("http://localhost:3000/dashboard/integrations"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if provider not in CONNECTOR_REGISTRY:
        raise HTTPException(status_code=404, detail="Provider not supported")
    _, ws = get_user_org_workspace(db, user)
    state = secrets.token_urlsafe(16)
    OAUTH_STATES[state] = f"{user.id}:{ws.id}:{provider}"
    conn = get_connector(provider)
    return ConnectResponse(authorizeUrl=conn.oauth_authorize_url(state, redirect_uri), state=state)


@router.get("/{provider}/callback")
def oauth_callback(
    provider: str,
    code: str = Query(...),
    state: str = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    key = OAUTH_STATES.pop(state, None)
    if not key:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    _, ws = get_user_org_workspace(db, user)
    conn = get_connector(provider)
    tokens = conn.exchange_code(code, "http://localhost:3000/dashboard/integrations")
    row = db.query(Integration).filter(Integration.workspace_id == ws.id, Integration.provider == provider).first()
    if not row:
        row = Integration(workspace_id=ws.id, provider=provider)
        db.add(row)
    row.access_token = tokens.get("access_token")
    row.refresh_token = tokens.get("refresh_token")
    row.status = "connected"
    db.commit()
    enqueue_connector_sync(provider, row.id)
    return {"ok": True, "provider": provider, "status": "connected"}


@router.post("/{provider}/demo-connect")
def demo_connect(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Instant connect for demo — stores mock token and runs first sync."""
    if provider not in CONNECTOR_REGISTRY:
        raise HTTPException(status_code=404, detail="Provider not supported")
    _, ws = get_user_org_workspace(db, user)
    row = db.query(Integration).filter(Integration.workspace_id == ws.id, Integration.provider == provider).first()
    if not row:
        row = Integration(workspace_id=ws.id, provider=provider)
        db.add(row)
    row.access_token = f"demo_{provider}_token"
    row.status = "connected"
    db.commit()
    return enqueue_connector_sync(provider, row.id)


@router.post("/{provider}/sync")
def sync_provider(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    row = db.query(Integration).filter(Integration.workspace_id == ws.id, Integration.provider == provider).first()
    if not row:
        raise HTTPException(status_code=404, detail="Integration not connected")
    row.status = "syncing"
    db.commit()
    result = enqueue_connector_sync(provider, row.id)
    return result


@router.delete("/{provider}")
def disconnect_provider(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    row = db.query(Integration).filter(Integration.workspace_id == ws.id, Integration.provider == provider).first()
    if row:
        db.delete(row)
        db.commit()
    return {"ok": True}
