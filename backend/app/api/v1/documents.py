from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import Document, User
from app.schemas.documents import DocumentResponse, DocumentSearchResult
from app.services import audit, ingestion, storage
from app.services.knowledge_engine import hybrid_retrieve
from app.services.workspace import get_user_org_workspace
from app.workers.tasks import enqueue_document_processing

router = APIRouter(prefix="/documents", tags=["documents"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024


def _to_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        workspace_id=doc.workspace_id,
        file_name=doc.file_name,
        file_type=doc.file_type,
        source_type=doc.source_type,
        storage_url=doc.storage_url,
        status=doc.status,
        extracted_text=doc.extracted_text[:2000],
        metadata=doc.metadata_ or {},
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )


@router.get("/search/semantic", response_model=list[DocumentSearchResult])
def search_documents(
    q: str = Query(..., min_length=2),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _, ws = get_user_org_workspace(db, user)
    hits = hybrid_retrieve(db, ws.id, q, top_k=8)
    return [
        DocumentSearchResult(
            document_id=h.source_id,
            file_name=h.title,
            snippet=h.snippet,
            score=h.score,
        )
        for h in hits
    ]


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org, ws = get_user_org_workspace(db, user)
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 10MB)")

    file_name = file.filename or "upload.bin"
    file_type = ingestion.detect_file_type(file_name)
    storage_key, storage_url = storage.upload_file(
        content,
        file_name,
        bucket_type="uploads",
        organization_id=org.id,
        workspace_id=ws.id,
        user_id=user.id,
        content_type=file.content_type or "application/octet-stream",
    )

    doc = Document(
        workspace_id=ws.id,
        user_id=user.id,
        file_name=file_name,
        file_type=file_type,
        source_type="upload",
        storage_url=storage_url,
        storage_key=storage_key,
        status="processing",
        metadata_={"size_bytes": len(content)},
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    audit.log_action(db, org.id, user.id, "document.upload", {"document_id": doc.id, "file_name": file_name})
    enqueue_document_processing(doc.id)
    return _to_response(doc)


@router.get("", response_model=list[DocumentResponse])
def list_documents(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    docs = db.query(Document).filter(Document.workspace_id == ws.id).order_by(Document.created_at.desc()).all()
    return [_to_response(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == ws.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return _to_response(doc)


@router.post("/{document_id}/parse", response_model=DocumentResponse)
def parse_document(document_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _, ws = get_user_org_workspace(db, user)
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == ws.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    from app.workers.tasks import process_document_sync

    process_document_sync(db, doc.id)
    db.refresh(doc)
    return _to_response(doc)
