import json
import time
from dataclasses import dataclass
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentChunk
from app.models.usage_log import UsageLog
from app.models.user import User
from app.models.workspace import Workspace
from app.rag.rag_graph import build_rag_graph
from app.rag.rrf import reciprocal_rank_fusion
from app.repositories.document_repository import DocumentRepository
from app.schemas.chat import ChatResponse, Citation, RetrievalDebugItem
from app.services.billing_service import BillingService
from app.services.document_processing import estimate_tokens


DEMO_PROVIDER = "demo-local"
DEMO_MODEL = "deterministic-rag-demo"
RAG_CREDITS = 5


@dataclass
class RankedChunk:
    chunk: DocumentChunk
    document: Document
    rrf_score: float
    vector_rank: int | None
    keyword_rank: int | None


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.documents = DocumentRepository(session)
        self.billing = BillingService(session)
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
        try:
            await self.billing.require_credits(workspace, RAG_CREDITS)
            ranked_chunks = await self.retrieve(workspace.id, question, document_ids)
            answer = self.generate_answer(question, ranked_chunks)
            citations = [self.to_citation(item) for item in ranked_chunks[:5]]
            debug = [self.to_debug_item(item) for item in ranked_chunks[:5]]
            prompt_tokens = estimate_tokens(question) + sum(item.chunk.token_count for item in ranked_chunks[:5])
            completion_tokens = estimate_tokens(answer)
            total_tokens = prompt_tokens + completion_tokens
            trace_id = f"demo-{uuid4().hex[:12]}"
            latency_ms = int((time.perf_counter() - started) * 1000)
            await self.billing.deduct(
                workspace.id,
                current_user.id,
                RAG_CREDITS,
                {"operation": "rag_chat", "trace_id": trace_id, "provider": DEMO_PROVIDER},
            )
            self.session.add(
                UsageLog(
                    workspace_id=workspace.id,
                    user_id=current_user.id,
                    operation_type="rag_chat",
                    provider=DEMO_PROVIDER,
                    model=DEMO_MODEL,
                    status="success",
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    credits_deducted=RAG_CREDITS,
                    latency_ms=latency_ms,
                    langfuse_trace_id=trace_id,
                    log_metadata={"document_ids": document_ids, "citation_count": len(citations)},
                )
            )
            await self.session.commit()
            return ChatResponse(
                answer=answer,
                citations=citations,
                debug=debug,
                provider=DEMO_PROVIDER,
                model=DEMO_MODEL,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                credits_used=RAG_CREDITS,
                latency_ms=latency_ms,
                trace_id=trace_id,
            )
        except Exception as exc:
            await self.session.rollback()
            latency_ms = int((time.perf_counter() - started) * 1000)
            self.session.add(
                UsageLog(
                    workspace_id=workspace.id,
                    user_id=current_user.id,
                    operation_type="rag_chat",
                    provider=DEMO_PROVIDER,
                    model=DEMO_MODEL,
                    status="failed",
                    credits_deducted=0,
                    latency_ms=latency_ms,
                    error_message=str(exc),
                )
            )
            await self.session.commit()
            raise

    async def retrieve(self, workspace_id: str, question: str, document_ids: list[str]) -> list[RankedChunk]:
        rows = await self.documents.list_indexed_chunks(workspace_id, document_ids or None)
        query_terms = {term.lower().strip(".,?!:;()[]") for term in question.split() if len(term) > 2}

        def keyword_score(chunk: DocumentChunk) -> int:
            content = chunk.content.lower()
            return sum(content.count(term) for term in query_terms)

        keyword_ranked = sorted(rows, key=lambda row: keyword_score(row[0]), reverse=True)
        vector_ranked = sorted(rows, key=lambda row: self.semantic_overlap(question, row[0].content), reverse=True)
        keyword_ids = [chunk.id for chunk, _ in keyword_ranked if keyword_score(chunk) > 0]
        vector_ids = [chunk.id for chunk, _ in vector_ranked]
        scores = reciprocal_rank_fusion(vector_ids[:20], keyword_ids[:20])
        lookup = {chunk.id: (chunk, document) for chunk, document in rows}
        ranked_ids = sorted(scores, key=lambda chunk_id: scores[chunk_id], reverse=True)[:5]
        ranked: list[RankedChunk] = []
        for chunk_id in ranked_ids:
            chunk, document = lookup[chunk_id]
            ranked.append(
                RankedChunk(
                    chunk=chunk,
                    document=document,
                    rrf_score=scores[chunk_id],
                    vector_rank=vector_ids.index(chunk_id) + 1 if chunk_id in vector_ids else None,
                    keyword_rank=keyword_ids.index(chunk_id) + 1 if chunk_id in keyword_ids else None,
                )
            )
        return ranked

    def semantic_overlap(self, question: str, content: str) -> float:
        question_terms = {term.lower().strip(".,?!:;()[]") for term in question.split() if len(term) > 2}
        content_terms = {term.lower().strip(".,?!:;()[]") for term in content.split() if len(term) > 2}
        if not question_terms:
            return 0.0
        return len(question_terms & content_terms) / len(question_terms)

    def generate_answer(self, question: str, ranked_chunks: list[RankedChunk]) -> str:
        if not ranked_chunks:
            return "I could not find indexed workspace documents that answer this question yet."
        snippets = " ".join(item.chunk.content for item in ranked_chunks[:3])
        trimmed = snippets[:900].strip()
        return (
            f"Based on the indexed workspace documents, here is the most relevant answer to: \"{question}\".\n\n"
            f"{trimmed}\n\n"
            "This response is generated by the clearly labeled demo-local provider. Configure DeepSeek or Qwen keys "
            "to replace this deterministic demo answer with a live model call."
        )

    def to_citation(self, item: RankedChunk) -> Citation:
        return Citation(
            document_id=item.document.id,
            document_name=item.document.original_filename,
            chunk_id=item.chunk.id,
            chunk_index=item.chunk.chunk_index,
            page_number=item.chunk.page_number,
            rrf_score=round(item.rrf_score, 5),
            preview=item.chunk.content[:220],
        )

    def to_debug_item(self, item: RankedChunk) -> RetrievalDebugItem:
        return RetrievalDebugItem(
            **self.to_citation(item).model_dump(),
            vector_rank=item.vector_rank,
            keyword_rank=item.keyword_rank,
        )

    async def stream_chat(self, **kwargs):
        response = await self.run_chat(**kwargs)
        for token in response.answer.split(" "):
            yield f"data: {json.dumps({'type': 'token', 'value': token + ' '})}\n\n"
        yield f"data: {json.dumps({'type': 'final', 'value': response.model_dump(mode='json')})}\n\n"
