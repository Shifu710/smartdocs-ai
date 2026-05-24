from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import AuthService


router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, session: SessionDep) -> TokenResponse:
    return await AuthService(session).register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: SessionDep) -> TokenResponse:
    return await AuthService(session).login(payload)


@router.post("/guest", response_model=TokenResponse)
async def guest_login(session: SessionDep) -> TokenResponse:
    return await AuthService(session).guest_login()


@router.get("/me", response_model=UserRead)
async def me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.post("/logout")
async def logout() -> dict[str, bool]:
    return {"ok": True}
