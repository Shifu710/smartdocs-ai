from datetime import datetime

from pydantic import BaseModel


class UsageLogRead(BaseModel):
    id: str
    workspace_id: str
    user_id: str | None
    operation_type: str
    provider: str | None
    model: str | None
    status: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    credits_deducted: int
    latency_ms: int | None
    error_message: str | None
    langfuse_trace_id: str | None
    log_metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class CreditTransactionRead(BaseModel):
    id: str
    workspace_id: str
    user_id: str | None
    transaction_type: str
    amount: int
    balance_after: int
    transaction_metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class UsageSummary(BaseModel):
    credits: int
    total_calls: int
    successful_calls: int
    failed_calls: int
    total_credits_used: int
    logs: list[UsageLogRead]
    transactions: list[CreditTransactionRead]

