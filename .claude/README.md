# 🤖 Claude Configuration for MindCode Academy

Este directorio contiene las configuraciones de Claude Code para optimizar el desarrollo del proyecto MindCode Academy.

## 📁 Estructura

```
.claude/
├── agents/              # Agentes especializados
│   ├── architect.md     # Arquitectura y diseño de sistemas
│   ├── backend.md       # Backend (FastAPI, Python, PostgreSQL)
│   ├── frontend.md      # Frontend (Next.js, React, TypeScript)
│   └── mobile.md        # Mobile (Android Kotlin + iOS Swift) ✨ NUEVO
│
├── commands/            # Slash commands personalizados ✨ NUEVO
│   ├── review-api.md           # Revisar endpoints REST
│   ├── test-coverage.md        # Analizar cobertura de tests
│   ├── security-audit.md       # Auditoría de seguridad
│   └── deploy-checklist.md     # Checklist pre-deployment
│
├── hooks/               # Hooks de automatización ✨ NUEVO
│   ├── session-start.sh        # Verificaciones al inicio de sesión
│   └── before-commit.sh        # Checks pre-commit
│
├── templates/           # Templates de documentación ✨ NUEVO
│   └── feature-spec.md         # Template para specs de features
│
└── README.md            # Esta documentación
```

---

## 🎯 Agentes Especializados

Los agentes son asistentes especializados para diferentes áreas del proyecto.

### Cómo usar agentes

En tu conversación con Claude, simplemente menciona el área:

```
"Como arquitecto, ¿qué opinas de agregar un cache layer?"
"Necesito ayuda con el backend para implementar autenticación"
"Como frontend developer, ¿cómo implemento este componente?"
"Ayúdame con la implementación mobile de esta feature"
```

### Agentes disponibles

#### 🟡 Architect
- **Especialidad**: Arquitectura de software, diseño de sistemas
- **Cuándo usar**: Decisiones arquitecturales, diseño de DB, API contracts
- **Entregables**: Specs técnicas, diagramas, planes de implementación

#### 🔵 Backend
- **Especialidad**: FastAPI, Python, SQLAlchemy, PostgreSQL
- **Cuándo usar**: API endpoints, modelos de datos, migraciones, tests backend
- **Stack**: FastAPI + SQLAlchemy + Alembic + Pytest

#### 🔴 Frontend
- **Especialidad**: Next.js, React, TypeScript, UI/UX
- **Cuándo usar**: Componentes React, integración API, testing frontend
- **Stack**: Next.js 15 + React 19 + TypeScript + Vitest

#### 🟢 Mobile
- **Especialidad**: Android (Kotlin) + iOS (Swift)
- **Cuándo usar**: Apps nativas, ViewModels, Repository pattern
- **Stack**: Jetpack Compose + SwiftUI + Clean Architecture

---

## ⚡ Slash Commands

Comandos personalizados para tareas frecuentes.

### Cómo usar slash commands

En Claude Code CLI o en conversaciones, usa el comando con `/`:

```bash
/review-api          # Revisar endpoints de API
/test-coverage       # Analizar cobertura de tests
/security-audit      # Auditoría de seguridad
/deploy-checklist    # Checklist pre-deployment
```

### Comandos disponibles

#### `/review-api`
**Revisa endpoints REST siguiendo best practices**

Verifica:
- REST compliance (verbos HTTP, status codes)
- Validaciones y error handling
- Documentación (Swagger)
- Performance (N+1 queries)
- Consistencia en respuestas

**Output**: Reporte markdown con findings y recomendaciones

---

#### `/test-coverage`
**Analiza cobertura de tests e identifica gaps**

Revisa:
- Backend: pytest coverage, tests unitarios e integración
- Frontend: componentes sin tests, lógica crítica
- Mobile: ViewModels, Repository, Mappers

**Output**: Lista priorizada de tests a crear

---

#### `/security-audit`
**Auditoría de seguridad completa del proyecto**

Analiza:
- Backend: Auth, input validation, secrets, CORS, rate limiting
- Frontend: XSS, sensitive data, API keys, dependencies
- Database: Access control, backups
- Mobile: Permisos, network security, ofuscación

**Output**: Reporte con vulnerabilidades y remediations

---

#### `/deploy-checklist`
**Checklist completo pre-deployment a producción**

Verifica:
- Backend: Migrations, tests, environment, security
- Frontend: Build, SEO, performance, error handling
- Mobile: Builds firmados, API endpoints
- Infrastructure: Docker, CI/CD, monitoring, backups

**Output**: Checklist interactivo con status de cada item

---

## 🪝 Hooks

Scripts de automatización que se ejecutan en eventos específicos.

### `session-start.sh`
**Se ejecuta al inicio de cada sesión de Claude**

Verifica:
- ✅ Docker está corriendo
- ✅ Containers del Backend activos
- ✅ Node.js instalado
- ✅ Dependencias del Frontend instaladas
- ✅ Archivos `.env` existen
- ✅ Estado de Git

**Uso manual**:
```bash
./.claude/hooks/session-start.sh
```

---

### `before-commit.sh`
**Pre-commit checks antes de commitear código**

Ejecuta:
- 🔐 Verifica archivos sensibles (.env, secrets)
- 🐍 Flake8 en Backend (linting)
- ⚛️ ESLint + TypeScript check en Frontend
- 📦 Verifica tamaño de archivos

**Uso manual**:
```bash
./.claude/hooks/before-commit.sh
```

Para ejecutarlo automáticamente antes de cada commit, configura un Git hook:
```bash
ln -s ../../.claude/hooks/before-commit.sh .git/hooks/pre-commit
```

---

## 📝 Templates

Templates para documentación consistente.

### `feature-spec.md`
**Template completo para especificaciones de features**

Incluye:
- Resumen ejecutivo y objetivos
- Diseño técnico (Backend, Frontend, Mobile)
- Cambios en base de datos
- Plan de testing
- Plan de implementación paso a paso
- Checklist de calidad
- Deployment checklist

**Cómo usar**:
```bash
cp .claude/templates/feature-spec.md spec/nueva-feature.md
```

---

## 🚀 Guía de Uso Rápida

### Scenario 1: Implementar nueva feature

1. **Arquitecto**: Diseñar la solución
   ```
   "Como arquitecto, diseña un sistema de comentarios en cursos"
   ```

2. **Crear spec**: Usar template
   ```bash
   cp .claude/templates/feature-spec.md spec/comentarios-cursos.md
   ```

3. **Backend**: Implementar API
   ```
   "Como backend developer, implementa los endpoints de comentarios"
   ```

4. **Frontend**: Implementar UI
   ```
   "Como frontend developer, crea el componente de comentarios"
   ```

5. **Mobile**: Implementar en apps
   ```
   "Como mobile developer, implementa comentarios en Android e iOS"
   ```

---

### Scenario 2: Code Review

```bash
# Revisar calidad de API
/review-api

# Verificar seguridad
/security-audit

# Analizar tests
/test-coverage
```

---

### Scenario 3: Pre-Deployment

```bash
# Ejecutar checklist completo
/deploy-checklist

# Verificar seguridad
/security-audit

# Ejecutar hooks manualmente
./.claude/hooks/before-commit.sh
```

---

## 🎓 Best Practices

### Trabajando con Agentes

1. **Sé específico**: "Como backend developer, implementa autenticación JWT"
2. **Contexto**: Menciona archivos relevantes
3. **Iterativo**: Valida cada paso antes de continuar

### Usando Slash Commands

1. **Frecuencia**: Ejecuta `/review-api` después de cambios en endpoints
2. **Pre-commit**: Ejecuta `/test-coverage` antes de PRs
3. **Pre-deploy**: SIEMPRE ejecuta `/deploy-checklist`

### Hooks

1. **Session Start**: Deja que se ejecute automáticamente
2. **Before Commit**: Configura como Git hook para automation

---

## 🔧 Configuración Adicional

### Git Hooks (Recomendado)

Para ejecutar hooks automáticamente:

```bash
# Pre-commit hook
ln -s ../../.claude/hooks/before-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Editor Integration

Si usas VS Code, agrega estos snippets para llamar comandos:

```json
{
  "Claude Review API": {
    "prefix": "claude-review",
    "body": ["/review-api"]
  },
  "Claude Test Coverage": {
    "prefix": "claude-tests",
    "body": ["/test-coverage"]
  }
}
```

---

## 📚 Referencias

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [CLAUDE.md](../CLAUDE.md) - Instrucciones del proyecto
- [Makefile](../Makefile) - Comandos globales del proyecto

---

## 🤝 Contribuir

Para agregar nuevos agentes, comandos o hooks:

1. Crea el archivo en el directorio apropiado
2. Sigue el formato de los existentes
3. Documenta en este README
4. Testa el comando/hook antes de commitear

---

**¡Configuración completa! Ahora Claude está optimizado para MindCode Academy 🚀**
