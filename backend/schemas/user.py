from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class BaseUser(BaseModel):
    username: str
    email: EmailStr


class CreateUser(BaseUser):
    password: str


class ReadUser(BaseUser):
    id: UUID


class UpdateUser(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str
    profile_picture: Optional[str] = None
