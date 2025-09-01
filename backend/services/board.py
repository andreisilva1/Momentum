from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlmodel import select
from backend.database.models import Organization, OrganizationsToUsers, User, Board
from backend.schemas.board import CreateBoard
from datetime import datetime

from backend.utils import verify_password
from sqlalchemy.orm import selectinload


class BoardService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, current_user: User):
        boards = await self.session.execute(
            select(Board).where(Board.creator_id == current_user.id)
        )

        return boards.scalars().all()

    async def get_all_tasks(self, board_id: UUID, current_user: User):
        board = await self.session.execute(
            select(Board)
            .options(
                selectinload(Board.organization).selectinload(Organization.participants)
            )
            .where(Board.id == board_id)
        )
        board = board.scalar_one_or_none()
        if board and current_user in board.organization.participants:
            return {"ok": True, "tasks": board.tasks}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"ok": False, "detail": "No board found with the provided id"},
        )

    async def get_by_search(self, search: str, current_user: User):
        boards = await self.session.execute(
            select(Board).where(
                Board.title.ilike(f"%{search}%"),
            )
        )
        boards = boards.scalars().all()
        boards_by_search = [
            board
            for board in boards
            if board.organization_id
            in [organization.id for organization in current_user.in_organizations]
        ]
        return boards_by_search

    async def add(self, organization_id: UUID, board: CreateBoard, current_user: User):
        organization = await self.session.execute(
            select(OrganizationsToUsers).where(
                OrganizationsToUsers.organization_id == organization_id,
                OrganizationsToUsers.user_id == current_user.id,
            )
        )
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found."
            )
        new_board = Board(
            **board.model_dump(),
            id=uuid4(),
            organization_id=organization_id,
            created_at=datetime.now(),
            creator_id=current_user.id,
        )
        self.session.add(new_board)
        await self.session.commit()
        return {"ok": True, "detail": "Board successfully created", "board": new_board}

    async def update(self, board_id: UUID, title: str, current_user: User):
        board = await self.session.execute(
            select(Board).where(
                Board.id == board_id,
            )
        )
        board = board.scalar_one_or_none()
        if board and board.organization_id in [
            organization.id for organization in current_user.in_organizations
        ]:
            board.title = title
            self.session.add(board)
            await self.session.commit()
            return {"detail": f"Name changed to {title}", "board": board}

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No board found with the provided ID.",
        )

    async def delete(self, board_id: UUID, current_user: User, password: str):
        if board_id in [
            board.id for board in current_user.created_boards
        ] and verify_password(password, current_user.password_hashed):
            deleted_board = await self.session.get(Board, board_id)
            await self.session.delete(deleted_board)
            await self.session.commit()
            return {
                "ok": True,
                "detail": f'Board "{deleted_board.title}" successfully removed.',
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A error occurred. Invalid board or you don't have the permissions to do that.",
        )
