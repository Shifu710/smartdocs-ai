from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, SessionDep, WorkspaceContext
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService


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
async def list_conversations() -> list[dict]:
    return []


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(conversation_id: str) -> list[dict]:
    return []
