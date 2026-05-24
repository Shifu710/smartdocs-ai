from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, SessionDep, WorkspaceContext
from app.models.conversation import Conversation
from app.schemas.chat import ChatRequest
from app.schemas.conversation import ConversationCreate, ConversationRead, MessageRead
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
        conversation_id=payload.conversation_id,
    )
    return StreamingResponse(generator, media_type="text/event-stream")


@router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(session: SessionDep, context: WorkspaceContext) -> list[ConversationRead]:
    workspace, _member = context
    result = await session.execute(
        select(Conversation)
        .where(Conversation.workspace_id == workspace.id)
        .order_by(Conversation.updated_at.desc())
        .limit(20)
    )
    return [ConversationRead.model_validate(conversation) for conversation in result.scalars().all()]


@router.post("/conversations", response_model=ConversationRead, status_code=201)
async def create_conversation(
    payload: ConversationCreate,
    session: SessionDep,
    context: WorkspaceContext,
    current_user: CurrentUser,
) -> ConversationRead:
    workspace, _member = context
    conversation = Conversation(workspace_id=workspace.id, user_id=current_user.id, title=payload.title, status="active")
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return ConversationRead.model_validate(conversation)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageRead])
async def list_messages(conversation_id: str, session: SessionDep, context: WorkspaceContext) -> list[MessageRead]:
    workspace, _member = context
    result = await session.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.workspace_id == workspace.id)
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        return []
    messages = sorted(conversation.messages, key=lambda message: message.created_at)
    return [MessageRead.model_validate(message) for message in messages]
