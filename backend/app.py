from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.session import create_db_tables
from backend.router import board, organization, task, user
from scalar_fastapi import get_scalar_api_reference


@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    yield


app = FastAPI(lifespan=lifespan_handler)
app.include_router(user.router)
app.include_router(organization.router)
app.include_router(board.router)
app.include_router(task.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"detail": "Hello, World!"}


@app.get("/scalar", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(openapi_url=app.openapi_url, title="Momentum API")
