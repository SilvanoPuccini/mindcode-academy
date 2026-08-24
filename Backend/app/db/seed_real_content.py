"""
Idempotent content updater: wires real, publicly available YouTube videos
into the flagship demo course so playback works end-to-end in production.

All video IDs are validated against YouTube's oEmbed endpoint before being
committed here. Safe to run multiple times (pure UPDATEs keyed by slug).

Usage:
    DATABASE_URL="postgresql://..." uv run python -m app.db.seed_real_content
"""

from app.db.base import SessionLocal
from app.models import Course, Lesson

# Ordered by lesson position within the course.
COURSE_SLUG = "curso-profesional-javascript"
REAL_VIDEOS = [
    "https://www.youtube.com/watch?v=W6NZfCO5SIk",  # JS Course for Beginners - First Step
    "https://www.youtube.com/watch?v=PkZNo7MFNFg",  # Learn JavaScript - Full Course
    "https://www.youtube.com/watch?v=zJSY8tbf_ys",  # Frontend Web Dev Bootcamp (functions)
    "https://www.youtube.com/watch?v=8aGhZQkoFbQ",  # Event loop talk (async/promises)
]


def apply_real_videos() -> None:
    db = SessionLocal()
    try:
        course = db.query(Course).filter(Course.slug == COURSE_SLUG).first()
        if not course:
            print(f"Course '{COURSE_SLUG}' not found; nothing to do.")
            return

        lessons = (
            db.query(Lesson)
            .filter(Lesson.course_id == course.id)
            .order_by(Lesson.position.asc(), Lesson.id.asc())
            .all()
        )

        if len(lessons) < len(REAL_VIDEOS):
            print(
                f"Warning: course has {len(lessons)} lessons "
                f"but {len(REAL_VIDEOS)} videos provided."
            )

        updated = 0
        for lesson, url in zip(lessons, REAL_VIDEOS):
            old = lesson.video_url
            lesson.video_url = url
            updated += 1
            print(f"  [{lesson.position}] {lesson.name}: {old} -> {url}")

        db.commit()
        print(f"Done. {updated} lessons updated on '{course.name}'.")
    finally:
        db.close()


if __name__ == "__main__":
    apply_real_videos()
