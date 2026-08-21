import styles from './loading.module.scss';

/**
 * Loading UI component for page-level loading states
 * Shows MindCode Academy branded loading screen with animated spinner
 */
export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* MindCode Academy Logo */}
        <div className={styles.logoContainer}>
          <h1 className={styles.logoPrimary}>Mind</h1>
          <h1 className={styles.logoAccent}>Code</h1>
        </div>

        {/* Animated Spinner */}
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className={styles.loadingText}>Cargando contenido...</p>
      </div>

      {/* Background Grid */}
      <div className={styles.gridBg}></div>
    </div>
  );
}
