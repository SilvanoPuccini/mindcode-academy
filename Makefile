.PHONY: help setup start stop test clean lint docker-up docker-down reset

# Colors for terminal output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(CYAN)╔═══════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║        PLATZIFLIX - COMANDOS DISPONIBLES         ║$(NC)"
	@echo "$(CYAN)╚═══════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)🚀 SETUP & INICIO:$(NC)"
	@echo "  make setup          - Setup inicial del proyecto completo"
	@echo "  make start          - Inicia todos los servicios (Backend + Frontend)"
	@echo "  make stop           - Detiene todos los servicios"
	@echo ""
	@echo "$(GREEN)🧪 TESTING:$(NC)"
	@echo "  make test           - Ejecuta todos los tests (Backend + Frontend)"
	@echo "  make test-backend   - Ejecuta solo tests del Backend"
	@echo "  make test-frontend  - Ejecuta solo tests del Frontend"
	@echo "  make test-coverage  - Ejecuta tests con coverage report"
	@echo ""
	@echo "$(GREEN)🔍 CALIDAD DE CÓDIGO:$(NC)"
	@echo "  make lint           - Ejecuta linters en Backend y Frontend"
	@echo "  make format         - Formatea código (Black + Prettier)"
	@echo ""
	@echo "$(GREEN)🐳 DOCKER:$(NC)"
	@echo "  make docker-up      - Inicia containers de Backend"
	@echo "  make docker-down    - Detiene y elimina containers"
	@echo "  make docker-logs    - Muestra logs de containers"
	@echo "  make docker-rebuild - Rebuild de containers desde cero"
	@echo ""
	@echo "$(GREEN)🗄️  DATABASE:$(NC)"
	@echo "  make migrate        - Ejecuta migraciones de DB"
	@echo "  make seed           - Puebla DB con datos de prueba"
	@echo "  make reset-db       - Reset completo de DB (peligroso)"
	@echo ""
	@echo "$(GREEN)🧹 LIMPIEZA:$(NC)"
	@echo "  make clean          - Limpia archivos temporales"
	@echo "  make clean-all      - Limpieza profunda (node_modules, venv, etc)"
	@echo ""
	@echo "$(GREEN)📱 MOBILE:$(NC)"
	@echo "  make mobile-android - Build Android app"
	@echo "  make mobile-ios     - Build iOS app"

# ============================================
# SETUP & INSTALLATION
# ============================================

setup:
	@echo "$(CYAN)🚀 Setup inicial de Platziflix...$(NC)"
	@echo "$(YELLOW)📦 Backend: Verificando Docker...$(NC)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker no encontrado. Instala Docker Desktop.$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Docker encontrado$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 Backend: Building Docker containers...$(NC)"
	cd Backend && docker-compose build
	@echo "$(GREEN)✓ Backend containers built$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 Frontend: Verificando Node.js...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js no encontrado. Instala Node.js.$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Node.js encontrado: $$(node --version)$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 Frontend: Instalando dependencias...$(NC)"
	cd Frontend && yarn install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"
	@echo ""
	@echo "$(YELLOW)📄 Copiando archivos de configuración...$(NC)"
	@test -f Backend/.env || (cp Backend/.env.example Backend/.env && echo "$(GREEN)✓ Backend/.env created$(NC)")
	@test -f Frontend/.env.local || (cp Frontend/.env.example Frontend/.env.local && echo "$(GREEN)✓ Frontend/.env.local created$(NC)")
	@echo ""
	@echo "$(GREEN)✅ Setup completo!$(NC)"
	@echo "$(CYAN)Siguiente paso: make start$(NC)"

# ============================================
# START & STOP SERVICES
# ============================================

start:
	@echo "$(CYAN)🚀 Iniciando servicios de Platziflix...$(NC)"
	@echo "$(YELLOW)Starting Backend (Docker)...$(NC)"
	cd Backend && make start
	@echo "$(GREEN)✓ Backend running on http://localhost:8000$(NC)"
	@echo ""
	@echo "$(YELLOW)Starting Frontend (Next.js)...$(NC)"
	@echo "$(CYAN)Frontend estará disponible en http://localhost:3000$(NC)"
	cd Frontend && yarn dev

stop:
	@echo "$(CYAN)🛑 Deteniendo servicios...$(NC)"
	@echo "$(YELLOW)Stopping Backend...$(NC)"
	cd Backend && make stop
	@echo "$(YELLOW)Stopping Frontend...$(NC)"
	-pkill -f "next dev" || true
	@echo "$(GREEN)✓ Todos los servicios detenidos$(NC)"

# ============================================
# TESTING
# ============================================

test:
	@echo "$(CYAN)🧪 Ejecutando todos los tests...$(NC)"
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

test-backend:
	@echo "$(YELLOW)🧪 Backend Tests...$(NC)"
	cd Backend && docker-compose exec -T api pytest app/tests/ -v
	@echo "$(GREEN)✓ Backend tests completed$(NC)"

test-frontend:
	@echo "$(YELLOW)🧪 Frontend Tests...$(NC)"
	cd Frontend && yarn test
	@echo "$(GREEN)✓ Frontend tests completed$(NC)"

test-coverage:
	@echo "$(CYAN)🧪 Tests con Coverage Report...$(NC)"
	@echo "$(YELLOW)Backend Coverage...$(NC)"
	cd Backend && docker-compose exec -T api pytest app/tests/ --cov=app --cov-report=html --cov-report=term
	@echo "$(YELLOW)Frontend Coverage...$(NC)"
	cd Frontend && yarn test --coverage
	@echo "$(GREEN)✓ Coverage reports generados$(NC)"
	@echo "$(CYAN)Backend coverage: Backend/htmlcov/index.html$(NC)"
	@echo "$(CYAN)Frontend coverage: Frontend/coverage/index.html$(NC)"

# ============================================
# CODE QUALITY
# ============================================

lint:
	@echo "$(CYAN)🔍 Ejecutando linters...$(NC)"
	@echo "$(YELLOW)Backend: flake8...$(NC)"
	-cd Backend && docker-compose exec -T api flake8 app/ --max-line-length=120 || true
	@echo "$(YELLOW)Frontend: ESLint...$(NC)"
	cd Frontend && yarn lint
	@echo "$(GREEN)✓ Linting completado$(NC)"

format:
	@echo "$(CYAN)🎨 Formateando código...$(NC)"
	@echo "$(YELLOW)Backend: Black...$(NC)"
	-cd Backend && docker-compose exec -T api black app/ || true
	@echo "$(YELLOW)Frontend: Prettier...$(NC)"
	cd Frontend && yarn prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss}"
	@echo "$(GREEN)✓ Código formateado$(NC)"

# ============================================
# DOCKER OPERATIONS
# ============================================

docker-up:
	@echo "$(CYAN)🐳 Iniciando Docker containers...$(NC)"
	cd Backend && docker-compose up -d
	@echo "$(GREEN)✓ Containers iniciados$(NC)"

docker-down:
	@echo "$(CYAN)🐳 Deteniendo Docker containers...$(NC)"
	cd Backend && docker-compose down
	@echo "$(GREEN)✓ Containers detenidos$(NC)"

docker-logs:
	@echo "$(CYAN)📋 Logs de containers:$(NC)"
	cd Backend && docker-compose logs -f

docker-rebuild:
	@echo "$(CYAN)🐳 Rebuilding containers desde cero...$(NC)"
	cd Backend && docker-compose down -v
	cd Backend && docker-compose build --no-cache
	cd Backend && docker-compose up -d
	@echo "$(GREEN)✓ Containers rebuilded$(NC)"

# ============================================
# DATABASE OPERATIONS
# ============================================

migrate:
	@echo "$(CYAN)🗄️  Ejecutando migraciones...$(NC)"
	cd Backend && make migrate
	@echo "$(GREEN)✓ Migraciones aplicadas$(NC)"

seed:
	@echo "$(CYAN)🌱 Poblando base de datos...$(NC)"
	cd Backend && make seed
	@echo "$(GREEN)✓ Datos de prueba insertados$(NC)"

reset-db:
	@echo "$(RED)⚠️  PELIGRO: Esto eliminará TODOS los datos$(NC)"
	@read -p "¿Estás seguro? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "$(YELLOW)Reseteando base de datos...$(NC)"
	cd Backend && make seed-fresh
	@echo "$(GREEN)✓ Base de datos reseteada$(NC)"

# ============================================
# CLEANUP
# ============================================

clean:
	@echo "$(CYAN)🧹 Limpiando archivos temporales...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type f -name "*.log" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

clean-all: clean
	@echo "$(CYAN)🧹 Limpieza profunda...$(NC)"
	@echo "$(RED)⚠️  Esto eliminará node_modules, venv, etc.$(NC)"
	@read -p "¿Continuar? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "venv" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".venv" -exec rm -rf {} + 2>/dev/null || true
	cd Backend && docker-compose down -v
	@echo "$(GREEN)✓ Limpieza profunda completada$(NC)"
	@echo "$(YELLOW)Ejecuta 'make setup' para reinstalar$(NC)"

# ============================================
# MOBILE BUILD
# ============================================

mobile-android:
	@echo "$(CYAN)📱 Building Android app...$(NC)"
	cd Mobile/PlatziFlixAndroid && ./gradlew assembleDebug
	@echo "$(GREEN)✓ Android APK: Mobile/PlatziFlixAndroid/app/build/outputs/apk/debug/$(NC)"

mobile-ios:
	@echo "$(CYAN)📱 Building iOS app...$(NC)"
	cd Mobile/PlatziFlixiOS && xcodebuild build -scheme PlatziFlixiOS -configuration Debug
	@echo "$(GREEN)✓ iOS build completado$(NC)"

# ============================================
# DEVELOPMENT HELPERS
# ============================================

dev-backend:
	@echo "$(CYAN)🔧 Modo desarrollo Backend (hot reload)$(NC)"
	cd Backend && docker-compose up

dev-frontend:
	@echo "$(CYAN)🔧 Modo desarrollo Frontend (Turbopack)$(NC)"
	cd Frontend && yarn dev

shell-backend:
	@echo "$(CYAN)🐚 Abriendo shell en container Backend...$(NC)"
	cd Backend && docker-compose exec api /bin/bash

shell-db:
	@echo "$(CYAN)🐚 Abriendo shell PostgreSQL...$(NC)"
	cd Backend && docker-compose exec db psql -U platziflix_user -d platziflix_db
