from sqlalchemy import Column, Integer, ForeignKey, Float, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel


class UserCourseProgress(BaseModel):
    """
    UserCourseProgress model for tracking user's progress in courses.

    Business Rules:
    - Tracks completion percentage (0.0 to 100.0)
    - One progress record per user per course
    - completed_lessons: Number of lessons completed
    - total_lessons: Total lessons in course (denormalized for performance)
    - is_completed: Auto-calculated when progress >= 100%

    Use Cases:
    - Track user progress in a course
    - Mark lessons as completed
    - Calculate completion percentage
    - Issue certificates when 100% complete
    """
    __tablename__ = 'user_course_progress'

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

    # Progress tracking
    completed_lessons = Column(Integer, default=0, nullable=False)
    total_lessons = Column(Integer, nullable=False)

    progress_percentage = Column(
        Float,
        CheckConstraint('progress_percentage >= 0 AND progress_percentage <= 100'),
        default=0.0,
        nullable=False
    )

    is_completed = Column(Integer, default=False, nullable=False)  # SQLite usa 0/1 para boolean

    # Relationships
    user = relationship("User", back_populates="progress")
    course = relationship("Course")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint(
            'user_id',
            'course_id',
            name='uq_user_course_progress_user_course'
        ),
    )

    def update_progress(self, completed_lessons: int):
        """
        Update progress based on completed lessons.

        Args:
            completed_lessons: Number of lessons completed
        """
        self.completed_lessons = completed_lessons

        if self.total_lessons > 0:
            self.progress_percentage = round(
                (completed_lessons / self.total_lessons) * 100, 2
            )
        else:
            self.progress_percentage = 0.0

        # Mark as completed if 100%
        self.is_completed = self.progress_percentage >= 100.0

    def __repr__(self):
        return (
            f"<UserCourseProgress("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"course_id={self.course_id}, "
            f"progress={self.progress_percentage}%"
            f")>"
        )

    def to_dict(self):
        """Convert to dict for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "completed_lessons": self.completed_lessons,
            "total_lessons": self.total_lessons,
            "progress_percentage": self.progress_percentage,
            "is_completed": bool(self.is_completed),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
