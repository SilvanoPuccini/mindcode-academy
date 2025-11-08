'use client';

import { useEffect } from 'react';
import styles from './error.module.scss';

/**
 * Error boundary component for handling runtime errors
 * Provides user-friendly error messages with MIND IA branding
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
          <svg
            className={styles.errorIcon}
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* MIND IA Logo */}
        <div className={styles.logoContainer}>
          <h1 className={styles.logoPrimary}>MIND</h1>
          <h1 className={styles.logoAccent}>IA</h1>
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Intentar de nuevo
          </button>

          <a href="/" className={styles.homeButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Ir al inicio
          </a>
        </div>
      </div>

      {/* Background Grid */}
      <div className={styles.gridBg}></div>
    </div>
  );
}
