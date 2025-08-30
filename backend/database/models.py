from datetime import datetime, timedelta
from enum import Enum
from typing import List
from uuid import UUID, uuid4
from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column
from sqlalchemy.dialects import postgresql


class Tags(str, Enum):
    COMMOM = "commom"
    IMPORTANT = "important"
    URGENT = "urgent"


class TasksToUsers(SQLModel, table=True):
    task_id: UUID = Field(default=None, foreign_key="task.id", primary_key=True)
    user_id: UUID = Field(default=None, foreign_key="user.id", primary_key=True)


class OrganizationsToUsers(SQLModel, table=True):
    user_id: UUID = Field(default=None, foreign_key="user.id", primary_key=True)
    organization_id: UUID = Field(
        default=None, foreign_key="organization.id", primary_key=True
    )


class User(SQLModel, table=True):
    id: UUID = Field(
        sa_column=Column(postgresql.UUID, default=uuid4(), primary_key=True, index=True)
    )
    username: str
    email: EmailStr = Field(unique=True)
    password_hashed: str
    created_at: datetime = Field(default=datetime.now())
    last_update: datetime
    profile_picture: str = Field(default=None, nullable=True)
    tasks_created: List["Task"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )
    tasks_attached: List["Task"] = Relationship(
        back_populates="users_attached", link_model=TasksToUsers
    )
    created_organizations: List["Organization"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )

    in_organizations: List["Organization"] = Relationship(
        back_populates="participants",
        link_model=OrganizationsToUsers,
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    created_boards: List["Board"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )


class Task(SQLModel, table=True):
    id: UUID = Field(
        sa_column=Column(postgresql.UUID, default=uuid4(), primary_key=True, index=True)
    )
    creator_id: UUID = Field(foreign_key="user.id")
    creator: User = Relationship(
        back_populates="tasks_created", sa_relationship_kwargs={"lazy": "selectin"}
    )
    title: str
    tag: Tags
    created_at: datetime = Field(default=datetime.now())
    limit_date: datetime = Field(default=(datetime.now() + timedelta(days=14)))
    users_attached: List[User] = Relationship(
        back_populates="tasks_attached",
        link_model=TasksToUsers,
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class Organization(SQLModel, table=True):
    id: UUID = Field(
        sa_column=Column(postgresql.UUID, default=uuid4(), primary_key=True, index=True)
    )
    title: str
    creator_id: UUID = Field(foreign_key="user.id")
    creator: User = Relationship(
        back_populates="created_organizations",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    participants: List["User"] = Relationship(
        back_populates="in_organizations",
        link_model=OrganizationsToUsers,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    org_boards: List["Board"] = Relationship(
        back_populates="organization",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )
    created_at: datetime = Field(default=datetime.now())


class Board(SQLModel, table=True):
    id: UUID = Field(
        sa_column=Column(postgresql.UUID, default=uuid4(), primary_key=True, index=True)
    )
    creator_id: UUID = Field(foreign_key="user.id")
    creator: User = Relationship(
        back_populates="created_boards", sa_relationship_kwargs={"lazy": "selectin"}
    )
    organization_id: UUID = Field(foreign_key="organization.id")
    organization: Organization = Relationship(
        back_populates="org_boards", sa_relationship_kwargs={"lazy": "selectin"}
    )
    title: str
    created_at: datetime = Field(default=datetime.now())
