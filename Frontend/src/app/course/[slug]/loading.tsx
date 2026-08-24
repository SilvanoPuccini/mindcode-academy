import { SkeletonCourse } from "@/components/SkeletonCourse/SkeletonCourse";
import styles from "./loading.module.scss";

// Route-level skeleton for cold API responses: mirrors the home
// catalog section header plus a grid of shimmering course cards,
// so the course detail page never flashes blank while fetching.
export default function Loading() {
  return (
    <main className={styles.container}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>Explora la plataforma</span>
        <h1 className={styles.sectionTitle}>
          Preparando <span className={styles.highlight}>tu curso</span>
        </h1>
        <p className={styles.sectionSubtitle}>
          Estamos trayendo el programa, las clases y los profesores para ti.
        </p>
      </header>

      <section className={styles.coursesGrid} aria-busy="true" aria-label="Cargando curso">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCourse key={index} />
        ))}
      </section>
    </main>
  );
}
