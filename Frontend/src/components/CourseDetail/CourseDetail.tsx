"use client";

import { FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CourseDetail } from "@/types";
import { Clock, BookOpen, GraduationCap, Rocket, Play } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { StarRating } from "@/components/StarRating/StarRating";
import { ShareButtons } from "@/components/ShareButtons/ShareButtons";
import styles from "./CourseDetail.module.scss";

interface CourseDetailComponentProps {
  course: CourseDetail;
}

type TabType = "description" | "content" | "reviews";

const mockReviews = [
  {
    id: 1,
    name: "Ana Rodríguez",
    rating: 5,
    date: "Hace 2 semanas",
    comment: "Excelente curso, muy bien explicado y con ejemplos prácticos. Lo recomiendo 100%.",
  },
  {
    id: 2,
    name: "Carlos Martínez",
    rating: 5,
    date: "Hace 1 mes",
    comment: "El mejor curso que he tomado. El profesor explica de manera clara y concisa.",
  },
  {
    id: 3,
    name: "Laura Gómez",
    rating: 4,
    date: "Hace 2 meses",
    comment: "Muy buen contenido, aunque me gustaría que tuviera más ejercicios prácticos.",
  },
];

export const CourseDetailComponent: FC<CourseDetailComponentProps> = ({ course }) => {
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const router = useRouter();

  // The sticky CTA bar (position: fixed, bottom: 0) doesn't take up
  // space in normal flow, so it visually covers whatever content
  // happens to sit at the bottom of the page when scrolled all the
  // way down (the "Contenido" tab in particular). Measure its real
  // rendered height and use it as bottom padding on the main content
  // section so nothing ever ends up hidden underneath it.
  const stickyCtaRef = useRef<HTMLDivElement>(null);
  const [stickyCtaHeight, setStickyCtaHeight] = useState(0);

  useEffect(() => {
    const node = stickyCtaRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      setStickyCtaHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const teacherName = course.teachers?.map((t) => t.name).join(", ") || "Instructor";

  // Same target as the "Contenido" tab's first class
  // link: jump straight into the course from the
  // sticky CTA. Disabled (not a dead link) when the
  // course has no classes yet.
  const firstClassId = course.classes?.[0]?.id;

  const handleStartCourse = () => {
    if (!firstClassId) return;
    router.push(`/classes/${firstClassId}`);
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalDuration = course.classes.reduce((acc, cls) => acc + (cls.duration ?? 0), 0);

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Cursos", href: "/#catalogo" },
    { label: course.name },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.container}>
            <Breadcrumbs items={breadcrumbItems} />

            <div className={styles.heroGrid}>
              <div className={styles.heroLeft}>
                <h1 className={styles.heroTitle}>{course.name}</h1>
                <p className={styles.heroTeacher}>Por {teacherName}</p>

                {course.average_rating && (
                  <div className={styles.heroRating}>
                    <StarRating
                      rating={course.average_rating}
                      totalRatings={course.total_ratings}
                      showCount={true}
                      size="medium"
                      readonly={true}
                    />
                  </div>
                )}

                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <Clock size={18} className={styles.statIcon} aria-hidden="true" />
                    <span className={styles.statText}>{formatDuration(totalDuration)}</span>
                  </div>
                  <div className={styles.stat}>
                    <BookOpen size={18} className={styles.statIcon} aria-hidden="true" />
                    <span className={styles.statText}>{course.classes.length} clases</span>
                  </div>
                  <div className={styles.stat}>
                    <GraduationCap size={18} className={styles.statIcon} aria-hidden="true" />
                    <span className={styles.statText}>Certificado</span>
                  </div>
                </div>

                <div className={styles.shareContainer}>
                  <ShareButtons
                    url={typeof window !== 'undefined' ? window.location.href : `https://mindcode-academy.com/course/${course.slug}`}
                    title={course.name}
                    description={course.description}
                  />
                </div>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.thumbnailWrapper}>
                  <Image
                    src={course.thumbnail}
                    alt={course.name}
                    className={styles.thumbnail}
                    width={600}
                    height={400}
                    priority
                  />
                  <div className={styles.playOverlay}>
                    <div className={styles.playButton}>
                      <Play size={28} fill="currentColor" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className={styles.mainContent}
        style={stickyCtaHeight ? { paddingBottom: `calc(${stickyCtaHeight}px + 2rem)` } : undefined}
      >
        <div className={styles.container}>
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
              Reviews ({mockReviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className={styles.descriptionTab}>
                <h2 className={styles.sectionTitle}>Acerca de este curso</h2>
                <p className={styles.description}>{course.description}</p>

                <h3 className={styles.subsectionTitle}>Lo que aprenderás</h3>
                <ul className={styles.learningList}>
                  <li>Fundamentos sólidos desde cero</li>
                  <li>Proyectos prácticos y reales</li>
                  <li>Best practices de la industria</li>
                  <li>Herramientas y tecnologías actuales</li>
                </ul>

                <h3 className={styles.subsectionTitle}>Instructor</h3>
                <div className={styles.instructorCard}>
                  <div className={styles.instructorAvatar}>
                    {teacherName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.instructorInfo}>
                    <h4 className={styles.instructorName}>{teacherName}</h4>
                    <p className={styles.instructorBio}>
                      Experto en desarrollo de software con más de 10 años de experiencia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className={styles.contentTab}>
                <h2 className={styles.sectionTitle}>Contenido del curso</h2>
                <div className={styles.classesList}>
                  {course.classes.map((cls, index) => (
                    <Link href={`/classes/${cls.id}`} key={cls.id} className={styles.classItem}>
                      <div className={styles.classNumber}>{(index + 1).toString().padStart(2, "0")}</div>
                      <div className={styles.classInfo}>
                        <h3 className={styles.classTitle}>{cls.name}</h3>
                        <p className={styles.classDescription}>{cls.description}</p>
                      </div>
                      <span className={styles.classDuration}>{formatDuration(cls.duration ?? 0)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className={styles.reviewsTab}>
                <h2 className={styles.sectionTitle}>Reseñas de estudiantes</h2>
                <div className={styles.reviewsList}>
                  {mockReviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewAvatar}>
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.reviewMeta}>
                          <h4 className={styles.reviewName}>{review.name}</h4>
                          <div className={styles.reviewStars}>
                            <StarRating rating={review.rating} size="small" readonly={true} />
                          </div>
                        </div>
                        <span className={styles.reviewDate}>{review.date}</span>
                      </div>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className={styles.stickyCtaContainer} ref={stickyCtaRef}>
        <div className={styles.container}>
          <button
            className={styles.ctaButton}
            onClick={handleStartCourse}
            disabled={!firstClassId}
            aria-disabled={!firstClassId}
          >
            <Rocket size={20} className={styles.ctaIcon} aria-hidden="true" />
            <span className={styles.ctaText}>
              {firstClassId ? "Empezar curso" : "Sin clases disponibles"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
