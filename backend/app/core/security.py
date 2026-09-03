from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
import hashlib
import hmac
import os
from app.core.config import settings

def get_password_hash(password: str) -> str:
    salt = "upishield_static_salt_2026"
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2_sha256${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("pbkdf2_sha256$"):
        expected_hash = get_password_hash(plain_password)
        return hmac.compare_digest(expected_hash, hashed_password)
    # Backward compatibility with sha256 or legacy bcrypt
    sha_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if sha_hash == hashed_password:
        return True
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.verify(plain_password, hashed_password)
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
