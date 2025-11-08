"use client";

import { useState, useEffect } from 'react';
import styles from './Testimonials.module.scss';

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Desarrolladora Full Stack",
    image: "https://i.pravatar.cc/150?img=1",
    text: "MIND IA transformó mi carrera. Los cursos son increíblemente prácticos y los profesores son expertos en sus áreas.",
    rating: 5
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    role: "Data Scientist",
    image: "https://i.pravatar.cc/150?img=3",
    text: "La mejor inversión que he hecho. Aprendí Machine Learning desde cero y ahora trabajo en una empresa top.",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Martínez",
    role: "Diseñadora UX/UI",
    image: "https://i.pravatar.cc/150?img=5",
    text: "Contenido de calidad, plataforma intuitiva y soporte increíble. 100% recomendado para todos.",
    rating: 5
  }
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Lo que dicen nuestros <span className={styles.highlight}>estudiantes</span>
        </h2>

        <div className={styles.carousel}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`${styles.card} ${index === current ? styles.active : ''}`}
              style={{
                transform: `translateX(${(index - current) * 100}%)`,
                opacity: index === current ? 1 : 0.3,
              }}
            >
              <div className={styles.quote}>"</div>
              <p className={styles.text}>{testimonial.text}</p>
              <div className={styles.stars}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <div className={styles.author}>
                <img src={testimonial.image} alt={testimonial.name} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.role}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
