'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import styles from './error.module.scss';

/**
 * Error boundary component for handling runtime errors
 * Provides user-friendly error messages with MindCode Academy branding
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        {/* Error Icon */}
        <div className={styles.iconContainer}>
          <AlertCircle size={120} className={styles.errorIcon} strokeWidth={1.5} aria-hidden="true" />
        </div>

        {/* MindCode Academy Logo */}
        <div className={styles.logoContainer}>
          <h1 className={styles.logoPrimary}>Mind</h1>
          <h1 className={styles.logoAccent}>Code</h1>
        </div>

        {/* Error Message */}
        <h2 className={styles.errorTitle}>Algo salió mal</h2>
        <p className={styles.errorMessage}>
          Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
        </p>

        {/* Error Details (Dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className={styles.errorDetails}>
            <summary className={styles.detailsSummary}>Detalles técnicos</summary>
            <pre className={styles.errorStack}>
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button onClick={reset} className={styles.retryButton}>
            <RefreshCw size={20} aria-hidden="true" />
            Intentar de nuevo
          </button>

          <Link href="/" className={styles.homeButton}>
            <Home size={20} aria-hidden="true" />
            Ir al inicio
          </Link>
        </div>
      </div>

      {/* Background Grid */}
      <div className={styles.gridBg}></div>
    </div>
  );
}
