"""User registration, login, and workspace bootstrap."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models import Organization, User, Workspace
from app.schemas.auth import AuthResponse, RegisterRequest, UserResponse
from app.config import get_settings

settings = get_settings()


def user_to_response(user: User) -> UserResponse:
    parts = (user.full_name or "").split(" ", 1)
    return UserResponse(
        id=user.id,
        email=user.email,
        firstName=parts[0] if parts else "",
        lastName=parts[1] if len(parts) > 1 else "",
        username=user.username or user.email.split("@")[0],
        company=user.company,
        role=user.role,
        avatarUrl=user.avatar_url,
        locale=user.locale,
        createdAt=user.created_at.isoformat() if user.created_at else datetime.now(timezone.utc).isoformat(),
    )


def bootstrap_org_workspace(db: Session, user: User) -> tuple[Organization, Workspace]:
    org = Organization(
        owner_id=user.id,
        name=user.company or f"{user.full_name}'s Organization",
        industry="",
        size="",
    )
    db.add(org)
    db.flush()
    ws = Workspace(
        organization_id=org.id,
        name="Transformation",
        workspace_type="transformation",
    )
    db.add(ws)
    db.flush()
    return org, ws


def register_user(db: Session, payload: RegisterRequest) -> AuthResponse:
    email = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("email_taken")
    full_name = f"{payload.firstName} {payload.lastName}".strip()
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=full_name,
        username=payload.username or email.split("@")[0],
        company=payload.company,
        role=payload.role or "member",
    )
    db.add(user)
    db.flush()
    org, ws = bootstrap_org_workspace(db, user)
    db.commit()
    db.refresh(user)
    return _build_auth_response(user, org.id, ws.id)


def login_user(db: Session, email: str, password: str, remember: bool = False) -> AuthResponse:
    user = db.query(User).filter(User.email == email.strip().lower()).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("invalid_credentials")
    org = db.query(Organization).filter(Organization.owner_id == user.id).first()
    ws = db.query(Workspace).filter(Workspace.organization_id == org.id).first() if org else None
    return _build_auth_response(user, org.id if org else None, ws.id if ws else None, remember=remember)


def refresh_session(db: Session, refresh_token: str) -> AuthResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("invalid_token")
    user = db.get(User, payload.get("sub"))
    if not user:
        raise ValueError("invalid_token")
    org = db.query(Organization).filter(Organization.owner_id == user.id).first()
    ws = db.query(Workspace).filter(Workspace.organization_id == org.id).first() if org else None
    return _build_auth_response(user, org.id if org else None, ws.id if ws else None)


def _build_auth_response(
    user: User,
    organization_id: str | None,
    workspace_id: str | None,
    remember: bool = False,
) -> AuthResponse:
    days = settings.refresh_token_expire_days if remember else 7
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return AuthResponse(
        token=create_access_token(user.id, {"org": organization_id, "ws": workspace_id}),
        refreshToken=create_refresh_token(user.id),
        user=user_to_response(user),
        expiresAt=expires.isoformat(),
        workspaceId=workspace_id,
        organizationId=organization_id,
    )
