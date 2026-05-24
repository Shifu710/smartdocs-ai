from fastapi import APIRouter

from app.api.deps import SessionDep, WorkspaceContext
from app.schemas.usage import UsageSummary
from app.services.usage_service import UsageService


router = APIRouter()


@router.get("", response_model=UsageSummary)
async def get_usage(session: SessionDep, context: WorkspaceContext) -> UsageSummary:
    workspace, _member = context
    return await UsageService(session).get_summary(workspace)
