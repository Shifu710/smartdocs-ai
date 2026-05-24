from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.api.deps import CurrentUser, SessionDep, require_platform_admin
from app.models.user import User
from app.models.workspace import Workspace
from app.services.demo_seed_service import seed_demo_data


router = APIRouter(dependencies=[Depends(require_platform_admin)])


@router.get("/stats")
async def platform_stats(session: SessionDep, current_user: CurrentUser) -> dict[str, int | str]:
    user_count = await session.scalar(select(func.count()).select_from(User))
    workspace_count = await session.scalar(select(func.count()).select_from(Workspace))
    return {
        "requested_by": current_user.email,
        "users": int(user_count or 0),
        "workspaces": int(workspace_count or 0),
    }


@router.post("/seed-demo")
async def seed_demo(session: SessionDep) -> dict[str, int | str]:
    return await seed_demo_data(session)
