"use client";

import { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import styles from "./Course.module.scss";
import { Course as CourseType } from "@/types";
import { StarRating } from "@/components/StarRating/StarRating";
import { useCourses } from "@/contexts/CourseContext";
import { useToast } from "@/contexts/ToastContext";
import { inferCategory } from "@/lib/course-taxonomy";
import { courseDurationMinutes } from "@/lib/course-search";
import { formatDuration } from "@/lib/format-duration";

type CourseProps = Omit<CourseType, "slug">;

const CourseComponent = ({
  id,
  name,
  description,
  thumbnail,
  average_rating,
  total_ratings,
  classes
}: CourseProps) => {
  const { favorites, toggleFavorite } = useCourses();
  const { showToast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);
  const isFavorite = favorites.includes(id);

  // Taxonomy badge: real category inferred from the course itself.
  const category = useMemo(() => inferCategory({ name, description }), [name, description]);

  // Meta data is optional: the list endpoint omits classes[],
  // so class count and duration render only when hydrated.
  const totalClasses = classes?.length ?? 0;
  const durationMinutes = courseDurationMinutes({ classes });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);

    const wasInFavorites = isFavorite;

    try {
      await toggleFavorite(id);
      // Show toast based on the action that just succeeded
      if (wasInFavorites) {
        showToast("Eliminado de favoritos", "info");
      } else {
        showToast("Agregado a favoritos", "success");
      }
    } catch {
      showToast("No se pudo actualizar tus favoritos", "error");
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <article className={styles.courseCard}>
      <div className={styles.thumbnailContainer}>
        <Image
          src={thumbnail}
          alt={name}
          className={styles.thumbnail}
          width={400}
          height={225}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className={styles.categoryBadge}>{category.label}</span>

        {/* Favorite Button */}
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''} ${isAnimating ? styles.animating : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className={styles.courseInfo}>
        <h2 className={styles.courseTitle}>{name}</h2>

        {(typeof average_rating === 'number' || totalClasses > 0 || durationMinutes > 0) && (
          <div className={styles.metaRow}>
            {typeof average_rating === 'number' && (
              <div className={styles.metaRating}>
                <StarRating
                  rating={average_rating}
                  totalRatings={total_ratings}
                  showCount={true}
                  size="small"
                  readonly={true}
                />
              </div>
            )}
            {totalClasses > 0 && (
              <>
                <span className={styles.metaDot} aria-hidden="true">·</span>
                <span>{totalClasses} clases</span>
              </>
            )}
            {durationMinutes > 0 && (
              <>
                <span className={styles.metaDot} aria-hidden="true">·</span>
                <span>{formatDuration(durationMinutes)}</span>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const Course = memo(CourseComponent);
