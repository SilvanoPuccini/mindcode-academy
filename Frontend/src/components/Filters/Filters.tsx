"use client";

import { useState } from 'react';
import styles from './Filters.module.scss';

const categories = [
  { id: 1, name: 'Todos', count: 500 },
  { id: 2, name: 'Web Development', count: 120 },
  { id: 3, name: 'Machine Learning', count: 85 },
  { id: 4, name: 'Data Science', count: 95 },
  { id: 5, name: 'Mobile Development', count: 70 },
  { id: 6, name: 'UX/UI Design', count: 60 },
];

const levels = ['Principiante', 'Intermedio', 'Avanzado'];
const durations = ['< 2 horas', '2-5 horas', '5-10 horas', '> 10 horas'];

export function Filters() {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleDuration = (duration: string) => {
    setSelectedDurations(prev =>
      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration]
    );
  };

  return (
    <aside className={styles.filters}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filtros</h3>
        <button className={styles.clearBtn}>Limpiar</button>
      </div>

      {/* Categories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Categorías</h4>
        <div className={styles.categoryList}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.name}</span>
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
                checked={selectedLevels.includes(level)}
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
                checked={selectedDurations.includes(duration)}
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
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.ratingValue}>
            {minRating > 0 ? `${minRating}★ o más` : 'Todos'}
          </div>
        </div>
      </div>
    </aside>
  );
}
