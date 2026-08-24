"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Play,
} from "lucide-react";
import { Class } from "@/types";
import { ApiClientError, apiFetch, publicFetch } from "@/lib/api";
import { getToken } from "@/services/authApi";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount/ScrollToTopOnMount";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";
import styles from "./page.module.scss";

type Phase = "loading" | "locked" | "ready" | "error";

/**
 * Rich context returned by GET /classes/{id} on a 401:
 * {"detail": {msg, course_id, course_slug, course_name, title,
 *             position, total_classes}}
 */
interface GateDetailBody {
  msg?: string;
  course_id?: number;
  course_slug?: string;
  course_name?: string;
  title?: string;
  position?: number;
  total_classes?: number;
}

interface GateInfo {
  title: string;
  courseName: string | null;
  courseSlug: string | null;
  position: number | null;
  totalClasses: number | null;
}

interface CourseRoster {
  name?: string;
  classes?: Class[];
}

function getGateDetail(error: ApiClientError): GateDetailBody | null {
  const detail = (error.payload as { detail?: GateDetailBody } | undefined)?.detail;
  return detail && typeof detail === "object" ? detail : null;
}

// Rosters come back ordered by id; sort by position so the sidebar,
// prev/next navigation and lock badges reflect real playback order.
function orderCourseClasses(classes: Class[]): Class[] {
  const allPositioned = classes.every(
    (cls): cls is Class & { position: number } => typeof cls.position === "number"
  );
  if (!allPositioned) return classes;
  return [...classes].sort((a, b) => a.position - b.position);
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

function LoadingSkeleton() {
  return (
    <div
      className={styles.skeleton}
      data-testid="class-page-skeleton"
      role="status"
      aria-label="Cargando clase"
    >
      <div className={`${styles.skeletonStage} ${styles.shimmer}`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort} ${styles.shimmer}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineTitle} ${styles.shimmer}`} />
        <div className={`${styles.skeletonLine} ${styles.shimmer}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort} ${styles.shimmer}`} />
      </div>
    </div>
  );
}

function LockScreen({ gate, classHref }: { gate: GateInfo; classHref: string }) {
  const positionLabel =
    gate.position !== null && gate.totalClasses !== null
      ? `Clase ${gate.position} de ${gate.totalClasses}`
      : null;

  return (
    <section className={styles.lockScreen} data-testid="lock-screen">
      <span className={styles.lockIconWrap}>
        <Lock size={26} aria-hidden="true" />
      </span>

      {gate.courseName && <p className={styles.lockEyebrow}>{gate.courseName}</p>}

      <h1 className={styles.lockTitle}>{gate.title || "Contenido exclusivo"}</h1>

      {positionLabel && (
        <span className={styles.durationChip}>
          <Clock size={14} aria-hidden="true" />
          {positionLabel}
        </span>
      )}

      <p className={styles.lockMessage}>
        Esta clase requiere una cuenta gratuita. Inicia sesión o regístrate para
        desbloquear todas las clases del curso.
      </p>

      <div className={styles.lockActions}>
        <Link href={`/login?next=${classHref}`} className={styles.primaryButton}>
          Iniciar Sesión
        </Link>
        {gate.courseSlug && (
          <Link href={`/course/${gate.courseSlug}`} className={styles.secondaryButton}>
            Ver temario
          </Link>
        )}
      </div>
    </section>
  );
}

/**
 * Course roster sidebar (temario), shared by the playback and lock
 * screens. While logged out, every class beyond the free preview
 * (position > 1) gets a small lock badge but stays clickable: users
 * land on the lock screen with its login CTA.
 */
function TemarioSidebar({
  classes,
  activeId,
  activePosition,
  isLoggedIn,
}: {
  classes: Class[];
  activeId?: number | null;
  activePosition?: number | null;
  isLoggedIn: boolean;
}) {
  if (classes.length === 0) return null;

  return (
    <aside className={styles.sidebar} aria-label="Clases del curso">
      <h2 className={styles.sidebarTitle}>
        <BookOpen size={18} aria-hidden="true" />
        Contenido del curso
      </h2>
      <ol className={styles.classList}>
        {classes.map((cls, index) => {
          const itemNumber = cls.position ?? index + 1;
          // On the playback screen the active class is matched by id;
          // on the lock screen we only know its position from the 401 body.
          const isActive =
            activeId != null
              ? cls.id === activeId
              : activePosition != null && itemNumber === activePosition;
          const isPlaying = activeId != null && cls.id === activeId;
          const isLocked = !isLoggedIn && itemNumber > 1 && !isPlaying;
          const itemDuration =
            cls.duration && cls.duration > 0 ? formatDuration(cls.duration) : null;

          return (
            <li key={cls.id}>
              <Link
                href={`/classes/${cls.id}`}
                className={`${styles.classItem} ${isActive ? styles.classItemActive : ""}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className={styles.classItemNumber}>
                  {itemNumber.toString().padStart(2, "0")}
                </span>
                <span className={styles.classItemName}>{cls.name}</span>
                {itemDuration && (
                  <span className={styles.classItemDuration}>{itemDuration}</span>
                )}
                {isActive && (
                  <Play size={14} className={styles.classItemPlaying} aria-hidden="true" />
                )}
                {isLocked && (
                  <>
                    <Lock size={14} className={styles.classItemLock} aria-hidden="true" />
                    <span className={styles.srOnly}>Requiere cuenta gratuita</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export default function ClassPage() {
  const params = useParams<{ class_id: string }>();
  const classId = params?.class_id;

  const [phase, setPhase] = useState<Phase>("loading");
  const [classData, setClassData] = useState<Class | null>(null);
  const [gate, setGate] = useState<GateInfo | null>(null);
  const [courseClasses, setCourseClasses] = useState<Class[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Temario lists cached by course slug so prev/next navigation between
  // classes of the same course doesn't refetch the roster every time.
  const temarioCacheRef = useRef<Map<string, Class[]>>(new Map());

  useEffect(() => {
    if (!classId) return;

    let cancelled = false;

    async function loadTemario(courseSlug: string): Promise<void> {
      const cached = temarioCacheRef.current.get(courseSlug);
      if (cached) {
        setCourseClasses(cached);
        return;
      }

      try {
        // The roster is public; even logged-in users fetch it without auth.
        const course = await publicFetch<CourseRoster>(`/courses/${courseSlug}`);
        if (cancelled) return;
        const classes = orderCourseClasses(course.classes ?? []);
        temarioCacheRef.current.set(courseSlug, classes);
        setCourseClasses(classes);
      } catch {
        // The temario is a nice-to-have: the class itself still plays.
      }
    }

    async function load(): Promise<void> {
      setPhase("loading");
      setClassData(null);
      setGate(null);

      const token = getToken();
      setIsLoggedIn(Boolean(token));

      try {
        // With a session, go through apiFetch so the Bearer token rides along.
        // skipAuthRedirect keeps a 401 in-page (lock screen) instead of the
        // default hard redirect to /login.
        const data = token
          ? await apiFetch<Class>(`/classes/${classId}`, { skipAuthRedirect: true })
          : await publicFetch<Class>(`/classes/${classId}`);
        if (cancelled) return;
        setClassData(data);
        setPhase("ready");
        if (data.course_slug) void loadTemario(data.course_slug);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiClientError && error.status === 401) {
          const detail = getGateDetail(error);
          setGate({
            title: detail?.title ?? "",
            courseName: detail?.course_name ?? null,
            courseSlug: detail?.course_slug ?? null,
            position: detail?.position ?? null,
            totalClasses: detail?.total_classes ?? null,
          });
          setPhase("locked");
          if (detail?.course_slug) void loadTemario(detail.course_slug);
        } else {
          setPhase("error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (phase === "loading" || !classId) {
    return (
      <main className={styles.page}>
        <article className={styles.card}>
          <LoadingSkeleton />
        </article>
      </main>
    );
  }

  if (phase === "locked" && gate) {
    return (
      <main className={styles.page}>
        <article className={styles.card}>
          <LockScreen gate={gate} classHref={`/classes/${classId}`} />
          <TemarioSidebar
            classes={courseClasses}
            activePosition={gate.position}
            isLoggedIn={isLoggedIn}
          />
        </article>
      </main>
    );
  }

  if (phase !== "ready" || !classData) {
    return (
      <main className={styles.page}>
        <article className={styles.card}>
          <section className={styles.lockScreen} role="alert">
            <p className={styles.lockMessage}>
              No se pudo cargar la clase. Revisá tu conexión e intentá de nuevo.
            </p>
            <Link href="/" className={styles.secondaryButton}>
              Volver al inicio
            </Link>
          </section>
        </article>
      </main>
    );
  }

  const title = classData.title ?? classData.name ?? "";
  const video = classData.video ?? "";
  const durationLabel =
    classData.duration && classData.duration > 0
      ? formatDuration(classData.duration)
      : null;

  const courseSlug = classData.course_slug ?? null;
  const courseLabel =
    classData.course_name ??
    courseClasses.find((cls) => cls.course_name)?.course_name ??
    null;
  const positionLabel =
    typeof classData.position === "number" && typeof classData.total_classes === "number"
      ? `Clase ${classData.position} de ${classData.total_classes}`
      : null;

  const currentIndex = courseClasses.findIndex((cls) => cls.id === classData.id);
  const prevClass = currentIndex > 0 ? courseClasses[currentIndex - 1] : null;
  const nextClass =
    currentIndex >= 0 && currentIndex < courseClasses.length - 1
      ? courseClasses[currentIndex + 1]
      : null;

  const backHref = courseSlug ?? "/#catalogo";
  const backLabel = courseSlug ? "Volver al curso" : "Volver al catálogo";

  const breadcrumbItems = courseSlug
    ? [
        { label: "Inicio", href: "/" },
        { label: courseLabel ?? "Curso", href: `/course/${courseSlug}` },
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
            <p className={styles.eyebrow}>{positionLabel ?? "Clase"}</p>
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

          <TemarioSidebar
            classes={courseClasses}
            activeId={classData.id}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </article>
    </main>
  );
}
