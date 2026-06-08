"""Workspace resolution for authenticated users."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Organization, User, Workspace


def get_user_org_workspace(db: Session, user: User, workspace_id: str | None = None) -> tuple[Organization, Workspace]:
    org = db.query(Organization).filter(Organization.owner_id == user.id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    if workspace_id:
        ws = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.organization_id == org.id).first()
    else:
        ws = db.query(Workspace).filter(Workspace.organization_id == org.id).first()
    if not ws:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return org, ws
