import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import styles from './loading.module.scss';

/**
 * Route-level loading: standardized branded spinner (Mind|Code wordmark,
 * triple-ring spinner, contextual copy) over the signature grid backdrop.
 */
export default function Loading() {
  return (
    <div className={styles.loadingContainer} aria-busy="true">
      <LoadingBrand text="Cargando contenido..." />
      <div className={styles.gridBg}></div>
    </div>
  );
}
