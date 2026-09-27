from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import User, Profile, AuditEvent
from app.schemas import LoginRequest, UserResponse
from app.security import verify_password, create_user_session, revoke_user_session, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=UserResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Controlled Demo Authentication endpoint.
    Zero public registration. Validates credentials and sets HttpOnly session cookie.
    """
    stmt = select(User).where(User.email == payload.email)
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Access restricted to authorized defensive analysts.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled.",
        )

    # Create session record
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:255]
    session_token, expires_at = create_user_session(db, user, client_ip, user_agent)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key=settings.cookie_name,
        value=session_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        expires=expires_at,
        path="/",
    )

    # Audit event
    audit = AuditEvent(
        user_id=user.id,
        action="LOGIN",
        target_resource="console",
        ip_address=client_ip,
        user_agent=user_agent,
        details={"status": "success"},
    )
    db.add(audit)
    db.commit()

    return user

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revokes active session and clears the session cookie."""
    token = request.cookies.get(settings.cookie_name)
    if token:
        revoke_user_session(db, token)

    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    # Audit event
    client_ip = request.client.host if request.client else None
    audit = AuditEvent(
        user_id=current_user.id,
        action="LOGOUT",
        target_resource="console",
        ip_address=client_ip,
        details={"status": "session_revoked"},
    )
    db.add(audit)
    db.commit()

    return {"message": "Session terminated successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves authenticated user profile and status."""
    return current_user
