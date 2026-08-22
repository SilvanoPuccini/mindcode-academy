"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import styles from './Hero.module.scss';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';

export function Hero() {
  const { allCourses } = useCourses();

  // Real numbers only, derived from the actual catalog
  // (loaded into CourseContext by the home page's GET
  // /courses call) - no hardcoded/invented stats.
  const stats = useMemo(() => {
    const courseCount = allCourses.length;

    const ratings = allCourses
      .map((course) => course.average_rating)
      .filter((rating): rating is number => typeof rating === 'number');
    const avgRating = ratings.length
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : null;

    // "Estudiantes" would need a real registered-users count
    // the backend doesn't expose, so we show something we can
    // actually verify instead: how many course categories are
    // available (same taxonomy used by the Categories section).
    const categoryCount = buildCategories(allCourses).length;

    return { courseCount, avgRating, categoryCount };
  }, [allCourses]);

  // "Ver cursos" scrolls to the categories section
  // (the catalog CTA above already targets #catalogo).
  // Smooth only when the user allows motion.
  const scrollToCategories = () => {
    const target = document.getElementById('categorias');
    if (!target) return;
    const prefersSmooth = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    ).matches;
    target.scrollIntoView({
      behavior: prefersSmooth ? 'smooth' : 'auto',
      block: 'start',
    });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Aprendé. Programá. <span className={styles.highlight}>Construí.</span>
          </h1>
          <p className={styles.subtitle}>
            Cursos de programación y tecnología para desarrollar habilidades reales
            y llevar tus ideas del código a la realidad.
          </p>

          <div className={styles.cta}>
            <Link href="/#catalogo" className={styles.btnPrimary}>
              Comenzar ahora
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={scrollToCategories}
            >
              Ver cursos
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {stats.courseCount > 0 ? stats.courseCount : '–'}
              </span>
              <span className={styles.statLabel}>Cursos</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {stats.categoryCount > 0 ? stats.categoryCount : '–'}
              </span>
              <span className={styles.statLabel}>Categorías</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {stats.avgRating ?? '–'}
                <Star size={22} className={styles.statStar} fill="currentColor" aria-hidden="true" />
              </span>
              <span className={styles.statLabel}>Rating</span>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className={styles.particles}>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
          <div className={styles.particle}></div>
        </div>
      </div>
    </section>
  );
}
