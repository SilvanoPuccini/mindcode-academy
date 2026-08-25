"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.scss";
import { Course as CourseType } from "@/types";
import { HeartCrack, LogIn } from "lucide-react";
import { Course as CourseComponent } from "@/components/Course/Course";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { useCourses } from "@/contexts/CourseContext";
import { useAuth } from "@/hooks/useAuth";
import { publicFetch } from "@/lib/api";

export default function FavoritesPage() {
  const { favorites, favoritesLoading, setAllCourses } = useCourses();
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [allCourses, setLocalCourses] = useState<CourseType[]>([]);
  // Session truth lives in the httpOnly cookie; useAuth() hydrates the
  // profile from GET /auth/me at boot (no localStorage token to probe).
  const { isAuthenticated: isLoggedIn } = useAuth();

  useEffect(() => {
    async function getCourses() {
      try {
        const data = await publicFetch<CourseType[]>("/courses", { cache: "no-store" });
        setAllCourses(data);
        setLocalCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    }

    getCourses();
  }, [setAllCourses]);

  const loading = coursesLoading || favoritesLoading;
  const favoriteCourses = allCourses.filter(course => favorites.includes(course.id));

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>Tu biblioteca</span>
            <h1 className={styles.title}>
              Mis <span className={styles.highlight}>favoritos</span>
            </h1>
            <p className={styles.subtitle}>
              {loading ? "Cargando..." : `${favoriteCourses.length} ${favoriteCourses.length === 1 ? 'curso guardado' : 'cursos guardados'}`}
            </p>
          </header>

          {loading ? (
            <div className={styles.loading}>Cargando tus favoritos...</div>
          ) : !isLoggedIn ? (
            <EmptyState
              icon={<LogIn size={40} aria-hidden="true" />}
              title="Iniciá sesión para ver tus favoritos"
              message="Tus favoritos se guardan en tu cuenta. Iniciá sesión para acceder a ellos desde cualquier dispositivo."
              actionLabel="Iniciar sesión"
              actionHref="/login"
            />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<HeartCrack size={40} aria-hidden="true" />}
              title="Todavía no tenés favoritos"
              message="Explorá el catálogo y guardá los cursos que más te interesen para tenerlos siempre a mano."
              actionLabel="Explorar cursos"
              actionHref="/#catalogo"
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
      </div>

      <Footer />
    </>
  );
}
