"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import styles from "./page.module.scss";
import { Course } from "@/types";
import { Course as CourseComponent } from "@/components/Course/Course";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Categories } from "@/components/Categories/Categories";
import { Filters } from "@/components/Filters/Filters";
import { ActiveFilters } from "@/components/ActiveFilters/ActiveFilters";
import { Testimonials } from "@/components/Testimonials/Testimonials";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { focusSearchInput, SEARCH_HASH } from "@/hooks/useSearchFocus";
import { buildCategories, inferCategory } from "@/lib/course-taxonomy";
import { fetchWithTimeout } from "@/lib/safe-fetch";
import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import Link from "next/link";

type SortOption = "rating" | "classes" | "name";

const PAGE_SIZE = 6;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Mejor valorados" },
  { value: "classes", label: "Más clases" },
  { value: "name", label: "Nombre (A-Z)" },
];

// Wrapper component for individual course cards with scroll reveal
// Memoized to prevent unnecessary re-renders
const CourseCardWrapper = ({ course }: { course: Course }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <Link
      href={`/course/${course.slug}`}
      ref={ref as React.RefObject<HTMLAnchorElement>}
      className={`${styles.courseLink} ${isVisible ? styles.visible : ''}`}
    >
      <CourseComponent
        id={course.id}
        name={course.name}
        description={course.description}
        thumbnail={course.thumbnail}
        average_rating={course.average_rating}
        total_ratings={course.total_ratings}
        total_classes={course.total_classes}
        total_duration_minutes={course.total_duration_minutes}
      />
    </Link>
  );
};

export default function Home() {
  const { allCourses, filteredCourses, filters, setFilters, setAllCourses, searchQuery } = useCourses();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Memoize getCourses function to prevent recreation on every render
  const getCourses = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/courses`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data: Course[] = await res.json();
      // The list endpoint now returns total_classes/total_duration_minutes
      // pre-aggregated server-side, so a single request is enough — no
      // more per-course detail fetch (previously 1 extra HTTP round trip
      // per visible course just to unlock the Duración filter).
      setAllCourses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  }, [setAllCourses]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  // Coming from the Navbar's search button on another
  // page (router.push(`/${SEARCH_HASH}`)): once the
  // SearchBar has mounted here, scroll to it and focus
  // its input.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== SEARCH_HASH) return;
    const frame = requestAnimationFrame(() => focusSearchInput());
    return () => cancelAnimationFrame(frame);
  }, []);

  // Deep link from the Footer's "Cursos" column (e.g. /?categoria=ia-ml):
  // once courses are loaded we can resolve the category's runtime id via
  // buildCategories() and reuse the exact same selection mechanism the
  // Categories carousel uses on click, then scroll the catalog into view.
  const appliedCategoryParamRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (appliedCategoryParamRef.current) return;
    if (allCourses.length === 0) return;

    const categoryKey = new URLSearchParams(window.location.search).get('categoria');
    appliedCategoryParamRef.current = true;
    if (!categoryKey) return;

    const match = buildCategories(allCourses).find((c) => c.key === categoryKey);
    if (!match) return;

    setFilters({ category: match.id, durations: [], minRating: 0 });

    const catalog = document.getElementById('catalogo');
    if (!catalog) return;
    const prefersSmooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    catalog.scrollIntoView({ behavior: prefersSmooth ? 'smooth' : 'auto', block: 'start' });
  }, [allCourses, setFilters]);

  // Taxonomy consumption: map the selected category id back to its key
  const selectedCategoryKey = useMemo(() => {
    if (filters.category === 1) return null;
    return buildCategories(allCourses).find((c) => c.id === filters.category)?.key ?? null;
  }, [allCourses, filters.category]);

  // Client-side category filter + sorting (pure derivation of context state)
  const visibleCourses = useMemo(() => {
    const byCategory = selectedCategoryKey
      ? filteredCourses.filter((course) => inferCategory(course).key === selectedCategoryKey)
      : filteredCourses;

    const sorted = [...byCategory];
    switch (sortBy) {
      case "classes":
        sorted.sort(
          (a, b) => (b.total_classes ?? 0) - (a.total_classes ?? 0)
        );
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "rating":
      default:
        sorted.sort((a, b) => (b.average_rating ?? -1) - (a.average_rating ?? -1));
        break;
    }
    return sorted;
  }, [filteredCourses, selectedCategoryKey, sortBy]);

  // Reset pagination whenever the result set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategoryKey, sortBy, filteredCourses]);

  const coursesToShow = useMemo(
    () => visibleCourses.slice(0, visibleCount),
    [visibleCourses, visibleCount]
  );

  const hasMore = !loading && visibleCount < visibleCourses.length;

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Navbar */}
      <Navbar />

      <div className={styles.page}>
        {/* Hero: the SearchBar is the hero's primary action,
            mounted directly under the copy via the children slot */}
        <Hero>
          <SearchBar />
        </Hero>

        {/* Categories */}
        <Categories />

        {/* Main Content with Filters */}
        <main className={`${styles.contentSection} ${isAuthenticated ? "" : styles.contentSectionSingle}`} id="catalogo">
          <div className={styles.container}>
            {/* Filters Sidebar: reserved for logged-in users */}
            {isAuthenticated && <Filters />}

            {/* Courses Grid */}
            <div className={styles.coursesWrapper}>
              {/* Removable chips for every active filter/search;
                  renders nothing while nothing is active */}
              <ActiveFilters />

              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>Explora la plataforma</span>
                  <h2 className={styles.sectionTitle}>
                    Catálogo <span className={styles.highlight}>de cursos</span>
                  </h2>
                  <p className={styles.sectionSubtitle}>
                    {loading
                      ? "Cargando..."
                      : `${visibleCourses.length} cursos encontrados para tu próxima meta`}
                  </p>
                  {/* Discrete clear-filters link when any filter is active */}
                  {(filters.category !== 1 || filters.durations.length > 0 || filters.minRating > 0 || searchQuery.trim()) && (
                    <button
                      type="button"
                      className={styles.clearFiltersLink}
                      onClick={() => {
                        setFilters({ category: 1, durations: [], minRating: 0 });
                      }}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>

                <div className={styles.sortControl}>
                  <label htmlFor="course-sort" className={styles.sortLabel}>
                    Ordenar por
                  </label>
                  <select
                    id="course-sort"
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.coursesGrid}>
                {loading ? (
                  <div className={styles.catalogLoading} aria-busy="true">
                    <LoadingBrand text="Cargando cursos…" />
                  </div>
                ) : visibleCourses.length === 0 ? (
                  <div className={styles.emptyMessage}>
                    <p>No se encontraron cursos con los filtros seleccionados</p>
                  </div>
                ) : (
                  coursesToShow.map((course) => (
                    <CourseCardWrapper key={course.id} course={course} />
                  ))
                )}
              </div>

              {hasMore && (
                <div className={styles.loadMoreWrap}>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Ver más cursos
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Testimonials */}
        <Testimonials />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
