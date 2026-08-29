"""
Authentication service for user registration, login, and token management.
"""

from sqlalchemy.orm import Session
from app.models import User
from app.core.security import hash_password, verify_password, create_access_token
from email_validator import validate_email, EmailNotValidError
from typing import Optional


class AuthService:
    """Service for handling authentication operations."""

    def __init__(self, db: Session):
        self.db = db

    def register_user(self, email: str, password: str, name: str) -> User:
        """
        Register a new user.

        Args:
            email: User email (validated for format and deliverability)
            password: Plain text password
            name: User name

        Returns:
            User: Created user

        Raises:
            ValueError: If email already exists or email format is invalid
        """
        # Validate email format and deliverability
        try:
            valid = validate_email(email)
            email = valid.email  # Normalize email (lowercase, etc.)
        except EmailNotValidError as e:
            raise ValueError(f"Email inválido: {str(e)}")

        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError(f"User with email {email} already exists")

        # Hash password
        password_hash = hash_password(password)

        # Create user
        new_user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            is_active=True,
            is_verified=False  # Email verification can be added later
        )

        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        return new_user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.

        Args:
            email: User email
            password: Plain text password

        Returns:
            User: Authenticated user if credentials are valid
            None: If credentials are invalid
        """
        user = self.db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        if not user.is_active:
            return None

        return user

    def create_user_token(self, user: User) -> str:
        """
        Create JWT access token for user.

        Args:
            user: User object

        Returns:
            str: JWT access token
        """
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name
        }

        access_token = create_access_token(data=token_data)
        return access_token

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User: User object if found
            None: If user not found
        """
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            email: User email

        Returns:
            User: User object if found
            None: If user not found
        """
        return self.db.query(User).filter(User.email == email).first()

    def update_user(self, user_id: int, **kwargs) -> Optional[User]:
        """
        Update user information.

        Args:
            user_id: User ID
            **kwargs: Fields to update. Callers must only pass fields the
                client actually sent (e.g. via Pydantic's
                model_dump(exclude_unset=True)) — every key present here is
                applied as-is, including None, so a field can be cleared by
                explicitly sending null. Omit a key entirely to leave it
                untouched.

        Returns:
            User: Updated user
            None: If user not found
        """
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """
        Change user password.

        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password

        Returns:
            bool: True if password changed successfully

        Raises:
            ValueError: If current password is incorrect
        """
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        self.db.commit()

        return True
