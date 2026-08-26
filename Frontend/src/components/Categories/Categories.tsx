"use client";

import { useMemo, useState, useCallback } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

export function Categories() {
  const { allCourses, filters, setFilters } = useCourses();
  const categories = useMemo(() => buildCategories(allCourses), [allCourses]);
  const [paused, setPaused] = useState(false);

  // Split into 2 rows of interleaved categories (round-robin)
  const rows = useMemo(() => {
    const r0: typeof categories = [];
    const r1: typeof categories = [];
    categories.forEach((cat, i) => {
      if (i % 2 === 0) r0.push(cat);
      else r1.push(cat);
    });
    return [r0, r1];
  }, [categories]);

  const handleCategoryClick = useCallback(
    (categoryId: number) => {
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
    },
    [filters, setFilters]
  );

  // Render a row of category cards (used twice for seamless loop)
  const renderCards = (items: typeof categories, rowIdx: number, keyPrefix: string) =>
    items.map((category) => {
      const Icon = category.icon;
      const isActive = filters.category === category.id;
      return (
        <button
          key={`${keyPrefix}-${category.key}`}
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
    });

  return (
    <section className={styles.categories} id="categorias" aria-label="Categorías">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Explora por <span className={styles.highlight}>categoría</span>
        </h2>
      </div>

      <div
        className={styles.carouselViewport}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Row 1: scrolls left */}
        <div
          className={`${styles.track} ${styles.trackLeft} ${paused ? styles.paused : ''}`}
          aria-hidden="true"
        >
          <div className={styles.trackInner}>
            {renderCards(rows[0], 0, 'a')}
            {renderCards(rows[0], 0, 'b')}
          </div>
        </div>

        {/* Row 2: scrolls right */}
        <div
          className={`${styles.track} ${styles.trackRight} ${paused ? styles.paused : ''}`}
          aria-hidden="true"
        >
          <div className={styles.trackInner}>
            {renderCards(rows[1], 1, 'c')}
            {renderCards(rows[1], 1, 'd')}
          </div>
        </div>

        {/* Fade edges */}
        <div className={`${styles.fadeEdge} ${styles.fadeLeft}`} aria-hidden="true" />
        <div className={`${styles.fadeEdge} ${styles.fadeRight}`} aria-hidden="true" />
      </div>

      {/* Accessible card list for screen readers (hidden visually) */}
      <div className={styles.srOnly}>
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.label} — {category.count} cursos
          </button>
        ))}
      </div>
    </section>
  );
}
