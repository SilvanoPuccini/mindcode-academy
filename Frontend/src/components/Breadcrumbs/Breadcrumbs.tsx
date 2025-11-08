"use client";

import Link from 'next/link';
import styles from './Breadcrumbs.module.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={styles.item}>
              {!isLast && item.href ? (
                <>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                  <span className={styles.separator}>/</span>
                </>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
