"use client";

import styles from './Hero.module.scss';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Aprende con <span className={styles.highlight}>Inteligencia Artificial</span>
          </h1>
          <p className={styles.subtitle}>
            Descubre cursos de tecnología diseñados para impulsar tu carrera.
            Contenido premium, profesores expertos, aprendizaje personalizado.
          </p>

          <div className={styles.cta}>
            <button className={styles.btnPrimary}>
              Comenzar ahora
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className={styles.btnSecondary}>
              Ver cursos
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Cursos</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Estudiantes</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4.8★</span>
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
