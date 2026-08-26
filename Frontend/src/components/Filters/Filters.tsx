"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Star, SlidersHorizontal, X } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import { DURATION_FILTER_OPTIONS } from '@/lib/course-search';
import { useRipple } from '@/hooks/useRipple';
import styles from './Filters.module.scss';

export function Filters() {
  const { allCourses, filters, setFilters } = useCourses();
  const rippleProps = useRipple();

  // Mobile bottom-sheet drawer state (the inline panel stays desktop-only).
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Derived from real courses - id 1 is reserved for "Todos"
  const categories = useMemo(() => [
    { id: 1, label: 'Todos', count: allCourses.length },
    ...buildCategories(allCourses),
  ], [allCourses]);

  // Count of active facets for the drawer button badge: selected
  // durations + non-default rating + a picked category.
  const activeCount =
    filters.durations.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.category !== 1 ? 1 : 0);

  const toggleDuration = (duration: string) => {
    const newDurations = filters.durations.includes(duration)
      ? filters.durations.filter(d => d !== duration)
      : [...filters.durations, duration];
    setFilters({ ...filters, durations: newDurations });
  };

  const handleCategoryChange = (categoryId: number) => {
    setFilters({ ...filters, category: categoryId });
  };

  const handleRatingChange = (rating: number) => {
    setFilters({ ...filters, minRating: rating });
  };

  const handleClearFilters = () => {
    setFilters({
      category: 1,
      durations: [],
      minRating: 0,
    });
  };

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Devolvé el foco al botón que abrió el drawer.
    toggleRef.current?.focus();
  }, []);

  // While the sheet is open: lock body scroll and close on Escape,
  // mirroring the Navbar's mobile menu behavior.
  useEffect(() => {
    if (!drawerOpen) return;

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  // Move focus into the sheet once it opens.
  useEffect(() => {
    if (drawerOpen) closeBtnRef.current?.focus();
  }, [drawerOpen]);

  // Shared filter controls: rendered inside both the desktop aside
  // and the mobile sheet. State is context-backed, so both stay in
  // sync and changes apply live ("Aplicar" only closes).
  const filterSections = (
    <>
      {/* Categories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categorías</h4>
        <div className={styles.categoryList}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${filters.category === category.id ? styles.active : ''} ripple-container`}
              onClick={() => handleCategoryChange(category.id)}
              aria-pressed={filters.category === category.id}
              {...rippleProps}
            >
              <span className={styles.radioDot} aria-hidden="true" />
              <span className={styles.categoryLabel}>{category.label}</span>
              <span className={styles.count}>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Duración</h4>
        <div className={styles.checkboxList}>
          {DURATION_FILTER_OPTIONS.map(duration => (
            <label key={duration} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.durations.includes(duration)}
                onChange={() => toggleDuration(duration)}
              />
              <span className={styles.checkmark}></span>
              <span>{duration}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Rating mínimo</h4>
        <div className={styles.ratingSlider}>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => handleRatingChange(Number(e.target.value))}
            className={styles.slider}
            aria-label="Rating mínimo"
          />
          <div className={styles.ratingValue}>
            {filters.minRating > 0 ? (
              <>
                {filters.minRating} <Star size={12} fill="currentColor" aria-hidden="true" /> o más
              </>
            ) : (
              'Todos'
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={styles.filters}>
        <div className={styles.header}>
          <h3 className={styles.title}>Filtros</h3>
          <button className={`${styles.clearBtn} ripple-container`} onClick={handleClearFilters} {...rippleProps}>
            Limpiar
          </button>
        </div>

        {filterSections}
      </aside>

      {/* Mobile drawer: trigger + overlay + bottom sheet. Visibility is
          pure CSS (media queries); the sheet slides with a transform
          transition gated by prefers-reduced-motion. No portals needed:
          position:fixed escapes the page flow like the Navbar menu. */}
      <div className={styles.mobileFilters}>
        <button
          ref={toggleRef}
          type="button"
          className={`${styles.mobileToggle} ripple-container`}
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-haspopup="dialog"
          {...rippleProps}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <span className={styles.badge} aria-label={`${activeCount} filtros activos`}>
              {activeCount}
            </span>
          )}
        </button>

        <div
          className={`${styles.overlay} ${drawerOpen ? styles.overlayOpen : ''}`}
          onClick={closeDrawer}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className={`${styles.sheet} ${drawerOpen ? styles.sheetOpen : ''}`}
          inert={!drawerOpen}
        >
          <span className={styles.dragHandle} aria-hidden="true" />

          <div className={styles.sheetHeader}>
            <h3 className={styles.title}>Filtros</h3>
            <button
              ref={closeBtnRef}
              type="button"
              className={styles.closeBtn}
              onClick={closeDrawer}
              aria-label="Cerrar filtros"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.sheetBody}>{filterSections}</div>

          <div className={styles.sheetFooter}>
            {/* Los filtros ya se aplicaron en vivo; esto solo cierra. */}
            <button type="button" className={styles.applyBtn} onClick={closeDrawer}>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
