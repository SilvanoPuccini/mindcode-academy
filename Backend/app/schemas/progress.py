from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProgressCreateRequest(BaseModel):
    """Schema for creating/updating course progress."""
    course_id: int
    completed_lessons: int = Field(..., ge=0)


class ProgressResponse(BaseModel):
    """Schema for progress response."""
    id: int
    user_id: int
    course_id: int
    completed_lessons: int
    total_lessons: int
    progress_percentage: float
    is_completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgressStatsResponse(BaseModel):
    """Schema for user's overall progress statistics."""
    total_courses_enrolled: int
    courses_in_progress: int
    courses_completed: int
    total_lessons_completed: int
    average_progress: float
