from redis.asyncio import Redis
from backend.database.config import database_settings as settings

_token_blacklist = Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)


async def add_jti_to_blacklist(jti: str):
    await _token_blacklist.set(jti, "blacklisted")


async def is_jti_blacklisted(jti: str):
    await _token_blacklist.exists(jti)
