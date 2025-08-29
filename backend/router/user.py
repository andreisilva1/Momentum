from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr

from backend.database.redis import add_jti_to_blacklist
from backend.dependencies import UserDep, UserServiceDep
from backend.schemas.user import CreateUser, ReadUser
from backend.utils import return_the_access_token


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def get_user(service: UserServiceDep, email: EmailStr):
    return await service.get(email)


@router.post("/signup")
async def signup(service: UserServiceDep, user: CreateUser):
    return await service.add(user)


@router.get("/profile")
async def profile(service: UserServiceDep, current_user: UserDep):
    return await service.profile(current_user)


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
