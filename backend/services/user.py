from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import select
from backend.database.models import User
from fastapi import HTTPException, status
from passlib.context import CryptContext

from backend.schemas.user import CreateUser, ReadUser
from backend.utils import generate_access_token

password_context = CryptContext(deprecated="auto", schemes="bcrypt")


class UserService:
    def __init__(self, session):
        self.session = session

    async def get(self, email: str):
        user = await self.session.execute(select(User).where(User.email == email))
        user = user.scalar_one_or_none()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this email.",
        )

    async def get_user_by_id(self, user_id: UUID) -> ReadUser:
        user = await self.session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with this id.",
            )

        return user

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

    async def update(self, current_user: User, update_infos: dict):
        print(update_infos)
        if "email" in update_infos.keys():
            new_user = await self.get(update_infos["email"])
            if new_user["data"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="The email is already in use.",
                )

        if password_context.verify(
            update_infos["password"], current_user.password_hashed
        ):
            del update_infos["password"]
            update_infos["last_update"] = datetime.now()
            for key, value in update_infos.items():
                setattr(current_user, key, value)
            self.session.add(current_user)
            await self.session.commit()
            await self.session.refresh(current_user)
            return {"updated_user": current_user, "ok": True}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "The password provided is incorrect.", "ok": False},
        )

    async def delete(self, current_user: User):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail={"detail": "No User provided.", "ok": False},
            )
        await self.session.delete(current_user)
        await self.session.commit()
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail={
                "message": f"User {current_user.username} successfully deleted.",
                "ok": True,
            },
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

    async def profile(self, current_user: User):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No user provided"
            )
        return current_user
