from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    document_ids: list[str] = Field(default_factory=list)
    conversation_id: str | None = None


class Citation(BaseModel):
    document_id: str
    document_name: str
    chunk_id: str
    chunk_index: int
    page_number: int | None = None
    rrf_score: float
    preview: str


class RetrievalDebugItem(Citation):
    vector_rank: int | None = None
    keyword_rank: int | None = None
    vector_distance: float | None = None
    keyword_score: float | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: list[Citation]
    debug: list[RetrievalDebugItem]
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    credits_used: int
    latency_ms: int
    trace_id: str | None = None
