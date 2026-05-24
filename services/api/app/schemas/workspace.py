from datetime import datetime

from pydantic import BaseModel, Field


class WorkspaceSettings(BaseModel):
    top_k_vector: int = Field(default=8, ge=1, le=50)
    top_k_keyword: int = Field(default=8, ge=1, le=50)
    final_top_k: int = Field(default=5, ge=1, le=20)
    min_relevance: float = Field(default=0.3, ge=0, le=1)
    max_context_tokens: int = Field(default=4000, ge=500, le=16000)


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str | None = Field(default=None, min_length=2, max_length=180)


class WorkspaceRead(BaseModel):
    id: str
    name: str
    slug: str
    owner_id: str
    credits: int
    settings: dict
    role: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceDashboard(BaseModel):
    workspace: WorkspaceRead
    member_count: int
    document_count: int
    indexed_document_count: int
    recent_usage_count: int


class WorkspaceMemberRead(BaseModel):
    id: str
    workspace_id: str
    user_id: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}
