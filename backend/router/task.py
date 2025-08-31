from uuid import UUID
from fastapi import APIRouter

from backend.database.models import Tags
from backend.dependencies import TaskServiceDep, UserDep
from backend.schemas.task import CreateTask, UpdateTask

router = APIRouter(prefix="/task", tags=["Task"])


@router.get("/get")
async def get_tasks(search: str, service: TaskServiceDep, current_user: UserDep):
    return await service.get_by_search(search, current_user)


@router.get("/get_all")
async def get_all_tasks(current_user: UserDep, service: TaskServiceDep):
    return await service.get_all(current_user)


@router.post("/create")
async def create_task(
    board_id: UUID,
    service: TaskServiceDep,
    current_user: UserDep,
    create_task: CreateTask,
    limit_date: int,
    tag: Tags,
):
    return await service.add(board_id, create_task, current_user, limit_date, tag)


@router.patch("/update")
async def update_task(
    task_id: UUID,
    service: TaskServiceDep,
    current_user: UserDep,
    update_task: UpdateTask,
    limit_date: int = 0,
    tag: Tags | str = "",
):
    return await service.update(task_id, current_user, update_task, tag, limit_date)


@router.delete("/delete")
async def delete_task(
    task_id: UUID, service: TaskServiceDep, current_user: UserDep, password: str
):
    return await service.delete(task_id, current_user, password)
