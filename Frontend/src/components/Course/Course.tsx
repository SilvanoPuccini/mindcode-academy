"use client";

import { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import styles from "./Course.module.scss";
import { Course as CourseType } from "@/types";
import { StarRating } from "@/components/StarRating/StarRating";
import { useCourses } from "@/contexts/CourseContext";
import { useToast } from "@/contexts/ToastContext";

type CourseProps = Omit<CourseType, "slug">;

const CourseComponent = ({
  id,
  name,
  description,
  thumbnail,
  average_rating,
  total_ratings
}: CourseProps) => {
  const { favorites, toggleFavorite } = useCourses();
  const { showToast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);
  const isFavorite = favorites.includes(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);

    const wasInFavorites = isFavorite;
    toggleFavorite(id);

    // Show toast based on action
    if (wasInFavorites) {
      showToast("Eliminado de favoritos", "info");
    } else {
      showToast("Agregado a favoritos", "success");
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  // Memoize badge calculation to prevent unnecessary recalculations
  const badge = useMemo(() => {
    if (average_rating && average_rating >= 4.5 && total_ratings && total_ratings > 50) {
      return { type: 'top', label: '⭐ TOP RATED' };
    }
    if (total_ratings && total_ratings > 100) {
      return { type: 'trending', label: '🔥 TRENDING' };
    }
    if (id % 3 === 0) { // Example logic for new courses
      return { type: 'new', label: '✨ NUEVO' };
    }
    return null;
  }, [average_rating, total_ratings, id]);

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
        {badge && (
          <span className={`${styles.badge} ${styles[badge.type]}`}>
            {badge.label}
          </span>
        )}

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
        <p className={styles.description}>{description}</p>

        {/* Rating Section - solo mostrar si existe average_rating */}
        {typeof average_rating === 'number' && (
          <div className={styles.ratingContainer}>
            <StarRating
              rating={average_rating}
              totalRatings={total_ratings}
              showCount={true}
              size="small"
              readonly={true}
            />
          </div>
        )}
      </div>
    </article>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const Course = memo(CourseComponent);
