"use client";

import { useMemo } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

// Category tile grid under the hero: one card per
// taxonomy category (icon + name + course count).
// Clicking a tile applies the same context-backed
// category filter the sidebar uses and scrolls to
// the catalog section.
export function Categories() {
  const { allCourses, filters, setFilters } = useCourses();

  // Derived from real courses - no hardcoded category arrays
  const categories = useMemo(() => buildCategories(allCourses), [allCourses]);

  // Selecting (or deselecting) a category always
  // brings the catalog into view. Smooth scroll
  // only when the user has not asked for reduced
  // motion; SSR-safe via the window guard.
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

        <div className={styles.grid}>
          {categories.map((category) => {
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
        </div>
      </div>
    </section>
  );
}
