from sqlalchemy.orm import Session

from app.models import AuditLog


def log_action(db: Session, organization_id: str, user_id: str, action: str, details: dict | None = None) -> None:
    entry = AuditLog(
        organization_id=organization_id,
        user_id=user_id,
        action=action,
        details=details or {},
    )
    db.add(entry)
    db.commit()
