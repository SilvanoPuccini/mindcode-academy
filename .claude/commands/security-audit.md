---
name: security-audit
description: Auditoría de seguridad completa del proyecto
---

Realiza una auditoría de seguridad exhaustiva del proyecto Platziflix.

# 🔐 SECURITY AUDIT - PLATZIFLIX

## 1. BACKEND SECURITY (FastAPI)

### 1.1 Authentication & Authorization

**Verificar**:
- [ ] ¿Está implementado sistema de autenticación?
- [ ] ¿Se valida el `user_id` en requests?
- [ ] ¿Hay protección contra CSRF?
- [ ] ¿Se usan tokens JWT correctamente?
- [ ] ¿Los passwords están hasheados? (bcrypt, argon2)
- [ ] ¿Hay rate limiting por usuario?

**Archivos a revisar**:
- `Backend/app/main.py` - Endpoints sin protección
- `Backend/app/core/security.py` - (si existe)
- `Backend/app/middleware/` - Middleware de auth

**Issues conocidos**:
```python
# Backend/app/main.py línea 157-186
# CRÍTICO: user_id no validado, cualquiera puede crear ratings
@app.post("/courses/{course_id}/ratings")
def add_course_rating(rating_data: RatingRequest, ...):
    # No verifica que el user_id sea del usuario autenticado
```

### 1.2 Input Validation

**Verificar**:
- [ ] Pydantic schemas en todos los endpoints
- [ ] Validación de tipos (int, str, email)
- [ ] Constraints de rangos (min/max)
- [ ] Sanitización de strings
- [ ] Validación de IDs (positivos, existentes)
- [ ] Path traversal prevention

**SQL Injection**:
- [ ] Uso de ORM (SQLAlchemy) ✅
- [ ] No queries raw SQL con f-strings
- [ ] Parámetros bindeados en queries

**Comando**:
```bash
cd Backend
grep -r "f\"SELECT" app/
grep -r "execute(text(" app/
```

### 1.3 Secrets & Configuration

**Verificar**:
- [ ] No hay API keys hardcodeadas
- [ ] Passwords no en código fuente
- [ ] `.env` en `.gitignore`
- [ ] Secrets en environment variables
- [ ] `SECRET_KEY` fuerte en producción

**Buscar secrets hardcodeados**:
```bash
grep -r "password.*=" Backend/app/ --include="*.py"
grep -r "api_key" Backend/app/ --include="*.py"
grep -r "secret" Backend/app/ --include="*.py"
```

### 1.4 CORS Configuration

**Verificar**:
- [ ] CORS configurado en FastAPI
- [ ] Origins específicos (no `*` en producción)
- [ ] Credentials handling apropiado

**Buscar**:
```python
# Backend/app/main.py
# ¿Existe CORSMiddleware?
from fastapi.middleware.cors import CORSMiddleware
```

### 1.5 Rate Limiting

**Verificar**:
- [ ] Rate limiting implementado
- [ ] Límites por endpoint
- [ ] Límites por IP
- [ ] Protección contra brute force

**Librerías recomendadas**:
- slowapi
- fastapi-limiter

### 1.6 Dependencies Vulnerabilities

**Ejecutar**:
```bash
cd Backend
pip install safety
safety check
```

O con Docker:
```bash
cd Backend
docker-compose exec api pip install safety
docker-compose exec api safety check
```

### 1.7 Error Handling

**Verificar**:
- [ ] No se exponen stack traces en producción
- [ ] Mensajes de error genéricos al usuario
- [ ] Logging apropiado de errores
- [ ] No se revelan detalles de implementación

---

## 2. FRONTEND SECURITY (Next.js)

### 2.1 XSS (Cross-Site Scripting)

**Verificar**:
- [ ] No uso de `dangerouslySetInnerHTML`
- [ ] Inputs sanitizados antes de render
- [ ] Content Security Policy configurado
- [ ] Escape de datos de usuario

**Buscar**:
```bash
cd Frontend
grep -r "dangerouslySetInnerHTML" src/
grep -r "innerHTML" src/
```

### 2.2 Sensitive Data Exposure

**Verificar**:
- [ ] API keys no en código frontend
- [ ] Uso de `NEXT_PUBLIC_` solo para datos públicos
- [ ] No tokens en localStorage sin encriptar
- [ ] HTTPS only en producción
- [ ] Cookies con flags `secure`, `httpOnly`, `sameSite`

**Buscar**:
```bash
cd Frontend
grep -r "localStorage.setItem" src/
grep -r "sessionStorage" src/
grep -r "API_KEY" src/
```

### 2.3 API Keys & Environment Variables

**Verificar**:
- [ ] `.env.local` en `.gitignore`
- [ ] No API keys en código
- [ ] Variables sensibles sin `NEXT_PUBLIC_`

**Buscar en Git history**:
```bash
git log --all --full-history -- "*.env"
```

### 2.4 Dependency Vulnerabilities

**Ejecutar**:
```bash
cd Frontend
yarn audit
# o
npm audit
```

**Arreglar vulnerabilities**:
```bash
yarn audit fix
```

### 2.5 HTTPS & Security Headers

**Verificar en producción**:
- [ ] HTTPS enabled
- [ ] HSTS header
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Content-Security-Policy

---

## 3. DATABASE SECURITY (PostgreSQL)

### 3.1 Access Control

**Verificar**:
- [ ] User de DB con mínimos privilegios
- [ ] Password fuerte
- [ ] Conexión solo desde containers autorizados
- [ ] No puerto 5432 expuesto públicamente en prod

**Revisar**:
```yaml
# Backend/docker-compose.yml
# ¿Está expuesto el puerto 5432?
ports:
  - "5432:5432"  # ⚠️ Solo para desarrollo
```

### 3.2 Data Integrity

**Verificar**:
- [ ] Foreign keys con CASCADE apropiado
- [ ] CHECK constraints
- [ ] NOT NULL donde corresponde
- [ ] UNIQUE constraints
- [ ] Soft deletes implementados ✅

### 3.3 Backup & Recovery

**Verificar**:
- [ ] Estrategia de backup definida
- [ ] Backups automáticos
- [ ] Plan de disaster recovery
- [ ] Backups encriptados

---

## 4. MOBILE SECURITY

### 4.1 Android

**Verificar**:
- [ ] Manifest sin permisos innecesarios
- [ ] Network security config (HTTPS only)
- [ ] API keys ofuscadas (BuildConfig)
- [ ] ProGuard/R8 habilitado en release
- [ ] Certificate pinning para API

**Revisar**:
```xml
<!-- Mobile/PlatziFlixAndroid/app/src/main/AndroidManifest.xml -->
<!-- Mobile/PlatziFlixAndroid/app/src/main/res/xml/network_security_config.xml -->
```

### 4.2 iOS

**Verificar**:
- [ ] App Transport Security configurado
- [ ] Keychain para datos sensibles
- [ ] API keys en configuración, no hardcodeadas
- [ ] Certificate pinning

---

## 5. CI/CD & INFRASTRUCTURE

### 5.1 GitHub Actions

**Verificar**:
- [ ] Secrets en GitHub Secrets (no en workflows)
- [ ] Permisos mínimos en workflows
- [ ] No exposición de tokens en logs

### 5.2 Docker

**Verificar**:
- [ ] Base images oficiales y actualizadas
- [ ] Multi-stage builds para reducir superficie
- [ ] No copia de archivos sensibles en imagen
- [ ] USER no-root en Dockerfile

---

## OUTPUT REPORT

Genera el siguiente reporte:

```markdown
# 🔐 SECURITY AUDIT REPORT - PLATZIFLIX
**Date**: [Fecha]
**Auditor**: Claude Agent

---

## EXECUTIVE SUMMARY

- **Critical Issues**: X
- **High Priority**: Y
- **Medium Priority**: Z
- **Low Priority**: W

**Overall Security Score**: X/100

---

## 🔴 CRITICAL VULNERABILITIES (Fix Immediately)

### 1. [Vulnerability Name]
- **Severity**: Critical
- **Component**: Backend/Frontend/Mobile
- **Location**: [Archivo:línea]
- **Description**: [Descripción del problema]
- **Impact**: [Qué puede pasar]
- **Remediation**:
  ```python
  # Código para arreglar
  ```

---

## 🟡 HIGH PRIORITY ISSUES

### 1. [Issue]
- **Severity**: High
- **Component**: [Backend/Frontend]
- **Description**: [...]
- **Remediation**: [...]

---

## 🟢 MEDIUM & LOW PRIORITY

[Lista de issues no críticos]

---

## ✅ SECURITY BEST PRACTICES FOUND

1. SQLAlchemy ORM previene SQL injection
2. Soft deletes implementados
3. Pydantic validation en API
4. [Otros puntos positivos]

---

## 📋 ACTION ITEMS (Prioritized)

### Immediate (Week 1)
- [ ] [Critical fix 1]
- [ ] [Critical fix 2]

### Short-term (Month 1)
- [ ] [High priority fix 1]
- [ ] [High priority fix 2]

### Long-term (Backlog)
- [ ] [Medium/Low priority items]

---

## 🛡️ RECOMMENDATIONS

### Backend
1. Implementar autenticación con JWT
2. Agregar rate limiting
3. Configurar CORS apropiadamente

### Frontend
1. Implementar CSP headers
2. Audit y fix de dependencias
3. Revisar manejo de tokens

### Infrastructure
1. Setup automated security scanning
2. Implement backup strategy
3. Add monitoring and alerting

---

## 📚 REFERENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security](https://nextjs.org/docs/authentication)
```

**Enfócate en vulnerabilidades reales y provee soluciones accionables.**
