"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Code2, Blocks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCourses } from '@/contexts/CourseContext';
import { buildCategories } from '@/lib/course-taxonomy';
import styles from './Categories.module.scss';

// One representative tech badge per category key.
// Every devicon URL below was verified to return
// HTTP 200 on jsdelivr before being embedded.
// Monochrome-dark logos (express, github) get an
// invert filter in dark mode so they stay visible.
type TechBadge =
  | { kind: 'img'; src: string; invertInDark?: boolean }
  | { kind: 'icon'; Icon: LucideIcon };

const CATEGORY_TECH: Record<string, TechBadge[]> = {
  react: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    },
  ],
  vue: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    },
  ],
  typescript: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    },
  ],
  javascript: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    },
  ],
  'backend-node': [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    },
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
      invertInDark: true,
    },
  ],
  mobile: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
    },
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg',
    },
  ],
  // ethereum devicon returns 403 on jsdelivr -> lucide fallback
  'blockchain-web3': [{ kind: 'icon', Icon: Blocks }],
  'ia-ml': [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    },
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
    },
  ],
  'devops-cloud': [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    },
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg',
    },
  ],
  'sql-nosql-db': [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    },
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    },
  ],
  git: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
      invertInDark: true,
    },
  ],
  'ux-ui': [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
    },
  ],
  ciberseguridad: [{ kind: 'icon', Icon: ShieldCheck }],
  python: [
    {
      kind: 'img',
      src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    },
  ],
  otros: [{ kind: 'icon', Icon: Code2 }],
};

const AUTO_SCROLL_MS = 3000;
const RESUME_DELAY_MS = 2000;
const TRANSITION_MS = 500;

export function Categories() {
  const { allCourses, filters, setFilters } = useCourses();

  // Derived from real courses - no hardcoded category arrays
  const categories = useMemo(() => buildCategories(allCourses), [allCourses]);

  const [startIndex, setStartIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [columnsVisible, setColumnsVisible] = useState(5);
  const [columnStep, setColumnStep] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalColumns = Math.ceil(categories.length / 2);
  const maxIndex = Math.max(0, totalColumns - columnsVisible);
  const canScroll = totalColumns > columnsVisible;

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

  // Responsive visible window: 5 / 3 / 2 columns
  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      setColumnsVisible(width <= 640 ? 2 : width <= 1024 ? 3 : 5);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Pixel-accurate step size = card width + grid gap
  useEffect(() => {
    const measure = () => {
      if (firstCardRef.current && viewportRef.current) {
        const gap = parseFloat(getComputedStyle(viewportRef.current).columnGap) || 0;
        setColumnStep(firstCardRef.current.getBoundingClientRect().width + gap);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [categories]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  // Keep the index valid when the layout changes
  useEffect(() => {
    setStartIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  // Auto-scroll: one column every 3s, wrap-around loop
  useEffect(() => {
    if (paused || reducedMotion || !canScroll) return;
    const intervalId = setInterval(() => {
      setStartIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, AUTO_SCROLL_MS);
    return () => clearInterval(intervalId);
  }, [paused, reducedMotion, canScroll, maxIndex]);

  // Pause immediately; resume 2s after leave (pending timer cleared on re-enter)
  const pauseAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setPaused(true);
  }, []);

  const resumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      resumeTimeoutRef.current = null;
      setPaused(false);
    }, RESUME_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    },
    []
  );

  const stepBack = () => setStartIndex((index) => (index <= 0 ? maxIndex : index - 1));
  const stepForward = () => setStartIndex((index) => (index >= maxIndex ? 0 : index + 1));

  return (
    <section
      className={styles.categories}
      id="categorias"
      aria-roledescription="carousel"
      aria-label="Categorías"
    >
      <div className={styles.container}>
        <h2 className={styles.title}>
          Explora por <span className={styles.highlight}>categoría</span>
        </h2>

        <div className={styles.carousel}>
          <button
            type="button"
            className={styles.arrow}
            onClick={stepBack}
            aria-label="Categorías anteriores"
            disabled={!canScroll}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <div
            className={styles.viewport}
            ref={viewportRef}
            onMouseEnter={pauseAutoScroll}
            onMouseLeave={resumeAutoScroll}
            onFocus={pauseAutoScroll}
            onBlur={resumeAutoScroll}
          >
            <div
              className={styles.track}
              style={{
                transform: `translateX(-${startIndex * columnStep}px)`,
                transitionDuration: reducedMotion ? '0ms' : `${TRANSITION_MS}ms`,
              }}
            >
              {categories.map((category, index) => {
                const tech = CATEGORY_TECH[category.key] ?? CATEGORY_TECH.otros;
                const cardClassName = `${styles.card} ${
                  filters.category === category.id ? styles.active : ''
                }`;
                return (
                  <button
                    key={category.key}
                    ref={index === 0 ? firstCardRef : undefined}
                    className={cardClassName}
                    onClick={() => handleCategoryClick(category.id)}
                    aria-pressed={filters.category === category.id}
                  >
                    <span className={styles.techChip}>
                      {tech.map((badge, badgeIndex) =>
                        badge.kind === 'icon' ? (
                          <badge.Icon key={badgeIndex} size={16} aria-hidden="true" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={badgeIndex}
                            src={badge.src}
                            alt=""
                            width={16}
                            height={16}
                            loading="lazy"
                            className={badge.invertInDark ? styles.invertInDark : undefined}
                          />
                        )
                      )}
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

          <button
            type="button"
            className={styles.arrow}
            onClick={stepForward}
            aria-label="Categorías siguientes"
            disabled={!canScroll}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
