from fastapi import APIRouter

from app.api.v1 import admin, auth, chat, documents, usage, workspaces


api_router = APIRouter()


@api_router.get("/health", tags=["health"])
async def api_health_check() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(documents.router, prefix="/workspaces/{workspace_id}/documents", tags=["documents"])
api_router.include_router(chat.router, prefix="/workspaces/{workspace_id}", tags=["chat"])
api_router.include_router(usage.router, prefix="/workspaces/{workspace_id}/usage", tags=["usage"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
