from datetime import datetime
from uuid import UUID, uuid4
from pydantic import EmailStr
from sqlmodel import Field, SQLModel
from sqlalchemy import Column
from sqlalchemy.dialects import postgresql


class User(SQLModel, table=True):
    id: UUID = Field(
        sa_column=Column(postgresql.UUID, default=uuid4(), primary_key=True, index=True)
    )
    username: str
    email: EmailStr
    password_hashed: str
    created_at: datetime = Field(default=datetime.now())
    last_update: datetime
