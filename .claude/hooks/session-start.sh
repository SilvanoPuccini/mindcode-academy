#!/bin/bash

# ============================================
# MINDCODE ACADEMY - Session Start Hook
# ============================================
# Este hook se ejecuta al inicio de cada sesión de Claude
# Verifica el estado del ambiente de desarrollo

set -e

echo "╔═══════════════════════════════════════════════════╗"
echo "║  🚀 INICIANDO SESIÓN DE CLAUDE - MINDCODE ACADEMY ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# 1. Verificar Docker
# ============================================
echo -e "${CYAN}📦 Verificando Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo -e "${YELLOW}   Instala Docker Desktop: https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo -e "${YELLOW}   Inicia Docker Desktop y vuelve a intentar${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker está corriendo${NC}"

# ============================================
# 2. Verificar Docker Compose
# ============================================
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose no encontrado (usando 'docker compose')${NC}"
fi

# ============================================
# 3. Verificar estado de containers del Backend
# ============================================
echo ""
echo -e "${CYAN}🐳 Verificando containers del Backend...${NC}"

cd Backend

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers del Backend están corriendo${NC}"

    # Mostrar estado de containers
    echo -e "${CYAN}   Estado de servicios:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}" | tail -n +2
else
    echo -e "${YELLOW}⚠️  Containers del Backend no están corriendo${NC}"
    echo -e "${YELLOW}   Para iniciarlos: cd Backend && make start${NC}"
fi

cd ..

# ============================================
# 4. Verificar Node.js y dependencias del Frontend
# ============================================
echo ""
echo -e "${CYAN}📦 Verificando Frontend...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo -e "${YELLOW}   Instala Node.js: https://nodejs.org/${NC}"
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} instalado${NC}"
fi

if [ ! -d "Frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado${NC}"
    echo -e "${YELLOW}   Instala dependencias: cd Frontend && yarn install${NC}"
else
    echo -e "${GREEN}✓ Dependencias del Frontend instaladas${NC}"
fi

# ============================================
# 5. Verificar archivos de entorno
# ============================================
echo ""
echo -e "${CYAN}🔐 Verificando archivos de entorno...${NC}"

if [ ! -f "Backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend/.env no encontrado${NC}"
    echo -e "${YELLOW}   Copia el template: cp Backend/.env.example Backend/.env${NC}"
else
    echo -e "${GREEN}✓ Backend/.env existe${NC}"
fi

if [ ! -f "Frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Frontend/.env.local no encontrado${NC}"
    echo -e "${YELLOW}   Copia el template: cp Frontend/.env.example Frontend/.env.local${NC}"
else
    echo -e "${GREEN}✓ Frontend/.env.local existe${NC}"
fi

# ============================================
# 6. Verificar Git status
# ============================================
echo ""
echo -e "${CYAN}📝 Estado de Git...${NC}"

if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ Branch actual: ${BRANCH}${NC}"

    # Verificar si hay cambios sin commit
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        MODIFIED_FILES=$(git status --short | wc -l)
        echo -e "${YELLOW}⚠️  ${MODIFIED_FILES} archivo(s) con cambios sin commit${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No es un repositorio Git${NC}"
fi

# ============================================
# 7. Resumen y próximos pasos
# ============================================
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║              📋 COMANDOS ÚTILES                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo -e "${CYAN}Global:${NC}"
echo "  make help       - Ver todos los comandos disponibles"
echo "  make start      - Iniciar Backend + Frontend"
echo "  make test       - Ejecutar todos los tests"
echo ""
echo -e "${CYAN}Backend:${NC}"
echo "  cd Backend && make start    - Iniciar API + DB"
echo "  cd Backend && make migrate  - Ejecutar migraciones"
echo "  cd Backend && make logs     - Ver logs"
echo ""
echo -e "${CYAN}Frontend:${NC}"
echo "  cd Frontend && yarn dev     - Iniciar servidor dev"
echo "  cd Frontend && yarn test    - Ejecutar tests"
echo ""
echo -e "${GREEN}✅ Ambiente verificado - ¡Listo para desarrollar!${NC}"
echo ""
