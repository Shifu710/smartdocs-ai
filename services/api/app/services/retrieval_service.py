import math
from dataclasses import dataclass, field

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embedding_gateway import EmbeddingGateway
from app.rag.rrf import reciprocal_rank_fusion
from app.repositories.document_repository import DocumentRepository
from app.repositories.retrieval_repository import RetrievalRepository


@dataclass
class RetrievedChunk:
    chunk_id: str
    workspace_id: str
    document_id: str
    document_name: str
    chunk_index: int
    content: str
    page_number: int | None
    token_count: int
    rrf_score: float
    vector_rank: int | None = None
    keyword_rank: int | None = None
    vector_distance: float | None = None
    keyword_score: float | None = None
    chunk_metadata: dict = field(default_factory=dict)

    @property
    def preview(self) -> str:
        return self.content[:220]


class RetrievalService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = RetrievalRepository(session)
        self.documents = DocumentRepository(session)
        self.embeddings = EmbeddingGateway()

    async def retrieve(
        self,
        *,
        workspace_id: str,
        query: str,
        document_ids: list[str] | None = None,
        top_k_vector: int = 8,
        top_k_keyword: int = 8,
        final_top_k: int = 5,
    ) -> list[RetrievedChunk]:
        requested_documents = document_ids or []
        embedded_query = await self.embeddings.embed_query(query)
        try:
            vector_rows = await self.repository.vector_search(
                workspace_id=workspace_id,
                query_embedding=embedded_query.embedding,
                document_ids=requested_documents,
                top_k=top_k_vector,
            )
            keyword_rows = await self.repository.keyword_search(
                workspace_id=workspace_id,
                query=query,
                document_ids=requested_documents,
                top_k=top_k_keyword,
            )
        except Exception:
            await self.session.rollback()
            vector_rows, keyword_rows = await self._fallback_python_search(
                workspace_id=workspace_id,
                query=query,
                query_embedding=embedded_query.embedding,
                document_ids=requested_documents,
                top_k_vector=top_k_vector,
                top_k_keyword=top_k_keyword,
            )

        vector_ids = [row["chunk_id"] for row in vector_rows]
        keyword_ids = [row["chunk_id"] for row in keyword_rows]
        scores = reciprocal_rank_fusion(vector_ids, keyword_ids)
        row_lookup: dict[str, dict] = {}
        for rank, row in enumerate(vector_rows, start=1):
            merged = row_lookup.setdefault(row["chunk_id"], row)
            merged["vector_rank"] = rank
            merged["vector_distance"] = row.get("vector_distance")
        for rank, row in enumerate(keyword_rows, start=1):
            merged = row_lookup.setdefault(row["chunk_id"], row)
            merged["keyword_rank"] = rank
            merged["keyword_score"] = row.get("keyword_score")

        ranked_ids = sorted(scores, key=lambda chunk_id: scores[chunk_id], reverse=True)[:final_top_k]
        return [self._to_retrieved(row_lookup[chunk_id], scores[chunk_id]) for chunk_id in ranked_ids]

    async def _fallback_python_search(
        self,
        *,
        workspace_id: str,
        query: str,
        query_embedding: list[float],
        document_ids: list[str],
        top_k_vector: int,
        top_k_keyword: int,
    ) -> tuple[list[dict], list[dict]]:
        rows = await self.documents.list_indexed_chunks(workspace_id, document_ids or None)
        terms = {term.lower().strip(".,?!:;()[]") for term in query.split() if len(term) > 2}

        def keyword_score(content: str) -> float:
            lowered = content.lower()
            return float(sum(lowered.count(term) for term in terms))

        def cosine(embedding: list[float] | None) -> float:
            if not embedding:
                return 0.0
            numerator = sum(a * b for a, b in zip(query_embedding, embedding, strict=False))
            query_norm = math.sqrt(sum(value * value for value in query_embedding)) or 1.0
            chunk_norm = math.sqrt(sum(value * value for value in embedding)) or 1.0
            return numerator / (query_norm * chunk_norm)

        mapped = [
            {
                "chunk_id": chunk.id,
                "workspace_id": chunk.workspace_id,
                "document_id": chunk.document_id,
                "document_name": document.original_filename,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "token_count": chunk.token_count,
                "chunk_metadata": chunk.chunk_metadata or {},
                "vector_distance": 1.0 - cosine(chunk.embedding),
                "keyword_score": keyword_score(chunk.content),
            }
            for chunk, document in rows
        ]
        vector_rows = sorted(mapped, key=lambda row: row["vector_distance"])[:top_k_vector]
        keyword_rows = [row for row in sorted(mapped, key=lambda row: row["keyword_score"], reverse=True) if row["keyword_score"] > 0][
            :top_k_keyword
        ]
        return vector_rows, keyword_rows

    def _to_retrieved(self, row: dict, rrf_score: float) -> RetrievedChunk:
        return RetrievedChunk(
            chunk_id=row["chunk_id"],
            workspace_id=row["workspace_id"],
            document_id=row["document_id"],
            document_name=row["document_name"],
            chunk_index=int(row["chunk_index"]),
            content=row["content"],
            page_number=row.get("page_number"),
            token_count=int(row.get("token_count") or 0),
            rrf_score=rrf_score,
            vector_rank=row.get("vector_rank"),
            keyword_rank=row.get("keyword_rank"),
            vector_distance=float(row["vector_distance"]) if row.get("vector_distance") is not None else None,
            keyword_score=float(row["keyword_score"]) if row.get("keyword_score") is not None else None,
            chunk_metadata=row.get("chunk_metadata") or {},
        )
