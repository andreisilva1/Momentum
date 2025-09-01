from datetime import datetime
from typing import List
from uuid import UUID
from pydantic import BaseModel

from backend.database.models import Status, User


class BaseTask(BaseModel):
    title: str


class CreateTask(BaseTask):
    pass


class ReadTask(BaseTask):
    id: UUID
    creator: User
    created_at: datetime
    users_attached: List[User]


class UpdateTask(BaseTask):
    pass
