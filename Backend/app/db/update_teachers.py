"""
Idempotent content updater: replaces the seed's original instructor
placeholders (real Platzi instructors' names/emails — Freddy Vega,
Diana García, etc. — which falsely implied an affiliation) with
MindCode Academy's own fictional instructors, each assigned to courses
within a single specialty only. See app/db/seed.py for the full roster
and rationale.

Safe to run multiple times, and safe to run against a database that
already has courses/lessons from app/db/seed.py — it only touches the
`teachers` table and the course_teachers association, it never creates
or duplicates courses/lessons/ratings.

Usage:
    DATABASE_URL="postgresql://..." uv run python -m app.db.update_teachers
"""

from app.db.base import SessionLocal
from app.models import Teacher, Course, course_teachers

# (name, email) — kept in sync with app/db/seed.py's TEACHERS block.
NEW_TEACHERS: list[tuple[str, str]] = [
    ("Valentina Reyes", "valentina.reyes@mindcode-academy.com"),  # Frontend & JavaScript
    ("Bruno Iglesias", "bruno.iglesias@mindcode-academy.com"),  # React & Vue
    ("Camila Duarte", "camila.duarte@mindcode-academy.com"),  # Backend, DevOps & Git
    ("Martín Sosa", "martin.sosa@mindcode-academy.com"),  # Bases de Datos
    ("Julieta Ferreyra", "julieta.ferreyra@mindcode-academy.com"),  # Python
    ("Nicolás Bravo", "nicolas.bravo@mindcode-academy.com"),  # IA / Data Science
    ("Renata Campos", "renata.campos@mindcode-academy.com"),  # UX/UI
    ("Sofía Aranda", "sofia.aranda@mindcode-academy.com"),  # Mobile (Flutter/Dart)
    ("Tomás Quiroga", "tomas.quiroga@mindcode-academy.com"),  # Ciberseguridad & Blockchain
]

# course_slug -> teacher email — kept in sync with app/db/seed.py's
# ASSIGN TEACHERS TO COURSES block.
COURSE_TEACHER_ASSIGNMENTS: dict[str, str] = {
    "curso-profesional-javascript": "valentina.reyes@mindcode-academy.com",
    "curso-python-desde-cero": "julieta.ferreyra@mindcode-academy.com",
    "curso-react-profesional": "bruno.iglesias@mindcode-academy.com",
    "curso-backend-nodejs": "camila.duarte@mindcode-academy.com",
    "curso-inteligencia-artificial-python": "nicolas.bravo@mindcode-academy.com",
    "curso-diseno-ux-ui": "renata.campos@mindcode-academy.com",
    "curso-devops-cloud": "camila.duarte@mindcode-academy.com",
    "curso-bases-datos-sql-nosql": "martin.sosa@mindcode-academy.com",
    "curso-typescript-avanzado": "valentina.reyes@mindcode-academy.com",
    "curso-git-github-profesional": "camila.duarte@mindcode-academy.com",
    "curso-vuejs-3-desde-cero": "bruno.iglesias@mindcode-academy.com",
    "curso-ciberseguridad": "tomas.quiroga@mindcode-academy.com",
    "curso-flutter-dart": "sofia.aranda@mindcode-academy.com",
    "curso-blockchain-web3": "tomas.quiroga@mindcode-academy.com",
    "curso-data-science-r": "nicolas.bravo@mindcode-academy.com",
}


def apply_teachers() -> None:
    db = SessionLocal()
    try:
        # Upsert the 9 MindCode instructors by email (idempotent).
        by_email: dict[str, Teacher] = {}
        for name, email in NEW_TEACHERS:
            teacher = db.query(Teacher).filter(Teacher.email == email).first()
            if teacher:
                teacher.name = name
            else:
                teacher = Teacher(name=name, email=email)
                db.add(teacher)
                db.flush()
            by_email[email] = teacher
        db.commit()

        # Rebuild course_teachers from scratch so no course keeps a
        # leftover assignment to an old (real-person) instructor.
        db.execute(course_teachers.delete())
        db.commit()

        assigned = 0
        for slug, email in COURSE_TEACHER_ASSIGNMENTS.items():
            course = db.query(Course).filter(Course.slug == slug).first()
            teacher = by_email.get(email)
            if not course or not teacher:
                print(f"[skip] {slug} -> {email} (course or teacher not found)")
                continue
            course.teachers.append(teacher)
            assigned += 1
        db.commit()

        # Drop any teacher left with zero courses (the old placeholder rows).
        orphaned = [t for t in db.query(Teacher).all() if not t.courses]
        for t in orphaned:
            db.delete(t)
        db.commit()

        print(
            f"Done. {len(NEW_TEACHERS)} instructors upserted, "
            f"{assigned} courses assigned, {len(orphaned)} orphaned teachers removed."
        )
    finally:
        db.close()


if __name__ == "__main__":
    apply_teachers()
