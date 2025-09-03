import aiosqlite
from .config import database_settings as settings

DB_PATH = settings.BLACKLIST_DB


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS token_blacklist (
                jti TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def add_jti_to_blacklist(jti: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO token_blacklist (jti) VALUES (?)", (jti,)
        )
        await db.commit()


async def is_jti_blacklisted(jti: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT 1 FROM token_blacklist WHERE jti = ? LIMIT 1", (jti,)
        )
        row = await cursor.fetchone()
        return row is not None
