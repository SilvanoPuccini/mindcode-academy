"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Heart,
  LogIn,
  Play,
  Rocket,
} from "lucide-react";
import styles from "./page.module.scss";
import { Course as CourseType } from "@/types";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, publicFetch } from "@/lib/api";

// Row shape returned by GET /progress (cookie auth): one entry per course
// the user ever started. See Backend/app/schemas/progress.py.
interface ProgressRow {
  id: number;
  user_id: number;
  course_id: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
}

export default function AulaPage() {
  const { favorites, allCourses: contextCourses, setAllCourses } = useCourses();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Local fallback: when context already has courses (navigated from home)
  // we use those; otherwise we fetch and keep a local copy so the page
  // works even if setAllCourses is a no-op (e.g. in tests).
  const [localCourses, setLocalCourses] = useState<CourseType[]>([]);
  const allCourses = contextCourses.length > 0 ? contextCourses : localCourses;
  const [coursesLoading, setCoursesLoading] = useState(allCourses.length === 0);

  // Progress rows for the authenticated session (empty while anonymous).
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    // If CourseContext already has courses, skip the fetch.
    if (contextCourses.length > 0) {
      setCoursesLoading(false);
      return;
    }

    let cancelled = false;

    async function getCourses() {
      try {
        const data = await publicFetch<CourseType[]>("/courses", { cache: "no-store" });
        if (cancelled) return;
        setAllCourses(data);
        setLocalCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    }

    getCourses();
    return () => {
      cancelled = true;
    };
  }, [setAllCourses, contextCourses.length]);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setProgressRows([]);
      setProgressLoading(false);
      return;
    }

    setProgressLoading(true);

    apiFetch<ProgressRow[]>("/progress", { skipAuthRedirect: true })
      .then((rows) => {
        if (!cancelled) setProgressRows(rows);
      })
      .catch((error) => {
        console.error("Error fetching progress:", error);
        if (!cancelled) setProgressRows([]);
      })
      .finally(() => {
        if (!cancelled) setProgressLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // course_id -> catalog entry lookup. Progress rows carry no slug/title
  // of their own; rows whose course disappeared from the catalog are
  // dropped instead of rendering dead cards.
  const courseById = useMemo(() => {
    return new Map(allCourses.map((course) => [course.id, course]));
  }, [allCourses]);

  const inProgress = useMemo(
    () =>
      progressRows.filter(
        (row) =>
          !row.is_completed &&
          row.progress_percentage >= 1 &&
          row.progress_percentage <= 99 &&
          courseById.has(row.course_id)
      ),
    [progressRows, courseById]
  );

  const completed = useMemo(
    () => progressRows.filter((row) => row.is_completed && courseById.has(row.course_id)),
    [progressRows, courseById]
  );

  const loadingPage = authLoading || coursesLoading || (isAuthenticated && progressLoading);

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>Tu aprendizaje</span>
            <h1 className={styles.title}>
              Mi <span className={styles.highlight}>Aula</span>
            </h1>
            <p className={styles.subtitle}>
              Retomá tus cursos donde los dejaste y seguí sumando progreso.
            </p>
          </header>

          {loadingPage ? (
            <LoadingBrand text="Cargando tu aula…" />
          ) : !isAuthenticated ? (
            <EmptyState
              icon={<LogIn size={40} aria-hidden="true" />}
              title="Iniciá sesión para ver tu aula"
              message="Tu progreso se guarda en tu cuenta. Iniciá sesión para retomar tus cursos desde cualquier dispositivo."
              actionLabel="Iniciar sesión"
              actionHref="/login?next=/aula"
            />
          ) : progressRows.length === 0 ? (
            <EmptyState
              icon={<Rocket size={40} aria-hidden="true" />}
              title="Arrancá tu primer curso"
              message="Todavía no empezaste ningún curso. Explorá el catálogo y elegí tu próximo desafío."
              actionLabel="Explorar cursos"
              actionHref="/#catalogo"
            />
          ) : (
            <>
              {/* Stats strip */}
              <div className={styles.statsStrip}>
                <div className={styles.statCard}>
                  <BookOpen size={22} className={styles.statIcon} aria-hidden="true" />
                  <div>
                    <span className={styles.statValue}>{inProgress.length}</span>
                    <span className={styles.statLabel}>
                      {inProgress.length === 1 ? "curso en progreso" : "cursos en progreso"}
                    </span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Award size={22} className={styles.statIcon} aria-hidden="true" />
                  <div>
                    <span className={styles.statValue}>{completed.length}</span>
                    <span className={styles.statLabel}>
                      {completed.length === 1 ? "completado" : "completados"}
                    </span>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <Heart size={22} className={styles.statIcon} aria-hidden="true" />
                  <div>
                    <span className={styles.statValue}>{favorites.length}</span>
                    <span className={styles.statLabel}>
                      {favorites.length === 1 ? "favorito" : "favoritos"}
                    </span>
                  </div>
                </div>
              </div>

              {inProgress.length > 0 && (
                <section className={styles.section} aria-labelledby="continue-heading">
                  <h2 id="continue-heading" className={styles.sectionTitle}>
                    Continuar viendo
                  </h2>
                  <div className={styles.cardsGrid}>
                    {inProgress.map((row) => {
                      const course = courseById.get(row.course_id)!;
                      const percent = Math.round(row.progress_percentage);
                      return (
                        <Link
                          key={row.id}
                          href={`/course/${course.slug}`}
                          className={styles.progressCard}
                        >
                          <div className={styles.thumbWrapper}>
                            <Image
                              src={course.thumbnail}
                              alt={course.name}
                              width={400}
                              height={225}
                              className={styles.thumb}
                            />
                          </div>
                          <h3 className={styles.cardTitle}>{course.name}</h3>
                          <div
                            className={styles.progressBar}
                            role="progressbar"
                            aria-valuenow={percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progreso de ${course.name}`}
                          >
                            <span
                              className={styles.progressFill}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className={styles.cardFooter}>
                            <span className={styles.percent}>{percent}%</span>
                            <span className={styles.cta}>
                              Continuar
                              <Play size={14} fill="currentColor" aria-hidden="true" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {completed.length > 0 && (
                <section className={styles.section} aria-labelledby="completed-heading">
                  <h2 id="completed-heading" className={styles.sectionTitle}>
                    Completados
                  </h2>
                  <div className={styles.cardsGrid}>
                    {completed.map((row) => {
                      const course = courseById.get(row.course_id)!;
                      return (
                        <Link
                          key={row.id}
                          href={`/course/${course.slug}`}
                          className={styles.progressCard}
                        >
                          <div className={styles.thumbWrapper}>
                            <Image
                              src={course.thumbnail}
                              alt={course.name}
                              width={400}
                              height={225}
                              className={styles.thumb}
                            />
                            <span className={styles.completedBadge}>
                              <Award size={13} aria-hidden="true" />
                              Completado
                            </span>
                          </div>
                          <h3 className={styles.cardTitle}>{course.name}</h3>
                          <div className={styles.cardFooter}>
                            <span className={styles.percent}>100%</span>
                            <span className={styles.cta}>Repasar</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Every row pointed at a course that vanished from the catalog */}
              {inProgress.length === 0 && completed.length === 0 && (
                <EmptyState
                  icon={<Rocket size={40} aria-hidden="true" />}
                  title="No hay cursos para mostrar acá"
                  message="El progreso guardado apunta a cursos que ya no están disponibles. Explorá el catálogo para empezar uno nuevo."
                  actionLabel="Explorar cursos"
                  actionHref="/#catalogo"
                />
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
