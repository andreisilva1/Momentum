from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class BaseBoard(BaseModel):
    title: str


class ReadBoard(BaseBoard):
    id: UUID
    created_at: datetime


class CreateBoard(BaseBoard):
    pass


class UpdateBoard(BaseBoard):
    pass
