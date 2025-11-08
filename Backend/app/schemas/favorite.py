from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FavoriteCreateRequest(BaseModel):
    """Schema for adding a course to favorites."""
    course_id: int


class FavoriteResponse(BaseModel):
    """Schema for favorite response."""
    id: int
    user_id: int
    course_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FavoriteToggleResponse(BaseModel):
    """Schema for favorite toggle response."""
    course_id: int
    is_favorited: bool
    message: str
