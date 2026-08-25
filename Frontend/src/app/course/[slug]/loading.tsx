import { SkeletonCourse } from "@/components/SkeletonCourse/SkeletonCourse";
import { Logo } from "@/components/Logo/Logo";
// The site-wide grid background utility (branded spinner backdrop on the
// home route) is reused verbatim so this cartel matches app/loading.tsx.
import gridStyles from "../../loading.module.scss";
import styles from "./loading.module.scss";

// Route-level branded "cartel" for cold API responses: a centered card
// with the logo lockup, a shimmer progress line and an eyebrow, dimmed
// skeleton cards below, and the shared grid background — so the course
// detail page never flashes blank while fetching.
export default function Loading() {
  return (
    <>
      <main className={styles.container} aria-busy="true" aria-label="Cargando curso">
        <div className={styles.card}>
          <Logo size={48} />
          <span className={styles.shimmerLine} aria-hidden="true" />
          <p className={styles.eyebrow}>Cargando curso…</p>
        </div>

        <section className={styles.suggestions} aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCourse key={index} />
          ))}
        </section>
      </main>
      <div className={gridStyles.gridBg} />
    </>
  );
}
