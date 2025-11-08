import styles from './SkeletonCourse.module.scss';

export function SkeletonCourse() {
  return (
    <article className={styles.skeletonCard}>
      <div className={styles.skeletonThumbnail}>
        <div className={styles.shimmer}></div>
      </div>
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonTitle} ${styles.shimmer}`}></div>
        <div className={`${styles.skeletonText} ${styles.shimmer}`}></div>
        <div className={`${styles.skeletonText} ${styles.short} ${styles.shimmer}`}></div>
        <div className={styles.skeletonRating}>
          <div className={`${styles.skeletonStars} ${styles.shimmer}`}></div>
        </div>
      </div>
    </article>
  );
}
