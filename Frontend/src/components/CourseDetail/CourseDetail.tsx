"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CourseDetail } from "@/types";
import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Infinity as InfinityIcon,
  MonitorSmartphone,
  Play,
  Share2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { StarRating } from "@/components/StarRating/StarRating";
import { RatingWidget } from "@/components/RatingWidget/RatingWidget";
import { formatDuration } from "@/lib/format-duration";
import { apiFetch, publicFetch } from "@/lib/api";
import {
  buildCompletedClassIds,
  sortClassesByPosition,
  CourseProgressResponse,
} from "@/lib/course-progress";
import { inferCategory } from "@/lib/course-taxonomy";
import {
  deriveBenefits,
  splitTopicTitle,
  teacherInitials,
} from "@/lib/course-detail-derive";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/contexts/ToastContext";
import styles from "./CourseDetail.module.scss";

interface CourseDetailComponentProps {
  course: CourseDetail;
}

type TabType = "description" | "content" | "reviews";

// Row shape returned by GET /courses/{course_id}/ratings (public).
// Ratings are SCORE-ONLY on this API: there is no review text and no
// user profile attached (see Backend/app/schemas/rating.py), so the UI
// renders elegant score rows keyed by anonymous student numbers.
interface RatingRow {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  created_at: string | null;
  updated_at: string | null;
}

/** Timestamp used for ordering/display: last update wins, creation falls back. */
function ratingTimestamp(review: RatingRow): number {
  const iso = review.updated_at ?? review.created_at;
  if (!iso) return 0;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Tiny dependency-free relative formatter for Spanish copy:
 * "justo ahora", "hace 5 minutos", "hace 3 días", "hace 2 meses"...
 */
function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";

  const secondsAgo = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (secondsAgo < 60) return "justo ahora";

  const units: [number, string, string][] = [
    [31536000, "año", "años"],
    [2592000, "mes", "meses"],
    [604800, "semana", "semanas"],
    [86400, "día", "días"],
    [3600, "hora", "horas"],
    [60, "minuto", "minutos"],
  ];

  for (const [unitSeconds, singular, plural] of units) {
    if (secondsAgo >= unitSeconds) {
      const amount = Math.floor(secondsAgo / unitSeconds);
      return `hace ${amount} ${amount === 1 ? singular : plural}`;
    }
  }

  return "justo ahora";
}

/** Anonymous-but-friendly label: the API only exposes the author's id. */
function ratingAuthorLabel(userId: number): string {
  return `Estudiante #${userId}`;
}

export const CourseDetailComponent: FC<CourseDetailComponentProps> = ({ course }) => {
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Temario progress (authenticated users only): the backend returns a
  // COUNT of completed lessons for this course (no per-lesson flags), so
  // the UI maps it onto the first N classes by position. Any failure
  // (404 = course not started, offline...) degrades to an empty set.
  const [completedIds, setCompletedIds] = useState<Set<number>>(() => new Set());
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedIds(new Set());
      setProgressLoaded(false);
      return;
    }

    let cancelled = false;
    setProgressLoaded(false);

    apiFetch<CourseProgressResponse>(`/progress/course/${course.id}`, {
      skipAuthRedirect: true,
    })
      .then((progress) => {
        if (!cancelled) {
          setCompletedIds(buildCompletedClassIds(course.classes, progress.completed_lessons));
        }
      })
      .catch(() => {
        if (!cancelled) setCompletedIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setProgressLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, course.id, course.classes]);

  // Circles render only once the fetch settled so the resume pill never
  // flashes on class #1 while the request is in flight.
  const showProgressCircles = isAuthenticated && progressLoaded;

  // Curriculum renders in position order (payload order breaks ties),
  // which is also the order the free-access CTA follows: "Empezar
  // clase 1" targets the very first class of the course.
  const sortedClasses = useMemo(
    () => sortClassesByPosition(course.classes ?? []),
    [course.classes]
  );
  const firstClass = sortedClasses[0];

  // Accordion state for the curriculum: one row open at a time.
  const [openClassId, setOpenClassId] = useState<number | null>(null);

  // First incomplete class by position gets the "Seguí acá" pill (-1
  // when everything is complete). Computed over the sorted render order.
  const resumeIndex = useMemo(
    () => sortedClasses.findIndex((cls) => !completedIds.has(cls.id)),
    [sortedClasses, completedIds]
  );

  // Community reviews (public read): fetched once per course on the
  // first Reviews tab mount. Fail-silent — a failed request just shows
  // the empty state instead of an error screen.
  const [reviews, setReviews] = useState<RatingRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewCount, setReviewCount] = useState(course.total_ratings ?? 0);
  const reviewsRequestedRef = useRef(false);

  useEffect(() => {
    if (activeTab !== "reviews" || reviewsRequestedRef.current) return;
    reviewsRequestedRef.current = true;
    setReviewsLoading(true);

    publicFetch<RatingRow[]>(`/courses/${course.id}/ratings`, { cache: "no-store" })
      .then((rows) => {
        setReviews(rows);
        setReviewCount(rows.length);
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  }, [activeTab, course.id]);

  // Newest first: last update wins, creation date breaks ties/fallbacks.
  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => ratingTimestamp(b) - ratingTimestamp(a)),
    [reviews]
  );

  const teachers = course.teachers ?? [];
  const teacherNames = teachers.map((teacher) => teacher.name).join(", ");

  // Blueprint hero: the gradient word comes from the inferred category
  // label when it appears in the course name; otherwise the last word
  // of the title is highlighted.
  const categoryLabel = inferCategory(course).label;
  const topic = useMemo(
    () => splitTopicTitle(course.name, categoryLabel),
    [course.name, categoryLabel]
  );

  // "Lo que aprenderás" bento: derived client-side from the description
  // sentences, with a generic fallback anchored on the category label.
  const benefits = useMemo(
    () => deriveBenefits(course.description, categoryLabel),
    [course.description, categoryLabel]
  );

  // Class durations are MINUTES (see lessons.duration in the backend seed);
  // the shared formatter renders them as "12 min" / "1 h 20 min".
  const totalDuration = sortedClasses.reduce((acc, cls) => acc + (cls.duration ?? 0), 0);

  // Free platform: the conversion CTA jumps straight into class 1.
  // Anonymous visitors keep access — class 1 is the free preview.
  const handleStartCourse = () => {
    if (!firstClass) return;
    router.push(`/classes/${firstClass.id}`);
  };

  // "Compartir curso": prefer the OS share sheet; everywhere else fall
  // back to copy-to-clipboard + toast. Closing the share sheet
  // (AbortError) is not a failure; any other share error degrades to
  // the clipboard path.
  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://mindcode-academy.com/course/${course.slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: course.name, text: course.description, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copiado al portapapeles", "success");
    } catch {
      showToast("No se pudo copiar el link", "error");
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Cursos", href: "/#catalogo" },
    { label: course.name },
  ];

  return (
    <div className={styles.pageContainer}>
      <main className={styles.layout}>
        {/* Left column · top: hero */}
        <section className={styles.heroArea} aria-labelledby="course-detail-title">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 id="course-detail-title" className={styles.heroTitle}>
            {topic.before}
            <span className={styles.topicWord}>{topic.topic}</span>
            {topic.after}
          </h1>

          {teachers.length > 0 && <p className={styles.heroTeacher}>Por {teacherNames}</p>}

          {course.average_rating && (
            <div className={styles.heroRating}>
              <StarRating
                rating={course.average_rating}
                size="medium"
                readonly={true}
              />
              <span className={styles.ratingMeta}>
                {course.average_rating.toFixed(1)} ({course.total_ratings ?? 0}{" "}
                {(course.total_ratings ?? 0) === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          )}

          {/* Personal rating: always rendered, even for unrated courses.
              The wrapper is the scroll anchor used by the Reviews tab's
              empty state ("sé el primero") CTA. */}
          <div id="rating-widget" className={styles.ratingAnchor}>
            <RatingWidget
              courseId={course.id}
              initialAverage={course.average_rating}
              initialCount={course.total_ratings}
            />
          </div>

          <figure className={styles.thumbnailFrame}>
            <Image
              src={course.thumbnail}
              alt={course.name}
              className={styles.thumbnail}
              width={1200}
              height={675}
              priority
            />
            <span className={styles.thumbnailGradient} aria-hidden="true" />
            <span className={styles.playChip} aria-hidden="true">
              <Play size={26} fill="currentColor" />
            </span>
          </figure>

          <ul className={styles.statsRow} aria-label="Datos del curso">
            <li className={styles.stat}>
              <Clock size={16} className={styles.statIcon} aria-hidden="true" />
              {formatDuration(totalDuration)}
            </li>
            <li className={styles.stat}>
              <BookOpen size={16} className={styles.statIcon} aria-hidden="true" />
              {sortedClasses.length} clases
            </li>
            <li className={styles.stat}>
              <Award size={16} className={styles.statIcon} aria-hidden="true" />
              Certificado
            </li>
          </ul>
        </section>

        {/* Right column · sticky free-access card */}
        <aside className={styles.cardArea} aria-label="Acceso al curso">
          <div className={styles.accessCard}>
            <span className={styles.freeBadge}>100% Gratis</span>

            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleStartCourse}
              disabled={!firstClass}
              aria-disabled={!firstClass}
            >
              <Play size={18} aria-hidden="true" />
              {firstClass ? "Empezar clase 1" : "Sin clases disponibles"}
            </button>

            <hr className={styles.cardDivider} />

            <div className={styles.includes}>
              <h2 className={styles.includesTitle}>Este curso incluye:</h2>
              <ul className={styles.includesList}>
                <li className={styles.includesItem}>
                  <BookOpen size={18} className={styles.includesIcon} aria-hidden="true" />
                  {sortedClasses.length} clases
                </li>
                <li className={styles.includesItem}>
                  <Clock size={18} className={styles.includesIcon} aria-hidden="true" />
                  {formatDuration(totalDuration)} de contenido
                </li>
                <li className={styles.includesItem}>
                  <Award size={18} className={styles.includesIcon} aria-hidden="true" />
                  Certificado de finalización
                </li>
                <li className={styles.includesItem}>
                  <InfinityIcon size={18} className={styles.includesIcon} aria-hidden="true" />
                  Acceso de por vida
                </li>
                <li className={styles.includesItem}>
                  <MonitorSmartphone
                    size={18}
                    className={styles.includesIcon}
                    aria-hidden="true"
                  />
                  Mobile y TV
                </li>
              </ul>
            </div>

            <hr className={styles.cardDivider} />

            <button type="button" className={styles.shareButton} onClick={handleShare}>
              <Share2 size={16} aria-hidden="true" />
              Compartir curso
            </button>
          </div>
        </aside>

        {/* Left column · bottom: tabs */}
        <section className={styles.bodyArea}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "description" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Descripción
            </button>
            <button
              className={`${styles.tab} ${activeTab === "content" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("content")}
            >
              Contenido
            </button>
            <button
              className={`${styles.tab} ${activeTab === "reviews" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviewCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className={styles.descriptionTab}>
                <h2 className={styles.sectionTitle}>Acerca de este curso</h2>
                <p className={styles.description}>{course.description}</p>

                <h2 className={styles.sectionTitle}>Lo que aprenderás</h2>
                <ul className={styles.benefitsGrid}>
                  {benefits.map((benefit) => (
                    <li key={benefit} className={styles.benefitCard}>
                      <span className={styles.benefitCheck} aria-hidden="true">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {teachers.length > 0 && (
                  <>
                    <h2 className={styles.sectionTitle}>Instructor</h2>
                    <div className={styles.instructorCard}>
                      {teachers.map((teacher) => (
                        <div key={teacher.id} className={styles.instructor}>
                          <span className={styles.instructorAvatar} aria-hidden="true">
                            {teacherInitials(teacher.name)}
                          </span>
                          <div className={styles.instructorInfo}>
                            <h3 className={styles.instructorName}>{teacher.name}</h3>
                            <p className={styles.instructorBio}>
                              Instructor en MindCode Academy
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className={styles.contentTab}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.sectionTitle}>Contenido del curso</h2>
                  <span className={styles.classesSummary}>
                    {sortedClasses.length} clases · {formatDuration(totalDuration)}
                  </span>
                </div>

                <div className={styles.classesList}>
                  {sortedClasses.map((cls, index) => {
                    const isDone = completedIds.has(cls.id);
                    const isOpen = openClassId === cls.id;
                    return (
                      <div
                        key={cls.id}
                        data-testid={`class-row-${cls.id}`}
                        className={`${styles.classRow} ${isOpen ? styles.classRowOpen : ""}`}
                      >
                        <button
                          type="button"
                          id={`class-header-${cls.id}`}
                          className={styles.classHeader}
                          onClick={() => setOpenClassId(isOpen ? null : cls.id)}
                          aria-expanded={isOpen}
                          aria-controls={`class-panel-${cls.id}`}
                        >
                          {showProgressCircles && (
                            <span
                              data-testid={`class-progress-${cls.id}`}
                              className={`${styles.progressCircle} ${isDone ? styles.circleDone : ""}`}
                              aria-hidden="true"
                            >
                              {isDone && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                            </span>
                          )}
                          <span className={styles.classNumber}>{index + 1}.</span>
                          <span className={styles.classTitle}>{cls.name}</span>
                          {showProgressCircles && (
                            <span className={styles.srOnly}>
                              {isDone ? "Clase completada" : "Clase pendiente"}
                            </span>
                          )}
                          {showProgressCircles && index === resumeIndex && (
                            <span className={styles.resumePill}>Seguí acá</span>
                          )}
                          <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
                        </button>
                        <div
                          id={`class-panel-${cls.id}`}
                          role="region"
                          aria-labelledby={`class-header-${cls.id}`}
                          className={styles.classPanel}
                          hidden={!isOpen}
                        >
                          <p className={styles.classDescription}>{cls.description}</p>
                          <div className={styles.classPanelFooter}>
                            <span className={styles.classDuration}>
                              <Clock size={14} aria-hidden="true" />
                              {formatDuration(cls.duration ?? 0)}
                            </span>
                            <Link href={`/classes/${cls.id}`} className={styles.classLink}>
                              Ver clase
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className={styles.reviewsTab}>
                <h2 className={styles.sectionTitle}>Reseñas de estudiantes</h2>

                {reviewsLoading ? (
                  <p className={styles.reviewsStatus}>Cargando reseñas...</p>
                ) : sortedReviews.length === 0 ? (
                  <div className={styles.emptyReviews}>
                    <p className={styles.emptyReviewsText}>
                      Todavía no hay reseñas — ¡sé el primero!
                    </p>
                    <a href="#rating-widget" className={styles.emptyReviewsCta}>
                      Calificar este curso
                    </a>
                  </div>
                ) : (
                  <div className={styles.reviewsList}>
                    {/* The API returns score-only ratings (no text, no user
                        profile), so each row shows the anonymous student
                        number, its stars and a relative date. */}
                    {sortedReviews.map((review) => {
                      const author = ratingAuthorLabel(review.user_id);
                      return (
                        <div key={review.id} className={styles.reviewCard} data-testid="review-row">
                          <div className={styles.reviewHeader}>
                            <div className={styles.reviewAvatar} aria-hidden="true">
                              {author.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.reviewMeta}>
                              <h3 className={styles.reviewName}>{author}</h3>
                              <div className={styles.reviewStars}>
                                <StarRating rating={review.rating} size="small" readonly={true} />
                              </div>
                            </div>
                            <time
                              className={styles.reviewDate}
                              dateTime={review.updated_at ?? review.created_at ?? undefined}
                            >
                              {formatRelativeDate(review.updated_at ?? review.created_at)}
                            </time>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
