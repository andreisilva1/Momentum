from datetime import datetime, timedelta
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from fastapi import HTTPException, status
from backend.database.models import (
    Board,
    Organization,
    Status,
    Tags,
    Task,
    TasksToUsers,
    User,
)
from backend.schemas.task import CreateTask, UpdateTask
from backend.utils import verify_password
from sqlalchemy.orm import selectinload


class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, current_user: User):
        tasks = await self.session.execute(
            select(Task).where(Task.users_attached.any(User.id == current_user.id))
        )
        return tasks.scalars().all()

    async def get_by_search(self, search: str, current_user: User):
        all_tasks = await self.session.execute(
            select(Task).where(Task.title.ilike(f"%{search}%"))
        )

        return [
            task
            for task in all_tasks.scalars().all()
            if current_user in task.users_attached
        ]

    async def add(
        self,
        board_id: UUID,
        create_task: CreateTask,
        current_user: User,
        tag: Tags,
        limit_days,
    ):
        limit_days = 15 if (not limit_days or limit_days) < 0 else limit_days
        if any(
            board_id == board.id
            for org in current_user.in_organizations
            for board in org.org_boards
        ):
            new_task = Task(
                **create_task.model_dump(),
                id=uuid4(),
                creator_id=current_user.id,
                created_at=datetime.now(),
                limit_date=datetime.now() + timedelta(days=limit_days),
                tag=tag,
                board_id=board_id,
            )
            self.session.add(new_task)
            new_task_to_user = TasksToUsers(
                task_id=new_task.id, user_id=current_user.id
            )
            self.session.add(new_task_to_user)
            await self.session.commit()
            return {
                "ok": True,
                "detail": "task successfully created.",
                "task": new_task,
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No board found."
        )

    async def update(
        self,
        task_id: UUID,
        current_user: User,
        update_task: UpdateTask,
        tag: Tags | None = None,
        task_status: Status | None = None,
        limit_days: int = 0,
    ):
        limit_days = 15 if (not limit_days or limit_days) < 0 else limit_days
        result = await self.session.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        update_task.title = update_task.title if update_task.title else task.title
        if not task or task_id not in [t.id for t in current_user.tasks_attached]:
            raise HTTPException(status_code=404, detail="No task found.")

        new_task = {
            **update_task.model_dump(exclude_unset=True),
            "limit_date": task.limit_date + timedelta(days=limit_days),
            "tag": tag or task.tag,
            "status": task_status or task.status,
        }

        updated = False
        for key, value in new_task.items():
            if getattr(task, key, None) != value:
                setattr(task, key, value)
                updated = True

        if not updated:
            raise HTTPException(
                status_code=404, detail="No update informations provided."
            )

        await self.session.commit()
        await self.session.refresh(task)

        return {"ok": True, "detail": "Task updated.", "new_task": task}

    async def delete(self, task_id, current_user: User, password: str):
        if verify_password(password, current_user.password_hashed) and any(
            task_id == task.id for task in current_user.tasks_attached
        ):
            await self.session.delete(await self.session.get(Task, task_id))
            await self.session.commit()
            return {"ok": True, "detail": "Task successfully deleted"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A error occurred. Verify the provided informations.",
        )

    async def finish_task(self, task_id: UUID, current_user: User):
        result = await self.session.execute(
            select(Task)
            .where(Task.id == task_id)
            .options(
                selectinload(Task.board)
                .selectinload(Board.organization)
                .selectinload(Organization.participants)
            )
        )

        task = result.scalars().first()
        if not task or current_user not in task.board.organization.participants:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No task found."
            )
        task.finished_at = datetime.now()
        self.session.add(task)
        await self.session.commit()
        self.session.refresh(task)
        return task

    async def attach_task_to_user(
        self, current_user: User, user_email: str, task_id: UUID
    ):
        task = await self.session.execute(
            select(Task)
            .where(Task.id == task_id)
            .options(selectinload(Task.board).selectinload(Board.organization))
        )
        task = task.scalar_one_or_none()

        if [
            user_email in user.email for user in task.board.organization.participants
        ] and current_user.id == task.board.organization.creator_id:
            user = [
                participant
                for participant in task.board.organization.participants
                if participant.email == user_email
            ]
            relationship = TasksToUsers(task_id=task_id, user_id=user[0].id)
            self.session.add(relationship)
            await self.session.commit()
            return {f"Task with the id {task_id} attached to {user_email}!"}

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permissions denied. Verify that you are the administrator of the task organization and that the user provided is in the organization.",
        )
