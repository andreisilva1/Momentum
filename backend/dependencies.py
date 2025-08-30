from typing import Annotated
from uuid import UUID
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import User
from backend.database.session import get_session
from backend.services.board import BoardService
from backend.services.organization import OrganizationService
from backend.services.user import UserService
from backend.utils import return_the_access_token

SessionDep = Annotated[AsyncSession, Depends(get_session)]


def create_user_service(session: SessionDep):
    return UserService(session)


async def get_current_user(
    data: Annotated[dict, Depends(return_the_access_token)], session: SessionDep
):
    return await session.get(User, UUID(data["user"]["id"]))


def create_organization_service(session: SessionDep):
    return OrganizationService(session)


def create_board_service(session: SessionDep):
    return BoardService(session)


UserServiceDep = Annotated[UserService, Depends(create_user_service)]
OrganizationServiceDep = Annotated[
    OrganizationService, Depends(create_organization_service)
]
BoardServiceDep = Annotated[BoardService, Depends(create_board_service)]
UserDep = Annotated[User, Depends(get_current_user)]
