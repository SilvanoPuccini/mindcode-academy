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
import { formatDuration } from "@/lib/format-duration";
import { useAuth } from "@/hooks/useAuth";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount/ScrollToTopOnMount";
import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
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

function LoadingSkeleton() {
  return (
    <div
      className={styles.skeleton}
      data-testid="class-page-skeleton"
      role="status"
      aria-label="Cargando clase"
    >
      <LoadingBrand text="Cargando clase…" />
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
  // Session truth lives in the httpOnly cookie: useAuth() hydrates it via
  // GET /auth/me and drives the temario lock badges. The class request
  // itself always goes through apiFetch (credentials: "include"); an
  // anonymous visitor simply gets the 401 lock screen below.
  const { isAuthenticated: isLoggedIn } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [classData, setClassData] = useState<Class | null>(null);
  const [gate, setGate] = useState<GateInfo | null>(null);
  const [courseClasses, setCourseClasses] = useState<Class[]>([]);

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

      try {
        // Always apiFetch: the session cookie rides along automatically.
        // skipAuthRedirect keeps a 401 in-page (lock screen) instead of the
        // default hard redirect to /login.
        const data = await apiFetch<Class>(`/classes/${classId}`, {
          skipAuthRedirect: true,
        });
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
        <div className={styles.shell}>
          <article className={styles.card}>
            <LoadingSkeleton />
          </article>
        </div>
      </main>
    );
  }

  if (phase === "locked" && gate) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <article className={styles.card}>
            <LockScreen gate={gate} classHref={`/classes/${classId}`} />
            {courseClasses.length > 0 && (
              <div className={styles.lockedCurriculum}>
                <TemarioSidebar
                  classes={courseClasses}
                  activePosition={gate.position}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            )}
          </article>
        </div>
      </main>
    );
  }

  if (phase !== "ready" || !classData) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
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
        </div>
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

  const backHref = courseSlug ? `/course/${courseSlug}` : "/#catalogo";
  const backLabel = courseSlug ? "Volver al curso" : "Volver al catálogo";

  return (
    <main className={styles.page}>
      <ScrollToTopOnMount />
      <div className={styles.shell}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.crumbLink}>
            Inicio
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          {courseSlug && (
            <>
              <Link href={`/course/${courseSlug}`} className={styles.crumbLink}>
                {courseLabel ?? "Curso"}
              </Link>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
            </>
          )}
          <span className={styles.crumbPill}>{title}</span>
        </nav>

        <article className={styles.card}>
          <div className={styles.grid}>
            <section className={styles.mainCol}>
              <div className={styles.stage}>
                <div className={styles.playerWrap}>
                  <VideoPlayer src={video} title={title} />
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.metaRow}>
                  <p className={styles.metaLabel}>{positionLabel ?? "Clase"}</p>
                  {durationLabel && (
                    <span className={styles.durationChip}>
                      <Clock size={14} aria-hidden="true" />
                      {durationLabel}
                    </span>
                  )}
                </div>

                <h1 className={styles.title}>{title}</h1>

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
                    <span
                      className={`${styles.navButton} ${styles.navButtonDisabled}`}
                      aria-disabled="true"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                      <span>Anterior</span>
                    </span>
                  )}

                  <Link href={backHref} className={styles.navButton} aria-label={backLabel}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span>{backLabel}</span>
                  </Link>

                  {nextClass ? (
                    <Link href={`/classes/${nextClass.id}`} className={styles.navButton}>
                      <span>Siguiente</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span
                      className={`${styles.navButton} ${styles.navButtonDisabled}`}
                      aria-disabled="true"
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </span>
                  )}
                </nav>
              </div>
            </section>

            <TemarioSidebar
              classes={courseClasses}
              activeId={classData.id}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
