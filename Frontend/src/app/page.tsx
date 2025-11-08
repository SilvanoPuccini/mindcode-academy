"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./page.module.scss";
import { Course } from "@/types";
import { Course as CourseComponent } from "@/components/Course/Course";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Categories } from "@/components/Categories/Categories";
import { Filters } from "@/components/Filters/Filters";
import { Testimonials } from "@/components/Testimonials/Testimonials";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { SkeletonCourse } from "@/components/SkeletonCourse/SkeletonCourse";
import { useCourses } from "@/contexts/CourseContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";

// Wrapper component for individual course cards with scroll reveal
// Memoized to prevent unnecessary re-renders
const CourseCardWrapper = ({ course }: { course: Course }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <Link
      href={`/course/${course.slug}`}
      ref={ref as React.RefObject<HTMLAnchorElement>}
      className={isVisible ? styles.visible : ''}
    >
      <CourseComponent
        id={course.id}
        name={course.name}
        description={course.description}
        thumbnail={course.thumbnail}
        average_rating={course.average_rating}
        total_ratings={course.total_ratings}
      />
    </Link>
  );
};

export default function Home() {
  const { filteredCourses, setAllCourses } = useCourses();
  const [loading, setLoading] = useState(true);

  // Memoize getCourses function to prevent recreation on every render
  const getCourses = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/courses", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data: Course[] = await res.json();
      setAllCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      // Simular mínimo de carga para UX suave
      setTimeout(() => setLoading(false), 500);
    }
  }, [setAllCourses]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Navbar */}
      <Navbar />

      <div className={styles.page}>
        {/* Hero Section */}
        <Hero />

        {/* Search Bar */}
        <SearchBar />

        {/* Categories */}
        <Categories />

        {/* Main Content with Filters */}
        <main className={styles.contentSection} id="cursos">
          <div className={styles.container}>
            {/* Filters Sidebar */}
            <Filters />

            {/* Courses Grid */}
            <div className={styles.coursesWrapper}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Cursos <span className={styles.highlight}>Destacados</span>
                </h2>
                <p className={styles.sectionSubtitle}>
                  {loading ? "Cargando..." : `${filteredCourses.length} cursos encontrados`}
                </p>
              </div>

              <div className={styles.coursesGrid}>
                {loading ? (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonCourse key={index} />
                    ))}
                  </>
                ) : filteredCourses.length === 0 ? (
                  <div className={styles.emptyMessage}>
                    <p>No se encontraron cursos con los filtros seleccionados</p>
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <CourseCardWrapper key={course.id} course={course} />
                  ))
                )}
              </div>
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
