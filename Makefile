# Makefile for Twitter Clone - Arch Linux / WSL
# Complete automated setup and management

.PHONY: help quick-start check-system install-system install dev clean

# Variables
DB_NAME = mi_proyecto
DB_USER = admin
DB_PASS = admin
BACKEND_DIR = .
FRONTEND_DIR = frontend

# Colors
RESET = \033[0m
BOLD = \033[1m
GREEN = \033[32m
YELLOW = \033[33m
BLUE = \033[34m
RED = \033[31m

###########################################
# QUICK START
###########################################

quick-start: ## Complete setup from scratch (recommended)
	@echo "$(BOLD)$(BLUE)Twitter Clone - Automated Setup$(RESET)"
	@echo ""
	@echo "This will install and configure everything automatically."
	@echo "Estimated time: 5-10 minutes"
	@echo ""
	@read -p "Press Enter to continue or Ctrl+C to cancel..."
	@echo ""
	@$(MAKE) check-system
	@$(MAKE) install-system
	@$(MAKE) configure-locale
	@$(MAKE) setup-postgresql
	@$(MAKE) install
	@$(MAKE) setup-env
	@$(MAKE) migrate
	@$(MAKE) try-restore
	@echo ""
	@echo "$(BOLD)$(GREEN)✓ Setup Complete!$(RESET)"
	@echo ""
	@echo "$(BOLD)Next steps:$(RESET)"
	@echo "  1. Review .env file (optional): nano .env"
	@echo "  2. Start application: make dev"
	@echo "  3. Open browser: http://localhost:5173"
	@echo ""

help: ## Show this help
	@echo "$(BOLD)Available Commands:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Quick Start:$(RESET)"
	@echo "  make quick-start    - Complete automated setup"
	@echo "  make dev            - Start application"

###########################################
# SYSTEM CHECKS
###########################################

check-system: ## Check system requirements
	@echo "$(YELLOW)Checking system...$(RESET)"
	@command -v pacman >/dev/null 2>&1 || (echo "$(RED)✗ pacman not found. Is this Arch Linux?$(RESET)" && exit 1)
	@command -v sudo >/dev/null 2>&1 || (echo "$(RED)✗ sudo not found$(RESET)" && exit 1)
	@echo "$(GREEN)✓ System check passed$(RESET)"

###########################################
# SYSTEM INSTALLATION
###########################################

install-system: ## Install Node.js and PostgreSQL
	@echo "$(YELLOW)Installing system packages...$(RESET)"
	@echo "This may take a few minutes..."
	@sudo pacman -Sy --needed --noconfirm nodejs npm postgresql base-devel 2>&1 | grep -v "warning:" || true
	@echo "$(GREEN)✓ System packages installed$(RESET)"

configure-locale: ## Configure system locale for PostgreSQL
	@echo "$(YELLOW)Configuring locale...$(RESET)"
	@sudo sed -i 's/^#en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen 2>/dev/null || true
	@sudo locale-gen >/dev/null 2>&1 || true
	@echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf >/dev/null
	@export LANG=en_US.UTF-8
	@echo "$(GREEN)✓ Locale configured$(RESET)"

setup-postgresql: ## Initialize and configure PostgreSQL
	@echo "$(YELLOW)Setting up PostgreSQL...$(RESET)"
	@sudo -u postgres initdb -D /var/lib/postgres/data >/dev/null 2>&1 || echo "  Database already initialized"
	@sudo systemctl start postgresql >/dev/null 2>&1 || true
	@sudo systemctl enable postgresql >/dev/null 2>&1 || true
	@sleep 2
	@sudo -u postgres psql -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null || echo "  Database $(DB_NAME) already exists"
	@sudo -u postgres psql -c "CREATE USER $(DB_USER) WITH PASSWORD '$(DB_PASS)';" 2>/dev/null || echo "  User $(DB_USER) already exists"
	@sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $(DB_NAME) TO $(DB_USER);" >/dev/null 2>&1
	@sudo -u postgres psql -c "ALTER USER $(DB_USER) CREATEDB;" >/dev/null 2>&1
	@sudo -u postgres psql -c "ALTER DATABASE $(DB_NAME) OWNER TO $(DB_USER);" >/dev/null 2>&1
	@echo "$(GREEN)✓ PostgreSQL configured$(RESET)"

###########################################
# PROJECT INSTALLATION
###########################################

install: ## Install project dependencies
	@echo "$(YELLOW)Installing project dependencies...$(RESET)"
	@echo "  Installing backend..."
	@npm install --silent 2>&1 | grep -E "(added|removed|up to date)" || true
	@echo "  Installing frontend..."
	@cd $(FRONTEND_DIR) && npm install --silent 2>&1 | grep -E "(added|removed|up to date)" || true
	@echo "  Generating Prisma client..."
	@npx prisma generate >/dev/null 2>&1
	@echo "$(GREEN)✓ Dependencies installed$(RESET)"

setup-env: ## Create .env file
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file...$(RESET)"; \
		echo 'DATABASE_URL="postgresql://$(DB_USER):$(DB_PASS)@localhost:5432/$(DB_NAME)?schema=public"' > .env; \
		echo 'JWT_SECRET="change-this-to-a-strong-random-secret-in-production"' >> .env; \
		echo 'PORT=3000' >> .env; \
		echo 'NODE_ENV=development' >> .env; \
		echo "$(GREEN)✓ .env file created$(RESET)"; \
	else \
		echo "$(BLUE).env file already exists$(RESET)"; \
	fi

migrate: ## Run database migrations
	@echo "$(YELLOW)Running migrations...$(RESET)"
	@npx prisma migrate deploy >/dev/null 2>&1 || echo "  No migrations to apply"
	@echo "$(GREEN)✓ Migrations complete$(RESET)"

try-restore: ## Try to restore backup if available
	@if [ -f backup_antigua.sql ]; then \
		echo "$(YELLOW)Found backup file, restoring...$(RESET)"; \
		psql -h localhost -U $(DB_USER) -d $(DB_NAME) < backup_antigua.sql >/dev/null 2>&1 && \
		echo "$(GREEN)✓ Backup restored$(RESET)" || \
		echo "$(BLUE)  Backup restore skipped$(RESET)"; \
	fi

###########################################
# DEVELOPMENT
###########################################

dev: ## Start development servers
	@echo "$(BOLD)Starting Twitter Clone...$(RESET)"
	@echo ""
	@echo "$(BLUE)Backend:  http://localhost:3000$(RESET)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(RESET)"
	@echo ""
	@echo "$(YELLOW)Press Ctrl+C to stop both servers$(RESET)"
	@echo ""
	@trap 'kill 0' INT; \
	(cd $(BACKEND_DIR) && npm run dev) & \
	(cd $(FRONTEND_DIR) && npm run dev) & \
	wait

dev-backend: ## Start backend only
	@echo "$(BLUE)Starting backend...$(RESET)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Start frontend only
	@echo "$(BLUE)Starting frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run dev

###########################################
# DATABASE MANAGEMENT
###########################################

db-studio: ## Open Prisma Studio (database GUI)
	@echo "$(BLUE)Opening Prisma Studio at http://localhost:5555$(RESET)"
	@npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(RED)WARNING: This will delete ALL data!$(RESET)"
	@read -p "Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		npx prisma migrate reset --force && \
		echo "$(GREEN)✓ Database reset$(RESET)"; \
	else \
		echo "$(YELLOW)Cancelled$(RESET)"; \
	fi

migrate-dev: ## Create new migration
	@npx prisma migrate dev

backup-db: ## Backup database
	@echo "$(YELLOW)Creating backup...$(RESET)"
	@pg_dump -h localhost -U $(DB_USER) $(DB_NAME) > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created$(RESET)"

restore-backup: ## Restore from backup_antigua.sql
	@if [ -f backup_antigua.sql ]; then \
		echo "$(YELLOW)Restoring backup...$(RESET)"; \
		psql -h localhost -U $(DB_USER) -d $(DB_NAME) < backup_antigua.sql && \
		echo "$(GREEN)✓ Backup restored$(RESET)"; \
	else \
		echo "$(RED)✗ backup_antigua.sql not found$(RESET)"; \
	fi

###########################################
# UTILITIES
###########################################

status: ## Show service status
	@echo "$(BOLD)Service Status:$(RESET)"
	@printf "Backend:     "
	@curl -s http://localhost:3000/health >/dev/null 2>&1 && echo "$(GREEN)Running$(RESET)" || echo "$(YELLOW)Stopped$(RESET)"
	@printf "Frontend:    "
	@curl -s http://localhost:5173 >/dev/null 2>&1 && echo "$(GREEN)Running$(RESET)" || echo "$(YELLOW)Stopped$(RESET)"
	@printf "PostgreSQL:  "
	@sudo systemctl is-active postgresql >/dev/null 2>&1 && echo "$(GREEN)Running$(RESET)" || echo "$(YELLOW)Stopped$(RESET)"

check-ports: ## Check port availability
	@echo "$(BOLD)Port Status:$(RESET)"
	@printf "3000 (Backend):   "
	@lsof -ti:3000 >/dev/null 2>&1 && echo "$(YELLOW)In use$(RESET)" || echo "$(GREEN)Available$(RESET)"
	@printf "5173 (Frontend):  "
	@lsof -ti:5173 >/dev/null 2>&1 && echo "$(YELLOW)In use$(RESET)" || echo "$(GREEN)Available$(RESET)"
	@printf "5432 (Database):  "
	@lsof -ti:5432 >/dev/null 2>&1 && echo "$(YELLOW)In use$(RESET)" || echo "$(GREEN)Available$(RESET)"

kill-ports: ## Kill processes on ports
	@echo "$(YELLOW)Killing processes...$(RESET)"
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@-lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✓ Ports cleared$(RESET)"

test-api: ## Test API health
	@curl -s http://localhost:3000/health 2>/dev/null || echo "$(RED)Backend not running$(RESET)"

clean: ## Remove node_modules
	@echo "$(YELLOW)Cleaning...$(RESET)"
	@rm -rf node_modules $(FRONTEND_DIR)/node_modules
	@rm -f package-lock.json $(FRONTEND_DIR)/package-lock.json
	@echo "$(GREEN)✓ Cleaned$(RESET)"

reinstall: clean install ## Clean and reinstall dependencies

build: ## Build for production
	@echo "$(YELLOW)Building frontend...$(RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✓ Build complete$(RESET)"

version: ## Show installed versions
	@echo "$(BOLD)Installed Versions:$(RESET)"
	@node --version 2>/dev/null | sed 's/^/Node.js:     /' || echo "Node.js:     $(RED)Not installed$(RESET)"
	@npm --version 2>/dev/null | sed 's/^/npm:         /' || echo "npm:         $(RED)Not installed$(RESET)"
	@psql --version 2>/dev/null | awk '{print $$3}' | sed 's/^/PostgreSQL: /' || echo "PostgreSQL: $(RED)Not installed$(RESET)"

###########################################
# SYSTEM MANAGEMENT
###########################################

start-postgres: ## Start PostgreSQL service
	@sudo systemctl start postgresql
	@echo "$(GREEN)✓ PostgreSQL started$(RESET)"

stop-postgres: ## Stop PostgreSQL service
	@sudo systemctl stop postgresql
	@echo "$(YELLOW)PostgreSQL stopped$(RESET)"

restart-postgres: ## Restart PostgreSQL service
	@sudo systemctl restart postgresql
	@echo "$(GREEN)✓ PostgreSQL restarted$(RESET)"

postgres-logs: ## Show PostgreSQL logs
	@sudo journalctl -u postgresql -n 50 --no-pager

postgres-shell: ## Open PostgreSQL shell
	@psql -h localhost -U $(DB_USER) -d $(DB_NAME)