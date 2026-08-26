"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Award,
  BookOpen,
  Camera,
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
import { apiFetch } from "@/lib/api";

interface Certificate {
  id: number;
  course_name: string;
  issued_at: string;
  verification_code: string;
  status: string;
}

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatIssuedDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function initialsColor(name: string): string {
  const code = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % 360;
  return `hsl(${code}, 55%, 42%)`;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp";

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const { allCourses, favorites } = useCourses();

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formBio, setFormBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Certificates
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role ?? "");
      setFormBio(user.bio ?? "");
      setAvatarPreview(user.avatar_url ?? null);
    }
  }, [user]);

  // Fetch certificates
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setCerts([]);
      return;
    }

    setCertsLoading(true);

    apiFetch<Certificate[]>("/certificates/me", { skipAuthRedirect: true })
      .then((data) => {
        if (!cancelled) setCerts(data);
      })
      .catch((error) => {
        console.error("Error fetching certificates:", error);
        if (!cancelled) setCerts([]);
      })
      .finally(() => {
        if (!cancelled) setCertsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = authLoading;

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_AVATAR_SIZE) {
        setSaveMsg("La imagen no puede superar 2 MB.");
        return;
      }

      setAvatarUploading(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Error leyendo archivo"));
          reader.readAsDataURL(file);
        });

        setAvatarPreview(dataUrl);
        await updateProfile({ avatar_url: dataUrl });
        setSaveMsg("Foto de perfil actualizada");
      } catch {
        setSaveMsg("Error al subir la foto. Intentá de nuevo.");
      } finally {
        setAvatarUploading(false);
        // Reset input so re-uploading the same file triggers change
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    []
  );

  const handleRemoveAvatar = useCallback(async () => {
    setAvatarUploading(true);
    try {
      await updateProfile({ avatar_url: undefined });
      setAvatarPreview(null);
      setSaveMsg("Foto de perfil eliminada");
    } catch {
      setSaveMsg("Error al eliminar la foto.");
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  // ── Save form ──────────────────────────────────────────────────
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
      setAvatarPreview(user.avatar_url ?? null);
    }
    setSaveMsg(null);
  };

  // Determine what to render inside the avatar circle
  const avatarContent = avatarPreview ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarPreview}
      alt={`Foto de perfil de ${user?.name ?? ""}`}
      className={styles.avatarImg}
    />
  ) : (
    <span
      className={styles.avatarInitials}
      style={{ background: user ? initialsColor(user.name) : "#888" }}
    >
      {user
        ?.name.split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </span>
  );

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
            </div>

            {/* Avatar row: positioned BELOW cover, never clipped */}
            <div className={styles.avatarRow}>
              <div className={styles.avatarWrap}>
                <button
                  type="button"
                  className={styles.avatarBtn}
                  onClick={handleAvatarClick}
                  aria-label="Cambiar foto de perfil"
                  disabled={avatarUploading}
                >
                  {avatarContent}
                  <span className={styles.avatarOverlay}>
                    <Camera size={20} aria-hidden="true" />
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_ACCEPT}
                  className={styles.srOnly}
                  onChange={handleAvatarChange}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                {avatarPreview && (
                  <button
                    type="button"
                    className={styles.removeAvatar}
                    onClick={handleRemoveAvatar}
                    aria-label="Eliminar foto de perfil"
                    disabled={avatarUploading}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
                <span className={styles.onlineDot} title="En línea" />
              </div>
              <div className={styles.identity}>
                <h1 className={styles.displayName}>{user.name}</h1>
                <p className={styles.roleLabel}>
                  {user.role || "Desarrollador"}
                </p>
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
                  {user.role && (
                    <span className={styles.roleBadge}>{user.role}</span>
                  )}
                  <p className={styles.bioText}>
                    {user.bio ||
                      "Aún no escribiste tu bio. Contanos sobre vos y tu stack tecnológico."}
                  </p>
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
                      <span className={styles.statNum}>{certs.length}</span>
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
                  {certs.length === 0 ? (
                    <p className={styles.bioText}>
                      {certsLoading ? "Cargando certificados…" : "Aún no tenés certificados"}
                    </p>
                  ) : (
                    <div className={styles.certsGrid}>
                      {certs.map((c) => (
                        <div key={c.id} className={styles.certItem}>
                          <Award size={28} className={styles.certIcon} aria-hidden="true" />
                          <div>
                            <h4 className={styles.certTitle}>{c.course_name}</h4>
                            <p className={styles.certDate}>
                              Emitido: {formatIssuedDate(c.issued_at)}
                            </p>
                            <p className={styles.certDate}>
                              Código: {c.verification_code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
