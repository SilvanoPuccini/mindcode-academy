"use client";

import { X } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import styles from './ActiveFilters.module.scss';

interface ActiveFilterChip {
  key: string;
  label: string;
  ariaLabel: string;
  onRemove: () => void;
}

// Removable chips summarizing every active catalog constraint:
// search query, duration buckets and minimum rating. Category is
// intentionally not chipped (it has its own dedicated selector row).
// Renders nothing when no filter/search is active.
export function ActiveFilters() {
  const { searchQuery, setSearchQuery, filters, setFilters } = useCourses();

  const chips: ActiveFilterChip[] = [];

  const query = searchQuery.trim();
  if (query) {
    chips.push({
      key: 'search',
      label: `Búsqueda: ${query}`,
      ariaLabel: `Quitar búsqueda ${query}`,
      onRemove: () => setSearchQuery(''),
    });
  }

  filters.durations.forEach((duration) => {
    chips.push({
      key: `duration-${duration}`,
      label: duration,
      ariaLabel: `Quitar duración ${duration}`,
      onRemove: () =>
        setFilters({
          ...filters,
          durations: filters.durations.filter((d) => d !== duration),
        }),
    });
  });

  if (filters.minRating > 0) {
    chips.push({
      key: 'min-rating',
      label: `★ ≥ ${filters.minRating}`,
      ariaLabel: 'Quitar rating mínimo',
      onRemove: () => setFilters({ ...filters, minRating: 0 }),
    });
  }

  if (chips.length === 0) return null;

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({ category: 1, durations: [], minRating: 0 });
  };

  return (
    <div className={styles.activeFilters} role="group" aria-label="Filtros activos">
      {chips.map((chip) => (
        <span key={chip.key} className={styles.chip}>
          <span className={styles.chipLabel}>{chip.label}</span>
          <button
            type="button"
            className={styles.chipRemove}
            onClick={chip.onRemove}
            aria-label={chip.ariaLabel}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      ))}

      <button type="button" className={styles.clearAll} onClick={handleClearAll}>
        Limpiar todo
      </button>
    </div>
  );
}
