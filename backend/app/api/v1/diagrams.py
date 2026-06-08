from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.services.ai_copilot import extract_mermaid, openai_chat
from app.services.export_engine import export_and_store
from app.services.workspace import get_user_org_workspace
from app.config import get_settings

router = APIRouter(prefix="/diagrams", tags=["diagrams"])
settings = get_settings()


class DiagramRequest(BaseModel):
    prompt: str
    context: str = ""


class DiagramResponse(BaseModel):
    code: str
    note: str
    storageUrl: str | None = None
    mock: bool = False


@router.post("/mermaid", response_model=DiagramResponse)
def generate_diagram(req: DiagramRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org, ws = get_user_org_workspace(db, user)
    if not settings.openai_enabled:
        code = "flowchart LR\n  Data[User Data] --> RAG[RAG Engine]\n  RAG --> AI[4CHGM Copilot]"
        return DiagramResponse(code=code, note="Mock diagram", mock=True)
    raw = openai_chat(
        [
            {"role": "system", "content": "Return ONLY valid Mermaid in a ```mermaid block. Enterprise style."},
            {"role": "user", "content": f"{req.prompt}\n\nContext:\n{req.context}"},
        ]
    )
    code = extract_mermaid(raw)
    key, url = export_and_store(
        code.encode("utf-8"),
        "diagram.mmd",
        "diagrams",
        org.id,
        ws.id,
        user.id,
        "text/plain",
    )
    return DiagramResponse(code=code, note="AI-generated — stored on R2", storageUrl=url, mock=False)
