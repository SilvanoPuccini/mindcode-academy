# MindCode Academy - Proyecto Multi-plataforma

## Arquitectura del Sistema

MindCode Academy es una plataforma de aprendizaje para desarrolladores con arquitectura multi-plataforma que incluye:
- **Backend**: API REST con FastAPI + PostgreSQL
- **Frontend**: Aplicación web con Next.js 15
- **Mobile**: Apps nativas Android (Kotlin) + iOS (Swift)

## Stack Tecnológico

### Backend (FastAPI/Python)
- **Framework**: FastAPI
- **Base de datos**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migraciones**: Alembic
- **Container**: Docker + Docker Compose
- **Gestión dependencias**: UV
- **Puerto**: 8000

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router)
- **React**: 19.0
- **Lenguaje**: TypeScript
- **Estilos**: SCSS + CSS Modules
- **Testing**: Vitest + React Testing Library
- **Fonts**: Geist Sans & Geist Mono

### Mobile
- **Android**: Kotlin + Jetpack Compose + Retrofit
- **iOS**: Swift + SwiftUI + Repository Pattern

## Estructura del Proyecto

```
claude-code/
├── Backend/           # API FastAPI + PostgreSQL
├── Frontend/          # Next.js 15 App
└── Mobile/
    ├── PlatziFlixAndroid/  # Kotlin App
    └── PlatziFlixiOS/      # Swift App
```

## Modelo de Datos

### Entidades Principales
- **Course**: Cursos (name, description, thumbnail, slug)
- **Teacher**: Profesores
- **Lesson**: Lecciones de un curso
- **Class**: Clases individuales de una lección

### Relaciones
- Course ↔ Teacher (Many-to-Many via course_teachers)
- Course → Lesson (One-to-Many)
- Lesson → Class (One-to-Many)

## API Endpoints

### Cursos
- `GET /` - Bienvenida
- `GET /health` - Health check + DB connectivity
- `GET /courses` - Lista todos los cursos
- `GET /courses/{slug}` - Detalle de curso por slug

### Ratings (Sistema de Calificaciones)
- `GET /courses/{id}/ratings` - Obtener ratings de un curso
- `POST /courses/{id}/ratings` - Agregar rating (body: user_id, rating)
- `PUT /courses/{id}/ratings/{user_id}` - Actualizar rating existente
- `DELETE /courses/{id}/ratings/{user_id}` - Eliminar rating (soft delete)
- `GET /courses/{id}/ratings/stats` - Estadísticas (promedio, distribución)
- `GET /courses/{id}/ratings/user/{user_id}` - Rating específico de usuario

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (retorna JWT)
- `GET /auth/me` - Obtener perfil del usuario autenticado

### Favoritos
- `GET /favorites` - Lista de cursos favoritos del usuario
- `POST /favorites/{course_id}` - Agregar curso a favoritos
- `DELETE /favorites/{course_id}` - Quitar curso de favoritos

### Progreso
- `GET /progress` - Progreso del usuario en todos los cursos
- `POST /progress` - Actualizar progreso de una clase

## Comandos de Desarrollo

### Backend
```bash
cd Backend
make start        # Iniciar Docker Compose
make stop         # Detener containers
make migrate      # Ejecutar migraciones
make seed         # Poblar datos de prueba
make logs         # Ver logs
```

### Frontend
```bash
cd Frontend
yarn dev          # Servidor de desarrollo
yarn build        # Build de producción
yarn test         # Ejecutar tests
yarn lint         # Linter
```

## URLs del Sistema

- **Backend API**: http://localhost:8000
- **Frontend Web**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (FastAPI Swagger)

## Base de Datos

### Configuración Docker
- **Usuario**: platziflix_user
- **Password**: platziflix_password
- **Database**: platziflix_db
- **Puerto**: 5432

### Migraciones
- Ubicación: `Backend/app/alembic/versions/`
- Comando crear: `make create-migration`
- Comando aplicar: `make migrate`

## Funcionalidades Implementadas

### Backend
- ✅ API REST con FastAPI
- ✅ Sistema de autenticación JWT
- ✅ Sistema de ratings y reseñas con soft delete
- ✅ Gestión de favoritos por usuario
- ✅ Tracking de progreso de cursos
- ✅ Base de datos PostgreSQL con migraciones Alembic
- ✅ Health checks de API y DB
- ✅ Documentación automática con Swagger
- ✅ Testing completo con pytest

### Frontend
- ✅ Catálogo de cursos con grid estilo Netflix
- ✅ Detalle de cursos (profesores, lecciones, clases)
- ✅ Sistema de calificación con estrellas
- ✅ Favoritos por usuario con persistencia
- ✅ Navegación por slug SEO-friendly
- ✅ Reproductor de video integrado
- ✅ Sistema de notificaciones (Toast)
- ✅ Context API para estado global
- ✅ TypeScript strict mode
- ✅ Testing con Vitest + React Testing Library

### Mobile
- ✅ Apps móviles nativas (Android + iOS)
- ✅ Consumo de API REST
- ✅ UI moderna con Jetpack Compose y SwiftUI

### DevOps
- ✅ Docker Compose para desarrollo
- ✅ CI/CD con GitHub Actions
- ✅ Tests automáticos en PR y push
- ✅ Makefile con comandos útiles

## Patrones de Desarrollo

### Backend
- **Arquitectura**: Service Layer Pattern
- **Dependency Injection**: FastAPI Dependencies
- **Database**: Repository Pattern con SQLAlchemy

### Frontend
- **Routing**: Next.js App Router
- **Data Fetching**: Server Components + fetch
- **Styling**: CSS Modules + SCSS
- **Testing**: Component testing con Vitest

### Mobile
- **Android**: MVVM + Jetpack Compose
- **iOS**: SwiftUI + Repository + Mapper Pattern

## Consideraciones de Desarrollo

1. **Docker obligatorio** para el backend (DB + API)
2. **TypeScript strict** en Frontend
3. **Testing requerido** para nuevas funcionalidades
4. **Migraciones automáticas** para cambios de DB
5. **Convenciones de naming**: snake_case (Python), camelCase (JS/TS), PascalCase (Swift/Kotlin)
6. **API REST** como única fuente de datos para Frontend/Mobile

## Comandos Útiles

```bash
# Desarrollo completo
cd Backend && make start    # Iniciar backend
cd Frontend && yarn dev     # Iniciar frontend

# Reset completo de datos
cd Backend && make seed-fresh

# Ver logs de todos los servicios
cd Backend && make logs
```

## Testing

### Backend Tests
```bash
cd Backend
make test                    # Ejecutar todos los tests
make test ARGS="-v"          # Verbose mode
make test ARGS="--cov"       # Con coverage report
```

**Ubicación**: `Backend/app/tests/`

**Tipos de tests**:
- `test_rating_db_constraints.py` - Tests de constraints de DB
- `test_course_rating_service.py` - Tests unitarios del servicio
- `test_rating_endpoints.py` - Tests de integración de endpoints

**Configuración**:
- `Backend/pytest.ini` - Configuración de pytest
- `Backend/app/tests/conftest.py` - Fixtures compartidos

### Frontend Tests
```bash
cd Frontend
yarn test                    # Ejecutar todos los tests
yarn test --coverage         # Con coverage
yarn test --watch            # Modo watch
```

**Ubicación**: `Frontend/src/**/*.test.{ts,tsx}`

**Tipos de tests**:
- Component tests (Course, StarRating, VideoPlayer)
- Integration tests (Pages)
- Context tests

**Configuración**:
- `Frontend/vitest.config.ts` - Configuración de Vitest
- `Frontend/src/test/setup.ts` - Setup global de tests

## CI/CD

### GitHub Actions
**Ubicación**: `.github/workflows/tests.yml`

**Jobs**:
1. **backend-tests**: Tests de Python + PostgreSQL
2. **frontend-tests**: Tests de Next.js + TypeScript (ESLint, type check, tests)
3. **integration-health-check**: Health check de la API
4. **test-summary**: Resumen de resultados

**Triggers**:
- Push a `main` y `develop`
- Pull requests hacia `main` y `develop`

**Nota**: Los tests NO se ejecutan en ramas `claude/**` para evitar notificaciones excesivas.

## Troubleshooting

### Backend no inicia
```bash
# Verificar estado de containers
cd Backend && docker-compose ps

# Ver logs
make logs

# Reiniciar todo
make stop && make start
```

### Migraciones fallan
```bash
# Verificar que DB está levantada
docker-compose ps

# Ver logs de DB
docker-compose logs db

# Intentar migración manual
docker-compose exec api bash -c "cd /app && uv run alembic upgrade head"
```

### Frontend no conecta con Backend
1. Verificar que Backend está corriendo: `curl http://localhost:8000/health`
2. Revisar variables de entorno en Frontend
3. Verificar CORS en Backend (configurado en `main.py`)

### Tests fallan
```bash
# Backend: Asegurarse que la DB de test está configurada
# Frontend: Limpiar caché
cd Frontend && yarn test --clearCache
```

## Notas Importantes

### Docker
- **TODOS** los comandos del Backend deben ejecutarse dentro del contenedor Docker
- Antes de ejecutar comandos, verifica que el contenedor esté funcionando: `docker-compose ps`
- Revisa el `Makefile` para ver comandos disponibles

### Base de Datos
- La DB usa **soft delete** en las entidades principales
- Todas las migraciones deben ser reversibles
- Los seeds son idempotentes (se pueden ejecutar múltiples veces)

### Frontend
- **TypeScript strict mode** habilitado
- CSS Modules para evitar conflictos de estilos
- Context API para estado global (evitar prop drilling)
- Next.js Image optimization automático

### API
- Documentación interactiva: http://localhost:8000/docs
- Todas las respuestas son JSON
- Autenticación JWT en headers: `Authorization: Bearer <token>`

Esta memoria contiene toda la información necesaria para continuar el desarrollo del proyecto MindCode Academy.