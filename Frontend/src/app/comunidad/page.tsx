"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Heart, Users, BookOpen, ArrowUpRight } from "lucide-react";
import styles from "./page.module.scss";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { useAuth } from "@/hooks/useAuth";

/* ------------------------------------------------------------------ */
/* Demo data — NO backend for community posts yet.                     */
/* Replace with real API calls once the endpoint lands.                */
/* ------------------------------------------------------------------ */

interface Discussion {
  id: number;
  author: string;
  authorInitials: string;
  title: string;
  body: string;
  tag: string;
  replies: number;
  likes: number;
  timeAgo: string;
}

const DEMO_DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    author: "Ana García",
    authorInitials: "AG",
    title: "¿Cómo estructurar un proyecto React con Hexagonal Architecture?",
    body: "Estoy intentando separar la lógica de negocio de los adaptadores en un proyecto con React + TypeScript. Alguien tiene un ejemplo concreto de cómo organizar las carpetas?",
    tag: "Arquitectura",
    replies: 12,
    likes: 34,
    timeAgo: "hace 2 horas",
  },
  {
    id: 2,
    author: "Bruno Díaz",
    authorInitials: "BD",
    title: "Guía rápida: Testing con Vitest + React Testing Library",
    body: "Armé un cheat-sheet con los patrones que más uso para testear componentes. Covers mocks, async rendering, y cómo testear hooks custom.",
    tag: "Testing",
    replies: 8,
    likes: 56,
    timeAgo: "hace 5 horas",
  },
  {
    id: 3,
    author: "Carla Ruiz",
    authorInitials: "CR",
    title: "Deploy en Render: errores comunes y cómo resolverlos",
    body: "Recopilé los errores que más veo en el discord de la comunidad cuando la gente deploya en Render. Desde Dockerfile hasta variables de entorno.",
    tag: "DevOps",
    replies: 15,
    likes: 41,
    timeAgo: "hace 1 día",
  },
  {
    id: 4,
    author: "Diego Fernández",
    authorInitials: "DF",
    title: "Portfolio para devs: ¿qué proyectos poner?",
    body: "Tengo 6 meses de experiencia y no sé qué proyectos mostrar en mi portfolio. ¿Qué opinan? ¿Cuántos proyectos son suficientes para una primera oportunidad laboral?",
    tag: "Carrera",
    replies: 23,
    likes: 67,
    timeAgo: "hace 2 días",
  },
];

const TOPIC_FILTERS = [
  "Todos",
  "Arquitectura",
  "Testing",
  "DevOps",
  "Carrera",
  "Frontend",
  "Backend",
];

const POPULAR_TOPICS = [
  { label: "React", count: 142 },
  { label: "Testing", count: 98 },
  { label: "TypeScript", count: 87 },
  { label: "DevOps", count: 65 },
  { label: "Arquitectura", count: 54 },
];

const ACTIVE_MEMBERS = [
  { initials: "AG", name: "Ana García" },
  { initials: "BD", name: "Bruno Díaz" },
  { initials: "CR", name: "Carla Ruiz" },
  { initials: "DF", name: "Diego Fernández" },
  { initials: "EP", name: "Elena Pérez" },
];

/* ------------------------------------------------------------------ */

function initialsColor(initials: string): string {
  // deterministic hue from initials for the avatar background
  const code = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % 360;
  return `hsl(${code}, 55%, 42%)`;
}

export default function ComunidadPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const { isAuthenticated } = useAuth();

  const filtered =
    activeFilter === "Todos"
      ? DEMO_DISCUSSIONS
      : DEMO_DISCUSSIONS.filter((d) => d.tag === activeFilter);

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
          {/* Hero bento */}
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <h1 className={styles.title}>
                Comunidad <span className={styles.highlight}>MindCode</span>
              </h1>
              <p className={styles.subtitle}>
                Espacio para compartir dudas, recursos y experiencias con otros desarrolladores.
              </p>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <Users size={16} aria-hidden="true" />
                  <span>4,320 miembros</span>
                </div>
                <div className={styles.heroStat}>
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>12,840 publicaciones</span>
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <Link href="#" className={styles.newPostCta}>
                <MessageCircle size={18} aria-hidden="true" />
                Nueva publicación
              </Link>
            )}
          </div>

          {/* Topic filters */}
          <div className={styles.filters} role="group" aria-label="Filtrar por tema">
            {TOPIC_FILTERS.map((topic) => (
              <button
                key={topic}
                type="button"
                className={`${styles.chip} ${activeFilter === topic ? styles.chipActive : ""}`}
                onClick={() => setActiveFilter(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Main grid: feed + sidebar */}
          <div className={styles.mainGrid}>
            {/* Feed */}
            <div className={styles.feed}>
              {filtered.length === 0 ? (
                <p className={styles.emptyFeed}>No hay publicaciones en esta categoría todavía.</p>
              ) : (
                filtered.map((disc) => (
                  <article key={disc.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <span
                        className={styles.avatar}
                        style={{ background: initialsColor(disc.authorInitials) }}
                        aria-hidden="true"
                      >
                        {disc.authorInitials}
                      </span>
                      <div>
                        <span className={styles.authorName}>{disc.author}</span>
                        <span className={styles.timeAgo}>{disc.timeAgo}</span>
                      </div>
                      <span className={styles.tag}>{disc.tag}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{disc.title}</h3>
                    <p className={styles.cardBody}>{disc.body}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.reaction}>
                        <MessageCircle size={14} aria-hidden="true" />
                        {disc.replies}
                      </span>
                      <span className={styles.reaction}>
                        <Heart size={14} aria-hidden="true" />
                        {disc.likes}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h2 className={styles.sidebarTitle}>
                  <BookOpen size={16} aria-hidden="true" />
                  Temas populares
                </h2>
                <ul className={styles.topicList}>
                  {POPULAR_TOPICS.map((t) => (
                    <li key={t.label} className={styles.topicItem}>
                      <span>{t.label}</span>
                      <span className={styles.topicCount}>{t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.sidebarCard}>
                <h2 className={styles.sidebarTitle}>
                  <Users size={16} aria-hidden="true" />
                  Miembros activos
                </h2>
                <ul className={styles.memberList}>
                  {ACTIVE_MEMBERS.map((m) => (
                    <li key={m.initials} className={styles.memberItem}>
                      <span
                        className={styles.memberAvatar}
                        style={{ background: initialsColor(m.initials) }}
                      >
                        {m.initials}
                      </span>
                      <span>{m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.sidebarCta}>
                <p className={styles.sidebarCtaText}>
                  ¿Tenés una duda? Abrí un thread y la comunidad te ayuda.
                </p>
                <ArrowUpRight size={16} aria-hidden="true" />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
