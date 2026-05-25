from io import BytesIO

import httpx
import pytest
import pytest_asyncio
from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from starlette.datastructures import Headers

from app.ai.model_gateway import ModelGateway, ModelResponse
from app.api.deps import get_session
from app.main import create_app
from app.models.conversation import Conversation, Message
from app.models.credit_transaction import CreditTransaction
from app.models.document import Document
from app.models.usage_log import UsageLog
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.chat_service import ChatService
from app.services.document_service import DocumentService
from app.services.retrieval_service import RetrievalService


TEST_TABLES = (
    User.__table__,
    Workspace.__table__,
    WorkspaceMember.__table__,
    Document.__table__,
    CreditTransaction.__table__,
    UsageLog.__table__,
    Conversation.__table__,
    Message.__table__,
)


@pytest_asyncio.fixture
async def session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(lambda sync_connection: User.metadata.create_all(sync_connection, tables=TEST_TABLES))

    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as test_session:
        yield test_session

    async with engine.begin() as connection:
        await connection.run_sync(lambda sync_connection: User.metadata.drop_all(sync_connection, tables=TEST_TABLES))
    await engine.dispose()


@pytest_asyncio.fixture
async def seeded_workspace(session):
    owner = User(email="owner@example.com", hashed_password="hash", full_name="Owner", is_guest=False)
    guest = User(email="guest@smartdocs.ai", hashed_password="hash", full_name="Guest", is_guest=True)
    workspace = Workspace(name="Acme", slug="acme", owner=owner, credits=100)
    owner_member = WorkspaceMember(workspace=workspace, user=owner, role="owner")
    guest_member = WorkspaceMember(workspace=workspace, user=guest, role="viewer")
    session.add_all([owner, guest, workspace, owner_member, guest_member])
    await session.commit()
    return workspace, owner, owner_member, guest, guest_member


class FakeRetrievedChunk:
    chunk_id = "chunk-1"
    workspace_id = "workspace-1"
    document_id = "document-1"
    document_name = "handbook.md"
    chunk_index = 0
    content = "Refunds are available within 30 days."
    page_number = None
    token_count = 7
    rrf_score = 0.03
    vector_rank = 1
    keyword_rank = 1
    vector_distance = 0.1
    keyword_score = 1.0
    chunk_metadata = {}

    @property
    def preview(self):
        return self.content[:220]


class FakeRetrievalService:
    async def retrieve(self, **kwargs):
        return [FakeRetrievedChunk()]


class SuccessfulModelGateway:
    providers = []

    async def chat_completion(self, messages, temperature=0.2, max_tokens=1200, metadata=None):
        return ModelResponse(
            provider="mock-qwen",
            model="qwen-test",
            content="Refunds are available within 30 days.",
            prompt_tokens=11,
            completion_tokens=7,
            total_tokens=18,
            latency_ms=2,
            raw_metadata={"mock": True},
        )

    def provider_status(self):
        return {"active": "mock-qwen"}


class FailingModelGateway:
    providers = []

    async def chat_completion(self, messages, temperature=0.2, max_tokens=1200, metadata=None):
        raise RuntimeError("provider timeout")

    def provider_status(self):
        return {"active": "mock-deepseek"}


class FakeProvider:
    def __init__(self, provider_name, response=None, error=None):
        self.provider_name = provider_name
        self.response = response
        self.error = error
        self.api_key = f"{provider_name}-key"
        self.is_configured = True

    async def chat_completion(self, **kwargs):
        if self.error:
            raise self.error
        return self.response


def _upload(filename: str, content: bytes = b"# Policy\nAllowed") -> UploadFile:
    return UploadFile(
        BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": "text/markdown"}),
    )


@pytest.mark.asyncio
async def test_real_api_guest_login_returns_guest_token(session, seeded_workspace):
    async def override_session():
        yield session

    app = create_app()
    app.dependency_overrides[get_session] = override_session
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/auth/guest")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "guest@smartdocs.ai"
    assert body["user"]["is_guest"] is True
    assert body["access_token"]


@pytest.mark.asyncio
async def test_guest_cannot_upload_document(session, seeded_workspace):
    workspace, _owner, _owner_member, guest, guest_member = seeded_workspace
    guest_member.role = "member"

    with pytest.raises(HTTPException) as exc:
        await DocumentService(session).upload_document(
            workspace=workspace,
            member=guest_member,
            current_user=guest,
            upload=_upload("guest.md"),
        )

    assert exc.value.status_code == 403
    assert "Guest users cannot upload" in exc.value.detail


@pytest.mark.asyncio
async def test_owner_can_upload_document(session, seeded_workspace, monkeypatch, tmp_path):
    workspace, owner, owner_member, _guest, _guest_member = seeded_workspace
    monkeypatch.setattr("app.core.config.settings.upload_dir", str(tmp_path))
    monkeypatch.setattr("app.services.document_service.process_document_task.delay", lambda document_id: None)

    result = await DocumentService(session).upload_document(
        workspace=workspace,
        member=owner_member,
        current_user=owner,
        upload=_upload("owner.md"),
    )

    assert result.original_filename == "owner.md"
    assert result.status == "uploaded"
    document = await session.get(Document, result.id)
    assert document is not None
    assert document.uploaded_by_id == owner.id


@pytest.mark.asyncio
async def test_retrieval_returns_only_same_workspace_chunks():
    service = RetrievalService.__new__(RetrievalService)

    class Documents:
        async def list_indexed_chunks(self, workspace_id, document_ids):
            assert workspace_id == "workspace-a"
            return [
                (
                    type(
                        "Chunk",
                        (),
                        {
                            "id": "chunk-a",
                            "workspace_id": "workspace-a",
                            "document_id": "doc-a",
                            "chunk_index": 0,
                            "content": "refund policy",
                            "page_number": None,
                            "token_count": 2,
                            "embedding": [1.0, 0.0],
                            "chunk_metadata": {},
                        },
                    )(),
                    type("Document", (), {"original_filename": "a.md"})(),
                )
            ]

    service.documents = Documents()
    vector_rows, keyword_rows = await service._fallback_python_search(
        workspace_id="workspace-a",
        query="refund",
        query_embedding=[1.0, 0.0],
        document_ids=[],
        top_k_vector=5,
        top_k_keyword=5,
    )

    assert {row["workspace_id"] for row in vector_rows + keyword_rows} == {"workspace-a"}


@pytest.mark.asyncio
async def test_deleted_documents_are_excluded_from_retrieval_query(monkeypatch):
    captured = []

    class FakeSession:
        async def execute(self, statement, params):
            captured.append(str(statement))

            class Result:
                def mappings(self):
                    return self

                def all(self):
                    return []

            return Result()

    from app.repositories.retrieval_repository import RetrievalRepository

    await RetrievalRepository(FakeSession()).vector_search(
        workspace_id="workspace",
        query_embedding=[0.1],
        document_ids=[],
        top_k=3,
    )
    await RetrievalRepository(FakeSession()).keyword_search(
        workspace_id="workspace",
        query="refund",
        document_ids=[],
        top_k=3,
    )

    assert captured
    assert all("d.status = 'indexed'" in query for query in captured)


@pytest.mark.asyncio
async def test_successful_chat_deducts_credits_and_creates_usage_log(session, seeded_workspace):
    workspace, owner, _owner_member, _guest, _guest_member = seeded_workspace
    service = ChatService(session)
    service.retrieval = FakeRetrievalService()
    service.model_gateway = SuccessfulModelGateway()

    response = await service.run_chat(workspace=workspace, current_user=owner, question="Refund?", document_ids=[])

    await session.refresh(workspace)
    usage_log = await session.scalar(select(UsageLog).where(UsageLog.workspace_id == workspace.id))
    transaction = await session.scalar(select(CreditTransaction).where(CreditTransaction.workspace_id == workspace.id))
    assert response.credits_used == 5
    assert workspace.credits == 95
    assert transaction.amount == -5
    assert usage_log.status == "success"
    assert usage_log.credits_deducted == 5


@pytest.mark.asyncio
async def test_failed_provider_call_deducts_zero_credits_and_logs_failure(session, seeded_workspace):
    workspace, owner, _owner_member, _guest, _guest_member = seeded_workspace
    service = ChatService(session)
    service.retrieval = FakeRetrievalService()
    service.model_gateway = FailingModelGateway()

    with pytest.raises(RuntimeError, match="provider timeout"):
        await service.run_chat(workspace=workspace, current_user=owner, question="Refund?", document_ids=[])

    await session.refresh(workspace)
    usage_log = await session.scalar(select(UsageLog).where(UsageLog.workspace_id == workspace.id))
    transactions = (await session.execute(select(CreditTransaction))).scalars().all()
    assert workspace.credits == 100
    assert transactions == []
    assert usage_log.status == "failed"
    assert usage_log.credits_deducted == 0


@pytest.mark.asyncio
async def test_usage_log_created_on_success_and_failure(session, seeded_workspace):
    workspace, owner, _owner_member, _guest, _guest_member = seeded_workspace
    success_service = ChatService(session)
    success_service.retrieval = FakeRetrievalService()
    success_service.model_gateway = SuccessfulModelGateway()
    await success_service.run_chat(workspace=workspace, current_user=owner, question="Success?", document_ids=[])

    failure_service = ChatService(session)
    failure_service.retrieval = FakeRetrievalService()
    failure_service.model_gateway = FailingModelGateway()
    with pytest.raises(RuntimeError):
        await failure_service.run_chat(workspace=workspace, current_user=owner, question="Fail?", document_ids=[])

    statuses = (await session.execute(select(UsageLog.status).order_by(UsageLog.created_at))).scalars().all()
    assert statuses == ["success", "failed"]


@pytest.mark.asyncio
async def test_mock_deepseek_failure_falls_back_to_qwen():
    qwen_response = ModelResponse(
        provider="qwen",
        model="qwen-plus",
        content="fallback answer",
        prompt_tokens=1,
        completion_tokens=2,
        total_tokens=3,
        latency_ms=1,
    )
    gateway = ModelGateway()
    gateway.providers = [
        FakeProvider("deepseek", error=RuntimeError("deepseek down")),
        FakeProvider("qwen", response=qwen_response),
    ]

    response = await gateway.chat_completion([{"role": "user", "content": "hello"}])

    assert response.provider == "qwen"
    assert response.content == "fallback answer"


@pytest.mark.asyncio
async def test_langgraph_end_to_end_mocked_flow_persists_messages(session, seeded_workspace):
    workspace, owner, _owner_member, _guest, _guest_member = seeded_workspace
    service = ChatService(session)
    service.retrieval = FakeRetrievalService()
    service.model_gateway = SuccessfulModelGateway()

    response = await service.run_chat(workspace=workspace, current_user=owner, question="What is refund?", document_ids=[])

    messages = (await session.execute(select(Message).where(Message.conversation_id == response.conversation_id))).scalars().all()
    assert response.answer == "Refunds are available within 30 days."
    assert len(messages) == 2
    assert [message.role for message in messages] == ["user", "assistant"]
    assert messages[1].citations[0]["document_name"] == "handbook.md"
