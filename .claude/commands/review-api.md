---
name: review-api
description: Revisa endpoints de API siguiendo REST best practices
---

Realiza una revisión exhaustiva de los endpoints de la API en `Backend/app/main.py`:

## 1. REST Compliance

Verifica que cada endpoint cumple con:
- **Verbos HTTP correctos**:
  - GET para lectura
  - POST para creación
  - PUT/PATCH para actualización
  - DELETE para eliminación
- **Status codes apropiados**:
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request, 404 Not Found
  - 500 Internal Server Error
- **Naming conventions**:
  - Recursos en plural: `/courses`, `/ratings`
  - Kebab-case para paths
  - Parámetros descriptivos

## 2. Validaciones y Seguridad

Revisa:
- **Pydantic schemas**: Todas las request/response tienen schemas definidos
- **Error handling**: Try/except con mensajes user-friendly
- **Input validation**: Validación de tipos y constraints
- **SQL Injection**: Uso de ORM en lugar de queries raw
- **Authentication**: Endpoints protegidos (si aplica)
- **Rate limiting**: Considerar implementación
- **CORS**: Configuración apropiada

## 3. Documentación

Evalúa:
- **Docstrings**: Cada endpoint tiene docstring descriptivo
- **OpenAPI tags**: Endpoints agrupados lógicamente
- **Response models**: response_model definido
- **Ejemplos**: Ejemplos en docstrings para Swagger
- **Error responses**: Responses documentados en decorador

## 4. Performance

Analiza:
- **N+1 queries**: Uso de `joinedload()` para relaciones
- **Eager loading**: Cargar relaciones necesarias
- **Índices**: Campos de búsqueda indexados en modelos
- **Paginación**: Endpoints que retornan listas implementan paginación
- **Caching**: Considerar cache para datos estáticos

## 5. Consistency

Verifica consistencia en:
- Formato de respuestas (siempre JSON)
- Naming de campos (snake_case)
- Estructura de errores
- Headers HTTP
- Versionado de API (si aplica)

## Output

Genera un reporte en formato markdown con:

```markdown
# API Review Report - [Fecha]

## Summary
- Total endpoints: X
- Issues found: Y
- Critical: Z

## Findings

### 🔴 Critical Issues
1. [Issue] - [Endpoint] - [Descripción]

### 🟡 Warnings
1. [Issue] - [Endpoint] - [Descripción]

### 🟢 Good Practices Found
1. [Practice] - [Endpoint]

## Recommendations
1. Prioridad Alta: [...]
2. Prioridad Media: [...]
3. Prioridad Baja: [...]

## Next Steps
- [ ] Fix critical issues
- [ ] Address warnings
- [ ] Implement recommended improvements
```

Sé detallado y constructivo en tus observaciones.
