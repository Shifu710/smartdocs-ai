import json
import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.model_gateway import ModelGateway
from app.models.usage_log import UsageLog
from app.models.user import User
from app.models.workspace import Workspace
from app.observability.tracing import RAGTracer
from app.rag.rag_graph import build_rag_graph
from app.schemas.chat import ChatResponse
from app.services.billing_service import BillingService
from app.services.retrieval_service import RetrievalService


RAG_CREDITS = 5


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.billing = BillingService(session)
        self.retrieval = RetrievalService(session)
        self.model_gateway = ModelGateway()
        self.graph = build_rag_graph()

    async def run_chat(
        self,
        *,
        workspace: Workspace,
        current_user: User,
        question: str,
        document_ids: list[str],
    ) -> ChatResponse:
        started = time.perf_counter()
        tracer = RAGTracer(workspace_id=workspace.id, user_id=current_user.id, question=question)
        try:
            state = await self.graph.ainvoke(
                {
                    "session": self.session,
                    "workspace": workspace,
                    "current_user": current_user,
                    "question": question,
                    "document_ids": document_ids,
                    "credits_required": RAG_CREDITS,
                    "retrieval_service": self.retrieval,
                    "model_gateway": self.model_gateway,
                    "billing": self.billing,
                    "tracer": tracer,
                    "started": started,
                }
            )
            model_response = state["model_response"]
            return ChatResponse(
                answer=model_response.content,
                citations=state["citations"],
                debug=state["debug"],
                provider=model_response.provider,
                model=model_response.model,
                prompt_tokens=model_response.prompt_tokens,
                completion_tokens=model_response.completion_tokens,
                total_tokens=model_response.total_tokens,
                credits_used=state["credits_used"],
                latency_ms=state["latency_ms"],
                trace_id=tracer.trace_id if tracer.trace else None,
            )
        except Exception as exc:
            await self.session.rollback()
            latency_ms = int((time.perf_counter() - started) * 1000)
            status_provider = self.model_gateway.provider_status()["active"]
            self.session.add(
                UsageLog(
                    workspace_id=workspace.id,
                    user_id=current_user.id,
                    operation_type="rag_chat",
                    provider=status_provider,
                    model=None,
                    status="failed",
                    credits_deducted=0,
                    latency_ms=latency_ms,
                    error_message=self._safe_error(exc),
                    langfuse_trace_id=tracer.trace_id if tracer.trace else None,
                )
            )
            await self.session.commit()
            raise

    def _safe_error(self, exc: Exception) -> str:
        text = str(exc) or exc.__class__.__name__
        for secret in (
            self.model_gateway.providers[0].api_key,
            self.model_gateway.providers[1].api_key,
            self.model_gateway.providers[2].api_key,
        ):
            if secret:
                text = text.replace(secret, "[redacted]")
        return text[:500]

    async def stream_chat(self, **kwargs):
        response = await self.run_chat(**kwargs)
        for token in response.answer.split(" "):
            yield f"data: {json.dumps({'type': 'token', 'value': token + ' '})}\n\n"
        yield f"data: {json.dumps({'type': 'final', 'value': response.model_dump(mode='json')})}\n\n"
