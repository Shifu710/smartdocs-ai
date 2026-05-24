from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep, WorkspaceContext
from app.schemas.workspace import WorkspaceCreate, WorkspaceDashboard, WorkspaceRead
from app.services.workspace_service import WorkspaceService


router = APIRouter()


@router.get("", response_model=list[WorkspaceRead])
async def list_workspaces(session: SessionDep, current_user: CurrentUser) -> list[WorkspaceRead]:
    return await WorkspaceService(session).list_workspaces(current_user)


@router.post("", response_model=WorkspaceRead, status_code=201)
async def create_workspace(
    payload: WorkspaceCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> WorkspaceRead:
    return await WorkspaceService(session).create_workspace(payload, current_user)


@router.get("/{workspace_id}/dashboard", response_model=WorkspaceDashboard)
async def get_workspace_dashboard(
    session: SessionDep,
    context: WorkspaceContext,
) -> WorkspaceDashboard:
    workspace, member = context
    return await WorkspaceService(session).get_dashboard(workspace, role=member.role)
