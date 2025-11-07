#!/bin/bash

# ============================================
# PLATZIFLIX - Before Commit Hook
# ============================================
# Este hook se ejecuta antes de hacer commits
# Verifica calidad de código y tests

set -e

echo "╔═══════════════════════════════════════════════════╗"
echo "║      🔍 PRE-COMMIT CHECKS - PLATZIFLIX            ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

ERRORS=0

# ============================================
# 1. Verificar que hay cambios para commitear
# ============================================
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No hay cambios staged para commit${NC}"
    exit 1
fi

echo -e "${CYAN}📝 Archivos a commitear:${NC}"
git diff --cached --name-only
echo ""

# ============================================
# 2. Verificar archivos sensibles
# ============================================
echo -e "${CYAN}🔐 Verificando archivos sensibles...${NC}"

SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "secrets.yaml"
    "credentials.json"
    "*.pem"
    "*.key"
    "id_rsa"
)

for pattern in "${SENSITIVE_FILES[@]}"; do
    if git diff --cached --name-only | grep -q "$pattern"; then
        echo -e "${RED}❌ PELIGRO: Intentando commitear archivo sensible: $pattern${NC}"
        echo -e "${RED}   NO commitees archivos con secrets o credenciales${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ No se detectaron archivos sensibles${NC}"
fi
echo ""

# ============================================
# 3. Backend Checks
# ============================================
if git diff --cached --name-only | grep -q "^Backend/"; then
    echo -e "${CYAN}🐍 Verificando Backend (Python)...${NC}"

    # Check si Docker está corriendo
    if docker info > /dev/null 2>&1; then
        cd Backend

        # Linting con flake8 (si está instalado)
        echo -e "${YELLOW}  Running flake8...${NC}"
        if docker-compose exec -T api flake8 app/ --max-line-length=120 --exclude=__pycache__,migrations 2>/dev/null; then
            echo -e "${GREEN}  ✓ Flake8 passed${NC}"
        else
            echo -e "${YELLOW}  ⚠️  Flake8 warnings (no bloqueante)${NC}"
        fi

        # Type checking con mypy (opcional)
        # echo -e "${YELLOW}  Running mypy...${NC}"
        # docker-compose exec -T api mypy app/ 2>/dev/null || true

        cd ..
    else
        echo -e "${YELLOW}  ⚠️  Docker no está corriendo, saltando checks de Backend${NC}"
    fi
    echo ""
fi

# ============================================
# 4. Frontend Checks
# ============================================
if git diff --cached --name-only | grep -q "^Frontend/"; then
    echo -e "${CYAN}⚛️  Verificando Frontend (TypeScript)...${NC}"

    if [ -d "Frontend/node_modules" ]; then
        cd Frontend

        # ESLint
        echo -e "${YELLOW}  Running ESLint...${NC}"
        if yarn lint --quiet 2>/dev/null; then
            echo -e "${GREEN}  ✓ ESLint passed${NC}"
        else
            echo -e "${RED}  ❌ ESLint failed${NC}"
            ERRORS=$((ERRORS + 1))
        fi

        # TypeScript type check
        echo -e "${YELLOW}  Running TypeScript check...${NC}"
        if yarn tsc --noEmit 2>/dev/null; then
            echo -e "${GREEN}  ✓ TypeScript check passed${NC}"
        else
            echo -e "${RED}  ❌ TypeScript errors found${NC}"
            ERRORS=$((ERRORS + 1))
        fi

        cd ..
    else
        echo -e "${YELLOW}  ⚠️  node_modules no encontrado, saltando checks de Frontend${NC}"
    fi
    echo ""
fi

# ============================================
# 5. Tests (opcional pero recomendado)
# ============================================
echo -e "${CYAN}🧪 Tests...${NC}"
echo -e "${YELLOW}Ejecutar tests antes de commit?${NC}"
echo -e "${YELLOW}(Recomendado pero puede ser lento)${NC}"
echo -e "${YELLOW}Para ejecutar tests: make test${NC}"
echo -e "${YELLOW}Saltando por ahora...${NC}"
echo ""

# Descomentar para ejecutar tests automáticamente:
# if git diff --cached --name-only | grep -q "^Backend/"; then
#     echo -e "${YELLOW}  Running Backend tests...${NC}"
#     cd Backend && make test-quick || ERRORS=$((ERRORS + 1))
#     cd ..
# fi
#
# if git diff --cached --name-only | grep -q "^Frontend/"; then
#     echo -e "${YELLOW}  Running Frontend tests...${NC}"
#     cd Frontend && yarn test --run || ERRORS=$((ERRORS + 1))
#     cd ..
# fi

# ============================================
# 6. Verificar tamaño de archivos
# ============================================
echo -e "${CYAN}📦 Verificando tamaño de archivos...${NC}"

MAX_FILE_SIZE=5242880  # 5MB en bytes

while IFS= read -r file; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$size" -gt "$MAX_FILE_SIZE" ]; then
            size_mb=$(echo "scale=2; $size / 1048576" | bc)
            echo -e "${RED}❌ Archivo muy grande: $file (${size_mb}MB)${NC}"
            echo -e "${YELLOW}   Considera usar Git LFS para archivos grandes${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done < <(git diff --cached --name-only)

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los archivos tienen tamaño apropiado${NC}"
fi
echo ""

# ============================================
# 7. Resultado final
# ============================================
echo "╔═══════════════════════════════════════════════════╗"

if [ $ERRORS -eq 0 ]; then
    echo "║           ✅ PRE-COMMIT CHECKS PASSED             ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}🎉 Todo listo para commit!${NC}"
    echo ""
    echo -e "${CYAN}Próximos pasos:${NC}"
    echo "  git commit -m 'tu mensaje descriptivo'"
    echo "  git push"
    exit 0
else
    echo "║           ❌ PRE-COMMIT CHECKS FAILED             ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo ""
    echo -e "${RED}❌ Se encontraron ${ERRORS} error(es)${NC}"
    echo -e "${YELLOW}Corrige los errores antes de commitear${NC}"
    exit 1
fi
