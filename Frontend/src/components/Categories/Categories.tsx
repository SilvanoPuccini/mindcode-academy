"use client";

import { useCourses } from '@/contexts/CourseContext';
import styles from './Categories.module.scss';

interface Category {
  id: number;
  name: string;
  icon: string;
  gradient: string;
}

const categories: Category[] = [
  { id: 2, name: 'Web Dev', icon: '💻', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 3, name: 'ML', icon: '🤖', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 4, name: 'Data Science', icon: '📊', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 5, name: 'Mobile', icon: '📱', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 6, name: 'Design', icon: '🎨', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 7, name: 'DevOps', icon: '☁️', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { id: 8, name: 'Blockchain', icon: '⛓️', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 9, name: 'Cybersecurity', icon: '🔐', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
];

export function Categories() {
  const { filters, setFilters } = useCourses();

  const handleCategoryClick = (categoryId: number) => {
    setFilters({ ...filters, category: categoryId });
  };

  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Explora por <span className={styles.highlight}>categoría</span>
        </h2>

        <div className={styles.grid}>
          {categories.map((category, index) => (
            <button
              key={category.id}
              className={`${styles.card} ${filters.category === category.id ? styles.active : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className={styles.iconCircle}
                style={{ background: category.gradient }}
              >
                <span className={styles.icon}>{category.icon}</span>
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
