"use client";

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import styles from './Toast.module.scss';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className={styles.icon}>
            {toast.type === 'success' && <CheckCircle2 size={20} aria-hidden="true" />}
            {toast.type === 'error' && <XCircle size={20} aria-hidden="true" />}
            {toast.type === 'info' && <Info size={20} aria-hidden="true" />}
          </span>
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.closeBtn}
            onClick={() => removeToast(toast.id)}
            aria-label="Cerrar"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
