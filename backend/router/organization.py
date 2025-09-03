from uuid import UUID
from fastapi import APIRouter
from pydantic import EmailStr

from backend.dependencies import OrganizationServiceDep, UserDep
from backend.schemas.organization import CreateOrganization

router = APIRouter(prefix="/organization", tags=["Organization"])


@router.get("/get")
async def get_organizations_by_search(
    current_user: UserDep, search: str, service: OrganizationServiceDep
):
    return await service.get_by_search(search, current_user)


@router.get("/get_all")
async def get_all_organizations(current_user: UserDep, service: OrganizationServiceDep):
    return await service.get_all(current_user)


@router.get("/get_all_boards")
async def get_organization_boards(
    organization_id: UUID, current_user: UserDep, service: OrganizationServiceDep
):
    return await service.get_boards(organization_id, current_user)


@router.post("/add_new_participant")
async def add_new_participant(
    current_user: UserDep,
    organization_id: UUID,
    email: str,
    service: OrganizationServiceDep,
):
    return await service.add_new_participant(organization_id, email, current_user)


@router.delete("/delete_participant")
async def delete_participant(
    current_user: UserDep,
    organization_id: UUID,
    participant_email: EmailStr,
    service: OrganizationServiceDep,
):
    return await service.delete_user_from_organization(
        organization_id, participant_email, current_user
    )


@router.get("/get_all_participants")
async def get_organization_participants(
    organization_id: UUID, current_user: UserDep, service: OrganizationServiceDep
):
    return await service.get_participants(organization_id, current_user)


@router.post("/create")
async def create_organization(
    current_user: UserDep,
    organization: CreateOrganization,
    service: OrganizationServiceDep,
):
    return await service.add(organization, current_user)


@router.patch("/update")
async def update_organization(
    current_user: UserDep,
    service: OrganizationServiceDep,
    organization_id: UUID,
    title: str,
):
    return await service.update(organization_id, title, current_user)


@router.delete("/delete")
async def delete_organization(
    current_user: UserDep,
    service: OrganizationServiceDep,
    password_confirm: str,
    organization_id: UUID,
):
    return await service.delete(organization_id, password_confirm, current_user)
