from datetime import datetime, timedelta
from typing import Annotated
from fastapi import Depends, HTTPException, status
import jwt
from backend.database.config import security_settings as settings
from backend.core.security import oauth2_scheme
from backend.database.redis import is_jti_blacklisted
from passlib.context import CryptContext

password_context = CryptContext(deprecated="auto", schemes="bcrypt")


def verify_password(password, hashed_password):
    return password_context.verify(password, hashed_password)


def generate_access_token(data: dict):
    token = jwt.encode(
        payload={
            **data,
            "jti": data["user"]["id"],
            "exp": datetime.now() + timedelta(days=1),
        },
        key=settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )

    return token


def decode_access_token(token: str):
    try:
        return jwt.decode(
            jwt=token, key=settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        return None


async def return_the_access_token(token: Annotated[str, Depends(oauth2_scheme)]):
    data = decode_access_token(token)
    if data is None or await is_jti_blacklisted(data["jti"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
    return data
