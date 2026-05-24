from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_transaction import CreditTransaction
from app.models.workspace import Workspace


class BillingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def require_credits(self, workspace: Workspace, amount: int) -> None:
        if workspace.credits < amount:
            raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient credits")

    async def deduct(self, workspace_id: str, user_id: str, amount: int, metadata: dict) -> int:
        result = await self.session.execute(
            update(Workspace)
            .where(Workspace.id == workspace_id, Workspace.credits >= amount)
            .values(credits=Workspace.credits - amount)
            .returning(Workspace.credits)
        )
        balance_after = result.scalar_one_or_none()
        if balance_after is None:
            raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient credits")
        self.session.add(
            CreditTransaction(
                workspace_id=workspace_id,
                user_id=user_id,
                transaction_type="rag_answer",
                amount=-amount,
                balance_after=balance_after,
                transaction_metadata=metadata,
            )
        )
        return int(balance_after)

