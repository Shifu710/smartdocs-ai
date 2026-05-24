from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, SessionDep, WorkspaceContext
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService
from app.models.usage_log import UsageLog
from sqlalchemy import select


router = APIRouter()


@router.post("/chat/stream")
async def chat_stream(
    payload: ChatRequest,
    session: SessionDep,
    context: WorkspaceContext,
    current_user: CurrentUser,
):
    workspace, _member = context
    generator = ChatService(session).stream_chat(
        workspace=workspace,
        current_user=current_user,
        question=payload.question,
        document_ids=payload.document_ids,
    )
    return StreamingResponse(generator, media_type="text/event-stream")


@router.get("/conversations")
async def list_conversations(session: SessionDep, context: WorkspaceContext) -> list[dict]:
    workspace, _member = context
    result = await session.execute(
        select(UsageLog)
        .where(UsageLog.workspace_id == workspace.id, UsageLog.operation_type == "rag_chat")
        .order_by(UsageLog.created_at.desc())
        .limit(20)
    )
    return [
        {
            "id": log.id,
            "title": (log.log_metadata or {}).get("question", "RAG chat"),
            "status": log.status,
            "provider": log.provider,
            "model": log.model,
            "created_at": log.created_at,
        }
        for log in result.scalars().all()
    ]


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(conversation_id: str, session: SessionDep, context: WorkspaceContext) -> list[dict]:
    workspace, _member = context
    result = await session.execute(
        select(UsageLog).where(UsageLog.id == conversation_id, UsageLog.workspace_id == workspace.id)
    )
    log = result.scalar_one_or_none()
    if not log:
        return []
    metadata = log.log_metadata or {}
    return [
        {"role": "user", "content": metadata.get("question", "Question not stored"), "created_at": log.created_at},
        {
            "role": "assistant",
            "content": metadata.get("answer_preview", "Answer content is available in the streamed response."),
            "citations": metadata.get("citations", []),
            "provider": log.provider,
            "model": log.model,
            "credits": log.credits_deducted,
            "trace_id": log.langfuse_trace_id,
            "created_at": log.created_at,
        },
    ]
