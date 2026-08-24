"""
Pure helpers to build class (lesson) payloads for the server-side login gate.

This module has no database or settings imports on purpose: it is plain logic,
unit-testable without a database session.
"""

from typing import Any


# Position that marks the free preview lesson of a course.
FREE_PREVIEW_POSITION = 1


def build_class_payload(
    lesson_like: Any,
    course_like: Any,
    user: Any,
    total_classes: int,
) -> dict[str, Any]:
    """
    Build the serialized class payload and apply the login gate rule.

    Rule: the lesson at position 1 (free preview) always includes "video".
    Any other lesson includes "video" only when `user` is not None.

    Args:
        lesson_like: Object with id, name, description, slug, duration,
            position and video_url attributes (the Lesson model or a stub).
        course_like: Object with id, slug and name attributes (Course or stub).
        user: Authenticated user or None.
        total_classes: Total number of lessons in the course.

    Returns:
        dict: Payload with base fields; includes "video" only when allowed.
    """
    payload: dict[str, Any] = {
        "id": lesson_like.id,
        "title": lesson_like.name,
        "description": lesson_like.description,
        "slug": lesson_like.slug,
        "duration": lesson_like.duration,
        "position": lesson_like.position,
        "course_id": course_like.id,
        "course_slug": course_like.slug,
        "course_name": course_like.name,
        "total_classes": total_classes,
    }

    if lesson_like.position == FREE_PREVIEW_POSITION or user is not None:
        payload["video"] = lesson_like.video_url

    return payload


def build_login_required_detail(
    payload: dict[str, Any],
) -> dict[str, Any]:
    """
    Build the structured HTTP 401 detail for a gated class.

    Args:
        payload: Base class payload without the "video" key.

    Returns:
        dict: Detail consumed by the frontend to prompt login in context.
    """
    return {
        "msg": "Login requerido para ver esta clase",
        "course_id": payload["course_id"],
        "course_slug": payload["course_slug"],
        "course_name": payload["course_name"],
        "title": payload["title"],
        "position": payload["position"],
        "total_classes": payload["total_classes"],
    }
