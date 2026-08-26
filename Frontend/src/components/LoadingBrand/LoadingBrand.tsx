import styles from '../../app/loading.module.scss';

interface LoadingBrandProps {
  /** Context-aware loading copy, e.g. "Cargando curso…". */
  text?: string;
}

/**
 * Branded loading state used across routes: Mind|Code gradient wordmark,
 * triple-ring spinner and contextual copy. Single source of truth for
 * "the spinning circle" the whole app standardizes on.
 */
export function LoadingBrand({ text = 'Cargando contenido...' }: LoadingBrandProps) {
  return (
    <div className={styles.loadingContent}>
      <div className={styles.logoContainer} aria-hidden="true">
        <span className={styles.logoPrimary}>Mind</span>
        <span className={styles.logoAccent}>Code</span>
      </div>

      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
      </div>

      <p className={styles.loadingText}>{text}</p>
    </div>
  );
}
