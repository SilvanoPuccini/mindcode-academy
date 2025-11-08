"""
Progress endpoints for tracking user's course progress.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.services.progress_service import ProgressService
from app.schemas.progress import (
    ProgressCreateRequest,
    ProgressResponse,
    ProgressStatsResponse
)
from app.core.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/progress", tags=["progress"])


def get_progress_service(db: Session = Depends(get_db)) -> ProgressService:
    """Dependency to get ProgressService instance."""
    return ProgressService(db)


@router.post("/", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
def update_progress(
    progress_data: ProgressCreateRequest,
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """
    Update or create progress for a course.

    Creates new progress or updates existing one.
    Automatically calculates percentage and completion status.
    """
    try:
        progress = progress_service.update_progress(
            user_id=current_user.id,
            course_id=progress_data.course_id,
            completed_lessons=progress_data.completed_lessons
        )

        return ProgressResponse.model_validate(progress)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/course/{course_id}", response_model=ProgressResponse)
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """
    Get progress for a specific course.

    Returns 404 if user hasn't started the course yet.
    """
    progress = progress_service.get_user_progress(current_user.id, course_id)

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No progress found for course {course_id}"
        )

    return ProgressResponse.model_validate(progress)


@router.get("/", response_model=List[ProgressResponse])
def get_all_progress(
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """
    Get all progress for current user.

    Returns list of all courses user has started.
    """
    all_progress = progress_service.get_all_user_progress(current_user.id)

    return [ProgressResponse.model_validate(p) for p in all_progress]


@router.get("/stats", response_model=ProgressStatsResponse)
def get_progress_stats(
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """
    Get overall progress statistics for current user.

    Returns:
    - Total courses enrolled
    - Courses in progress
    - Courses completed
    - Total lessons completed
    - Average progress percentage
    """
    stats = progress_service.get_user_stats(current_user.id)

    return ProgressStatsResponse(**stats)


@router.post("/lesson/{lesson_id}", response_model=ProgressResponse)
def mark_lesson_completed(
    lesson_id: int,
    course_id: int,
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    """
    Mark a specific lesson as completed.

    Automatically increments completed lessons count and updates percentage.

    Query params:
    - course_id: Course that the lesson belongs to
    """
    try:
        progress = progress_service.mark_lesson_completed(
            user_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id
        )

        return ProgressResponse.model_validate(progress)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
