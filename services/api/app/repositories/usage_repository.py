from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_transaction import CreditTransaction
from app.models.usage_log import UsageLog


class UsageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_logs(self, workspace_id: str, *, limit: int = 50) -> list[UsageLog]:
        result = await self.session.execute(
            select(UsageLog)
            .where(UsageLog.workspace_id == workspace_id)
            .order_by(UsageLog.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_transactions(self, workspace_id: str, *, limit: int = 50) -> list[CreditTransaction]:
        result = await self.session.execute(
            select(CreditTransaction)
            .where(CreditTransaction.workspace_id == workspace_id)
            .order_by(CreditTransaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def total_calls(self, workspace_id: str) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(UsageLog).where(UsageLog.workspace_id == workspace_id)
        )
        return int(result.scalar_one())

    async def calls_by_status(self, workspace_id: str, status: str) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(UsageLog).where(
                UsageLog.workspace_id == workspace_id,
                UsageLog.status == status,
            )
        )
        return int(result.scalar_one())

    async def total_credits_used(self, workspace_id: str) -> int:
        result = await self.session.execute(
            select(func.coalesce(func.sum(UsageLog.credits_deducted), 0)).where(UsageLog.workspace_id == workspace_id)
        )
        return int(result.scalar_one())

