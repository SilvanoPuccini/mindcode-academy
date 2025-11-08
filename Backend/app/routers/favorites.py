"""
Favorites endpoints for managing user's favorite courses.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.favorite_service import FavoriteService
from app.schemas.favorite import FavoriteToggleResponse, FavoriteResponse
from app.core.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/favorites", tags=["favorites"])


def get_favorite_service(db: Session = Depends(get_db)) -> FavoriteService:
    """Dependency to get FavoriteService instance."""
    return FavoriteService(db)


@router.post("/toggle/{course_id}", response_model=FavoriteToggleResponse)
def toggle_favorite(
    course_id: int,
    current_user: User = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service)
):
    """
    Toggle a course as favorite/unfavorite.

    If favorited: removes from favorites
    If not favorited: adds to favorites

    Requires authentication.
    """
    try:
        result = favorite_service.toggle_favorite(
            user_id=current_user.id,
            course_id=course_id
        )

        return FavoriteToggleResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/", response_model=List[FavoriteResponse])
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service)
):
    """
    Get all favorite courses for current user.

    Returns list of favorites with course IDs.
    """
    favorites = favorite_service.get_user_favorites(current_user.id)

    return [FavoriteResponse.model_validate(fav) for fav in favorites]


@router.get("/course-ids", response_model=List[int])
def get_favorite_course_ids(
    current_user: User = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service)
):
    """
    Get list of course IDs that user has favorited.

    Useful for syncing with frontend.
    """
    course_ids = favorite_service.get_user_favorite_course_ids(current_user.id)

    return course_ids


@router.get("/check/{course_id}", response_model=dict)
def check_if_favorited(
    course_id: int,
    current_user: User = Depends(get_current_user),
    favorite_service: FavoriteService = Depends(get_favorite_service)
):
    """
    Check if a specific course is favorited by current user.
    """
    is_favorited = favorite_service.is_favorited(current_user.id, course_id)

    return {
        "course_id": course_id,
        "is_favorited": is_favorited
    }
