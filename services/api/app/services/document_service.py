from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.document import Document
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentChunkRead, DocumentDetail, DocumentRead
from app.services.document_processing import process_document
from app.services.workspace_service import assert_workspace_role
from app.utils.file_storage import save_upload_file
from app.workers.tasks import process_document_task


ALLOWED_TYPES = {"pdf", "docx", "txt", "md"}


class DocumentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.documents = DocumentRepository(session)

    async def list_documents(self, workspace: Workspace) -> list[DocumentRead]:
        documents = await self.documents.list_documents(workspace.id)
        return [DocumentRead.model_validate(document) for document in documents]

    async def upload_document(
        self,
        *,
        workspace: Workspace,
        member: WorkspaceMember,
        current_user: User,
        upload: UploadFile,
    ) -> DocumentRead:
        assert_workspace_role(member.role, "member")
        if current_user.is_guest:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guest users cannot upload documents")

        extension = Path(upload.filename or "").suffix.lower().lstrip(".")
        if extension not in ALLOWED_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Supported files: PDF, DOCX, TXT, MD")

        document_id = str(uuid4())
        stored = await save_upload_file(workspace.id, document_id, upload)
        max_size = settings.max_file_size_mb * 1024 * 1024
        if stored.size_bytes > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds {settings.max_file_size_mb}MB limit",
            )

        document = Document(
            id=document_id,
            workspace_id=workspace.id,
            uploaded_by_id=current_user.id,
            original_filename=upload.filename or "document",
            file_type=extension,
            mime_type=upload.content_type,
            file_size_bytes=stored.size_bytes,
            file_hash=stored.sha256,
            storage_path=stored.path,
            status="uploaded",
            chunk_count=0,
        )
        self.session.add(document)
        try:
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This document already exists") from exc

        try:
            process_document_task.delay(document.id)
        except Exception:
            await process_document(self.session, document.id)

        await self.session.refresh(document)
        return DocumentRead.model_validate(document)

    async def get_document(self, workspace: Workspace, document_id: str) -> DocumentDetail:
        document = await self.documents.get_document(workspace.id, document_id, with_chunks=True)
        if not document or document.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        sorted_chunks = sorted(document.chunks, key=lambda chunk: chunk.chunk_index)
        return DocumentDetail(
            **DocumentRead.model_validate(document).model_dump(),
            chunks=[DocumentChunkRead.model_validate(chunk) for chunk in sorted_chunks],
        )

    async def list_chunks(self, workspace: Workspace, document_id: str):
        document = await self.documents.get_document(workspace.id, document_id)
        if not document or document.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return await self.documents.list_chunks(workspace.id, document_id)

    async def delete_document(self, workspace: Workspace, member: WorkspaceMember, document_id: str) -> DocumentRead:
        assert_workspace_role(member.role, "admin")
        document = await self.documents.get_document(workspace.id, document_id)
        if not document or document.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        document.status = "deleted"
        await self.documents.replace_chunks(document, [])
        await self.session.commit()
        await self.session.refresh(document)
        return DocumentRead.model_validate(document)

    async def reindex_document(self, workspace: Workspace, member: WorkspaceMember, document_id: str) -> DocumentRead:
        assert_workspace_role(member.role, "admin")
        document = await self.documents.get_document(workspace.id, document_id)
        if not document or document.status == "deleted":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        try:
            process_document_task.delay(document.id)
        except Exception:
            await process_document(self.session, document.id)
        await self.session.refresh(document)
        return DocumentRead.model_validate(document)
