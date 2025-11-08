"""
Authentication endpoints for user registration and login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
    PasswordChangeRequest
)
from app.core.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["authentication"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency to get AuthService instance."""
    return AuthService(db)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegisterRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user account.

    Requirements:
    - Email must be unique
    - Password must be at least 8 characters
    - Password must contain: uppercase, lowercase, digit

    Returns JWT token for immediate login.
    """
    try:
        user = auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )

        # Generate token
        access_token = auth_service.create_user_token(user)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login with email and password.

    Returns JWT token on successful authentication.
    """
    user = auth_service.authenticate_user(
        email=credentials.email,
        password=credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate token
    access_token = auth_service.create_user_token(user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.

    Requires: Valid JWT token in Authorization header
    """
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_current_user(
    update_data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Update current user profile.

    Can update: name, email
    """
    updated_user = auth_service.update_user(
        user_id=current_user.id,
        name=update_data.name,
        email=update_data.email
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse.model_validate(updated_user)


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Change user password.

    Requires: Current password for verification
    """
    try:
        auth_service.change_password(
            user_id=current_user.id,
            current_password=password_data.current_password,
            new_password=password_data.new_password
        )

        return {"message": "Password changed successfully"}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
