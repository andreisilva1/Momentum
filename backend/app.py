from contextlib import asynccontextmanager
from fastapi import FastAPI

from backend.database.session import create_db_tables
from backend.router import user
from scalar_fastapi import get_scalar_api_reference


@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    yield


app = FastAPI(lifespan=lifespan_handler)
app.include_router(user.router)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.get("/scalar", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(openapi_url=app.openapi_url, title="Momentum API")
