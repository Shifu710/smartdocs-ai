from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embedding_gateway import EmbeddingGateway
from app.ai.providers.demo_embeddings import deterministic_embedding
from app.models.document import Document, DocumentChunk
from app.repositories.document_repository import DocumentRepository
from app.utils.tokens import estimate_tokens


def extract_text(path: str, file_type: str) -> list[tuple[str, int | None]]:
    file_path = Path(path)
    if file_type == "pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(file_path))
        return [(page.extract_text() or "", index + 1) for index, page in enumerate(reader.pages)]
    if file_type == "docx":
        from docx import Document as DocxDocument

        doc = DocxDocument(str(file_path))
        paragraphs = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
        return [("\n".join(paragraphs), None)]
    if file_type in {"txt", "md"}:
        return [(file_path.read_text(encoding="utf-8", errors="ignore"), None)]
    raise ValueError(f"Unsupported file type: {file_type}")


def build_chunks(document: Document, pages: list[tuple[str, int | None]]) -> list[DocumentChunk]:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=680,
        chunk_overlap=85,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    chunks: list[DocumentChunk] = []
    for text, page_number in pages:
        for content in splitter.split_text(text):
            cleaned = content.strip()
            if not cleaned:
                continue
            chunks.append(
                DocumentChunk(
                    workspace_id=document.workspace_id,
                    document_id=document.id,
                    chunk_index=len(chunks),
                    content=cleaned,
                    embedding=deterministic_embedding(cleaned),
                    page_number=page_number,
                    token_count=estimate_tokens(cleaned),
                    chunk_metadata={"provider": "demo-local"},
                )
            )
    return chunks


async def build_chunks_with_embeddings(document: Document, pages: list[tuple[str, int | None]]) -> list[DocumentChunk]:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=680,
        chunk_overlap=85,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    embeddings = EmbeddingGateway()
    chunks: list[DocumentChunk] = []
    for text, page_number in pages:
        for content in splitter.split_text(text):
            cleaned = content.strip()
            if not cleaned:
                continue
            embedded = await embeddings.embed_text(cleaned)
            chunks.append(
                DocumentChunk(
                    workspace_id=document.workspace_id,
                    document_id=document.id,
                    chunk_index=len(chunks),
                    content=cleaned,
                    embedding=embedded.embedding,
                    page_number=page_number,
                    token_count=estimate_tokens(cleaned),
                    chunk_metadata={
                        "embedding_provider": embedded.provider,
                        "embedding_model": embedded.model,
                        "embedding_dimension": embedded.dimension,
                        "embedding_latency_ms": embedded.latency_ms,
                    },
                )
            )
    return chunks


async def process_document(session: AsyncSession, document_id: str) -> Document:
    repository = DocumentRepository(session)
    document = await session.get(Document, document_id)
    if not document:
        raise ValueError("Document not found")

    document.status = "processing"
    document.error_message = None
    await session.commit()

    try:
        pages = extract_text(document.storage_path, document.file_type)
        chunks = await build_chunks_with_embeddings(document, pages)
        if not chunks:
            raise ValueError("No extractable text found in document")
        await repository.replace_chunks(document, chunks)
        document.status = "indexed"
        document.last_indexed_at = datetime.now(UTC)
        document.error_message = None
        await session.commit()
        await session.refresh(document)
        return document
    except Exception as exc:
        document.status = "failed"
        document.error_message = str(exc)
        document.chunk_count = 0
        await session.commit()
        raise
