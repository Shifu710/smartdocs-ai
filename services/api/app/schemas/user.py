from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    role: str
    is_guest: bool
    created_at: datetime

    model_config = {"from_attributes": True}
