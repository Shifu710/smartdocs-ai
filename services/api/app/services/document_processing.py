import hashlib
import math
from datetime import UTC, datetime
from pathlib import Path

from docx import Document as DocxDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentChunk
from app.repositories.document_repository import DocumentRepository


def deterministic_embedding(text: str, dimensions: int = 1024) -> list[float]:
    values = [0.0] * dimensions
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimensions
        values[index] += 1.0
    norm = math.sqrt(sum(value * value for value in values)) or 1.0
    return [value / norm for value in values]


def estimate_tokens(text: str) -> int:
    return max(1, int(len(text) * 0.75))


def extract_text(path: str, file_type: str) -> list[tuple[str, int | None]]:
    file_path = Path(path)
    if file_type == "pdf":
        reader = PdfReader(str(file_path))
        return [(page.extract_text() or "", index + 1) for index, page in enumerate(reader.pages)]
    if file_type == "docx":
        doc = DocxDocument(str(file_path))
        paragraphs = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
        return [("\n".join(paragraphs), None)]
    if file_type in {"txt", "md"}:
        return [(file_path.read_text(encoding="utf-8", errors="ignore"), None)]
    raise ValueError(f"Unsupported file type: {file_type}")


def build_chunks(document: Document, pages: list[tuple[str, int | None]]) -> list[DocumentChunk]:
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
        chunks = build_chunks(document, pages)
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
