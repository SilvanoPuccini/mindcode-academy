---
name: deploy-checklist
description: Checklist completo pre-deployment a producción
---

Verifica que el proyecto está listo para deployment a producción.

# 🚀 PRE-DEPLOYMENT CHECKLIST - PLATZIFLIX

## 1. BACKEND READINESS

### 1.1 Database

- [ ] **Migraciones ejecutadas**
  ```bash
  cd Backend
  docker-compose exec api alembic current
  docker-compose exec api alembic upgrade head
  ```

- [ ] **Backup de DB creado**
  ```bash
  docker-compose exec db pg_dump -U platziflix_user platziflix_db > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Seeds actualizados** (si aplica)
  ```bash
  cd Backend && make seed
  ```

- [ ] **Índices optimizados**
  - Revisar queries lentas
  - Agregar índices donde sea necesario

- [ ] **Connection pooling configurado**
  - SQLAlchemy pool_size apropiado
  - max_overflow configurado

### 1.2 Environment Variables

- [ ] **`.env` de producción creado**
  ```bash
  # Verificar que existe Backend/.env.production
  ```

- [ ] **Secrets seguros**
  - [ ] `SECRET_KEY` generado con: `openssl rand -hex 32`
  - [ ] `DATABASE_URL` con password fuerte
  - [ ] No hay valores de desarrollo

- [ ] **Environment configurado**
  - [ ] `DEBUG=False`
  - [ ] `ENVIRONMENT=production`
  - [ ] `CORS_ORIGINS` con dominios reales

### 1.3 Tests

- [ ] **Todos los tests pasando**
  ```bash
  cd Backend
  pytest app/tests/ -v
  ```

- [ ] **Coverage aceptable** (>80%)
  ```bash
  pytest app/tests/ --cov=app --cov-report=term
  ```

- [ ] **Tests de integración funcionando**

### 1.4 Code Quality

- [ ] **Linter sin errores**
  ```bash
  flake8 app/ --max-line-length=120
  ```

- [ ] **Type checking** (si aplica)
  ```bash
  mypy app/
  ```

- [ ] **No hay TODOs críticos**
  ```bash
  grep -r "TODO" Backend/app/ | grep -i "critical\|urgent\|important"
  ```

### 1.5 Security

- [ ] **Authentication habilitado**
- [ ] **Rate limiting configurado**
- [ ] **CORS settings para producción**
- [ ] **HTTPS only**
- [ ] **Secrets no hardcodeados**
- [ ] **SQL injection prevención** (ORM)
- [ ] **Input validation completa**

### 1.6 Logging & Monitoring

- [ ] **Logging configurado**
  - [ ] Log level: INFO o WARNING
  - [ ] Logs estructurados (JSON)
  - [ ] Rotación de logs

- [ ] **Error tracking** (Sentry, etc.)
  ```python
  # SENTRY_DSN configurado
  ```

- [ ] **Health check funcionando**
  ```bash
  curl http://localhost:8000/health
  ```

### 1.7 Performance

- [ ] **No N+1 queries**
- [ ] **Eager loading implementado**
- [ ] **Caching configurado** (Redis, si aplica)
- [ ] **Query optimization**

---

## 2. FRONTEND READINESS

### 2.1 Build

- [ ] **Build exitoso**
  ```bash
  cd Frontend
  yarn build
  ```

- [ ] **No errores de build**

- [ ] **Build size aceptable**
  ```bash
  # Revisar output de next build
  # First Load JS < 200 KB es ideal
  ```

### 2.2 Tests

- [ ] **Tests pasando**
  ```bash
  yarn test --passWithNoTests
  ```

- [ ] **No console.log en producción**
  ```bash
  grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
  ```

### 2.3 Environment

- [ ] **`.env.production` creado**
- [ ] **API_URL apunta a producción**
  ```bash
  NEXT_PUBLIC_API_URL=https://api.platziflix.com
  ```

- [ ] **Feature flags configurados**

### 2.4 SEO & Meta

- [ ] **Meta tags completos**
  - [ ] Title
  - [ ] Description
  - [ ] Open Graph tags
  - [ ] Twitter Cards

- [ ] **Sitemap generado**
- [ ] **robots.txt configurado**
- [ ] **Favicon y app icons**

### 2.5 Performance

- [ ] **Images optimizadas**
  - [ ] Usando next/image
  - [ ] Formatos modernos (WebP)
  - [ ] Lazy loading

- [ ] **Code splitting**
  - [ ] Dynamic imports donde corresponde
  - [ ] Route-based code splitting

- [ ] **Bundle analysis**
  ```bash
  yarn analyze
  ```

- [ ] **Lighthouse score > 90**

### 2.6 Security

- [ ] **No API keys expuestas**
- [ ] **CSP headers configurados**
- [ ] **HTTPS only**
- [ ] **Secure cookies** (httpOnly, secure, sameSite)

### 2.7 Error Handling

- [ ] **Error boundaries implementados**
- [ ] **404 page customizada**
- [ ] **500 page customizada**
- [ ] **Loading states apropiados**

---

## 3. MOBILE READINESS

### 3.1 Android

- [ ] **Build release exitoso**
  ```bash
  cd Mobile/PlatziFlixAndroid
  ./gradlew assembleRelease
  ```

- [ ] **APK firmado**
  - [ ] Keystore generado
  - [ ] signing config en gradle

- [ ] **ProGuard/R8 habilitado**

- [ ] **Version code incrementado**
  ```kotlin
  // app/build.gradle.kts
  versionCode = 2
  versionName = "1.1.0"
  ```

- [ ] **API endpoints apuntan a producción**

- [ ] **Tests pasando**
  ```bash
  ./gradlew test
  ```

### 3.2 iOS

- [ ] **Build release exitoso**
  ```bash
  cd Mobile/PlatziFlixiOS
  xcodebuild archive -scheme PlatziFlixiOS -configuration Release
  ```

- [ ] **App firmada con certificado de distribución**

- [ ] **Version y build number incrementados**

- [ ] **API endpoints apuntan a producción**

- [ ] **Tests pasando**
  ```bash
  xcodebuild test -scheme PlatziFlixiOS
  ```

---

## 4. INFRASTRUCTURE & DEVOPS

### 4.1 Docker

- [ ] **Dockerfile optimizado**
  - [ ] Multi-stage build
  - [ ] Imagen mínima
  - [ ] USER no-root

- [ ] **Docker Compose para producción**
  - [ ] restart: always
  - [ ] resource limits
  - [ ] health checks

- [ ] **Images pushed a registry**
  ```bash
  docker push platziflix-backend:v1.0.0
  ```

### 4.2 CI/CD

- [ ] **Pipeline ejecutando correctamente**
  - [ ] Tests automáticos
  - [ ] Build verification
  - [ ] Security scanning

- [ ] **Deployment automatizado** (opcional)

- [ ] **Rollback strategy documentada**

### 4.3 Monitoring

- [ ] **Application monitoring configurado**
  - [ ] Sentry / DataDog / New Relic

- [ ] **Infrastructure monitoring**
  - [ ] CPU, Memory, Disk usage
  - [ ] Request rates
  - [ ] Error rates

- [ ] **Alertas configuradas**
  - [ ] High error rate
  - [ ] Service down
  - [ ] High latency

### 4.4 Backup & Recovery

- [ ] **Backup automático de DB**
  - [ ] Daily backups
  - [ ] Retention policy

- [ ] **Backup testing**
  - [ ] Restore procedure documentado
  - [ ] Backup tested recientemente

- [ ] **Disaster recovery plan**

---

## 5. DOCUMENTATION

- [ ] **README.md actualizado**
  - [ ] Instrucciones de instalación
  - [ ] Comandos comunes
  - [ ] Troubleshooting

- [ ] **API documentation actualizada**
  - [ ] Swagger/OpenAPI up to date
  - [ ] Ejemplos actualizados

- [ ] **CHANGELOG.md actualizado**

- [ ] **Deployment documentation**
  - [ ] Deployment steps
  - [ ] Rollback procedure
  - [ ] Environment variables

- [ ] **Architecture diagram** (si es major release)

---

## 6. LEGAL & COMPLIANCE

- [ ] **Privacy policy actualizada**
- [ ] **Terms of service actualizados**
- [ ] **GDPR compliance** (si aplica)
- [ ] **License files presentes**

---

## 7. COMMUNICATION

- [ ] **Stakeholders notificados**
- [ ] **Maintenance window comunicado** (si aplica)
- [ ] **Release notes preparados**
- [ ] **Support team briefed**

---

## 8. POST-DEPLOYMENT

### Inmediatamente después del deploy

- [ ] **Health checks pasando**
  ```bash
  curl https://api.platziflix.com/health
  ```

- [ ] **Smoke tests ejecutados**
  - [ ] Login funciona
  - [ ] Features principales funcionan
  - [ ] No errores en consola

- [ ] **Monitoring activo**
  - [ ] Error rates normales
  - [ ] Response times aceptables
  - [ ] No memory leaks

### Primera hora

- [ ] **Logs monitoreados**
  - [ ] No errores críticos
  - [ ] Tráfico normal

- [ ] **User feedback monitoreado**
  - [ ] Support tickets
  - [ ] Social media

### Primer día

- [ ] **Performance metrics revisados**
- [ ] **Error rates comparados con baseline**
- [ ] **User adoption monitoreado**

---

## 9. ROLLBACK PLAN

**Si algo sale mal**:

1. **Identificar el problema**
   - Revisar logs
   - Revisar monitoring
   - Reproducir issue

2. **Decidir: Fix forward o Rollback**
   - Hot fix si es rápido (<15 min)
   - Rollback si es complejo

3. **Ejecutar rollback**
   ```bash
   # Docker
   docker-compose up -d --scale api=3 platziflix-backend:v0.9.0

   # Database rollback
   alembic downgrade -1
   ```

4. **Comunicar**
   - Notificar a stakeholders
   - Post-mortem después

---

## OUTPUT FORMAT

Genera un checklist interactivo:

```markdown
# 🚀 DEPLOYMENT READINESS REPORT
**Date**: [Fecha]
**Version**: [Version a deployar]
**Target**: Production

---

## Summary
- ✅ Passed: X/Y checks
- ⚠️  Warnings: Z checks
- ❌ Failed: W checks

**Status**: 🟢 READY | 🟡 READY WITH WARNINGS | 🔴 NOT READY

---

## Detailed Results

### Backend
- ✅ Tests passing (100%)
- ✅ Migrations executed
- ⚠️  Coverage at 75% (target: 80%)
- ❌ Rate limiting not configured

### Frontend
- ✅ Build successful
- ✅ Tests passing
- ✅ Performance score: 94

### Mobile
- ✅ Android build signed
- ⚠️  iOS tests skipped

---

## Blockers
1. ❌ Rate limiting must be configured before deploy
2. ❌ Production secrets not configured

## Recommendations
1. ⚠️  Increase test coverage to 80%+
2. ⚠️  Setup error monitoring (Sentry)

---

## Next Steps
1. [ ] Fix blockers
2. [ ] Address high-priority warnings
3. [ ] Schedule deployment window
4. [ ] Execute deployment
5. [ ] Monitor for 24 hours
```

**Sé honesto sobre el estado del proyecto. Es mejor retrasar un deploy que tener problemas en producción.**
