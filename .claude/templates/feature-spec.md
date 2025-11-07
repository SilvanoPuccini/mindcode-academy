# Feature: [Nombre de la Feature]

**Author**: [Tu nombre]
**Date**: [Fecha]
**Status**: 🟡 Draft | 🔵 In Progress | 🟢 Completed
**Priority**: 🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low

---

## 📋 Resumen Ejecutivo

**Descripción breve**: [1-2 líneas describiendo la feature]

**Motivación**: [Por qué se necesita esta feature]

**Valor de negocio**: [Qué problema resuelve o qué valor aporta]

---

## 🎯 Objetivos

- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3

---

## 🚫 Non-Goals (Fuera de Scope)

- Lo que NO se incluye en esta feature
- Consideraciones para versiones futuras

---

## 🏗️ Diseño Técnico

### Backend (FastAPI + PostgreSQL)

#### Modelos de Datos

**Nuevas tablas**:
```python
# Backend/app/models/[model_name].py

class [ModelName](BaseModel):
    __tablename__ = '[table_name]'

    # Campos
    field1 = Column(String, nullable=False)
    field2 = Column(Integer, default=0)

    # Relaciones
    related_model = relationship("[RelatedModel]", back_populates="...")
```

**Modificaciones a tablas existentes**:
- [Tabla]: Agregar campo `[field_name]`

#### Endpoints API

| Método | Endpoint | Descripción | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/v1/[resource]` | Lista todos | - | `List[[Resource]]` |
| POST | `/api/v1/[resource]` | Crea nuevo | `[CreateSchema]` | `[Resource]` |
| GET | `/api/v1/[resource]/{id}` | Detalle | - | `[Resource]` |
| PUT | `/api/v1/[resource]/{id}` | Actualiza | `[UpdateSchema]` | `[Resource]` |
| DELETE | `/api/v1/[resource]/{id}` | Elimina | - | 204 No Content |

#### Servicios

**Archivo**: `Backend/app/services/[service_name]_service.py`

```python
class [ServiceName]Service:
    def __init__(self, db: Session):
        self.db = db

    def method_name(self, param1, param2):
        """Lógica de negocio"""
        pass
```

#### Schemas Pydantic

**Archivo**: `Backend/app/schemas/[schema_name].py`

```python
class [Resource]Base(BaseModel):
    field1: str
    field2: int

class [Resource]Create([Resource]Base):
    pass

class [Resource]Response([Resource]Base):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

#### Migraciones

```bash
# Comando para crear migración
cd Backend
alembic revision --autogenerate -m "Add [table_name] table"
alembic upgrade head
```

**Cambios en DB**:
- Nueva tabla: `[table_name]`
- Índices: `idx_[table]_[field]`
- Foreign keys: `fk_[table1]_[table2]`
- Constraints: CHECK, UNIQUE

---

### Frontend (Next.js + React)

#### Componentes

**Nuevos componentes**:

1. **[ComponentName]** (`Frontend/src/components/[ComponentName]/`)
   - Props: `{ prop1: string, prop2: number }`
   - Estado: `useState` para [descripción]
   - Lógica: [Descripción de la lógica]

```tsx
// Frontend/src/components/[ComponentName]/[ComponentName].tsx

interface [ComponentName]Props {
  prop1: string;
  prop2: number;
}

export const [ComponentName] = ({ prop1, prop2 }: [ComponentName]Props) => {
  // Implementation
};
```

#### Páginas/Rutas

**Nuevas rutas**:
- `/[route]` - [Descripción]
- `/[route]/[id]` - [Descripción]

**Archivo**: `Frontend/src/app/[route]/page.tsx`

#### API Integration

**Archivo**: `Frontend/src/services/[service]Api.ts`

```typescript
export async function fetch[Resource]() {
  const response = await fetch(`${API_URL}/[endpoint]`);
  return response.json();
}
```

#### State Management

- **Local state**: `useState` para [qué datos]
- **Server state**: Server Components para [qué datos]
- **Context**: (si aplica) Para compartir [qué estado]

#### Tipos TypeScript

**Archivo**: `Frontend/src/types/[type].ts`

```typescript
export interface [ResourceType] {
  id: number;
  field1: string;
  field2: number;
}
```

---

### Mobile

#### Android (Kotlin + Jetpack Compose)

**Archivos a crear/modificar**:
- `data/entities/[Name]DTO.kt` - DTO del API
- `domain/models/[Name].kt` - Modelo de dominio
- `data/mappers/[Name]Mapper.kt` - Transformación DTO → Domain
- `presentation/[feature]/screen/[Name]Screen.kt` - UI
- `presentation/[feature]/viewmodel/[Name]ViewModel.kt` - Estado

#### iOS (Swift + SwiftUI)

**Archivos a crear/modificar**:
- `Data/Entities/[Name]DTO.swift` - DTO del API
- `Domain/Models/[Name].swift` - Modelo de dominio
- `Data/Mapper/[Name]Mapper.swift` - Transformación
- `Presentation/Views/[Name]View.swift` - UI
- `Presentation/ViewModels/[Name]ViewModel.swift` - Estado

---

## 🗄️ Cambios en Base de Datos

### Schema Changes

```sql
-- Nueva tabla
CREATE TABLE [table_name] (
    id SERIAL PRIMARY KEY,
    field1 VARCHAR(255) NOT NULL,
    field2 INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_[table]_[field] ON [table]([field]);

-- Foreign keys
ALTER TABLE [table1]
ADD CONSTRAINT fk_[table1]_[table2]
FOREIGN KEY ([table2_id]) REFERENCES [table2](id);
```

### Data Migration

¿Se requiere migración de datos existentes?
- [ ] Sí - [Descripción de la migración]
- [ ] No

---

## 🧪 Plan de Testing

### Backend Tests

**Archivo**: `Backend/app/tests/test_[feature].py`

```python
# Tests a crear:
def test_create_[resource]_success():
    """Should create [resource] with valid data"""
    pass

def test_create_[resource]_invalid_data():
    """Should return 400 with invalid data"""
    pass

def test_get_[resource]_not_found():
    """Should return 404 for non-existent [resource]"""
    pass
```

### Frontend Tests

**Archivo**: `Frontend/src/components/[Component]/__tests__/[Component].test.tsx`

```tsx
// Tests a crear:
test('renders [Component] correctly', () => {
  // Test implementation
});

test('handles user interaction', () => {
  // Test implementation
});

test('displays error state', () => {
  // Test implementation
});
```

### Integration Tests

- [ ] E2E: Usuario puede [acción completa]
- [ ] API: Endpoints funcionan end-to-end

---

## 📅 Plan de Implementación

### Fase 1: Backend Foundation (Estimado: X horas)
1. [ ] Crear modelos SQLAlchemy
2. [ ] Crear schemas Pydantic
3. [ ] Crear migración Alembic
4. [ ] Ejecutar y verificar migración
5. [ ] Crear service layer
6. [ ] Implementar endpoints
7. [ ] Tests unitarios backend

### Fase 2: Frontend Implementation (Estimado: X horas)
8. [ ] Crear tipos TypeScript
9. [ ] Crear componentes base
10. [ ] Implementar páginas/rutas
11. [ ] Integrar con API
12. [ ] Implementar estados de error/loading
13. [ ] Tests de componentes

### Fase 3: Mobile Implementation (Estimado: X horas)
14. [ ] Android: DTOs, Mappers, Repository
15. [ ] Android: ViewModel y UI
16. [ ] iOS: DTOs, Mappers, Repository
17. [ ] iOS: ViewModel y UI

### Fase 4: Testing & Polish (Estimado: X horas)
18. [ ] Integration testing
19. [ ] E2E testing
20. [ ] Bug fixes
21. [ ] Performance optimization
22. [ ] Documentation

**Tiempo total estimado**: XX horas

---

## ✅ Checklist de Calidad

### Code Quality
- [ ] Backend: Tests unitarios (>80% coverage)
- [ ] Backend: Tests de integración
- [ ] Frontend: Tests de componentes
- [ ] Frontend: TypeScript sin errores
- [ ] Código sigue style guide del proyecto
- [ ] Sin warnings de linter

### Funcionalidad
- [ ] Happy path funciona correctamente
- [ ] Error handling implementado
- [ ] Edge cases considerados
- [ ] Validaciones en lugar correcto

### Performance
- [ ] No N+1 queries
- [ ] Índices de DB apropiados
- [ ] Eager loading donde se necesita
- [ ] Frontend: Componentes optimizados

### Seguridad
- [ ] Input validation (backend + frontend)
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention
- [ ] Authentication/Authorization (si aplica)
- [ ] Secrets no hardcodeados

### Documentación
- [ ] README actualizado
- [ ] API docs (Swagger) actualizados
- [ ] Comentarios en código complejo
- [ ] CLAUDE.md actualizado si cambia arquitectura

---

## 🚀 Deployment Checklist

- [ ] Migraciones ejecutadas en staging
- [ ] Tests passing en CI/CD
- [ ] Feature flag habilitado (si aplica)
- [ ] Rollback plan documentado
- [ ] Monitoring configurado
- [ ] Logs apropiados

---

## 📚 Referencias

- [Link a diseño de UI/UX]
- [Link a especificación técnica relacionada]
- [Link a ticket/issue]
- [Documentación externa relevante]

---

## 🤔 Preguntas Abiertas

- [ ] ¿Pregunta 1?
- [ ] ¿Pregunta 2?

---

## 🔄 Changelog

**[Fecha]**: Draft inicial
**[Fecha]**: [Cambio realizado]
