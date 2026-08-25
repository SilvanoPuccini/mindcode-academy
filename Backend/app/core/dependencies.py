"""
FastAPI dependencies for authentication and authorization.

Dual-transport authentication:
- Web clients send the JWT via the httpOnly "mindcode_token" cookie.
- Mobile/API clients keep sending it via the Authorization: Bearer header.

The Bearer header always wins when present; otherwise the session cookie is
used as fallback. A missing token now raises 401 uniformly (the old
HTTPBearer(auto_error=True) path answered 403 for a missing header).
"""

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.config import ACCESS_TOKEN_COOKIE_NAME
from app.core.security import decode_access_token
from app.models import User

# Non-raising scheme for both dependencies: missing/malformed Authorization
# headers yield None credentials instead of an automatic error, so the
# resolvers below can fall back to the cookie and decide the final response.
security = HTTPBearer(auto_error=False)


def _resolve_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    """
    Resolution order for the auth token:
    1. "Authorization: Bearer <token>" header (mobile/API clients)
    2. httpOnly "mindcode_token" cookie (web clients)
    Returns None when neither transport carries a token.
    """
    if credentials is not None and credentials.credentials:
        return credentials.credentials
    return request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)


def _find_user(db: Session, payload: dict | None) -> User | None:
    """
    Resolves the token payload to a user, or None when the payload is
    invalid or the referenced user does not exist. Activity is NOT checked
    here: each resolver applies its own policy (403 vs None).
    """
    if payload is None:
        return None

    user_id = payload.get("sub")
    if user_id is None:
        return None

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError):
        return None

    return db.query(User).filter(User.id == parsed_user_id).first()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from a Bearer header or the
    session cookie.

    Args:
        request: Incoming request (provides access to cookies)
        credentials: Bearer credentials parsed from the Authorization header
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: 401 when no token is present or it is invalid;
            403 when the resolved user is inactive.
    """
    token = _resolve_token(request, credentials)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = _find_user(db, payload)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return user


def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Dependency to optionally resolve the current user from a Bearer header or
    the session cookie.

    Unlike get_current_user, this never raises for authentication problems.
    Returns None when there is no token in either transport, the token is
    invalid/expired, or the referenced user does not exist (or is inactive).

    Args:
        request: Incoming request (provides access to cookies)
        credentials: Bearer credentials parsed from the Authorization header
        db: Database session

    Returns:
        User | None: The authenticated user, or None if unauthenticated
    """
    token = _resolve_token(request, credentials)
    if token is None:
        return None

    user = _find_user(db, decode_access_token(token))
    if user is None or not user.is_active:
        return None

    return user
