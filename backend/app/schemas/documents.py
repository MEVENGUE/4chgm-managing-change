from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    workspace_id: str
    file_name: str
    file_type: str
    source_type: str
    storage_url: str
    status: str
    extracted_text: str
    metadata: dict
    created_at: str


class DocumentSearchResult(BaseModel):
    document_id: str
    file_name: str
    snippet: str
    score: float
