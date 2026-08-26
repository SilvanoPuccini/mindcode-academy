"use client";

import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Clock,
  Flame,
  LogIn,
  Save,
  X,
} from "lucide-react";
import styles from "./page.module.scss";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { ScrollProgress } from "@/components/ScrollProgress/ScrollProgress";
import { LoadingBrand } from "@/components/LoadingBrand/LoadingBrand";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/contexts/CourseContext";
import { updateProfile } from "@/services/authApi";
import { Course as CourseType } from "@/types";

/* ------------------------------------------------------------------ */
/* Demo certificates — no backend yet. Replace with real data later.   */
/* ------------------------------------------------------------------ */
const DEMO_CERTS = [
  { title: "Curso de React", issued: "Ago 2026" },
  { title: "Curso de Python", issued: "Jul 2026" },
];

function initialsColor(name: string): string {
  const code = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % 360;
  return `hsl(${code}, 55%, 42%)`;
}

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const { allCourses, setAllCourses, favorites } = useCourses();
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formBio, setFormBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Hydrate catalog (same pattern as /aula)
  useEffect(() => {
    let cancelled = false;
    async function getCourses() {
      try {
        const { publicFetch } = await import("@/lib/api");
        const data = await publicFetch<CourseType[]>("/courses", { cache: "no-store" });
        if (!cancelled) setAllCourses(data);
      } catch {
        // best-effort
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    }
    getCourses();
    return () => {
      cancelled = true;
    };
  }, [setAllCourses]);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role ?? "");
      setFormBio(user.bio ?? "");
    }
  }, [user]);

  const loading = authLoading || coursesLoading;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateProfile({
        name: formName,
        email: formEmail,
        role: formRole || undefined,
        bio: formBio || undefined,
      });
      setSaveMsg("Perfil actualizado correctamente");
    } catch {
      setSaveMsg("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role ?? "");
      setFormBio(user.bio ?? "");
    }
    setSaveMsg(null);
  };

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <div className={styles.page}>
        {loading ? (
          <LoadingBrand text="Cargando perfil…" />
        ) : !user ? (
          <EmptyState
            icon={<LogIn size={40} aria-hidden="true" />}
            title="Iniciá sesión para ver tu perfil"
            message="Accedé a tu cuenta para gestionar tu información y ver tu progreso."
            actionLabel="Iniciar sesión"
            actionHref="/login?next=/perfil"
          />
        ) : (
          <>
            {/* ── Cover + Avatar ─────────────────────── */}
            <div className={styles.cover}>
              <div className={styles.coverGradient} />
              <div className={styles.avatarRow}>
                <div className={styles.avatarWrap}>
                  <span
                    className={styles.avatar}
                    style={{ background: initialsColor(user.name) }}
                  >
                    {user.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className={styles.onlineDot} title="En línea" />
                </div>
                <div className={styles.identity}>
                  <h1 className={styles.displayName}>{user.name}</h1>
                  <p className={styles.roleLabel}>
                    {user.role || "Desarrollador"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Content Canvas ─────────────────────── */}
            <div className={styles.canvas}>
              {/* Left column */}
              <div className={styles.leftCol}>
                {/* Bio card */}
                <div className={styles.bioCard}>
                  <h3 className={styles.cardHeading}>
                    <BookOpen size={18} aria-hidden="true" />
                    Sobre mí
                  </h3>
                  <p className={styles.bioText}>
                    {user.bio ||
                      "Aún no escribiste tu bio. Contanos sobre vos y tu stack tecnológico."}
                  </p>
                  {/* Skill tags — demo for now */}
                  <div className={styles.tags}>
                    {["JavaScript", "React", "Node.js", "Python"].map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats card */}
                <div className={styles.statsCard}>
                  <h3 className={styles.cardHeading}>Estadísticas</h3>
                  <div className={styles.statRow}>
                    <div className={styles.statIconBox}>
                      <BookOpen size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <span className={styles.statNum}>{allCourses.length}</span>
                      <span className={styles.statLabel}>Cursos disponibles</span>
                    </div>
                  </div>
                  <div className={styles.statRow}>
                    <div className={`${styles.statIconBox} ${styles.statIconAccent}`}>
                      <Award size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <span className={styles.statNum}>{DEMO_CERTS.length}</span>
                      <span className={styles.statLabel}>Certificados</span>
                    </div>
                  </div>
                  <div className={styles.statRow}>
                    <div className={`${styles.statIconBox} ${styles.statIconTertiary}`}>
                      <Clock size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <span className={styles.statNum}>
                        {favorites.length}
                      </span>
                      <span className={styles.statLabel}>Favoritos guardados</span>
                    </div>
                  </div>
                  <div className={styles.streakRow}>
                    <Flame size={20} aria-hidden="true" />
                    <span>Racha actual</span>
                    <span className={styles.streakVal}>—</span>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className={styles.rightCol}>
                {/* Certificates */}
                <div className={styles.certsCard}>
                  <div className={styles.certsHeader}>
                    <h3 className={styles.cardHeading}>Últimos certificados</h3>
                    <span className={styles.viewAll}>Ver todos</span>
                  </div>
                  <div className={styles.certsGrid}>
                    {DEMO_CERTS.map((c) => (
                      <div key={c.title} className={styles.certItem}>
                        <Award size={28} className={styles.certIcon} aria-hidden="true" />
                        <div>
                          <h4 className={styles.certTitle}>{c.title}</h4>
                          <p className={styles.certDate}>Emitido: {c.issued}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Settings */}
                <form className={styles.settingsCard} onSubmit={handleSave}>
                  <h3 className={`${styles.cardHeading} ${styles.settingsHeading}`}>
                    Configuración de cuenta
                  </h3>

                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label htmlFor="profile-name" className={styles.fieldLabel}>
                        Nombre
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        className={styles.input}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="profile-email" className={styles.fieldLabel}>
                        Email
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        className={styles.input}
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="profile-role" className={styles.fieldLabel}>
                      Rol profesional
                    </label>
                    <input
                      id="profile-role"
                      type="text"
                      className={styles.input}
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Ej: Fullstack Developer"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="profile-bio" className={styles.fieldLabel}>
                      Bio
                    </label>
                    <textarea
                      id="profile-bio"
                      className={styles.textarea}
                      rows={4}
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      placeholder="Contanos sobre vos y tu stack tecnológico."
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={handleCancel}
                    >
                      <X size={16} aria-hidden="true" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={styles.saveBtn}
                      disabled={saving}
                    >
                      <Save size={16} aria-hidden="true" />
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </button>
                  </div>

                  {saveMsg && (
                    <p
                      className={`${styles.saveMsg} ${
                        saveMsg.startsWith("Error") ? styles.saveMsgErr : ""
                      }`}
                      role="status"
                    >
                      {saveMsg}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
