"""Hybrid knowledge retrieval — keyword + semantic search (JSON embeddings, no pgvector required)."""

from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk, Project
from app.services import embeddings
from app.services.vector_utils import as_float_list, cosine_similarity

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
    """Semantic search using stored JSON embeddings (works without pgvector)."""
    vectors = embeddings.generate_embeddings([query])
    if not vectors:
        return []
    query_vec = vectors[0]

    rows = (
        db.query(DocumentChunk, Document)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(
            Document.workspace_id == workspace_id,
            DocumentChunk.embedding.isnot(None),
        )
        .all()
    )

    hits: list[RetrievalHit] = []
    for chunk, doc in rows:
        emb = as_float_list(chunk.embedding)
        if not emb:
            continue
        score = cosine_similarity(query_vec, emb)
        if score <= 0:
            continue
        hits.append(
            RetrievalHit(
                doc.id,
                doc.file_name,
                (chunk.chunk_text or "")[:240],
                float(score),
                "chunk",
            )
        )

    return sorted(hits, key=lambda h: h.score, reverse=True)[:limit]


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
