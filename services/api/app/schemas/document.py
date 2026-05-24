from datetime import datetime

from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: str
    workspace_id: str
    uploaded_by_id: str | None
    original_filename: str
    file_type: str
    mime_type: str | None
    file_size_bytes: int
    file_hash: str
    status: str
    error_message: str | None
    chunk_count: int
    last_indexed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentChunkRead(BaseModel):
    id: str
    workspace_id: str
    document_id: str
    chunk_index: int
    content: str
    page_number: int | None
    token_count: int
    chunk_metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentDetail(DocumentRead):
    chunks: list[DocumentChunkRead] = []

