from datetime import datetime
from typing import List
from uuid import UUID
from pydantic import BaseModel

from backend.database.models import Board, User


class BaseOrganization(BaseModel):
    title: str


class CreateOrganization(BaseOrganization):
    pass


class ReadOrganization(BaseOrganization):
    id: UUID
    creator: User
    participants: List[User]
    boards: List[Board]
    created_at: datetime


class UpdateOrganization(BaseOrganization):
    pass
