import { Class, Course, CourseDetail } from "@/types";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Clock, Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount/ScrollToTopOnMount";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import Link from "next/link";
import styles from "./page.module.scss";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ClassPageProps {
  params: Promise<{ class_id: string }>;
}

async function getClassData(class_id: string): Promise<Class> {
  const res = await fetch(`${API_BASE_URL}/classes/${class_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar la clase");
  return res.json();
}

/**
 * GET /classes/{id} does not return the parent course (no course_id,
 * no course slug — verified against Backend/app/main.py:get_class_by_id).
 * The Lesson row does have a course_id column, but it isn't exposed by
 * that endpoint, so there's no direct way to ask "which course is this
 * class in". As a workaround using only existing public endpoints, we
 * fetch the course list and search each course's class list for a
 * matching id. The course catalog is small (current seed: ~18 courses),
 * so this stays cheap, and results are cached for 5 minutes since course
 * rosters change rarely — unlike the class fetch above, which stays
 * "no-store" so video/description edits show up immediately.
 */
async function findParentCourse(classId: number): Promise<CourseDetail | null> {
  try {
    const listRes = await fetch(`${API_BASE_URL}/courses`, {
      next: { revalidate: 300 },
    });
    if (!listRes.ok) return null;
    const courses: Course[] = await listRes.json();

    const details = await Promise.all(
      courses.map(async (course) => {
        try {
          const res = await fetch(`${API_BASE_URL}/courses/${course.slug}`, {
            next: { revalidate: 300 },
          });
          if (!res.ok) return null;
          return (await res.json()) as CourseDetail;
        } catch {
          return null;
        }
      })
    );

    return (
      details.find((course) => course?.classes?.some((cls) => cls.id === classId)) ?? null
    );
  } catch {
    return null;
  }
}

// The API stores durations in seconds (same
// convention as the Progress endpoints).
function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { class_id } = await params;
  const classData = await getClassData(class_id);
  const parentCourse = await findParentCourse(classData.id);

  // Detail payload fields (verified against GET /classes/{id}):
  // title, description, video, duration (seconds), slug. No course
  // reference — see findParentCourse() above.
  const title = classData.title ?? classData.name ?? "";
  const video = classData.video ?? "";
  const durationLabel =
    classData.duration && classData.duration > 0
      ? formatDuration(classData.duration)
      : null;

  // Course's class list shape (from GET /courses/{slug}) only has
  // id/name/description/slug — no duration/video per class, so the
  // sidebar can't show a duration chip per item (only the currently
  // playing class has that, from GET /classes/{id} above).
  const courseClasses = parentCourse?.classes ?? [];
  const currentIndex = courseClasses.findIndex((cls) => cls.id === classData.id);
  const prevClass = currentIndex > 0 ? courseClasses[currentIndex - 1] : null;
  const nextClass =
    currentIndex >= 0 && currentIndex < courseClasses.length - 1
      ? courseClasses[currentIndex + 1]
      : null;

  const backHref = parentCourse ? `/course/${parentCourse.slug}` : "/#catalogo";
  const backLabel = parentCourse ? "Volver al curso" : "Volver al catálogo";

  const breadcrumbItems = parentCourse
    ? [
        { label: "Inicio", href: "/" },
        { label: parentCourse.name, href: `/course/${parentCourse.slug}` },
        { label: title },
      ]
    : [{ label: "Inicio", href: "/" }, { label: title }];

  return (
    <main className={styles.page}>
      <ScrollToTopOnMount />
      <article className={styles.card}>
        <div className={styles.stage}>
          <div className={styles.stageHeader}>
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className={styles.playerWrap}>
            <VideoPlayer src={video} title={title} />
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>Clase</p>
            <h1 className={styles.title}>{title}</h1>

            {durationLabel && (
              <span className={styles.durationChip}>
                <Clock size={14} aria-hidden="true" />
                {durationLabel}
              </span>
            )}

            {classData.description && (
              <p className={styles.description}>{classData.description}</p>
            )}

            <nav className={styles.classNav} aria-label="Navegación entre clases">
              {prevClass ? (
                <Link href={`/classes/${prevClass.id}`} className={styles.navButton}>
                  <ChevronLeft size={18} aria-hidden="true" />
                  <span>Anterior</span>
                </Link>
              ) : (
                <span className={`${styles.navButton} ${styles.navButtonDisabled}`} aria-disabled="true">
                  <ChevronLeft size={18} aria-hidden="true" />
                  <span>Anterior</span>
                </span>
              )}

              <Link href={backHref} className={styles.backButton} aria-label={backLabel}>
                <ArrowLeft size={18} aria-hidden="true" />
                <span>{backLabel}</span>
              </Link>

              {nextClass ? (
                <Link
                  href={`/classes/${nextClass.id}`}
                  className={`${styles.navButton} ${styles.navButtonNext}`}
                >
                  <span>Siguiente</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <span
                  className={`${styles.navButton} ${styles.navButtonNext} ${styles.navButtonDisabled}`}
                  aria-disabled="true"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </span>
              )}
            </nav>
          </div>

          {courseClasses.length > 0 && (
            <aside className={styles.sidebar} aria-label="Clases del curso">
              <h2 className={styles.sidebarTitle}>
                <BookOpen size={18} aria-hidden="true" />
                Contenido del curso
              </h2>
              <ol className={styles.classList}>
                {courseClasses.map((cls, index) => {
                  const isActive = cls.id === classData.id;
                  return (
                    <li key={cls.id}>
                      <Link
                        href={`/classes/${cls.id}`}
                        className={`${styles.classItem} ${isActive ? styles.classItemActive : ""}`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <span className={styles.classItemNumber}>
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <span className={styles.classItemName}>{cls.name}</span>
                        {isActive && (
                          <Play size={14} className={styles.classItemPlaying} aria-hidden="true" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </aside>
          )}
        </div>
      </article>
    </main>
  );
}
