from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr

from backend.database.redis import add_jti_to_blacklist
from backend.dependencies import UserDep, UserServiceDep
from backend.schemas.user import CreateUser, UpdateUser
from backend.utils import return_the_access_token


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def get_user(service: UserServiceDep, email: EmailStr):
    return await service.get(email)


@router.get("/user")
async def get_user_by_id(service: UserServiceDep, id: UUID):
    return await service.get_user_by_id(id)


@router.post("/signup")
async def signup(service: UserServiceDep, user: CreateUser):
    return await service.add(user)


@router.get("/profile")
async def profile(service: UserServiceDep, current_user: UserDep):
    return await service.profile(current_user)


@router.patch("/update")
async def update(
    service: UserServiceDep, current_user: UserDep, update_infos: UpdateUser
):
    update = {
        k: v
        for k, v in update_infos.model_dump(exclude_unset=True).items()
        if v.strip() != "" and v is not None
    }
    return await service.update(current_user, update)


@router.delete("/delete")
async def delete(service: UserServiceDep, current_user: UserDep):
    return await service.delete(current_user)


@router.post("/login")
async def login(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep,
):
    token = await service.token(request_form.username, request_form.password)
    ok = True if token else False
    return {"access_token": token, "type": "jwt", "ok": ok}


@router.post("/logout")
async def logout(token_data: Annotated[dict, Depends(return_the_access_token)]):
    await add_jti_to_blacklist(token_data["jti"])
    return {"ok": True, "detail": "Successfully logged out"}
