"use client";

import { useState } from 'react';
import styles from './SearchBar.module.scss';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
          <button className={styles.searchBtn}>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
