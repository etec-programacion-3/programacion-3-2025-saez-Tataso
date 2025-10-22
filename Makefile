# Makefile for Twitetec clone project.

.PHONY: help install install-backend install-frontend setup-db migrate dev dev-backend dev-frontend build clean test

# Variables
BACKEND_DIR = .
FRONTEND_DIR = frontend
DB_NAME = mi_proyecto
DB_USER = admin

# Colors for output
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m

help: ## Show this help message
	@echo "$(COLOR_BOLD)Available commands:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_BLUE)%-20s$(COLOR_RESET) %s\n", $$1, $$2}'

install: ## Install all dependencies (backend + frontend + Prisma)
	@echo "$(COLOR_GREEN)Installing dependencies...$(COLOR_RESET)"
	@$(MAKE) install-backend
	@$(MAKE) install-frontend
	@$(MAKE) setup-prisma
	@echo "$(COLOR_GREEN)Installation complete!$(COLOR_RESET)"

install-backend: ## Install backend dependencies only
	@echo "$(COLOR_YELLOW)Installing backend dependencies...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(COLOR_GREEN)Backend dependencies installed$(COLOR_RESET)"

install-frontend: ## Install frontend dependencies only
	@echo "$(COLOR_YELLOW)Installing frontend dependencies...$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(COLOR_GREEN)Frontend dependencies installed$(COLOR_RESET)"

setup-prisma: ## Generate Prisma client
	@echo "$(COLOR_YELLOW)Generating Prisma client...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma generate
	@echo "$(COLOR_GREEN)Prisma client generated$(COLOR_RESET)"

setup-db: ## Setup PostgreSQL database (requires sudo)
	@echo "$(COLOR_YELLOW)Setting up PostgreSQL database...$(COLOR_RESET)"
	@sudo -u postgres psql -c "CREATE DATABASE $(DB_NAME);" || echo "Database already exists"
	@sudo -u postgres psql -c "CREATE USER $(DB_USER) WITH PASSWORD 'admin';" || echo "User already exists"
	@sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $(DB_NAME) TO $(DB_USER);"
	@sudo -u postgres psql -c "ALTER USER $(DB_USER) CREATEDB;"
	@echo "$(COLOR_GREEN)Database setup complete$(COLOR_RESET)"

migrate: ## Run database migrations
	@echo "$(COLOR_YELLOW)Running migrations...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma migrate deploy
	@echo "$(COLOR_GREEN)Migrations complete$(COLOR_RESET)"

migrate-dev: ## Create and run new migration
	@echo "$(COLOR_YELLOW)Creating new migration...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma migrate dev

db-push: ## Push schema changes without migration
	@cd $(BACKEND_DIR) && npx prisma db push

db-studio: ## Open Prisma Studio
	@echo "$(COLOR_BLUE)Opening Prisma Studio at http://localhost:5555$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(COLOR_YELLOW)Resetting database...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma migrate reset --force
	@echo "$(COLOR_GREEN)Database reset complete$(COLOR_RESET)"

dev: ## Start both backend and frontend in parallel (requires tmux)
	@command -v tmux >/dev/null 2>&1 || { echo "tmux not found. Install with: sudo pacman -S tmux"; exit 1; }
	@tmux new-session -d -s twitter-clone "cd $(BACKEND_DIR) && npm run dev"
	@tmux split-window -h -t twitter-clone "cd $(FRONTEND_DIR) && npm run dev"
	@tmux attach -t twitter-clone

dev-backend: ## Start backend development server
	@echo "$(COLOR_BLUE)Starting backend on http://localhost:3000$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Start frontend development server
	@echo "$(COLOR_BLUE)Starting frontend on http://localhost:5173$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm run dev

build: ## Build frontend for production
	@echo "$(COLOR_YELLOW)Building frontend...$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(COLOR_GREEN)Build complete$(COLOR_RESET)"

start: ## Start backend in production mode
	@echo "$(COLOR_BLUE)Starting backend in production mode...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npm start

clean: ## Clean node_modules and build artifacts
	@echo "$(COLOR_YELLOW)Cleaning...$(COLOR_RESET)"
	@rm -rf $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -f $(BACKEND_DIR)/package-lock.json
	@rm -f $(FRONTEND_DIR)/package-lock.json
	@echo "$(COLOR_GREEN)Clean complete$(COLOR_RESET)"

reinstall: clean install ## Clean and reinstall all dependencies

test-api: ## Test API health endpoint
	@echo "$(COLOR_YELLOW)Testing API...$(COLOR_RESET)"
	@curl -s http://localhost:3000/health | python -m json.tool || echo "Backend not running"

logs-backend: ## Show backend logs (if using PM2)
	@pm2 logs backend

logs-frontend: ## Show frontend logs (if using PM2)
	@pm2 logs frontend

status: ## Show service status
	@echo "$(COLOR_BOLD)Service Status:$(COLOR_RESET)"
	@echo -n "Backend:  "
	@curl -s http://localhost:3000/health >/dev/null 2>&1 && echo "$(COLOR_GREEN)Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)Stopped$(COLOR_RESET)"
	@echo -n "Frontend: "
	@curl -s http://localhost:5173 >/dev/null 2>&1 && echo "$(COLOR_GREEN)Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)Stopped$(COLOR_RESET)"
	@echo -n "PostgreSQL: "
	@sudo systemctl is-active postgresql >/dev/null 2>&1 && echo "$(COLOR_GREEN)Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)Stopped$(COLOR_RESET)"

check-ports: ## Check if ports are in use
	@echo "$(COLOR_BOLD)Port Status:$(COLOR_RESET)"
	@echo -n "3000 (Backend):  "
	@lsof -ti:3000 >/dev/null 2>&1 && echo "$(COLOR_YELLOW)In use$(COLOR_RESET)" || echo "$(COLOR_GREEN)Available$(COLOR_RESET)"
	@echo -n "5173 (Frontend): "
	@lsof -ti:5173 >/dev/null 2>&1 && echo "$(COLOR_YELLOW)In use$(COLOR_RESET)" || echo "$(COLOR_GREEN)Available$(COLOR_RESET)"
	@echo -n "5432 (PostgreSQL): "
	@lsof -ti:5432 >/dev/null 2>&1 && echo "$(COLOR_YELLOW)In use$(COLOR_RESET)" || echo "$(COLOR_GREEN)Available$(COLOR_RESET)"

kill-ports: ## Kill processes on ports 3000 and 5173
	@echo "$(COLOR_YELLOW)Killing processes on ports...$(COLOR_RESET)"
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:5173 | xargs kill -9 2>/dev/null || true
	@echo "$(COLOR_GREEN)Ports cleared$(COLOR_RESET)"

env-example: ## Create .env.example file
	@echo "DATABASE_URL=\"postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public\"" > .env.example
	@echo "JWT_SECRET=\"change-this-secret-key-in-production\"" >> .env.example
	@echo "PORT=3000" >> .env.example
	@echo "NODE_ENV=development" >> .env.example
	@echo "$(COLOR_GREEN).env.example created$(COLOR_RESET)"

env-check: ## Check if .env file exists
	@test -f .env && echo "$(COLOR_GREEN).env file exists$(COLOR_RESET)" || echo "$(COLOR_YELLOW).env file missing - copy from .env.example$(COLOR_RESET)"

backup-db: ## Backup database to backup.sql
	@echo "$(COLOR_YELLOW)Backing up database...$(COLOR_RESET)"
	@pg_dump -h localhost -U $(DB_USER) $(DB_NAME) > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(COLOR_GREEN)Backup complete$(COLOR_RESET)"

restore-db: ## Restore database from backup.sql
	@echo "$(COLOR_YELLOW)Restoring database...$(COLOR_RESET)"
	@psql -h localhost -U $(DB_USER) $(DB_NAME) < backup.sql
	@echo "$(COLOR_GREEN)Restore complete$(COLOR_RESET)"

version: ## Show versions of installed tools
	@echo "$(COLOR_BOLD)Installed Versions:$(COLOR_RESET)"
	@node --version | sed 's/^/Node.js:     /'
	@npm --version | sed 's/^/npm:         /'
	@psql --version | sed 's/^/PostgreSQL: /'
	@cd $(BACKEND_DIR) && npx prisma --version | grep "prisma" | sed 's/^/Prisma:      /'