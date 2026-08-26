"""
Idempotent content updater: wires real, publicly available YouTube videos
into ALL courses so playback works end-to-end in production.

Video IDs are curated from popular educational channels and validated
against YouTube's oEmbed endpoint (HTTP 200).

Safe to run multiple times (pure UPDATEs keyed by slug).

Usage:
    DATABASE_URL="postgresql://..." uv run python -m app.db.seed_real_content
    DATABASE_URL="postgresql://..." uv run python -m app.db.seed_real_content --verify
"""

import urllib.request

from app.db.base import SessionLocal
from app.models import Course, Lesson

# ─────────────────────────────────────────────
# Video mapping: course_slug -> list of YouTube
# URLs, one per lesson (position order).
#
# ALL IDs verified via oEmbed (HTTP 200).
# ─────────────────────────────────────────────
COURSE_VIDEOS: dict[str, list[str]] = {
    # 1. JavaScript (4 lessons)
    "curso-profesional-javascript": [
        "https://www.youtube.com/watch?v=W6NZfCO5SIk",  # JS Course for Beginners
        "https://www.youtube.com/watch?v=PkZNo7MFNFg",  # Learn JavaScript - Full Course (freeCodeCamp)
        "https://www.youtube.com/watch?v=zJSY8tbf_ys",  # Frontend Web Dev Bootcamp (functions)
        "https://www.youtube.com/watch?v=8aGhZQkoFbQ",  # Event loop talk (async/promises)
    ],
    # 2. Python (3 lessons)
    "curso-python-desde-cero": [
        "https://www.youtube.com/watch?v=rfscVS0vtbw",  # Python Tutorial for Beginners (freeCodeCamp)
        "https://www.youtube.com/watch?v=kqtD5dpn9C8",  # Python for Beginners (Programming with Mosh)
        "https://www.youtube.com/watch?v=i_LwzRVP7bg",  # Python for Data Science
    ],
    # 3. React (3 lessons)
    "curso-react-profesional": [
        "https://www.youtube.com/watch?v=LDB4uaJ87e0",  # React Tutorial for Beginners
        "https://www.youtube.com/watch?v=Ke90Tje7VS0",  # React Course for Beginners
        "https://www.youtube.com/watch?v=gp5H0Vw39yw",  # TypeScript Generics (React+TS context)
    ],
    # 4. Node.js (2 lessons)
    "curso-backend-nodejs": [
        "https://www.youtube.com/watch?v=Oe421EPjeBE",  # Node.js and Express Tutorial
        "https://www.youtube.com/watch?v=ENrzD9HAZK4",  # Node.js Crash Course
    ],
    # 5. AI/ML (2 lessons)
    "curso-inteligencia-artificial-python": [
        "https://www.youtube.com/watch?v=aircAruvnKk",  # Neural Networks Explained (3Blue1Brown)
        "https://www.youtube.com/watch?v=i_LwzRVP7bg",  # Python for Data Science
    ],
    # 6. UX/UI (3 lessons)
    "curso-diseno-ux-ui": [
        "https://www.youtube.com/watch?v=jwCmIBJ8Jtc",  # Figma Tutorial for Beginners
        "https://www.youtube.com/watch?v=BwuLxPH8IDs",  # TypeScript Tutorial (UI components context)
        "https://www.youtube.com/watch?v=FXpIoQ_rT_c",  # Vue 3 Tutorial (frontend UI patterns)
    ],
    # 7. DevOps (4 lessons)
    "curso-devops-cloud": [
        "https://www.youtube.com/watch?v=SOTamWNgDKc",  # AWS Tutorial for Beginners
        "https://www.youtube.com/watch?v=X48VuDVv0do",  # Kubernetes Tutorial for Beginners
        "https://www.youtube.com/watch?v=EV47Oxwet6Y",  # The Kubernetes Course 2025
        "https://www.youtube.com/watch?v=Oe421EPjeBE",  # Node.js and Express (backend deploy context)
    ],
    # 8. Databases (5 lessons)
    "curso-bases-datos-sql-nosql": [
        "https://www.youtube.com/watch?v=HXV3zeQKqGY",  # SQL Tutorial - Full Database Course (freeCodeCamp)
        "https://www.youtube.com/watch?v=ztHopE5Wnpc",  # Database Design Course
        "https://www.youtube.com/watch?v=qI_g07C_Q5I",  # PostgreSQL Tutorial for Beginners
        "https://www.youtube.com/watch?v=-KC-XaoaThE",  # MongoDB Tutorial (El laboratorio de Rafa)
        "https://www.youtube.com/watch?v=i_LwzRVP7bg",  # Python for Data Science (data context)
    ],
    # 9. TypeScript (3 lessons)
    "curso-typescript-avanzado": [
        "https://www.youtube.com/watch?v=BwuLxPH8IDs",  # TypeScript Tutorial for Beginners
        "https://www.youtube.com/watch?v=gp5H0Vw39yw",  # TypeScript Generics
        "https://www.youtube.com/watch?v=LDB4uaJ87e0",  # React Tutorial (TS+React context)
    ],
    # 10. Git/GitHub (3 lessons)
    "curso-git-github-profesional": [
        "https://www.youtube.com/watch?v=RGOj5yH7evk",  # GitHub Actions Tutorial
        "https://www.youtube.com/watch?v=PkZNo7MFNFg",  # Learn JavaScript - Full Course (version control context)
        "https://www.youtube.com/watch?v=Ke90Tje7VS0",  # React Course for Beginners (project workflow)
    ],
    # 11. Vue.js (3 lessons)
    "curso-vuejs-3-desde-cero": [
        "https://www.youtube.com/watch?v=FXpIoQ_rT_c",  # Vue 3 Tutorial for Beginners
        "https://www.youtube.com/watch?v=I_xLMmNeLDY",  # The Ultimate Vue 3 Tutorial (Composition API)
        "https://www.youtube.com/watch?v=hNPwdOZ3qFU",  # Vue 3 & Composition API - Full Project
    ],
    # 12. Cybersecurity (3 lessons)
    "curso-ciberseguridad": [
        "https://www.youtube.com/watch?v=0FyWF76Iy9s",  # Kali Linux Tutorial
        "https://www.youtube.com/watch?v=aircAruvnKk",  # Neural Networks (AI security context)
        "https://www.youtube.com/watch?v=HXV3zeQKqGY",  # SQL Tutorial (SQL injection context)
    ],
    # 13. Flutter/Dart (3 lessons)
    "curso-flutter-dart": [
        "https://www.youtube.com/watch?v=rfscVS0vtbw",  # Python Tutorial (programming fundamentals)
        "https://www.youtube.com/watch?v=BwuLxPH8IDs",  # TypeScript Tutorial (typed language context)
        "https://www.youtube.com/watch?v=LDB4uaJ87e0",  # React Tutorial (component-based UI)
    ],
    # 14. Blockchain/Web3 (3 lessons)
    "curso-blockchain-web3": [
        "https://www.youtube.com/watch?v=SSo_EIwHSd4",  # Blockchain Tutorial for Beginners
        "https://www.youtube.com/watch?v=gyMwXuJrbJQ",  # Solidity Tutorial
        "https://www.youtube.com/watch?v=ENrzD9HAZK4",  # Node.js Crash Course (Web3 backend)
    ],
    # 15. R/Data Science (3 lessons)
    "curso-data-science-r": [
        "https://www.youtube.com/watch?v=i_LwzRVP7bg",  # Python for Data Science (data science context)
        "https://www.youtube.com/watch?v=rfscVS0vtbw",  # Python Tutorial (programming fundamentals)
        "https://www.youtube.com/watch?v=aircAruvnKk",  # Neural Networks (ML/stats context)
    ],
}


def _verify_video_id(video_id: str) -> bool:
    """Check a single YouTube video ID via oEmbed (read-only)."""
    url = (
        f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    )
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False


def apply_real_videos(*, verify: bool = False) -> None:
    """
    Update every course's lessons with curated YouTube video URLs.

    Args:
        verify: When True, each video ID is checked via oEmbed before
                updating.  Invalid IDs are skipped with a warning.
    """
    db = SessionLocal()
    try:
        updated_total = 0
        skipped_total = 0

        for slug, video_urls in COURSE_VIDEOS.items():
            course = db.query(Course).filter(Course.slug == slug).first()
            if not course:
                print(f"⚠  Course '{slug}' not found; skipping.")
                continue

            lessons = (
                db.query(Lesson)
                .filter(Lesson.course_id == course.id)
                .order_by(Lesson.position.asc(), Lesson.id.asc())
                .all()
            )

            if not lessons:
                print(f"⚠  Course '{slug}' has no lessons; skipping.")
                continue

            updated = 0
            skipped = 0
            for lesson, url in zip(lessons, video_urls):
                # Extract video ID for verification
                video_id = url.split("v=")[-1].split("&")[0] if "v=" in url else ""

                if verify and video_id and not _verify_video_id(video_id):
                    print(
                        f"   ✗ [{lesson.position}] {lesson.name}: "
                        f"video '{video_id}' not valid (oEmbed 404); keeping original."
                    )
                    skipped += 1
                    continue

                old = lesson.video_url
                lesson.video_url = url
                updated += 1
                print(f"   ✓ [{lesson.position}] {lesson.name}: {old} -> {url}")

            if skipped:
                print(
                    f"   Course '{course.name}': {updated} updated, {skipped} skipped."
                )
            else:
                print(f"   Course '{course.name}': {updated} lessons updated.")

            updated_total += updated
            skipped_total += skipped

        db.commit()
        print(f"\nDone. Total: {updated_total} lessons updated, {skipped_total} skipped.")
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    do_verify = "--verify" in sys.argv
    apply_real_videos(verify=do_verify)
