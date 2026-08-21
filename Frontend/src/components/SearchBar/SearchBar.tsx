"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { useRipple } from '@/hooks/useRipple';
import { SEARCH_INPUT_ID } from '@/hooks/useSearchFocus';
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

  // Submit (button click or Enter key) applies the
  // query immediately - no debounce wait - and
  // brings the catalog into view. Smooth only when
  // the user allows motion.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(localQuery);
    const catalog = document.getElementById('catalogo');
    if (!catalog) return;
    const prefersSmooth = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    ).matches;
    catalog.scrollIntoView({
      behavior: prefersSmooth ? 'smooth' : 'auto',
      block: 'start',
    });
  };

  return (
    <div className={styles.searchSection} id="buscador">
      <div className={styles.container}>
        <form
          role="search"
          className={`${styles.searchBox} ${focused ? styles.focused : ''}`}
          onSubmit={handleSubmit}
        >
          <Search size={24} className={styles.searchIcon} aria-hidden="true" />
          <input
            id={SEARCH_INPUT_ID}
            type="text"
            placeholder="Busca cursos de Machine Learning, Web Development, Data Science..."
            aria-label="Buscar cursos"
            className={styles.searchInput}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {localQuery && (
            <button
              type="button"
              className={`${styles.clearBtn} ripple-container`}
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              {...rippleProps}
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className={`${styles.searchBtn} ripple-container`}
            {...rippleProps}
          >
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
}
