import asyncio
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.credit_transaction import CreditTransaction
from app.models.document import Document, DocumentChunk
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, default_workspace_settings
from app.services.document_processing import deterministic_embedding, estimate_tokens


DEMO_DOCUMENTS = {
    "refund-policy.md": """
# Refund Policy

Customers can request a refund within 30 days of purchase when the subscription has not been used for a full production rollout. Enterprise refunds require account owner approval and support review. Approved refunds are returned to the original payment method within 7 business days.
""",
    "security-policy.md": """
# Security Policy

SmartDocs AI keeps every workspace isolated by workspace_id. Documents are encrypted in managed storage, API requests require JWT authentication, and RBAC limits document upload, settings, billing, and admin actions. AI usage is logged with provider, model, latency, token counts, trace id, and credit deduction details.
""",
    "employee-handbook.md": """
# Employee Handbook

Employees receive annual leave, sick leave, and public holiday benefits according to local policy. Leave requests should be submitted through the HR system before the planned absence. Managers review requests and approve based on team coverage.
""",
    "product-requirements.md": """
# SmartDocs AI Product Requirements

The product must support document upload, PDF/DOCX/TXT/Markdown extraction, chunking, embeddings, hybrid retrieval with vector and keyword search, citations, a Retrieval Debug Panel, credit deduction after successful answers, and usage logs for every AI attempt.
""",
}


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

        for filename, content in DEMO_DOCUMENTS.items():
            existing_document = await session.scalar(
                select(Document).where(
                    Document.workspace_id == workspace.id,
                    Document.original_filename == filename,
                    Document.status != "deleted",
                )
            )
            if existing_document:
                continue
            file_hash = deterministic_hash(content)
            document = Document(
                workspace_id=workspace.id,
                uploaded_by_id=demo.id,
                original_filename=filename,
                file_type="md",
                mime_type="text/markdown",
                file_size_bytes=len(content.encode("utf-8")),
                file_hash=file_hash,
                storage_path=f"/uploads/{workspace.id}/seed/{filename}",
                status="indexed",
                chunk_count=1,
                last_indexed_at=datetime.now(UTC),
            )
            session.add(document)
            await session.flush()
            session.add(
                DocumentChunk(
                    workspace_id=workspace.id,
                    document_id=document.id,
                    chunk_index=0,
                    content=content.strip(),
                    embedding=deterministic_embedding(content),
                    token_count=estimate_tokens(content),
                    chunk_metadata={"seeded": True, "provider": "demo-local"},
                )
            )

        await session.commit()
        print("Seeded SmartDocs AI demo users, workspace, and indexed documents.")


def deterministic_hash(content: str) -> str:
    import hashlib

    return hashlib.sha256(content.encode("utf-8")).hexdigest()


if __name__ == "__main__":
    asyncio.run(seed())
