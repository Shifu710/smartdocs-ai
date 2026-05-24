from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace
from app.repositories.usage_repository import UsageRepository
from app.schemas.usage import UsageSummary


class UsageService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.usage = UsageRepository(session)

    async def get_summary(self, workspace: Workspace) -> UsageSummary:
        return UsageSummary(
            credits=workspace.credits,
            total_calls=await self.usage.total_calls(workspace.id),
            successful_calls=await self.usage.calls_by_status(workspace.id, "success"),
            failed_calls=await self.usage.calls_by_status(workspace.id, "failed"),
            total_credits_used=await self.usage.total_credits_used(workspace.id),
            logs=await self.usage.list_logs(workspace.id),
            transactions=await self.usage.list_transactions(workspace.id),
        )

