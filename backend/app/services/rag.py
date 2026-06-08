"""RAG orchestration — intent, retrieval, context assembly, LLM reasoning."""

from __future__ import annotations

from typing import Iterator, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.services.ai_copilot import EngineContext, mock_answer, openai_chat, system_prompt
from app.services.knowledge_engine import RetrievalHit, build_context_block, hybrid_retrieve

settings = get_settings()

INTENT_KEYWORDS = {
    "risk": ["risk", "at-risk", "mitigation", "vulnerability", "threat"],
    "cost": ["cost", "budget", "spend", "forecast", "savings", "overrun"],
    "roadmap": ["roadmap", "timeline", "milestone", "phase", "dependency"],
    "sprint": ["sprint", "velocity", "scrum", "story", "backlog"],
    "diagram": ["diagram", "mermaid", "architecture", "flowchart", "chart"],
}


def detect_intent(query: str) -> str:
    q = query.lower()
    for intent, words in INTENT_KEYWORDS.items():
        if any(w in q for w in words):
            return intent
    return "general"


def _attachments_block(attachments: list[dict] | None, document_text: Optional[str] = None) -> str:
    parts: list[str] = []
    if attachments:
        for i, att in enumerate(attachments, 1):
            title = att.get("title") or att.get("fileName") or f"Document {i}"
            content = (att.get("content") or "")[:12000]
            parts.append(f"--- Document {i}: {title} ---\n{content}")
    if document_text:
        parts.append(f"--- Document ---\n{document_text[:12000]}")
    return "\n\n".join(parts)


def assemble_messages(
    query: str,
    hits: list[RetrievalHit],
    ctx: Optional[EngineContext] = None,
    document_text: Optional[str] = None,
    attachments: list[dict] | None = None,
) -> list[dict]:
    intent = detect_intent(query)
    knowledge = build_context_block(hits)
    doc_block = _attachments_block(attachments, document_text)
    sys = (
        f"{system_prompt(ctx)}\n"
        f"Detected intent: {intent}. Use retrieved knowledge, uploaded documents, and portfolio context. "
        "Answer follow-up questions about attached documents. Cite sources by number [1], [2]. Be actionable."
    )
    user_parts = [f"Retrieved knowledge:\n{knowledge}"]
    if doc_block:
        user_parts.append(f"User-attached documents (use as primary source when relevant):\n{doc_block}")
    user_parts.append(f"User question: {query}")
    return [
        {"role": "system", "content": sys},
        {"role": "user", "content": "\n\n".join(user_parts)},
    ]


def citations_from_hits(hits: list[RetrievalHit]) -> list[dict]:
    return [
        {
            "sourceId": h.source_id,
            "title": h.title,
            "snippet": h.snippet,
            "score": round(h.score, 2),
        }
        for h in hits
    ]


def suggested_actions(intent: str) -> list[dict]:
    actions = {
        "risk": [{"id": "a1", "label": "Open Risk Dashboard", "kind": "navigate", "payload": "/dashboard/risks"}],
        "cost": [{"id": "a2", "label": "View Cost Analytics", "kind": "navigate", "payload": "/dashboard/cost"}],
        "roadmap": [{"id": "a3", "label": "Open Roadmap", "kind": "navigate", "payload": "/dashboard/roadmap"}],
        "diagram": [{"id": "a4", "label": "Open Mermaid Studio", "kind": "navigate", "payload": "/dashboard/mermaid"}],
    }
    return actions.get(intent, [{"id": "a0", "label": "Knowledge Center", "kind": "navigate", "payload": "/dashboard/knowledge"}])


def rag_answer(
    db: Session,
    workspace_id: str,
    query: str,
    ctx: Optional[EngineContext] = None,
    document_text: Optional[str] = None,
    attachments: list[dict] | None = None,
) -> dict:
    attach_text = " ".join((a.get("content") or "")[:500] for a in (attachments or []))
    hits = hybrid_retrieve(db, workspace_id, query or attach_text or document_text or "transformation", top_k=8)
    intent = detect_intent(query or "document analysis")
    if not settings.openai_enabled:
        content = mock_answer(query or "document")
        if document_text:
            content = f"Document analysis (mock): {len(document_text.split())} words. Key themes from user content."
        return {
            "content": content,
            "citations": citations_from_hits(hits),
            "actions": suggested_actions(intent),
            "contextUsed": ["mock mode", *[h.title for h in hits[:3]]],
            "mock": True,
        }
    messages = assemble_messages(query, hits, ctx, document_text, attachments)
    content = openai_chat(messages)
    doc_titles = [a.get("title", "Document") for a in (attachments or [])]
    return {
        "content": content,
        "citations": citations_from_hits(hits),
        "actions": suggested_actions(intent),
        "contextUsed": ["RAG retrieval", "OpenAI", *doc_titles, *[h.title for h in hits[:4]]],
        "mock": False,
        "model": settings.openai_model,
    }


def rag_stream(
    db: Session,
    workspace_id: str,
    query: str,
    ctx: Optional[EngineContext] = None,
    attachments: list[dict] | None = None,
) -> Iterator[str]:
    """Stream tokens via OpenAI streaming API."""
    attach_text = " ".join((a.get("content") or "")[:500] for a in (attachments or []))
    hits = hybrid_retrieve(db, workspace_id, query or attach_text, top_k=8)
    if not settings.openai_enabled:
        text = mock_answer(query)
        for word in text.split(" "):
            yield word + " "
        return
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    messages = assemble_messages(query, hits, ctx, attachments=attachments)
    stream = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
