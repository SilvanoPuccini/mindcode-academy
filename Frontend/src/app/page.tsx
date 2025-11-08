"use client";

import { useEffect, useState } from "react";
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
import { useCourses } from "@/contexts/CourseContext";
import Link from "next/link";

export default function Home() {
  const { filteredCourses, setAllCourses } = useCourses();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCourses() {
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
        setLoading(false);
      }
    }

    getCourses();
  }, [setAllCourses]);

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
                  <p>Cargando cursos...</p>
                ) : filteredCourses.length === 0 ? (
                  <p>No se encontraron cursos</p>
                ) : (
                  filteredCourses.map((course) => (
                    <Link href={`/course/${course.slug}`} key={course.id}>
                      <CourseComponent
                        id={course.id}
                        name={course.name}
                        description={course.description}
                        thumbnail={course.thumbnail}
                        average_rating={course.average_rating}
                        total_ratings={course.total_ratings}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Testimonials */}
        <Testimonials />

        {/* Nombres laterales decorativos */}
        <div className={styles.verticalLeft}>MIND</div>
        <div className={styles.verticalRight}>IA</div>

        {/* Fondo de cuadrícula */}
        <div className={styles.gridBg}></div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
