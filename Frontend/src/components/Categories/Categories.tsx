"use client";

import { useMemo, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

// Reel: 2 rows × 5 columns = 10 visible categories per page.
// Hover for 3 seconds on the reel to expand and show all categories.
const COLS = 5;
const ROWS = 2;
const PAGE_SIZE = COLS * ROWS;
const HOVER_EXPAND_DELAY = 3000;

export function Categories() {
  const { allCourses, filters, setFilters } = useCourses();
  const categories = useMemo(() => buildCategories(allCourses), [allCourses]);

  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  const needsReel = categories.length > PAGE_SIZE;

  // Visible slice: when expanded show everything, otherwise current page.
  const visibleCategories = expanded
    ? categories
    : categories.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Split visible categories into rows for the grid.
  const rows = useMemo(() => {
    const result: typeof categories[] = [];
    for (let i = 0; i < visibleCategories.length; i += COLS) {
      result.push(visibleCategories.slice(i, i + COLS));
    }
    return result;
  }, [visibleCategories]);

  const handlePrev = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  const handleMouseEnter = useCallback(() => {
    if (!needsReel) return;
    hoverTimerRef.current = setTimeout(() => setExpanded(true), HOVER_EXPAND_DELAY);
  }, [needsReel]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setExpanded(false);
    // Snap page back to 0 if we collapsed past the end.
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const handleCategoryClick = (categoryId: number) => {
    setFilters({ ...filters, category: categoryId });
    if (typeof window === 'undefined') return;
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
    <section className={styles.categories} id="categorias" aria-label="Categorías">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Explora por <span className={styles.highlight}>categoría</span>
        </h2>

        <div
          className={styles.reelWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Prev arrow */}
          {needsReel && !expanded && (
            <button
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={handlePrev}
              disabled={page === 0}
              aria-label="Categorías anteriores"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          )}

          {/* Category grid: 2 rows × 5 cols */}
          <div className={`${styles.reel} ${expanded ? styles.expanded : ''}`}>
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className={styles.row}>
                {row.map((category) => {
                  const Icon = category.icon;
                  const isActive = filters.category === category.id;
                  return (
                    <button
                      key={category.key}
                      className={`${styles.card} ${isActive ? styles.active : ''}`}
                      onClick={() => handleCategoryClick(category.id)}
                      aria-pressed={isActive}
                    >
                      <span className={styles.categoryIcon} aria-hidden="true">
                        <Icon size={26} strokeWidth={1.75} />
                      </span>
                      <span className={styles.categoryName}>{category.label}</span>
                      <span className={styles.categoryCount}>
                        {category.count} {category.count === 1 ? 'curso' : 'cursos'}
                      </span>
                    </button>
                  );
                })}
                {/* Fill incomplete rows so alignment stays consistent */}
                {row.length < COLS &&
                  Array.from({ length: COLS - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.cardPlaceholder} />
                  ))}
              </div>
            ))}
          </div>

          {/* Next arrow */}
          {needsReel && !expanded && (
            <button
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              aria-label="Siguientes categorías"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Page dots when in reel mode */}
        {needsReel && !expanded && totalPages > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Páginas de categorías">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === page ? styles.dotActive : ''}`}
                onClick={() => setPage(i)}
                role="tab"
                aria-selected={i === page}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
