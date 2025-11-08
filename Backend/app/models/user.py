from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel


class User(BaseModel):
    """
    User model representing platform users.

    Features:
    - Email-based authentication
    - Password hashing (handled at service layer)
    - Email verification support
    - Active/inactive status
    - Relationships: favorites, progress, ratings
    """
    __tablename__ = 'users'

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)  # Hashed password
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    favorites = relationship(
        "UserFavorite",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    progress = relationship(
        "UserCourseProgress",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"

    def to_dict(self, include_sensitive=False):
        """
        Convert user to dictionary for API responses.

        Args:
            include_sensitive: If True, includes sensitive data like password_hash

        Returns:
            dict: User data
        """
        data = {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_sensitive:
            data["password_hash"] = self.password_hash

        return data
