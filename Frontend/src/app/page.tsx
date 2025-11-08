import styles from "./page.module.scss";
import { Course } from "@/types";
import { Course as CourseComponent } from "@/components/Course/Course";
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
    <div className={styles.page}>
      {/* Banner superior */}
      <header className={styles.banner}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className={styles.bannerPrimary}>MIN</span>
          <span className={styles.bannerAccent}>DIA</span>
        </div>
      </header>
      <div style={{ textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem' }}>
        <span className={styles.bannerSub}>Aprende con inteligencia</span>
      </div>
      {/* Nombres laterales */}
      <div className={styles.verticalLeft}>MIN</div>
      <div className={styles.verticalRight}>DIA</div>
      {/* Grid de cursos */}
      <main className={styles.main}>
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
      </main>
      {/* Fondo de cuadrícula */}
      <div className={styles.gridBg}></div>
    </div>
  );
}
