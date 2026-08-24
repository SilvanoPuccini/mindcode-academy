"""
Pure-logic tests for the class payload login gate.

These tests do NOT touch the database: they exercise build_class_payload
with simple stubs to verify the gating rule:
- position == 1 (free preview) always includes "video"
- other lessons include "video" only for authenticated users
"""

from dataclasses import dataclass

from app.services.class_payload import (
    FREE_PREVIEW_POSITION,
    build_class_payload,
    build_login_required_detail,
)


@dataclass
class LessonStub:
    id: int = 2
    name: str = "Variables y Tipos de Datos"
    description: str = "let, const, var y tipos primitivos"
    slug: str = "variables-tipos-datos"
    duration: int = 12
    position: int = 2
    video_url: str = "https://example.com/video"


@dataclass
class CourseStub:
    id: int = 1
    name: str = "JavaScript desde Cero"
    slug: str = "javascript-desde-cero"


def test_free_preview_includes_video_without_user():
    lesson = LessonStub(position=1)

    payload = build_class_payload(lesson, CourseStub(), user=None, total_classes=4)

    assert payload["video"] == lesson.video_url
    assert payload["position"] == FREE_PREVIEW_POSITION


def test_non_first_unauthenticated_excludes_video():
    lesson = LessonStub(position=3)

    payload = build_class_payload(lesson, CourseStub(), user=None, total_classes=4)

    assert "video" not in payload
    assert payload["id"] == lesson.id
    assert payload["title"] == lesson.name
    assert payload["description"] == lesson.description
    assert payload["slug"] == lesson.slug
    assert payload["duration"] == lesson.duration
    assert payload["position"] == 3
    assert payload["course_id"] == 1
    assert payload["course_slug"] == "javascript-desde-cero"
    assert payload["course_name"] == "JavaScript desde Cero"
    assert payload["total_classes"] == 4


def test_non_first_authenticated_includes_video():
    lesson = LessonStub(position=2)
    user = object()  # any authenticated user marker

    payload = build_class_payload(lesson, CourseStub(), user=user, total_classes=4)

    assert payload["video"] == lesson.video_url
    assert payload["position"] == 2


def test_login_required_detail_shape():
    lesson = LessonStub(position=3)

    payload = build_class_payload(lesson, CourseStub(), user=None, total_classes=4)
    detail = build_login_required_detail(payload)

    assert detail == {
        "msg": "Login requerido para ver esta clase",
        "course_id": 1,
        "course_slug": "javascript-desde-cero",
        "course_name": "JavaScript desde Cero",
        "title": "Variables y Tipos de Datos",
        "position": 3,
        "total_classes": 4,
    }
