"""
Idempotent content updater: assigns REAL, publicly available YouTube videos
to every course, so each course has its own original topic content instead
of sharing a single placeholder link.

Every video ID was validated against YouTube's oEmbed endpoint (HTTP 200)
before being committed here. Safe to run multiple times (pure UPDATEs).

Each entry is (url, credit): `credit` is the YouTube channel name shown as
attribution next to the player (see Lesson.video_credit) — None when the
channel isn't reliably known.

Usage:
    DATABASE_URL="postgresql://..." uv run python -m app.db.update_all_videos
"""

from app.db.base import SessionLocal
from app.models import Course, Lesson

# Ordered lists keyed by course slug; lessons receive videos by position.
# IMPORTANT: keep at least as many entries as the course has lessons — a
# shorter list makes apply_real_videos() cycle (i % len(urls)) and repeat
# the same video across lessons (this is exactly the "same video 3 times"
# bug reported for curso-flutter-dart before this list was completed).
COURSE_VIDEOS: dict[str, list[tuple[str, str | None]]] = {
    "curso-profesional-javascript": [
        ("https://www.youtube.com/watch?v=RqQ1d1qEWlE", "Fazt"),  # JS para principiantes (3M views)
        ("https://www.youtube.com/watch?v=z95mZVUcJ-E", "Soy Dalto"),  # JS completo
        ("https://www.youtube.com/watch?v=EdWuxZVBEMA", "TodoCode"),  # JS desde cero
        ("https://www.youtube.com/watch?v=1glVfFxj8a4", None),  # JS completo moderno
    ],
    "curso-python-desde-cero": [
        ("https://www.youtube.com/watch?v=chPhlsHoEPo", "Fazt"),  # Python (8.8M views)
        ("https://www.youtube.com/watch?v=DLikpfc64cA", "freeCodeCamp Español"),
        ("https://www.youtube.com/watch?v=TkN2i-_4N4g", "midudev"),  # 2025
        ("https://www.youtube.com/watch?v=Kp4Mvapo5kc", None),  # Curso COMPLETO Python
    ],
    "curso-react-profesional": [
        ("https://www.youtube.com/watch?v=rLoWMU4L_qE", "Fazt"),  # React desde cero
        ("https://www.youtube.com/watch?v=6Jfk8ic3KVk", "freeCodeCamp Español"),  # 8h
        ("https://www.youtube.com/watch?v=7iobxzd_2wY", "midudev"),
        ("https://www.youtube.com/watch?v=qkzcjwnueLA", None),  # React videojuego
    ],
    "curso-backend-nodejs": [
        ("https://www.youtube.com/watch?v=tDF644vI-gs", "jonmircha"),  # Node + Express
        ("https://www.youtube.com/watch?v=isPMA0FWwJA", None),  # API REST con Node desde cero
    ],
    "curso-inteligencia-artificial-python": [
        ("https://www.youtube.com/watch?v=xyU2pzKTQE0", "Adrian Cancino"),  # ML completo
        ("https://www.youtube.com/watch?v=QbDcJUVXpxA", None),  # ML con Python - Data Science
    ],
    "curso-diseno-ux-ui": [
        ("https://www.youtube.com/watch?v=4WluMTM2oss", "jonmircha"),  # Curso UX/UI
        ("https://www.youtube.com/watch?v=Gtjc5wAyY5A", "Espacio UX"),  # Diseño UX
        ("https://www.youtube.com/watch?v=TXmQ3D4OIUA", None),  # Guía rápida UX
    ],
    "curso-devops-cloud": [
        ("https://www.youtube.com/watch?v=CV_Uf3Dq-EU", "Pelado Nerd"),  # Docker (971K)
        ("https://www.youtube.com/watch?v=wZnddhLrmiM", "midudev"),  # Docker a producción
        ("https://www.youtube.com/watch?v=Vgm9FSM0jlk", None),  # Kubernetes conceptos
        ("https://www.youtube.com/watch?v=Sccd454SgWk", None),  # Kubernetes arquitectura
    ],
    "curso-bases-datos-sql-nosql": [
        ("https://www.youtube.com/watch?v=OuJerKzV5T0", "MoureDev"),  # SQL completo
        ("https://www.youtube.com/watch?v=6JBsoPOwPew", "Sergie Code"),  # SQL MySQL/PG
        ("https://www.youtube.com/watch?v=8N4M994IDt8", None),  # SQL y BD 8 horas
        # NOTE: no Spanish-language, 2025+-verifiable video surfaced during
        # curation for "NoSQL con MongoDB" / "Redis y Caching" — these two
        # lessons still cycle onto the 3 videos above until a verified one
        # is found. Not a regression: same behavior as before this pass.
    ],
    "curso-typescript-avanzado": [
        ("https://www.youtube.com/watch?v=qObAEqBEKHI", None),  # Curso TypeScript sesión 1+
        ("https://www.youtube.com/watch?v=7XRyVqPpBi0", None),  # TS desde cero - instalación
        ("https://www.youtube.com/watch?v=4lAYfsq-2TE", None),  # React + TypeScript práctico
    ],
    "curso-git-github-profesional": [
        ("https://www.youtube.com/watch?v=3GymExBkKjE", "MoureDev"),  # Git/GitHub (5h)
        ("https://www.youtube.com/watch?v=9ZJ-K-zk_Go", "Soy Dalto"),  # GIT completo
        ("https://www.youtube.com/watch?v=PW_A-lOpVV0", "Bluuweb"),  # Git/GitHub
        ("https://www.youtube.com/watch?v=mBYSUUnMt9M", "freeCodeCamp Español"),
    ],
    "curso-vuejs-3-desde-cero": [
        # "Composition API" — original curated video (5h complete course).
        ("https://www.youtube.com/watch?v=KdfrY2GYuTo", None),
        # "Componentes y Props" — best topical match found; upload date
        # could not be verified as 2025+, flagged for manual confirmation.
        ("https://www.youtube.com/watch?v=gpjIa6hXrsA", None),
        # "Pinia y Estado Global" — confirmed 2025 in its own title.
        ("https://www.youtube.com/watch?v=j1xrtyzgOw8", "Cod3r Cursos"),  # VUE 3 Masterclass 2025
    ],
    "curso-ciberseguridad": [
        ("https://www.youtube.com/watch?v=9tPZZu7Bseo", "Contando Bits"),  # Kali Linux
        ("https://www.youtube.com/watch?v=jbaXMj22w-I", "Hixec"),  # Hacking ético
        ("https://www.youtube.com/watch?v=lUr9C05NfPM", None),  # Pentesting completo
    ],
    "curso-flutter-dart": [
        # "Dart desde Cero" — confirmed jun 2025.
        ("https://www.youtube.com/watch?v=jbquK626iyU", "Cry Code"),  # async & await en Dart
        # "Widgets y Layout" — original curated video, confirmed 2025
        # (published mar 2025 per its own upload metadata).
        ("https://www.youtube.com/watch?v=IKG1eV2SetA", "AristiDevs"),  # Flutter/Dart completo (9h)
        # "Navegación y Estado" — confirmed nov 2025 (GoRouter + ShellRoute).
        ("https://www.youtube.com/watch?v=6LzXm4QWtVs", "Cry Code"),
    ],
    "curso-blockchain-web3": [
        ("https://www.youtube.com/watch?v=bN3seZiVJmk", "Fazt"),  # Desarrollo Blockchain
        ("https://www.youtube.com/watch?v=syFww00o7ug", None),  # Foundry - desplegar contratos
        ("https://www.youtube.com/watch?v=EWXy3ov5KVY", None),  # Solidity - mappings
    ],
    # NOTE: no high-quality Spanish R-specific course surfaced during
    # curation (checked again during this pass — still nothing verifiable
    # as 2025+); assigned the Data-Science-themed ML course as interim
    # content. All 3 lessons of this course still cycle onto this single
    # video until a real one is found.
    "curso-data-science-r": [
        ("https://www.youtube.com/watch?v=QbDcJUVXpxA", None),  # ML/Data Science (interim)
    ],
}


def apply_real_videos() -> None:
    db = SessionLocal()
    try:
        updated_courses = 0
        for slug, entries in COURSE_VIDEOS.items():
            course = db.query(Course).filter(Course.slug == slug).first()
            if not course:
                print(f"[skip] '{slug}' not found")
                continue

            lessons = (
                db.query(Lesson)
                .filter(Lesson.course_id == course.id)
                .order_by(Lesson.position.asc(), Lesson.id.asc())
                .all()
            )
            if len(entries) < len(lessons):
                print(
                    f"[warn] {slug}: only {len(entries)} curated videos for "
                    f"{len(lessons)} lessons — some will repeat"
                )

            changed = 0
            for i, lesson in enumerate(lessons):
                url, credit = entries[i % len(entries)]
                if lesson.video_url != url or lesson.video_credit != credit:
                    lesson.video_url = url
                    lesson.video_credit = credit
                    changed += 1
            db.commit()
            updated_courses += 1
            print(f"[ok] {slug}: {changed}/{len(lessons)} lessons set ({len(entries)} curated videos)")
        print(f"Done. {updated_courses} courses processed.")
    finally:
        db.close()


if __name__ == "__main__":
    apply_real_videos()
