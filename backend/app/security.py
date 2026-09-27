import bcrypt
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models import User, Session as UserSession

def hash_password(password: str) -> str:
    """Hashes a password with bcrypt and individual salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def hash_token(token: str) -> str:
    """Computes SHA-256 hash of a session token for secure database lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_user_session(
    db: Session,
    user: User,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> tuple[str, datetime]:
    """Generates a secure 256-bit random session token and commits to DB."""
    raw_token = secrets.token_hex(32)
    token_digest = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.session_expire_hours)

    session_record = UserSession(
        user_id=user.id,
        token_hash=token_digest,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=expires_at,
    )
    db.add(session_record)
    db.commit()

    return raw_token, expires_at

def revoke_user_session(db: Session, token: str) -> None:
    """Revokes active session on logout."""
    token_digest = hash_token(token)
    stmt = select(UserSession).where(UserSession.token_hash == token_digest)
    session_record = db.execute(stmt).scalar_one_or_none()
    if session_record:
        db.delete(session_record)
        db.commit()

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts session token from HttpOnly cookie (or Bearer Authorization header).
    Validates expiration and user status.
    """
    token = request.cookies.get(settings.cookie_name)
    if not token:
        # Check Authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session authentication required. Please log in to the Security Console.",
        )

    token_digest = hash_token(token)
    now = datetime.now(timezone.utc)

    stmt = (
        select(UserSession)
        .where(
            UserSession.token_hash == token_digest,
            UserSession.expires_at > now,
        )
    )
    session_record = db.execute(stmt).scalar_one_or_none()

    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or was revoked. Please re-authenticate.",
        )

    user = db.get(User, session_record.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or disabled.",
        )

    return user
