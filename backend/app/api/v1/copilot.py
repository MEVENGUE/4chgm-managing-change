import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import CopilotMessage, CopilotThread, User
from app.schemas.copilot import (
    CopilotChatRequest,
    CopilotChatResponse,
    DocumentChatRequest,
    ThreadMessageResponse,
    ThreadResponse,
)
from app.services.rag import (
    citations_from_hits,
    detect_intent,
    hybrid_retrieve,
    rag_answer,
    rag_stream,
    suggested_actions,
)
from app.services.workspace import get_user_org_workspace

router = APIRouter(prefix="/copilot", tags=["copilot"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_or_create_thread(db: Session, user: User, workspace_id: str, thread_id: str | None, title: str) -> CopilotThread:
    if thread_id:
        thread = db.query(CopilotThread).filter(
            CopilotThread.id == thread_id,
            CopilotThread.user_id == user.id,
        ).first()
        if thread:
            return thread
    thread = CopilotThread(workspace_id=workspace_id, user_id=user.id, title=title[:80])
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def _save_messages(db: Session, thread: CopilotThread, user_content: str, assistant: dict) -> tuple[str, str]:
    user_msg = CopilotMessage(thread_id=thread.id, role="user", content=user_content)
    asst_msg = CopilotMessage(
        thread_id=thread.id,
        role="assistant",
        content=assistant["content"],
        citations=assistant.get("citations", []),
    )
    db.add(user_msg)
    db.add(asst_msg)
    thread.title = thread.title if thread.title != "New thread" else user_content[:60]
    db.commit()
    db.refresh(user_msg)
    db.refresh(asst_msg)
    return user_msg.id, asst_msg.id


@router.get("/threads", response_model=list[ThreadResponse])
def list_threads(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    threads = (
        db.query(CopilotThread)
        .filter(CopilotThread.user_id == user.id, CopilotThread.workspace_id == ws.id)
        .order_by(CopilotThread.created_at.desc())
        .limit(30)
        .all()
    )
    out = []
    for t in threads:
        msgs = db.query(CopilotMessage).filter(CopilotMessage.thread_id == t.id).order_by(CopilotMessage.created_at).all()
        out.append(
            ThreadResponse(
                id=t.id,
                title=t.title,
                createdAt=t.created_at.isoformat() if t.created_at else "",
                updatedAt=msgs[-1].created_at.isoformat() if msgs else "",
                messages=[
                    ThreadMessageResponse(
                        id=m.id, role=m.role, content=m.content,
                        citations=m.citations or [],
                        createdAt=m.created_at.isoformat() if m.created_at else "",
                    )
                    for m in msgs
                ],
            )
        )
    return out


@router.post("/chat", response_model=CopilotChatResponse)
def copilot_chat(req: CopilotChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    thread = _get_or_create_thread(db, user, ws.id, req.threadId, req.prompt)
    result = rag_answer(db, ws.id, req.prompt, req.context)
    _, msg_id = _save_messages(db, thread, req.prompt, result)
    intent = detect_intent(req.prompt)
    return CopilotChatResponse(
        content=result["content"],
        threadId=thread.id,
        messageId=msg_id,
        citations=result.get("citations", []),
        actions=result.get("actions", suggested_actions(intent)),
        contextUsed=result.get("contextUsed", []),
        model=result.get("model"),
        mock=result.get("mock", False),
    )


@router.post("/chat/document", response_model=CopilotChatResponse)
def copilot_document(req: DocumentChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.consentAccepted:
        return CopilotChatResponse(
            content="Document analysis requires consent under the 4CHGM data policy.",
            threadId=req.threadId or str(uuid.uuid4()),
            messageId=str(uuid.uuid4()),
            mock=True,
        )
    _, ws = get_user_org_workspace(db, user)
    thread = _get_or_create_thread(db, user, ws.id, req.threadId, req.title)
    result = rag_answer(db, ws.id, f"Analyze document: {req.title}", req.context, req.content[:50000])
    _, msg_id = _save_messages(db, thread, f"Document: {req.title}", result)
    return CopilotChatResponse(
        content=result["content"],
        threadId=thread.id,
        messageId=msg_id,
        citations=result.get("citations", []),
        actions=result.get("actions", []),
        contextUsed=result.get("contextUsed", []),
        model=result.get("model"),
        mock=result.get("mock", False),
    )


@router.post("/chat/stream")
def copilot_stream(req: CopilotChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    thread = _get_or_create_thread(db, user, ws.id, req.threadId, req.prompt)
    hits = hybrid_retrieve(db, ws.id, req.prompt, top_k=8)
    citations = citations_from_hits(hits)

    thread_id = thread.id

    def event_generator():
        from app.database import SessionLocal

        full = ""
        for token in rag_stream(db, ws.id, req.prompt, req.context):
            full += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        local_db = SessionLocal()
        try:
            user_msg = CopilotMessage(thread_id=thread_id, role="user", content=req.prompt)
            asst = CopilotMessage(thread_id=thread_id, role="assistant", content=full, citations=citations)
            local_db.add(user_msg)
            local_db.add(asst)
            local_db.commit()
            local_db.refresh(asst)
            msg_id = asst.id
        finally:
            local_db.close()
        yield f"data: {json.dumps({'type': 'done', 'threadId': thread_id, 'citations': citations, 'messageId': msg_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
