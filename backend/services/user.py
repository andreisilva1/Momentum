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

    async def get(self, email: str):
        user = await self.session.execute(select(User).where(User.email == email))
        user = user.scalar_one_or_none()
        ok = True if user else False
        return {"data": user, "ok": ok}

    async def add(self, user: CreateUser):
        new_user = await self.get(user.email)
        print(new_user)
        if not new_user["data"]:
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
                detail={
                    "message": f"User {new_user.username} successfully created.",
                    "ok": True,
                },
            )
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail={
                "message": "Already exists a user with this email. Try another.",
                "ok": False,
            },
        )

    async def update(self, current_user: User, user: UpdateUser):
        new_user = await self.get(user.username)
        if not new_user["data"]:
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
            password, current_user.password_hashed
        ):
            await self.session.delete(current_user)
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail=f"User {current_user.username} successfully deleted.",
            )
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Incorrect password."
        )

    async def token(self, email, password):
        user = await self.get(email)

        if not user["data"] or not password_context.verify(
            password, user["data"].password_hashed
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with the provided email.",
            )

        token = generate_access_token(
            {
                "user": {
                    "username": email,
                    "id": str(user["data"].id),
                }
            }
        )
        return token

    async def profile(current_user: User):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No user provided"
            )
        return current_user
