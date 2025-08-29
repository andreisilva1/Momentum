from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr

from backend.dependencies import UserServiceDep
from backend.schemas.user import CreateUser


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def get_user(service: UserServiceDep, email: EmailStr):
    return await service.get(email)


@router.post("/signup")
async def signup(service: UserServiceDep, user: CreateUser):
    return await service.add(user)


@router.post("/login")
async def login(
    request_form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserServiceDep,
):
    token = await service.token(request_form.username, request_form.password)
    ok = True if token else False
    return {"access_token": token, "type": "jwt", "ok": ok}
