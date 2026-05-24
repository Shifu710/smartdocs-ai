from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class RetrievalRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def vector_search(
        self,
        *,
        workspace_id: str,
        query_embedding: list[float],
        document_ids: list[str],
        top_k: int,
    ) -> list[dict]:
        document_filter = "AND dc.document_id = ANY(CAST(:document_ids AS uuid[]))" if document_ids else ""
        statement = text(
            f"""
            SELECT
              dc.id AS chunk_id,
              dc.workspace_id,
              dc.document_id,
              dc.chunk_index,
              dc.content,
              dc.page_number,
              dc.token_count,
              dc.metadata AS chunk_metadata,
              d.original_filename AS document_name,
              dc.embedding <=> CAST(:query_embedding AS vector) AS vector_distance
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE dc.workspace_id = :workspace_id
              AND d.status = 'indexed'
              {document_filter}
            ORDER BY dc.embedding <=> CAST(:query_embedding AS vector)
            LIMIT :top_k
            """
        )
        params = {"workspace_id": workspace_id, "query_embedding": self._vector_literal(query_embedding), "top_k": top_k}
        if document_ids:
            params["document_ids"] = document_ids
        result = await self.session.execute(statement, params)
        return [dict(row) for row in result.mappings().all()]

    async def keyword_search(
        self,
        *,
        workspace_id: str,
        query: str,
        document_ids: list[str],
        top_k: int,
    ) -> list[dict]:
        document_filter = "AND dc.document_id = ANY(CAST(:document_ids AS uuid[]))" if document_ids else ""
        statement = text(
            f"""
            SELECT
              dc.id AS chunk_id,
              dc.workspace_id,
              dc.document_id,
              dc.chunk_index,
              dc.content,
              dc.page_number,
              dc.token_count,
              dc.metadata AS chunk_metadata,
              d.original_filename AS document_name,
              ts_rank_cd(dc.content_tsvector, plainto_tsquery('english', :query)) AS keyword_score
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE dc.workspace_id = :workspace_id
              AND d.status = 'indexed'
              {document_filter}
              AND dc.content_tsvector @@ plainto_tsquery('english', :query)
            ORDER BY keyword_score DESC
            LIMIT :top_k
            """
        )
        params = {"workspace_id": workspace_id, "query": query, "top_k": top_k}
        if document_ids:
            params["document_ids"] = document_ids
        result = await self.session.execute(statement, params)
        return [dict(row) for row in result.mappings().all()]

    def _vector_literal(self, embedding: list[float]) -> str:
        return "[" + ",".join(f"{value:.8f}" for value in embedding) + "]"
