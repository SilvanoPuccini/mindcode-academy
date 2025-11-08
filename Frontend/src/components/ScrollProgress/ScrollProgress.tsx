"use client";

import { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.scss';

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
