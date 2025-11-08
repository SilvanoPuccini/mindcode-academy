"""
Service for managing user favorites.
"""

from sqlalchemy.orm import Session
from app.models import UserFavorite, Course
from typing import List, Optional
from datetime import datetime


class FavoriteService:
    """Service for handling user favorite operations."""

    def __init__(self, db: Session):
        self.db = db

    def toggle_favorite(self, user_id: int, course_id: int) -> dict:
        """
        Toggle a course as favorite/unfavorite.

        If course is favorited: unfavorite it
        If course is not favorited: favorite it

        Args:
            user_id: User ID
            course_id: Course ID

        Returns:
            dict: Status with is_favorited boolean and message

        Raises:
            ValueError: If course doesn't exist
        """
        # Check if course exists
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise ValueError(f"Course {course_id} not found")

        # Check if already favorited
        existing_favorite = (
            self.db.query(UserFavorite)
            .filter(
                UserFavorite.user_id == user_id,
                UserFavorite.course_id == course_id,
                UserFavorite.deleted_at == None
            )
            .first()
        )

        if existing_favorite:
            # Unfavorite (soft delete)
            existing_favorite.deleted_at = datetime.utcnow()
            self.db.commit()

            return {
                "course_id": course_id,
                "is_favorited": False,
                "message": "Course removed from favorites"
            }
        else:
            # Favorite (create or restore)
            deleted_favorite = (
                self.db.query(UserFavorite)
                .filter(
                    UserFavorite.user_id == user_id,
                    UserFavorite.course_id == course_id,
                    UserFavorite.deleted_at != None
                )
                .first()
            )

            if deleted_favorite:
                # Restore deleted favorite
                deleted_favorite.deleted_at = None
                self.db.commit()
            else:
                # Create new favorite
                new_favorite = UserFavorite(
                    user_id=user_id,
                    course_id=course_id
                )
                self.db.add(new_favorite)
                self.db.commit()

            return {
                "course_id": course_id,
                "is_favorited": True,
                "message": "Course added to favorites"
            }

    def get_user_favorites(self, user_id: int) -> List[UserFavorite]:
        """
        Get all active favorites for a user.

        Args:
            user_id: User ID

        Returns:
            List[UserFavorite]: List of active favorites
        """
        favorites = (
            self.db.query(UserFavorite)
            .filter(
                UserFavorite.user_id == user_id,
                UserFavorite.deleted_at == None
            )
            .all()
        )

        return favorites

    def get_user_favorite_course_ids(self, user_id: int) -> List[int]:
        """
        Get list of course IDs that user has favorited.

        Args:
            user_id: User ID

        Returns:
            List[int]: List of course IDs
        """
        favorites = self.get_user_favorites(user_id)
        return [fav.course_id for fav in favorites]

    def is_favorited(self, user_id: int, course_id: int) -> bool:
        """
        Check if a course is favorited by user.

        Args:
            user_id: User ID
            course_id: Course ID

        Returns:
            bool: True if favorited
        """
        favorite = (
            self.db.query(UserFavorite)
            .filter(
                UserFavorite.user_id == user_id,
                UserFavorite.course_id == course_id,
                UserFavorite.deleted_at == None
            )
            .first()
        )

        return favorite is not None
