from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel


class UserFavorite(BaseModel):
    """
    UserFavorite model for storing user's favorite courses.

    Business Rules:
    - One user can favorite a course only once (UNIQUE constraint)
    - Supports soft deletes (deleted_at)
    - When deleted_at IS NULL = course is favorited
    - When deleted_at IS NOT NULL = course is unfavorited

    Use Cases:
    - Add course to favorites
    - Remove course from favorites
    - Sync favorites across devices
    """
    __tablename__ = 'user_favorites'

    # Foreign keys
    user_id = Column(
        Integer,
        ForeignKey('users.id'),
        nullable=False,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey('courses.id'),
        nullable=False,
        index=True
    )

    # Relationships
    user = relationship("User", back_populates="favorites")
    course = relationship("Course")

    # Unique constraint: one active favorite per user per course
    __table_args__ = (
        UniqueConstraint(
            'user_id',
            'course_id',
            name='uq_user_favorites_user_course'
        ),
    )

    def __repr__(self):
        return (
            f"<UserFavorite("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"course_id={self.course_id}"
            f")>"
        )

    def to_dict(self):
        """Convert to dict for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
