from uuid import UUID
from fastapi import APIRouter

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
    current_user: UserDep, service: OrganizationServiceDep, organization_id: UUID
):
    return await service.delete(organization_id, current_user)
