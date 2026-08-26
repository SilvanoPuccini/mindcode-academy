"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

// Carousel: 2 rows × 5 columns = 10 visible categories.
// Auto-advances every 3 seconds. Pauses on hover.
const COLS = 5;
const ROWS = 2;
const PAGE_SIZE = COLS * ROWS;
const AUTO_INTERVAL = 3000;

export function Categories() {
  const { allCourses, filters, setFilters } = useCourses();
  const categories = useMemo(() => buildCategories(allCourses), [allCourses]);

  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  const needsCarousel = categories.length > PAGE_SIZE;

  // Current page slice
  const visibleCategories = useMemo(
    () => categories.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [categories, page]
  );

  // Split into rows
  const rows = useMemo(() => {
    const result: typeof categories[] = [];
    for (let i = 0; i < visibleCategories.length; i += COLS) {
      result.push(visibleCategories.slice(i, i + COLS));
    }
    return result;
  }, [visibleCategories]);

  // Auto-advance
  useEffect(() => {
    if (!needsCarousel || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, AUTO_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [needsCarousel, paused, totalPages]);

  const handlePrev = useCallback(() => {
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const handleNext = useCallback(() => {
    setPage((p) => (p + 1) % totalPages);
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
          className={styles.carouselWrapper}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Prev arrow */}
          {needsCarousel && (
            <button
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={handlePrev}
              aria-label="Categorías anteriores"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          )}

          {/* Category grid: 2 rows × 5 cols */}
          <div className={styles.carousel}>
            {rows.map((row, rowIdx) => (
              <div key={`${page}-${rowIdx}`} className={styles.row}>
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
                {/* Fill incomplete rows */}
                {row.length < COLS &&
                  Array.from({ length: COLS - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.cardPlaceholder} />
                  ))}
              </div>
            ))}
          </div>

          {/* Next arrow */}
          {needsCarousel && (
            <button
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={handleNext}
              aria-label="Siguientes categorías"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
