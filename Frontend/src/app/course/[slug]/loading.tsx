import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import styles from "./loading.module.scss";

// Route-level loading for /course/[slug]: the standardized branded
// spinner with contextual copy. Light and transparent by design —
// no fixed overlays, no dark takeover.
export default function Loading() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Cargando curso">
      <LoadingBrand text="Cargando curso…" />
    </div>
  );
}
