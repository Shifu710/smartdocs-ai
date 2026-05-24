from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document
from app.models.usage_log import UsageLog
from app.models.workspace import Workspace, WorkspaceMember


class WorkspaceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_slug(self, slug: str) -> Workspace | None:
        result = await self.session.execute(select(Workspace).where(Workspace.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_id(self, workspace_id: str) -> Workspace | None:
        result = await self.session.execute(
            select(Workspace)
            .options(selectinload(Workspace.members))
            .where(Workspace.id == workspace_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: str) -> list[tuple[Workspace, str]]:
        result = await self.session.execute(
            select(Workspace, WorkspaceMember.role)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id)
            .order_by(Workspace.created_at.desc())
        )
        return list(result.all())

    async def create(self, *, name: str, slug: str, owner_id: str, credits: int = 1000) -> Workspace:
        workspace = Workspace(name=name, slug=slug, owner_id=owner_id, credits=credits)
        self.session.add(workspace)
        await self.session.flush()
        return workspace

    async def add_member(self, *, workspace_id: str, user_id: str, role: str) -> WorkspaceMember:
        member = WorkspaceMember(workspace_id=workspace_id, user_id=user_id, role=role)
        self.session.add(member)
        await self.session.flush()
        return member

    async def get_member(self, *, workspace_id: str, user_id: str) -> WorkspaceMember | None:
        result = await self.session.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def dashboard_counts(self, workspace_id: str) -> dict[str, int]:
        members_result = await self.session.execute(
            select(func.count()).select_from(WorkspaceMember).where(WorkspaceMember.workspace_id == workspace_id)
        )
        documents_result = await self.session.execute(
            select(func.count()).select_from(Document).where(Document.workspace_id == workspace_id)
        )
        indexed_result = await self.session.execute(
            select(func.count())
            .select_from(Document)
            .where(Document.workspace_id == workspace_id, Document.status == "indexed")
        )
        usage_result = await self.session.execute(
            select(func.count()).select_from(UsageLog).where(UsageLog.workspace_id == workspace_id)
        )

        return {
            "member_count": int(members_result.scalar_one()),
            "document_count": int(documents_result.scalar_one()),
            "indexed_document_count": int(indexed_result.scalar_one()),
            "recent_usage_count": int(usage_result.scalar_one()),
        }
