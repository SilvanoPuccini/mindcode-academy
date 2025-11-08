"use client";

import { useState, useEffect } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import { useRipple } from '@/hooks/useRipple';
import styles from './SearchBar.module.scss';

export function SearchBar() {
  const { setSearchQuery } = useCourses();
  const [localQuery, setLocalQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const rippleProps = useRipple();

  // Debounce effect - actualiza el contexto después de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className={styles.searchSection}>
      <div className={styles.container}>
        <div className={`${styles.searchBox} ${focused ? styles.focused : ''}`}>
          <svg className={styles.searchIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Busca cursos de Machine Learning, Web Development, Data Science..."
            className={styles.searchInput}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {localQuery && (
            <button className={`${styles.clearBtn} ripple-container`} onClick={handleClear} {...rippleProps}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
          <button className={`${styles.searchBtn} ripple-container`} {...rippleProps}>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
