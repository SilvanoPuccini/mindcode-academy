# 🎬 Platziflix

> Plataforma de cursos online multi-plataforma desarrollada con arquitectura moderna

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/SilvanoPuccini/claude-code)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2015-000000.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contribuir](#-contribuir)

---

## 🎯 Descripción

**Platziflix** es una plataforma completa de gestión de cursos online que replica la experiencia visual de Netflix. El proyecto incluye:

- 🖥️ **Web App** - Interfaz moderna con Next.js 15 y React 19
- 📱 **Mobile Apps** - Apps nativas para Android (Kotlin) e iOS (Swift)
- 🔧 **Backend API** - API REST robusta con FastAPI y PostgreSQL
- 🎥 **Video Player** - Reproductor integrado para clases en video
- ⭐ **Sistema de Ratings** - Calificación y reseñas de cursos
- 💾 **Gestión de Datos** - Sistema completo de cursos, lecciones y clases

---

## ✨ Características

### Frontend
- ✅ Catálogo de cursos con diseño tipo Netflix
- ✅ Navegación por slug SEO-friendly
- ✅ Sistema de calificación con estrellas
- ✅ Favoritos y seguimiento de progreso
- ✅ Reproductor de video integrado
- ✅ Diseño responsive y accesible
- ✅ Server-side rendering con Next.js
- ✅ TypeScript estricto

### Backend
- ✅ API REST con FastAPI
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL
- ✅ Migraciones con Alembic
- ✅ Soft delete en entidades
- ✅ Health checks y monitoring
- ✅ Documentación automática (Swagger)
- ✅ Testing con pytest

### Mobile
- ✅ Apps nativas Android (Kotlin) e iOS (Swift)
- ✅ Consumo de API REST
- ✅ Diseño moderno con Jetpack Compose y SwiftUI
- ✅ Repository pattern

---

## 🛠️ Stack Tecnológico

### Backend
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red)
![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?logo=docker&logoColor=white)

- **Framework**: FastAPI
- **Base de datos**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migraciones**: Alembic
- **Containerización**: Docker + Docker Compose
- **Gestión de dependencias**: UV
- **Testing**: pytest, pytest-cov, httpx

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?logo=sass&logoColor=white)

- **Framework**: Next.js 15 (App Router)
- **React**: 19.0
- **Lenguaje**: TypeScript 5.0
- **Estilos**: SCSS + CSS Modules
- **Testing**: Vitest + React Testing Library
- **Fonts**: Geist Sans & Geist Mono

### Mobile
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?logo=kotlin&logoColor=white)
![Swift](https://img.shields.io/badge/Swift-F05138?logo=swift&logoColor=white)

- **Android**: Kotlin + Jetpack Compose + Retrofit + MVVM
- **iOS**: Swift + SwiftUI + Repository Pattern

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Next.js  │  │ Android  │  │   iOS    │             │
│  │  Web App │  │   App    │  │   App    │             │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘             │
└────────┼─────────────┼─────────────┼───────────────────┘
         │             │             │
         └─────────────┴─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │      FastAPI Backend      │
         │   (REST API - Port 8000)  │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │    PostgreSQL Database    │
         │      (Port 5432)          │
         └───────────────────────────┘
```

### Patrones de Diseño

**Backend**
- Service Layer Pattern
- Dependency Injection (FastAPI)
- Repository Pattern con SQLAlchemy
- Soft Delete Pattern

**Frontend**
- Server Components (Next.js)
- Context API para estado global
- CSS Modules para estilos aislados
- Component-based architecture

**Mobile**
- MVVM (Android)
- Repository Pattern (iOS)
- Clean Architecture

---

## 🚀 Inicio Rápido

### Prerequisitos

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/SilvanoPuccini/claude-code.git
cd claude-code
```

### 2. Iniciar Backend (Docker)

```bash
cd Backend
make start        # Iniciar Docker Compose
make migrate      # Ejecutar migraciones
make seed         # Poblar datos de prueba
```

La API estará disponible en: **http://localhost:8000**
Documentación Swagger: **http://localhost:8000/docs**

### 3. Iniciar Frontend

```bash
cd Frontend
yarn install      # Instalar dependencias
yarn dev          # Iniciar servidor de desarrollo
```

La aplicación web estará disponible en: **http://localhost:3000**

### 4. Verificar que todo funciona

```bash
# Health check de la API
curl http://localhost:8000/health

# Obtener cursos
curl http://localhost:8000/courses
```

---

## 📁 Estructura del Proyecto

```
claude-code/
├── Backend/                    # API FastAPI + PostgreSQL
│   ├── app/
│   │   ├── alembic/           # Migraciones de base de datos
│   │   ├── db/                # Modelos y conexión DB
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Lógica de negocio
│   │   └── tests/             # Tests backend
│   ├── docker-compose.yml     # Configuración Docker
│   ├── Dockerfile             # Imagen Docker
│   ├── Makefile               # Comandos útiles
│   └── pyproject.toml         # Dependencias Python
│
├── Frontend/                   # Next.js 15 App
│   ├── public/                # Archivos estáticos
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Context providers
│   │   ├── types/             # TypeScript types
│   │   └── test/              # Setup de tests
│   ├── package.json           # Dependencias Node
│   └── vitest.config.ts       # Configuración Vitest
│
└── Mobile/
    ├── PlatziFlixAndroid/     # App Android (Kotlin)
    └── PlatziFlixiOS/         # App iOS (Swift)
```

---

## 🔌 API Endpoints

### Cursos
```http
GET    /courses                # Lista todos los cursos
GET    /courses/{slug}         # Detalle de curso por slug
```

### Ratings
```http
GET    /courses/{id}/ratings              # Obtener ratings de un curso
POST   /courses/{id}/ratings              # Agregar rating
PUT    /courses/{id}/ratings/{user_id}   # Actualizar rating
DELETE /courses/{id}/ratings/{user_id}   # Eliminar rating
GET    /courses/{id}/ratings/stats        # Estadísticas de ratings
GET    /courses/{id}/ratings/user/{id}   # Rating de usuario específico
```

### Autenticación
```http
POST   /auth/register         # Registrar usuario
POST   /auth/login            # Iniciar sesión
GET    /auth/me               # Perfil del usuario
```

### Favoritos
```http
GET    /favorites             # Lista de favoritos
POST   /favorites/{course_id} # Agregar a favoritos
DELETE /favorites/{course_id} # Quitar de favoritos
```

### Progreso
```http
GET    /progress              # Progreso del usuario
POST   /progress              # Actualizar progreso
```

### Health
```http
GET    /health                # Health check de API y DB
```

📚 **Documentación completa**: http://localhost:8000/docs

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend
make test                      # Ejecutar todos los tests
make test ARGS="-v"            # Modo verbose
make test ARGS="--cov"         # Con coverage
```

**Test coverage:**
- Unit tests para servicios
- Integration tests para endpoints
- Database constraint tests

### Frontend Tests

```bash
cd Frontend
yarn test                      # Ejecutar tests
yarn test --coverage           # Con coverage
yarn test --watch              # Modo watch
```

**Test coverage:**
- Component tests
- Hook tests
- Integration tests

---

## 🎨 Comandos de Desarrollo

### Backend

```bash
make start          # Iniciar Docker Compose
make stop           # Detener containers
make restart        # Reiniciar containers
make logs           # Ver logs
make migrate        # Ejecutar migraciones
make seed           # Poblar datos de prueba
make seed-fresh     # Reset y poblar datos
make test           # Ejecutar tests
make clean          # Limpiar todo
```

### Frontend

```bash
yarn dev            # Servidor de desarrollo
yarn build          # Build de producción
yarn start          # Servidor de producción
yarn lint           # Linter
yarn test           # Tests
yarn type-check     # Verificar tipos
```

---

## 🗄️ Base de Datos

### Modelo de Datos

```
courses
├── id (PK)
├── name
├── description
├── thumbnail
├── slug (unique)
├── average_rating
└── total_ratings

teachers
├── id (PK)
├── name
└── bio

lessons
├── id (PK)
├── course_id (FK)
├── title
└── order

classes
├── id (PK)
├── lesson_id (FK)
├── title
├── video
└── duration

course_ratings
├── id (PK)
├── course_id (FK)
├── user_id
├── rating (1-5)
└── deleted_at (soft delete)
```

### Migraciones

```bash
# Crear nueva migración
make create-migration

# Aplicar migraciones
make migrate

# Ver historial
docker-compose exec api bash -c "cd /app && uv run alembic history"
```

---

## 🚢 Deployment

### Opciones de Deployment

**Frontend (Vercel)**
```bash
cd Frontend
vercel deploy --prod
```

**Backend (Railway/Render)**
- Conectar repositorio GitHub
- Railway detecta automáticamente Docker
- Configurar variables de entorno

**Variables de entorno necesarias:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key
```

---

## 📝 Funcionalidades Implementadas

- ✅ Catálogo de cursos con grid estilo Netflix
- ✅ Detalle de cursos (profesores, lecciones, clases)
- ✅ Sistema de autenticación JWT
- ✅ Sistema de ratings y reseñas
- ✅ Favoritos por usuario
- ✅ Tracking de progreso
- ✅ Navegación por slug SEO-friendly
- ✅ Reproductor de video integrado
- ✅ Health checks de API y DB
- ✅ Apps móviles nativas (Android + iOS)
- ✅ Testing completo (Backend + Frontend)
- ✅ CI/CD con GitHub Actions

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de código

- **Python**: snake_case, PEP 8
- **TypeScript/JavaScript**: camelCase, ESLint
- **Kotlin**: PascalCase para clases, camelCase para funciones
- **Swift**: PascalCase para tipos, camelCase para funciones

---

## 📄 License

Este proyecto fue desarrollado como parte del curso de Claude Code de Platzi.

**Instructor**: Eduardo Alvarez

---

## 🙏 Agradecimientos

- [Platzi](https://platzi.com/) por el curso
- [FastAPI](https://fastapi.tiangolo.com/) por el excelente framework
- [Next.js](https://nextjs.org/) por el framework de React
- Comunidad de desarrolladores

---

## 📞 Contacto

**Desarrollador**: Silvano Puccini
**GitHub**: [@SilvanoPuccini](https://github.com/SilvanoPuccini)

---

<p align="center">Hecho con ❤️ durante el Curso de Claude Code de Platzi</p>
