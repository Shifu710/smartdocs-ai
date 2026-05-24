from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk


class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_documents(self, workspace_id: str) -> list[Document]:
        result = await self.session.execute(
            select(Document)
            .where(Document.workspace_id == workspace_id, Document.status != "deleted")
            .order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_document(self, workspace_id: str, document_id: str, *, with_chunks: bool = False) -> Document | None:
        statement = select(Document).where(Document.workspace_id == workspace_id, Document.id == document_id)
        if with_chunks:
            statement = statement.options(selectinload(Document.chunks))
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create_document(
        self,
        *,
        workspace_id: str,
        uploaded_by_id: str,
        original_filename: str,
        file_type: str,
        mime_type: str | None,
        file_size_bytes: int,
        file_hash: str,
        storage_path: str,
    ) -> Document:
        document = Document(
            workspace_id=workspace_id,
            uploaded_by_id=uploaded_by_id,
            original_filename=original_filename,
            file_type=file_type,
            mime_type=mime_type,
            file_size_bytes=file_size_bytes,
            file_hash=file_hash,
            storage_path=storage_path,
            status="uploaded",
            chunk_count=0,
        )
        self.session.add(document)
        await self.session.flush()
        return document

    async def replace_chunks(self, document: Document, chunks: list[DocumentChunk]) -> None:
        await self.session.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document.id))
        for chunk in chunks:
            self.session.add(chunk)
        document.chunk_count = len(chunks)
        await self.session.flush()

    async def list_chunks(
        self,
        workspace_id: str,
        document_id: str,
        *,
        limit: int = 200,
    ) -> list[DocumentChunk]:
        result = await self.session.execute(
            select(DocumentChunk)
            .where(DocumentChunk.workspace_id == workspace_id, DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_indexed_chunks(
        self,
        workspace_id: str,
        document_ids: list[str] | None = None,
        *,
        limit: int = 500,
    ) -> list[tuple[DocumentChunk, Document]]:
        statement = (
            select(DocumentChunk, Document)
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(DocumentChunk.workspace_id == workspace_id, Document.status == "indexed")
            .order_by(DocumentChunk.created_at.asc())
            .limit(limit)
        )
        if document_ids:
            statement = statement.where(DocumentChunk.document_id.in_(document_ids))
        result = await self.session.execute(statement)
        return list(result.all())

    async def count_chunks(self, workspace_id: str, document_id: str) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(DocumentChunk).where(
                DocumentChunk.workspace_id == workspace_id,
                DocumentChunk.document_id == document_id,
            )
        )
        return int(result.scalar_one())

