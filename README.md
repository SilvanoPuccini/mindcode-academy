# 🧠 MindCode Academy

> Plataforma de cursos online multi-plataforma. Mi propia versión del proyecto final del curso de **Claude Code de Platzi**, evolucionada a producto completo: desplegada, segura y rediseñada.

<p align="center">
  <!-- TODO: reemplazar por screenshots reales -->
  <img src="https://placehold.co/900x420/0F172A/FFFFFF/png?text=Screenshot+del+cat%C3%A1logo" alt="MindCode Academy — screenshot" width="880" />
  <br/><sub><i>Catálogo estilo Netflix · dark & light · buscador inteligente</i></sub>
</p>

🔗 **Producción**

| App | URL |
|---|---|
| Frontend | [mindcode-academy.vercel.app](https://mindcode-academy.vercel.app) |
| API | [mindcode-backend.onrender.com](https://mindcode-backend.onrender.com) |
| Swagger | [mindcode-backend.onrender.com/docs](https://mindcode-backend.onrender.com/docs) |

---

## ✨ Qué tiene esta versión

### Plataforma
- 🎬 **Catálogo estilo Netflix** con skeletons, filtros reales y ordenamiento
- 🔍 **Búsqueda inteligente** tolerante a tildes, por palabras sueltas, con dropdown de resultados y navegación por teclado
- 🔒 **Login gate server-side**: temario libre, clase 1 como preview gratuito, el resto requiere cuenta
- ⭐ **Calificaciones seguras**: atadas al JWT, con widget interactivo y estadísticas
- 📊 **Mi Aula**: dashboard con "Continuar viendo", progreso y completados
- 🍪 **Sesiones httpOnly cookie** (+ Bearer disponible para apps móviles)
- 🌗 Dark & light mode con canvas de marca
- 🖼️ Open Graph dinámico para compartir links bonitos

### Calidad
- ✅ 145 tests frontend (Vitest + RTL) · suite pytest backend
- ✅ CI/CD: GitHub Actions + deploy automático en Vercel (front) y Render (API)

## 🛠️ Stack

| Capa | Tecnología |
|---|---|
| Web | Next.js 15 (App Router) · React 19 · TypeScript estricto · SCSS Modules |
| API | FastAPI · SQLAlchemy 2.0 · Alembic · JWT |
| Datos | PostgreSQL (Neon) |
| Infra | Docker Compose (dev) · Vercel · Render · UV · Yarn |

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────┐
│                  CLIENTES                   │
│   Next.js 15 ── Android (Kotlin) ── iOS    │
└───────────────────┬────────────────────────┘
                    │ REST + JWT/cookie
        ┌───────────▼────────────┐
        │   FastAPI en Render    │
        │   gate de clases       │
        └───────────┬────────────┘
            ┌───────▼────────┐
            │ PostgreSQL     │
            │ (Neon)         │
            └────────────────┘
```

## 🚀 Desarrollo local

```bash
# Backend (Docker)
cd Backend && make start && make migrate && make seed

# Frontend
cd Frontend && yarn install && yarn dev   # http://localhost:3000
```

## 🔌 API (principales)

```
GET    /courses                      # Catálogo público (sin video_url)
GET    /courses/{slug}               # Detalle + temario con posiciones
GET    /classes/{id}                 # Clase: pos 1 libre; resto 401 sin JWT
POST   /auth/register|login          # Devuelven cookie de sesión
POST   /auth/logout                  # Limpia la cookie
GET    /courses/{id}/ratings/me      # Tu calificación (JWT)
POST   /courses/{id}/ratings         # Calificar/upsert (JWT)
GET    /progress/course/{id}         # Progreso del usuario (JWT)
```

## 🧪 Tests

```bash
cd Frontend && yarn test          # Vitest + React Testing Library
cd Backend  && make test          # pytest dentro de Docker
```

## 📸 Galería

> 🚧 Espacio reservado para más capturas (aula, reproductor, dark mode).

<!-- Añadir aquí: aula.png, player.png, dark-home.png -->

---

## 🎓 Origen y créditos

Este proyecto nació como entrega del curso **[Claude Code de Platzi](https://www.platzi.com)** (instructor: Eduardo Alvarez), que tomé en su momento. Todo lo que ves acá — gate de contenido, sesiones httpOnly, currículo real de YouTube, rediseño completo y despliegue en producción — es **mi propia contribución y versión** del proyecto base.

🙏 Gracias a Platzi por el punto de partida y a los creadores cuyo contenido educativo público alimenta las clases demo: freeCodeCamp Español, Fazt, MoureDev, midudev, Soy Dalto, Pelado Nerd, jonmircha, AristiDevs, Contando Bits y TodoCode.

## 👤 Autor

**Silvano Puccini** · [@SilvanoPuccini](https://github.com/SilvanoPuccini)

---

<div align="center"><sub>Hecho con ☕ y Claude Code</sub></div>
