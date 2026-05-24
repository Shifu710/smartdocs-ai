import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.credit_transaction import CreditTransaction
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, default_workspace_settings


async def get_or_create_user(
    session,
    *,
    email: str,
    password: str,
    role: str = "user",
    full_name: str | None = None,
    is_guest: bool = False,
) -> User:
    existing = await session.scalar(select(User).where(User.email == email))
    if existing:
        return existing

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
        is_guest=is_guest,
    )
    session.add(user)
    await session.flush()
    return user


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        admin = await get_or_create_user(
            session,
            email="platform_admin@smartdocs.ai",
            password="admin12345",
            role="platform_admin",
            full_name="Platform Admin",
        )
        demo = await get_or_create_user(
            session,
            email="demo@smartdocs.ai",
            password="demo12345",
            full_name="Demo Owner",
        )
        guest = await get_or_create_user(
            session,
            email="guest@smartdocs.ai",
            password="guest123",
            full_name="Guest Reviewer",
            is_guest=True,
        )

        workspace = await session.scalar(select(Workspace).where(Workspace.slug == "smartdocs-demo"))
        if not workspace:
            workspace = Workspace(
                name="SmartDocs Demo Workspace",
                slug="smartdocs-demo",
                owner_id=demo.id,
                credits=500,
                settings=default_workspace_settings(),
            )
            session.add(workspace)
            await session.flush()
            session.add(
                CreditTransaction(
                    workspace_id=workspace.id,
                    user_id=demo.id,
                    transaction_type="initial_grant",
                    amount=500,
                    balance_after=500,
                    transaction_metadata={"source": "seed"},
                )
            )

        for user, role in ((demo, "owner"), (guest, "viewer"), (admin, "owner")):
            existing_member = await session.scalar(
                select(WorkspaceMember).where(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.user_id == user.id,
                )
            )
            if not existing_member:
                session.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role=role))

        await session.commit()
        print("Seeded SmartDocs AI demo users and workspace.")


if __name__ == "__main__":
    asyncio.run(seed())
