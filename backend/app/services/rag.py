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


def assemble_messages(
    query: str,
    hits: list[RetrievalHit],
    ctx: Optional[EngineContext] = None,
    document_text: Optional[str] = None,
) -> list[dict]:
    intent = detect_intent(query)
    knowledge = build_context_block(hits)
    sys = (
        f"{system_prompt(ctx)}\n"
        f"Detected intent: {intent}. Use retrieved knowledge and portfolio context. "
        "Cite sources by number [1], [2]. Be actionable."
    )
    user_parts = [f"Retrieved knowledge:\n{knowledge}"]
    if document_text:
        user_parts.append(f"Uploaded document excerpt:\n{document_text[:12000]}")
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
) -> dict:
    hits = hybrid_retrieve(db, workspace_id, query or document_text or "transformation", top_k=8)
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
    messages = assemble_messages(query, hits, ctx, document_text)
    content = openai_chat(messages)
    return {
        "content": content,
        "citations": citations_from_hits(hits),
        "actions": suggested_actions(intent),
        "contextUsed": ["RAG retrieval", "OpenAI", *[h.title for h in hits[:4]]],
        "mock": False,
        "model": settings.openai_model,
    }


def rag_stream(
    db: Session,
    workspace_id: str,
    query: str,
    ctx: Optional[EngineContext] = None,
) -> Iterator[str]:
    """Stream tokens via OpenAI streaming API."""
    hits = hybrid_retrieve(db, workspace_id, query, top_k=8)
    if not settings.openai_enabled:
        text = mock_answer(query)
        for word in text.split(" "):
            yield word + " "
        return
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    messages = assemble_messages(query, hits, ctx)
    stream = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
