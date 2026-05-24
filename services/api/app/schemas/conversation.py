from datetime import datetime

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    title: str = Field(default="New chat", max_length=220)


class ConversationRead(BaseModel):
    id: str
    workspace_id: str
    user_id: str | None
    title: str
    status: str
    provider: str | None
    model: str | None
    total_tokens: int
    credits_used: int
    trace_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageRead(BaseModel):
    id: str
    workspace_id: str
    conversation_id: str
    user_id: str | None
    role: str
    content: str
    provider: str | None
    model: str | None
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    credits_used: int
    latency_ms: int | None
    trace_id: str | None
    citations: list
    message_metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}
