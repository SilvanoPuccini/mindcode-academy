"use client";

import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import { useRipple } from '@/hooks/useRipple';
import styles from './Filters.module.scss';

const levels = ['Principiante', 'Intermedio', 'Avanzado'];
const durations = ['< 2 horas', '2-5 horas', '5-10 horas', '> 10 horas'];

export function Filters() {
  const { allCourses, filters, setFilters } = useCourses();
  const rippleProps = useRipple();

  // Derived from real courses - id 1 is reserved for "Todos"
  const categories = useMemo(() => [
    { id: 1, label: 'Todos', count: allCourses.length },
    ...buildCategories(allCourses),
  ], [allCourses]);

  const toggleLevel = (level: string) => {
    const newLevels = filters.levels.includes(level)
      ? filters.levels.filter(l => l !== level)
      : [...filters.levels, level];
    setFilters({ ...filters, levels: newLevels });
  };

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
      levels: [],
      durations: [],
      minRating: 0,
    });
  };

  return (
    <aside className={styles.filters}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filtros</h3>
        <button className={`${styles.clearBtn} ripple-container`} onClick={handleClearFilters} {...rippleProps}>
          Limpiar
        </button>
      </div>

      {/* Categories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categorías</h4>
        <div className={styles.categoryList}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${filters.category === category.id ? styles.active : ''} ripple-container`}
              onClick={() => handleCategoryChange(category.id)}
              {...rippleProps}
            >
              <span>{category.label}</span>
              <span className={styles.count}>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Nivel</h4>
        <div className={styles.checkboxList}>
          {levels.map(level => (
            <label key={level} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.levels.includes(level)}
                onChange={() => toggleLevel(level)}
              />
              <span className={styles.checkmark}></span>
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Duración</h4>
        <div className={styles.checkboxList}>
          {durations.map(duration => (
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
    </aside>
  );
}
