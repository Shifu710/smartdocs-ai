from fastapi import APIRouter, UploadFile

from app.api.deps import CurrentUser, SessionDep, WorkspaceContext
from app.schemas.document import DocumentChunkRead, DocumentDetail, DocumentRead
from app.services.document_service import DocumentService


router = APIRouter()


@router.get("", response_model=list[DocumentRead])
async def list_documents(session: SessionDep, context: WorkspaceContext) -> list[DocumentRead]:
    workspace, _member = context
    return await DocumentService(session).list_documents(workspace)


@router.post("/upload", response_model=DocumentRead, status_code=201)
async def upload_document(
    file: UploadFile,
    session: SessionDep,
    context: WorkspaceContext,
    current_user: CurrentUser,
) -> DocumentRead:
    workspace, member = context
    return await DocumentService(session).upload_document(
        workspace=workspace,
        member=member,
        current_user=current_user,
        upload=file,
    )


@router.get("/{document_id}", response_model=DocumentDetail)
async def get_document(document_id: str, session: SessionDep, context: WorkspaceContext) -> DocumentDetail:
    workspace, _member = context
    return await DocumentService(session).get_document(workspace, document_id)


@router.delete("/{document_id}", response_model=DocumentRead)
async def delete_document(document_id: str, session: SessionDep, context: WorkspaceContext) -> DocumentRead:
    workspace, member = context
    return await DocumentService(session).delete_document(workspace, member, document_id)


@router.post("/{document_id}/reindex", response_model=DocumentRead)
async def reindex_document(document_id: str, session: SessionDep, context: WorkspaceContext) -> DocumentRead:
    workspace, member = context
    return await DocumentService(session).reindex_document(workspace, member, document_id)


@router.get("/{document_id}/chunks", response_model=list[DocumentChunkRead])
async def list_chunks(document_id: str, session: SessionDep, context: WorkspaceContext):
    workspace, _member = context
    return await DocumentService(session).list_chunks(workspace, document_id)

