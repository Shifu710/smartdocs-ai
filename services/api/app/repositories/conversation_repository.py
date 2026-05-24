from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, Message


class ConversationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, *, workspace_id: str, user_id: str | None, title: str) -> Conversation:
        conversation = Conversation(workspace_id=workspace_id, user_id=user_id, title=title[:220], status="active")
        self.session.add(conversation)
        await self.session.flush()
        return conversation

    async def get(self, *, workspace_id: str, conversation_id: str, with_messages: bool = False) -> Conversation | None:
        statement = select(Conversation).where(
            Conversation.workspace_id == workspace_id,
            Conversation.id == conversation_id,
        )
        if with_messages:
            statement = statement.options(selectinload(Conversation.messages))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def list(self, *, workspace_id: str, limit: int = 20) -> list[Conversation]:
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.workspace_id == workspace_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_message(
        self,
        *,
        workspace_id: str,
        conversation_id: str,
        user_id: str | None,
        role: str,
        content: str,
        provider: str | None = None,
        model: str | None = None,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        total_tokens: int = 0,
        credits_used: int = 0,
        latency_ms: int | None = None,
        trace_id: str | None = None,
        citations: list | None = None,
        metadata: dict | None = None,
    ) -> Message:
        message = Message(
            workspace_id=workspace_id,
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            provider=provider,
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            credits_used=credits_used,
            latency_ms=latency_ms,
            trace_id=trace_id,
            citations=citations or [],
            message_metadata=metadata or {},
        )
        self.session.add(message)
        await self.session.flush()
        return message
