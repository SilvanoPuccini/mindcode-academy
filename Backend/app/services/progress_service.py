"""
Service for managing user course progress.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import UserCourseProgress, Course, Lesson
from typing import List, Optional, Dict


class ProgressService:
    """Service for handling user progress operations."""

    def __init__(self, db: Session):
        self.db = db

    def update_progress(self, user_id: int, course_id: int, completed_lessons: int) -> UserCourseProgress:
        """
        Update or create progress for a user in a course.

        Args:
            user_id: User ID
            course_id: Course ID
            completed_lessons: Number of lessons completed

        Returns:
            UserCourseProgress: Updated progress

        Raises:
            ValueError: If course doesn't exist or completed_lessons invalid
        """
        # Get course and count total lessons
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise ValueError(f"Course {course_id} not found")

        total_lessons = self.db.query(func.count(Lesson.id)).filter(Lesson.course_id == course_id).scalar()
        if total_lessons == 0:
            total_lessons = 1  # Avoid division by zero

        if completed_lessons > total_lessons:
            raise ValueError(f"Completed lessons ({completed_lessons}) cannot exceed total lessons ({total_lessons})")

        # Check if progress exists
        progress = (
            self.db.query(UserCourseProgress)
            .filter(
                UserCourseProgress.user_id == user_id,
                UserCourseProgress.course_id == course_id
            )
            .first()
        )

        if progress:
            # Update existing progress
            progress.update_progress(completed_lessons)
        else:
            # Create new progress
            progress = UserCourseProgress(
                user_id=user_id,
                course_id=course_id,
                completed_lessons=completed_lessons,
                total_lessons=total_lessons
            )
            progress.update_progress(completed_lessons)
            self.db.add(progress)

        self.db.commit()
        self.db.refresh(progress)

        return progress

    def get_user_progress(self, user_id: int, course_id: int) -> Optional[UserCourseProgress]:
        """
        Get progress for a specific course.

        Args:
            user_id: User ID
            course_id: Course ID

        Returns:
            UserCourseProgress: Progress if exists
            None: If no progress found
        """
        return (
            self.db.query(UserCourseProgress)
            .filter(
                UserCourseProgress.user_id == user_id,
                UserCourseProgress.course_id == course_id
            )
            .first()
        )

    def get_all_user_progress(self, user_id: int) -> List[UserCourseProgress]:
        """
        Get all progress for a user.

        Args:
            user_id: User ID

        Returns:
            List[UserCourseProgress]: List of progress records
        """
        return (
            self.db.query(UserCourseProgress)
            .filter(UserCourseProgress.user_id == user_id)
            .all()
        )

    def get_user_stats(self, user_id: int) -> Dict:
        """
        Get overall progress statistics for a user.

        Args:
            user_id: User ID

        Returns:
            Dict: Statistics with total courses, completed, in progress, etc.
        """
        all_progress = self.get_all_user_progress(user_id)

        if not all_progress:
            return {
                "total_courses_enrolled": 0,
                "courses_in_progress": 0,
                "courses_completed": 0,
                "total_lessons_completed": 0,
                "average_progress": 0.0
            }

        total_courses = len(all_progress)
        courses_completed = sum(1 for p in all_progress if p.is_completed)
        courses_in_progress = total_courses - courses_completed
        total_lessons_completed = sum(p.completed_lessons for p in all_progress)
        average_progress = round(
            sum(p.progress_percentage for p in all_progress) / total_courses, 2
        )

        return {
            "total_courses_enrolled": total_courses,
            "courses_in_progress": courses_in_progress,
            "courses_completed": courses_completed,
            "total_lessons_completed": total_lessons_completed,
            "average_progress": average_progress
        }

    def mark_lesson_completed(self, user_id: int, course_id: int, lesson_id: int) -> UserCourseProgress:
        """
        Mark a specific lesson as completed and update progress.

        Args:
            user_id: User ID
            course_id: Course ID
            lesson_id: Lesson ID

        Returns:
            UserCourseProgress: Updated progress

        Raises:
            ValueError: If lesson or course not found
        """
        # Verify lesson exists and belongs to course
        lesson = (
            self.db.query(Lesson)
            .filter(Lesson.id == lesson_id, Lesson.course_id == course_id)
            .first()
        )
        if not lesson:
            raise ValueError(f"Lesson {lesson_id} not found in course {course_id}")

        # Get current progress
        progress = self.get_user_progress(user_id, course_id)

        if progress:
            # Increment completed lessons (if not already at max)
            if progress.completed_lessons < progress.total_lessons:
                new_completed = progress.completed_lessons + 1
                return self.update_progress(user_id, course_id, new_completed)
            return progress
        else:
            # Create new progress with 1 lesson completed
            return self.update_progress(user_id, course_id, 1)
