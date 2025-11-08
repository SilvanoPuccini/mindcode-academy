import styles from "./Course.module.scss";
import { Course as CourseType } from "@/types";
import { StarRating } from "@/components/StarRating/StarRating";

type CourseProps = Omit<CourseType, "slug">;

export const Course = ({
  id,
  name,
  description,
  thumbnail,
  average_rating,
  total_ratings
}: CourseProps) => {
  // Determine badge type based on course properties
  const getBadge = () => {
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
  };

  const badge = getBadge();

  return (
    <article className={styles.courseCard}>
      <div className={styles.thumbnailContainer}>
        <img src={thumbnail} alt={name} className={styles.thumbnail} />
        {badge && (
          <span className={`${styles.badge} ${styles[badge.type]}`}>
            {badge.label}
          </span>
        )}
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
