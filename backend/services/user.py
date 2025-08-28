from datetime import datetime
from uuid import uuid4

from sqlmodel import select
from backend.database.models import User
from fastapi import HTTPException, status
from passlib.context import CryptContext

from backend.schemas.user import CreateUser, UpdateUser
from backend.utils import generate_access_token

password_context = CryptContext(deprecated="auto", schemes="bcrypt")


class UserService:
    def __init__(self, session):
        self.session = session

    async def get(self, username: str):
        user = await self.session.execute(select(User).where(User.username == username))
        user = user.scalar_one_or_none()
        return user

    async def add(self, user: CreateUser):
        new_user = await self.get(user.username)
        print(new_user)
        if not new_user:
            new_user = User(
                **user.model_dump(exclude=["password"]),
                password_hashed=password_context.hash(user.password),
                id=uuid4(),
                created_at=datetime.now(),
                last_update=datetime.now(),
            )
            self.session.add(new_user)
            await self.session.commit()
            await self.session.refresh(new_user)
            raise HTTPException(
                status_code=status.HTTP_201_CREATED,
                detail=f"User {new_user.username} successfully created.",
            )
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail="Already exists a user with this username",
        )

    async def update(self, current_user: User, user: UpdateUser):
        new_user = await self.get(user.username)
        if not new_user:
            new_user = {
                **user.model_dump(exclude=["password"]),
                "password_hashed": password_context.hash(user.password),
                "last_update": datetime.now(),
            }
        for key, value in new_user.items():
            setattr(current_user, key, value)
        self.session.add(current_user)
        await self.session.commit()
        await self.session.refresh(current_user)

    async def delete(self, current_user: User, password: str):
        if current_user and password_context.verify(
            current_user.password_hashed, password
        ):
            await self.session.delete(current_user)
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail=f"User {current_user.username} successfully deleted.",
            )
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Incorrect password."
        )

    async def token(self, username, password):
        user = await self.get(username)
        if not user or not password_context.verify(user.password_hashed, password):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with the provided username.",
            )

        token = generate_access_token(
            {
                {
                    "user": {
                        "username": username,
                        "id": str(user.id),
                    }
                }
            }
        )
        return token
