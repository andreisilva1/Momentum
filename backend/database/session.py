from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from .config import database_settings as settings

engine = create_async_engine(url=settings.DB_URL, echo=True)


async def create_db_tables():
    async with engine.begin() as connection:
        from .models import User  # noqa: F401

        await connection.run_sync(SQLModel.metadata.create_all)


async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_session():
    async with async_session() as session:
        yield session
