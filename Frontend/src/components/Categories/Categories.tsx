"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

// Continuous marquee pace: each row crosses half its (2x duplicated)
// track width in this many seconds — matches the previous CSS animation.
const SECONDS_PER_HALF_TRACK = 30;
// Manual nudge distance per arrow click (roughly 2 cards).
const NUDGE_PX = 376;
// How long the carousel stays paused after a manual nudge before the
// automatic scroll resumes.
const RESUME_DELAY_MS = 1500;

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

  // Row 1 scrolls left (scrollLeft grows 0 -> half), row 2 scrolls right
  // (scrollLeft shrinks half -> 0) — same visual as before, now driven by
  // real scrollLeft so both the auto-scroll loop and the arrow nudges
  // share one source of truth instead of fighting over `transform`.
  const track0Ref = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Row 2 starts at its track's midpoint so it can count DOWN toward 0.
  useEffect(() => {
    const el = track1Ref.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth / 2;
  }, [rows]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number;
    let lastTs: number | null = null;

    const tick = (ts: number) => {
      rafId = requestAnimationFrame(tick);
      const last = lastTs ?? ts;
      const dt = (ts - last) / 1000;
      lastTs = ts;
      if (pausedRef.current) return;

      const el0 = track0Ref.current;
      if (el0) {
        const half = el0.scrollWidth / 2;
        if (half > 0) {
          el0.scrollLeft += (half / SECONDS_PER_HALF_TRACK) * dt;
          if (el0.scrollLeft >= half) el0.scrollLeft -= half;
        }
      }

      const el1 = track1Ref.current;
      if (el1) {
        const half = el1.scrollWidth / 2;
        if (half > 0) {
          el1.scrollLeft -= (half / SECONDS_PER_HALF_TRACK) * dt;
          if (el1.scrollLeft <= 0) el1.scrollLeft += half;
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const pauseThenResume = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY_MS);
  }, []);

  // direction 1 = "forward": row 1 keeps scrolling left, row 2 keeps
  // scrolling right — same direction each row already auto-scrolls in.
  const nudge = useCallback(
    (direction: 1 | -1) => {
      track0Ref.current?.scrollBy({ left: direction * NUDGE_PX, behavior: 'smooth' });
      track1Ref.current?.scrollBy({ left: -direction * NUDGE_PX, behavior: 'smooth' });
      pauseThenResume();
    },
    [pauseThenResume]
  );

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
  const renderCards = (items: typeof categories, keyPrefix: string) =>
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

      <div className={styles.carouselWrapper}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={() => nudge(-1)}
          aria-label="Categorías anteriores"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div
          className={styles.carouselViewport}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            setPaused(false);
          }}
        >
          {/* Row 1: scrolls left */}
          <div className={`${styles.track} ${styles.trackLeft}`} ref={track0Ref} aria-hidden="true">
            <div className={styles.trackInner}>
              {renderCards(rows[0], 'a')}
              {renderCards(rows[0], 'b')}
            </div>
          </div>

          {/* Row 2: scrolls right */}
          <div className={`${styles.track} ${styles.trackRight}`} ref={track1Ref} aria-hidden="true">
            <div className={styles.trackInner}>
              {renderCards(rows[1], 'c')}
              {renderCards(rows[1], 'd')}
            </div>
          </div>

          {/* Fade edges */}
          <div className={`${styles.fadeEdge} ${styles.fadeLeft}`} aria-hidden="true" />
          <div className={`${styles.fadeEdge} ${styles.fadeRight}`} aria-hidden="true" />
        </div>

        <button
          type="button"
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={() => nudge(1)}
          aria-label="Siguientes categorías"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
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
