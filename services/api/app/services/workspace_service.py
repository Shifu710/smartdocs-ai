import re

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_transaction import CreditTransaction
from app.models.user import User
from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate, WorkspaceDashboard, WorkspaceRead


ROLE_ORDER = {
    "viewer": 10,
    "member": 20,
    "admin": 30,
    "owner": 40,
}


class WorkspaceService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.workspaces = WorkspaceRepository(session)

    async def create_workspace(self, payload: WorkspaceCreate, current_user: User) -> WorkspaceRead:
        slug = payload.slug or slugify(payload.name)
        slug = await self._unique_slug(slug)

        workspace = await self.workspaces.create(name=payload.name, slug=slug, owner_id=current_user.id)
        await self.workspaces.add_member(workspace_id=workspace.id, user_id=current_user.id, role="owner")
        self.session.add(
            CreditTransaction(
                workspace_id=workspace.id,
                user_id=current_user.id,
                transaction_type="initial_grant",
                amount=workspace.credits,
                balance_after=workspace.credits,
                transaction_metadata={"source": "workspace_created"},
            )
        )
        await self.session.commit()
        await self.session.refresh(workspace)
        return workspace_to_read(workspace, role="owner")

    async def list_workspaces(self, current_user: User) -> list[WorkspaceRead]:
        rows = await self.workspaces.list_for_user(current_user.id)
        return [workspace_to_read(workspace, role=role) for workspace, role in rows]

    async def get_dashboard(self, workspace: Workspace, role: str) -> WorkspaceDashboard:
        counts = await self.workspaces.dashboard_counts(workspace.id)
        return WorkspaceDashboard(
            workspace=workspace_to_read(workspace, role=role),
            **counts,
        )

    async def _unique_slug(self, base_slug: str) -> str:
        slug = slugify(base_slug)
        candidate = slug
        suffix = 2
        while await self.workspaces.get_by_slug(candidate):
            candidate = f"{slug}-{suffix}"
            suffix += 1
        return candidate


def workspace_to_read(workspace: Workspace, role: str | None = None) -> WorkspaceRead:
    return WorkspaceRead.model_validate(workspace).model_copy(update={"role": role})


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "workspace"


def role_at_least(actual: str, minimum: str) -> bool:
    return ROLE_ORDER.get(actual, 0) >= ROLE_ORDER.get(minimum, 0)


def assert_workspace_role(actual: str, minimum: str) -> None:
    if not role_at_least(actual, minimum):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient workspace permissions")
