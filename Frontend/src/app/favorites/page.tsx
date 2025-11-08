"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { Course as CourseType } from "@/types";
import { Course as CourseComponent } from "@/components/Course/Course";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { useCourses } from "@/contexts/CourseContext";

export default function FavoritesPage() {
  const { favorites, setAllCourses } = useCourses();
  const [loading, setLoading] = useState(true);
  const [allCourses, setLocalCourses] = useState<CourseType[]>([]);

  useEffect(() => {
    async function getCourses() {
      try {
        const res = await fetch("http://localhost:8000/courses", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data: CourseType[] = await res.json();
        setAllCourses(data);
        setLocalCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }

    getCourses();
  }, [setAllCourses]);

  const favoriteCourses = allCourses.filter(course => favorites.includes(course.id));

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>
              Mis <span className={styles.highlight}>Favoritos</span>
            </h1>
            <p className={styles.subtitle}>
              {loading ? "Cargando..." : `${favoriteCourses.length} ${favoriteCourses.length === 1 ? 'curso favorito' : 'cursos favoritos'}`}
            </p>
          </header>

          {loading ? (
            <div className={styles.loading}>Cargando tus favoritos...</div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon="💔"
              title="No tienes favoritos aún"
              message="Explora nuestro catálogo y guarda tus cursos preferidos para acceder a ellos fácilmente."
              actionLabel="Explorar cursos"
              actionHref="/#cursos"
            />
          ) : (
            <div className={styles.coursesGrid}>
              {favoriteCourses.map((course) => (
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
              ))}
            </div>
          )}
        </div>

        {/* Fondo decorativo */}
        <div className={styles.gridBg}></div>
      </div>

      <Footer />
    </>
  );
}
