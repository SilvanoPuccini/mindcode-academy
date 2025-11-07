---
name: test-coverage
description: Analiza cobertura de tests y sugiere tests faltantes
---

Analiza la cobertura de tests del proyecto Platziflix e identifica gaps de testing.

## BACKEND (Backend/app/tests/)

### 1. Ejecutar Coverage Report

Si Docker está corriendo:
```bash
cd Backend
docker-compose exec api pytest app/tests/ --cov=app --cov-report=term-missing --cov-report=html
```

### 2. Analizar Coverage

Identifica:
- **Archivos sin tests**: Modelos, servicios, endpoints sin coverage
- **Líneas no cubiertas**: Funciones críticas sin testear
- **Edge cases**: Casos límite no considerados

### 3. Revisar Tests Existentes

Para cada test file:
- ¿Sigue AAA pattern? (Arrange, Act, Assert)
- ¿Tests unitarios vs integración?
- ¿Mock de dependencias externas?
- ¿Assertions completas?

### 4. Gaps Identificados

Lista casos de prueba faltantes:
- Validaciones de modelos
- Lógica de servicios
- Error handling en endpoints
- Soft deletes
- Constraints de DB

## FRONTEND (Frontend/src/)

### 1. Listar Componentes

Revisa estructura:
```
Frontend/src/components/
Frontend/src/app/
```

### 2. Identificar Componentes Sin Tests

Para cada componente:
- ¿Tiene archivo `*.test.tsx`?
- ¿Qué funcionalidad crítica no está testeada?

### 3. Lógica No Testeada

Identifica:
- Custom hooks sin tests
- API calls sin tests
- Form validations
- Error boundaries
- Loading states

### 4. Gaps Identificados

Lista componentes y funcionalidad a testear:
- Renders condicionales
- User interactions (clicks, inputs)
- API integration
- Error states

## MOBILE (Opcional)

### Android (Mobile/PlatziFlixAndroid/)
- ViewModels: ¿Tests de estados?
- Repository: ¿Tests de transformaciones?
- Mappers: ¿Tests de conversión DTO → Domain?

### iOS (Mobile/PlatziFlixiOS/)
- ViewModels: ¿Tests con XCTest?
- Repository: ¿Tests de network calls?
- Mappers: ¿Tests de transformaciones?

## Output Report

Genera reporte con priorización:

```markdown
# Test Coverage Report - [Fecha]

## Executive Summary
- Backend Coverage: X%
- Frontend Coverage: Y%
- Critical gaps: Z

## Backend Tests

### ✅ Well Tested
- [File] - Coverage: XX%

### ❌ Missing Tests
1. **[File/Module]** - Priority: HIGH/MEDIUM/LOW
   - Missing: [Descripción de qué falta testear]
   - Suggested tests:
     - `test_[scenario]`: [Descripción]
     - `test_[edge_case]`: [Descripción]

## Frontend Tests

### ✅ Well Tested Components
- [Component] - Tests: X

### ❌ Untested Components
1. **[Component]** - Priority: HIGH/MEDIUM/LOW
   - Missing tests:
     - Should render correctly
     - Should handle user interaction
     - Should display error state

## Recommended Test Suite

### Backend (crear estos archivos):
1. `Backend/app/tests/test_[feature].py`
   ```python
   # Template de test sugerido
   ```

### Frontend (crear estos archivos):
1. `Frontend/src/components/[Component]/__tests__/[Component].test.tsx`
   ```typescript
   // Template de test sugerido
   ```

## Action Items
- [ ] Alcanzar 80% coverage en Backend
- [ ] Alcanzar 70% coverage en Frontend
- [ ] Testear todos los componentes críticos
- [ ] Agregar integration tests

## Priorización
1. **Inmediato**: [Tests críticos faltantes]
2. **Esta semana**: [Tests importantes]
3. **Backlog**: [Tests nice-to-have]
```

Enfócate en identificar gaps críticos que afecten funcionalidad core.
