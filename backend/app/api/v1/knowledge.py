from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.services.knowledge_engine import hybrid_retrieve
from app.services.workspace import get_user_org_workspace

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class KnowledgeHit(BaseModel):
    sourceId: str
    title: str
    snippet: str
    score: float
    sourceType: str


@router.get("/search", response_model=list[KnowledgeHit])
def knowledge_search(
    q: str = Query(..., min_length=2),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _, ws = get_user_org_workspace(db, user)
    hits = hybrid_retrieve(db, ws.id, q, top_k=10)
    return [
        KnowledgeHit(
            sourceId=h.source_id,
            title=h.title,
            snippet=h.snippet,
            score=round(h.score, 3),
            sourceType=h.source_type,
        )
        for h in hits
    ]
