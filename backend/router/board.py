from uuid import UUID
from fastapi import APIRouter

from backend.dependencies import BoardServiceDep, UserDep
from backend.schemas.board import CreateBoard, UpdateBoard

router = APIRouter(prefix="/board", tags=["Board"])


@router.get("/get")
async def get_by_search(current_user: UserDep, service: BoardServiceDep, search: str):
    return await service.get_by_search(search, current_user)


@router.get("/get_all")
async def get_all_boards(current_user: UserDep, service: BoardServiceDep):
    return await service.get_all(current_user)


@router.post("/create")
async def create_board(
    organization_id: UUID,
    current_user: UserDep,
    service: BoardServiceDep,
    board: CreateBoard,
):
    return await service.add(organization_id, board, current_user)


@router.patch("/update")
async def update_board(
    board_id: UUID, current_user: UserDep, service: BoardServiceDep, title: str
):
    return await service.update(board_id, title, current_user)


@router.delete("/delete")
async def delete_board(
    board_id: UUID, current_user: UserDep, service: BoardServiceDep, password: str
):
    return await service.delete(board_id, current_user, password)
