import Link from 'next/link';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.content}>
        <div className={styles.icon}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className={styles.action}>
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
