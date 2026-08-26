import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import gridStyles from "../../loading.module.scss";

// Route-level loading for /course/[slug]: the standardized branded
// spinner with contextual copy, over the shared grid backdrop.
export default function Loading() {
  return (
    <div className={gridStyles.loadingContainer} aria-busy="true" aria-label="Cargando curso">
      <LoadingBrand text="Cargando curso…" />
      <div className={gridStyles.gridBg} />
    </div>
  );
}
