from fastapi import APIRouter

from backend.dependencies import UserServiceDep
from backend.schemas.user import CreateUser


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def get_user(service: UserServiceDep, username: str):
    return await service.get(username)


@router.post("/signup")
async def signup(service: UserServiceDep, user: CreateUser):
    return await service.add(user)
