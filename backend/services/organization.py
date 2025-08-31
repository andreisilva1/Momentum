from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from fastapi import HTTPException, status
from backend.database.models import Board, Organization, OrganizationsToUsers, User
from backend.schemas.organization import CreateOrganization
from uuid import UUID, uuid4
from datetime import datetime


class OrganizationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_organizations_by_organization_and_user_id(
        self, organization_id: UUID, current_user: User
    ):
        organizations = await self.session.execute(
            select(Organization).where(
                Organization.id == organization_id,
                Organization.participants.any(User.id == current_user.id),
            )
        )
        return organizations

    async def get_all(self, current_user: User):
        organizations = await self.session.execute(
            select(Organization).where(
                Organization.participants.any(User.id == current_user.id)
            )
        )
        return organizations.scalars().all()

    async def get_boards(self, organization_id: UUID, current_user: User):
        organizations = await self.get_organizations_by_organization_and_user_id(
            organization_id, current_user
        )
        if organizations:
            return [
                organization.org_boards
                for organization in organizations.scalars().all()
            ][0]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No boards found with the provided ID.",
        )

    async def get_participants(self, organization_id: UUID, current_user: User):
        organization = await self.get_organizations_by_organization_and_user_id(
            organization_id, current_user
        )
        if organization:
            return organization.scalar_one_or_none().participants
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization with that ID has been found.",
        )

    async def get_by_search(self, search: str, current_user: User):
        organizations = await self.session.execute(
            select(Organization).where(
                Organization.title.ilike(f"%{search}%"),
            )
        )
        if not organizations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No organizations found with the provided title",
            )
        organizations_by_search = organizations.scalars().all()
        organizations_by_search = [
            organization
            for organization in organizations
            if current_user in organization.participants
        ]
        return organizations_by_search

    async def get_by_title(self, title: str, current_user: User):
        organizations = await self.session.execute(
            select(Organization).where(Organization.creator_id == current_user.id)
        )
        organizations = organizations.scalars().all()
        for organization in organizations:
            if organization.title == title:
                return organization
        return None

    async def add(self, organization: CreateOrganization, current_user: User):
        if not organization.title.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No name has been provided.",
            )
        existent_organization = await self.get_by_title(
            organization.title, current_user
        )
        if existent_organization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "ok": False,
                    "detail": "This name is already in use in a organization created by you.",
                },
            )
        new_organization = Organization(
            **organization.model_dump(),
            id=uuid4(),
            creator_id=current_user.id,
            created_at=datetime.now(),
        )
        new_organization_user_link = OrganizationsToUsers(
            user_id=current_user.id, organization_id=new_organization.id
        )
        self.session.add(new_organization)
        self.session.add(new_organization_user_link)
        await self.session.commit()

        return {
            "ok": True,
            "detail": "Organization created successfully",
            "organization": new_organization,
        }

    async def update(self, organization_id: UUID, title: str, current_user: User):
        organization = await self.session.get(Organization, organization_id)
        existent_organization = await self.get_by_title(title, current_user)

        if (not organization.creator_id == current_user.id) or (
            existent_organization
            and existent_organization.creator_id == current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="A error occurred. Verify the provided ID and if the name is not already in use by you.",
            )

        organization.title = title
        self.session.add(organization)
        await self.session.commit()
        await self.session.refresh(organization)
        return organization

    async def delete(self, organization_id: UUID, current_user):
        organization = await self.session.get(Organization, organization_id)
        if organization.creator_id == current_user.id:
            title = organization.title
            await self.session.delete(organization)
            await self.session.commit()
            return {"detail": f"Organization {title} successfully deleted"}
