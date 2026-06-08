"""Background tasks — document parsing and embedding pipeline."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Document, DocumentChunk
from app.services import embeddings, ingestion, storage
from app.workers.celery_app import celery_app


def process_document_sync(db: Session, document_id: str) -> None:
    doc = db.get(Document, document_id)
    if not doc:
        return

    file_bytes = storage.read_local_file(doc.storage_key)
    if not file_bytes and doc.storage_url.startswith("file://"):
        from pathlib import Path

        file_bytes = Path(doc.storage_url.replace("file://", "")).read_bytes()

    if not file_bytes:
        doc.status = "failed"
        doc.metadata_ = {**(doc.metadata_ or {}), "error": "file_not_found"}
        db.commit()
        return

    text, meta = ingestion.extract_text(file_bytes, doc.file_name)
    doc.extracted_text = text
    doc.metadata_ = {**(doc.metadata_ or {}), **meta}
    doc.status = "parsed" if text else "failed"

    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()
    chunks = ingestion.chunk_text(text)
    texts = [c["text"] for c in chunks]
    vectors = embeddings.generate_embeddings(texts) if texts else []

    for i, chunk in enumerate(chunks):
        dc = DocumentChunk(
            document_id=doc.id,
            chunk_text=chunk["text"],
            embedding=vectors[i] if i < len(vectors) else None,
            metadata_={"section": chunk.get("section", i)},
        )
        db.add(dc)

    doc.status = "indexed" if vectors else ("parsed" if text else "failed")
    db.commit()


@celery_app.task(name="app.workers.tasks.process_document")
def process_document(document_id: str) -> str:
    db = SessionLocal()
    try:
        process_document_sync(db, document_id)
        return document_id
    finally:
        db.close()


def enqueue_document_processing(document_id: str) -> None:
    try:
        process_document.delay(document_id)
    except Exception:
        db = SessionLocal()
        try:
            process_document_sync(db, document_id)
        finally:
            db.close()


def index_document_text(db: Session, document_id: str) -> None:
    doc = db.get(Document, document_id)
    if not doc or not doc.extracted_text:
        return
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()
    chunks = ingestion.chunk_text(doc.extracted_text)
    texts = [c["text"] for c in chunks]
    vectors = embeddings.generate_embeddings(texts) if texts else []
    for i, chunk in enumerate(chunks):
        db.add(
            DocumentChunk(
                document_id=doc.id,
                chunk_text=chunk["text"],
                embedding=vectors[i] if i < len(vectors) else None,
                metadata_={"section": chunk.get("section", i)},
            )
        )
    doc.status = "indexed" if vectors else "parsed"
    db.commit()


@celery_app.task(name="app.workers.tasks.sync_connector")
def sync_connector(integration_id: str) -> dict:
    db = SessionLocal()
    try:
        from app.models import Integration
        from app.services.connectors import get_connector

        row = db.get(Integration, integration_id)
        if not row:
            return {"error": "not_found"}
        conn = get_connector(row.provider)
        return conn.sync(db, row, row.workspace_id, row.workspace_id)
    finally:
        db.close()


def enqueue_connector_sync(provider: str, integration_id: str) -> dict:
    try:
        sync_connector.delay(integration_id)
        return {"provider": provider, "status": "syncing", "queued": True}
    except Exception:
        db = SessionLocal()
        try:
            from app.models import Integration
            from app.services.connectors import get_connector

            row = db.get(Integration, integration_id)
            if not row:
                return {"error": "not_found"}
            conn = get_connector(provider)
            return conn.sync(db, row, row.workspace_id, row.workspace_id)
        finally:
            db.close()
