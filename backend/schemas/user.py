from uuid import UUID
from pydantic import BaseModel, EmailStr


class BaseUser(BaseModel):
    username: str
    email: EmailStr


class CreateUser(BaseUser):
    password: str


class ReadUser(BaseUser):
    id: UUID


class UpdateUser(BaseUser):
    email: str
    password: str
