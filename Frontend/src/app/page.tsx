import styles from "./page.module.scss";
import { Course } from "@/types";
import { Course as CourseComponent } from "@/components/Course/Course";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Filters } from "@/components/Filters/Filters";
import { Testimonials } from "@/components/Testimonials/Testimonials";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import Link from "next/link";

async function getCourses(): Promise<Course[]> {
  const res = await fetch("http://localhost:8000/courses", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  const data = await res.json();
  return data;
}

export default async function Home() {
  const courses = await getCourses();

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

        {/* Main Content with Filters */}
        <main className={styles.contentSection}>
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
                  {courses.length} cursos disponibles
                </p>
              </div>

              <div className={styles.coursesGrid}>
                {courses.map((course) => (
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
