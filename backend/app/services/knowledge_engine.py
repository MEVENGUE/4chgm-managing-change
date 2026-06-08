"""Hybrid knowledge retrieval — keyword + pgvector semantic search."""

from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk, Project
from app.services import embeddings

STOP = frozenset({"the", "a", "an", "of", "to", "and", "for", "in", "on", "is", "are", "with", "our", "your"})


@dataclass
class RetrievalHit:
    source_id: str
    title: str
    snippet: str
    score: float
    source_type: str  # document | project | chunk


def _tokenize(text_value: str) -> set[str]:
    return {t for t in re.sub(r"[^a-z0-9\s]", " ", text_value.lower()).split() if len(t) > 2 and t not in STOP}


def keyword_search_documents(db: Session, workspace_id: str, query: str, limit: int = 5) -> list[RetrievalHit]:
    q = query.lower()
    tokens = _tokenize(query)
    docs = db.query(Document).filter(Document.workspace_id == workspace_id).all()
    hits: list[RetrievalHit] = []
    for doc in docs:
        hay = f"{doc.file_name} {doc.extracted_text or ''}".lower()
        overlap = sum(1 for t in tokens if t in hay)
        if overlap > 0 or q in hay:
            score = overlap / max(1, len(tokens))
            snippet = (doc.extracted_text or doc.file_name)[:240]
            hits.append(RetrievalHit(doc.id, doc.file_name, snippet, min(0.95, 0.4 + score * 0.15), "document"))
    return sorted(hits, key=lambda h: h.score, reverse=True)[:limit]


def vector_search_chunks(db: Session, workspace_id: str, query: str, limit: int = 6) -> list[RetrievalHit]:
    vectors = embeddings.generate_embeddings([query])
    if not vectors:
        return []
    vec_literal = "[" + ",".join(str(v) for v in vectors[0]) + "]"
    sql = text(
        """
        SELECT dc.document_id, d.file_name, dc.chunk_text,
               1 - (dc.embedding <=> CAST(:vec AS vector)) AS score
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        WHERE d.workspace_id = :ws AND dc.embedding IS NOT NULL
        ORDER BY dc.embedding <=> CAST(:vec AS vector)
        LIMIT :lim
        """
    )
    rows = db.execute(sql, {"vec": vec_literal, "ws": workspace_id, "lim": limit}).fetchall()
    return [
        RetrievalHit(r[0], r[1], (r[2] or "")[:240], float(r[3]), "chunk")
        for r in rows
    ]


def search_projects(db: Session, workspace_id: str, query: str, limit: int = 4) -> list[RetrievalHit]:
    tokens = _tokenize(query)
    projects = db.query(Project).filter(Project.workspace_id == workspace_id).all()
    hits: list[RetrievalHit] = []
    for p in projects:
        hay = f"{p.title} {p.description} {' '.join(p.tags or [])}".lower()
        overlap = sum(1 for t in tokens if t in hay)
        if overlap > 0:
            hits.append(
                RetrievalHit(
                    p.id,
                    p.title,
                    (p.description or "")[:240],
                    min(0.9, 0.35 + overlap * 0.12),
                    "project",
                )
            )
    return sorted(hits, key=lambda h: h.score, reverse=True)[:limit]


def hybrid_retrieve(db: Session, workspace_id: str, query: str, top_k: int = 8) -> list[RetrievalHit]:
    """Merge vector + keyword + project hits with score fusion."""
    seen: dict[str, RetrievalHit] = {}
    for hit in vector_search_chunks(db, workspace_id, query, top_k):
        key = f"{hit.source_type}:{hit.source_id}"
        if key not in seen or hit.score > seen[key].score:
            seen[key] = hit
    for hit in keyword_search_documents(db, workspace_id, query, top_k):
        key = f"{hit.source_type}:{hit.source_id}"
        if key not in seen:
            seen[key] = hit
        else:
            seen[key].score = min(0.99, seen[key].score + hit.score * 0.3)
    for hit in search_projects(db, workspace_id, query, 4):
        key = f"{hit.source_type}:{hit.source_id}"
        seen[key] = hit
    ranked = sorted(seen.values(), key=lambda h: h.score, reverse=True)
    return ranked[:top_k]


def build_context_block(hits: list[RetrievalHit]) -> str:
    if not hits:
        return "No indexed knowledge matched this query."
    lines = []
    for i, h in enumerate(hits, 1):
        lines.append(f"[{i}] ({h.source_type}) {h.title}: {h.snippet}")
    return "\n".join(lines)
