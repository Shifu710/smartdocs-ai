from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.users = UserRepository(session)

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        existing = await self.users.get_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user = await self.users.create(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
        )
        await self.session.commit()
        await self.session.refresh(user)
        return self._token_response(user)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = await self.users.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is disabled")
        return self._token_response(user)

    async def guest_login(self) -> TokenResponse:
        user = await self.users.get_by_email("guest@smartdocs.ai")
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Guest account is not seeded yet. Run: docker compose exec api python seed.py",
            )
        if not user.is_guest:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Guest account is misconfigured")
        return self._token_response(user)

    def _token_response(self, user: User) -> TokenResponse:
        access_token = create_access_token(user.id, {"role": user.role, "is_guest": user.is_guest})
        refresh_token = create_refresh_token(user.id)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)
