# Makefile for Twitetec clone project - Arch Linux Edition

.PHONY: help install install-backend install-frontend setup-db migrate dev dev-backend dev-frontend build clean test

# Variables
BACKEND_DIR = .
FRONTEND_DIR = frontend
DB_NAME = mi_proyecto
DB_USER = admin
DB_PASS = admin

# Colors for output
COLOR_RESET = \033[0m
COLOR_BOLD = \033[1m
COLOR_GREEN = \033[32m
COLOR_YELLOW = \033[33m
COLOR_BLUE = \033[34m
COLOR_RED = \033[31m

help: ## Show this help message
	@echo "$(COLOR_BOLD)Available commands:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_BLUE)%-20s$(COLOR_RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(COLOR_BOLD)Quick Start on Fresh Arch Linux:$(COLOR_RESET)"
	@echo "  1. make fix-postgres    # Initialize PostgreSQL (if having issues)"
	@echo "  2. make install         # Install Node.js dependencies"
	@echo "  3. make env-create      # Create .env file"
	@echo "  4. make setup-db        # Setup PostgreSQL database"
	@echo "  5. make migrate         # Run database migrations"
	@echo "  6. make dev             # Start the application"
	@echo ""
	@echo "$(COLOR_BOLD)Or use the one-command setup:$(COLOR_RESET)"
	@echo "  make quick-setup        # Does everything automatically"

check-system: ## Check if all system dependencies are installed
	@echo "$(COLOR_BOLD)Checking system dependencies...$(COLOR_RESET)"
	@command -v node >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Node.js installed$(COLOR_RESET) (version: $$(node --version))" || echo "$(COLOR_RED)✗ Node.js not found$(COLOR_RESET) - Install with: sudo pacman -S nodejs"
	@command -v npm >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ npm installed$(COLOR_RESET) (version: $$(npm --version))" || echo "$(COLOR_RED)✗ npm not found$(COLOR_RESET) - Install with: sudo pacman -S npm"
	@command -v psql >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ PostgreSQL installed$(COLOR_RESET) (version: $$(psql --version | cut -d' ' -f3))" || echo "$(COLOR_RED)✗ PostgreSQL not found$(COLOR_RESET) - Install with: sudo pacman -S postgresql"
	@command -v git >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Git installed$(COLOR_RESET) (version: $$(git --version | cut -d' ' -f3))" || echo "$(COLOR_RED)✗ Git not found$(COLOR_RESET) - Install with: sudo pacman -S git"
	@command -v make >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Make installed$(COLOR_RESET)" || echo "$(COLOR_RED)✗ Make not found$(COLOR_RESET) - Install with: sudo pacman -S make"
	@command -v lsof >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ lsof installed$(COLOR_RESET)" || echo "$(COLOR_RED)✗ lsof not found$(COLOR_RESET) - Install with: sudo pacman -S lsof"
	@command -v tmux >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ tmux installed$(COLOR_RESET)" || echo "$(COLOR_YELLOW)⚠ tmux not found (optional)$(COLOR_RESET) - Install with: sudo pacman -S tmux"
	@echo ""
	@echo "$(COLOR_BOLD)System Locale Status:$(COLOR_RESET)"
	@locale -a 2>/dev/null | grep -q "en_US.utf8" && echo "$(COLOR_GREEN)✓ en_US.UTF-8 locale available$(COLOR_RESET)" || echo "$(COLOR_RED)✗ en_US.UTF-8 locale not configured$(COLOR_RESET) - Run: make locale-setup"
	@echo ""
	@echo "$(COLOR_BOLD)PostgreSQL Service Status:$(COLOR_RESET)"
	@sudo systemctl is-active postgresql >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ PostgreSQL is running$(COLOR_RESET)" || echo "$(COLOR_RED)✗ PostgreSQL is not running$(COLOR_RESET) - Start with: sudo systemctl start postgresql"
	@sudo systemctl is-enabled postgresql >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ PostgreSQL is enabled$(COLOR_RESET)" || echo "$(COLOR_YELLOW)⚠ PostgreSQL is not enabled$(COLOR_RESET) - Enable with: sudo systemctl enable postgresql"

locale-setup: ## Configure system locales for PostgreSQL (Arch Linux)
	@echo "$(COLOR_BOLD)Setting up system locales...$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)1. Enabling en_US.UTF-8 locale...$(COLOR_RESET)"
	@sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
	@echo "$(COLOR_YELLOW)2. Generating locales...$(COLOR_RESET)"
	@sudo locale-gen
	@echo "$(COLOR_YELLOW)3. Setting default locale...$(COLOR_RESET)"
	@echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf
	@echo "$(COLOR_GREEN)✓ Locales configured successfully!$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)Please run the following in your terminal:$(COLOR_RESET)"
	@echo "  export LANG=en_US.UTF-8"
	@echo "  export LC_ALL=en_US.UTF-8"
	@echo ""
	@echo "$(COLOR_YELLOW)Or logout and login again for changes to take effect$(COLOR_RESET)"

postgres-init: ## Initialize PostgreSQL for first time (Arch Linux)
	@echo "$(COLOR_YELLOW)Checking system locales...$(COLOR_RESET)"
	@locale -a | grep -q "en_US.utf8" || (echo "$(COLOR_YELLOW)Configuring locales...$(COLOR_RESET)" && \
		sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen && \
		sudo locale-gen && \
		echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf)
	@echo "$(COLOR_YELLOW)Checking PostgreSQL initialization...$(COLOR_RESET)"
	@if [ ! -d "/var/lib/postgres/data" ] || [ -z "$$(ls -A /var/lib/postgres/data 2>/dev/null)" ]; then \
		echo "$(COLOR_YELLOW)PostgreSQL data directory not found or empty.$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)Initializing PostgreSQL database...$(COLOR_RESET)"; \
		sudo -u postgres bash -c "export LANG=en_US.UTF-8 && export LC_ALL=en_US.UTF-8 && initdb -D /var/lib/postgres/data --locale=en_US.UTF-8"; \
		echo "$(COLOR_GREEN)✓ PostgreSQL initialized successfully$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_GREEN)✓ PostgreSQL already initialized$(COLOR_RESET)"; \
	fi
	@echo "$(COLOR_YELLOW)Enabling PostgreSQL service...$(COLOR_RESET)"
	@sudo systemctl enable postgresql
	@echo "$(COLOR_YELLOW)Starting PostgreSQL service...$(COLOR_RESET)"
	@sudo systemctl start postgresql || (echo "$(COLOR_RED)Failed to start. Checking status...$(COLOR_RESET)" && sudo systemctl status postgresql && exit 1)
	@echo "$(COLOR_GREEN)✓ PostgreSQL service started successfully$(COLOR_RESET)"

fix-postgres: ## Fix common PostgreSQL issues on Arch Linux (including locales)
	@echo "$(COLOR_BOLD)Fixing PostgreSQL issues...$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)1. Configuring system locales...$(COLOR_RESET)"
	@grep -q "^en_US.UTF-8" /etc/locale.gen || (sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen && sudo locale-gen)
	@test -f /etc/locale.conf || echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf
	@export LANG=en_US.UTF-8 && export LC_ALL=en_US.UTF-8
	@echo "$(COLOR_GREEN)✓ Locales configured$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)2. Stopping PostgreSQL if running...$(COLOR_RESET)"
	@sudo systemctl stop postgresql 2>/dev/null || true
	@echo "$(COLOR_YELLOW)3. Checking data directory...$(COLOR_RESET)"
	@if [ -d "/var/lib/postgres/data" ]; then \
		if [ -z "$$(ls -A /var/lib/postgres/data 2>/dev/null)" ]; then \
			echo "$(COLOR_YELLOW)   Data directory exists but is empty. Removing...$(COLOR_RESET)"; \
			sudo rm -rf /var/lib/postgres/data; \
		else \
			echo "$(COLOR_YELLOW)   Data directory exists with data. Backing up...$(COLOR_RESET)"; \
			sudo mv /var/lib/postgres/data /var/lib/postgres/data.backup.$$(date +%Y%m%d_%H%M%S); \
		fi; \
	fi
	@echo "$(COLOR_YELLOW)4. Creating fresh data directory...$(COLOR_RESET)"
	@sudo mkdir -p /var/lib/postgres/data
	@sudo chown postgres:postgres /var/lib/postgres/data
	@sudo chmod 700 /var/lib/postgres/data
	@echo "$(COLOR_YELLOW)5. Initializing PostgreSQL with locale...$(COLOR_RESET)"
	@sudo -u postgres bash -c "export LANG=en_US.UTF-8 && export LC_ALL=en_US.UTF-8 && initdb -D /var/lib/postgres/data --locale=en_US.UTF-8"
	@echo "$(COLOR_YELLOW)6. Starting PostgreSQL...$(COLOR_RESET)"
	@sudo systemctl enable postgresql
	@sudo systemctl start postgresql
	@echo "$(COLOR_GREEN)✓ PostgreSQL fixed and running!$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)Now run: make setup-db$(COLOR_RESET)"

install: ## Install all dependencies (backend + frontend + Prisma)
	@echo "$(COLOR_GREEN)Installing dependencies...$(COLOR_RESET)"
	@$(MAKE) install-backend
	@$(MAKE) install-frontend
	@$(MAKE) setup-prisma
	@echo "$(COLOR_GREEN)✓ Installation complete!$(COLOR_RESET)"

install-backend: ## Install backend dependencies only
	@echo "$(COLOR_YELLOW)Installing backend dependencies...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(COLOR_GREEN)✓ Backend dependencies installed$(COLOR_RESET)"

install-frontend: ## Install frontend dependencies only
	@echo "$(COLOR_YELLOW)Installing frontend dependencies...$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(COLOR_GREEN)✓ Frontend dependencies installed$(COLOR_RESET)"

setup-prisma: ## Generate Prisma client
	@echo "$(COLOR_YELLOW)Generating Prisma client...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma generate
	@echo "$(COLOR_GREEN)✓ Prisma client generated$(COLOR_RESET)"

env-create: ## Create .env file from template
	@echo "$(COLOR_YELLOW)Creating .env file...$(COLOR_RESET)"
	@if [ -f .env ]; then \
		echo "$(COLOR_YELLOW).env file already exists. Backing up to .env.backup$(COLOR_RESET)"; \
		cp .env .env.backup; \
	fi
	@echo "DATABASE_URL=\"postgresql://$(DB_USER):$(DB_PASS)@localhost:5432/$(DB_NAME)?schema=public\"" > .env
	@echo "JWT_SECRET=\"change-this-secret-key-in-production-$$(openssl rand -hex 32)\"" >> .env
	@echo "PORT=3000" >> .env
	@echo "NODE_ENV=development" >> .env
	@echo "$(COLOR_GREEN)✓ .env file created$(COLOR_RESET)"

setup-db: ## Setup PostgreSQL database (requires sudo)
	@echo "$(COLOR_YELLOW)Setting up PostgreSQL database...$(COLOR_RESET)"
	@echo "$(COLOR_BLUE)Checking if PostgreSQL is running...$(COLOR_RESET)"
	@sudo systemctl is-active postgresql >/dev/null 2>&1 || (echo "$(COLOR_YELLOW)Starting PostgreSQL...$(COLOR_RESET)" && sudo systemctl start postgresql)
	@echo "$(COLOR_BLUE)Creating database and user...$(COLOR_RESET)"
	@sudo -u postgres psql -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null || echo "$(COLOR_YELLOW)Database already exists$(COLOR_RESET)"
	@sudo -u postgres psql -c "CREATE USER $(DB_USER) WITH PASSWORD '$(DB_PASS)';" 2>/dev/null || echo "$(COLOR_YELLOW)User already exists$(COLOR_RESET)"
	@sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $(DB_NAME) TO $(DB_USER);"
	@sudo -u postgres psql -c "ALTER USER $(DB_USER) CREATEDB;"
	@sudo -u postgres psql -d $(DB_NAME) -c "GRANT ALL ON SCHEMA public TO $(DB_USER);"
	@echo "$(COLOR_GREEN)✓ Database setup complete$(COLOR_RESET)"
	@echo "  Database: $(DB_NAME)"
	@echo "  User: $(DB_USER)"
	@echo "  Password: $(DB_PASS)"

migrate: ## Run database migrations
	@echo "$(COLOR_YELLOW)Running migrations...$(COLOR_RESET)"
	@if [ ! -f .env ]; then \
		echo "$(COLOR_RED)✗ .env file not found. Run 'make env-create' first$(COLOR_RESET)"; \
		exit 1; \
	fi
	@cd $(BACKEND_DIR) && npx prisma migrate deploy
	@echo "$(COLOR_GREEN)✓ Migrations complete$(COLOR_RESET)"

migrate-dev: ## Create and run new migration
	@echo "$(COLOR_YELLOW)Creating new migration...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma migrate dev

db-push: ## Push schema changes without migration
	@cd $(BACKEND_DIR) && npx prisma db push

db-studio: ## Open Prisma Studio
	@echo "$(COLOR_BLUE)Opening Prisma Studio at http://localhost:5555$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma studio

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "$(COLOR_RED)WARNING: This will delete all data!$(COLOR_RESET)"
	@echo "Press Ctrl+C to cancel, or wait 3 seconds to continue..."
	@sleep 3
	@echo "$(COLOR_YELLOW)Resetting database...$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npx prisma migrate reset --force
	@echo "$(COLOR_GREEN)✓ Database reset complete$(COLOR_RESET)"

dev: ## Start both backend and frontend in parallel (requires tmux)
	@if command -v tmux >/dev/null 2>&1; then \
		echo "$(COLOR_BLUE)Starting application with tmux...$(COLOR_RESET)"; \
		tmux kill-session -t twitter-clone 2>/dev/null || true; \
		tmux new-session -d -s twitter-clone "cd $(BACKEND_DIR) && npm run dev"; \
		tmux split-window -h -t twitter-clone "cd $(FRONTEND_DIR) && npm run dev"; \
		echo "$(COLOR_GREEN)✓ Application started in tmux$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)Attaching to tmux session...$(COLOR_RESET)"; \
		echo "$(COLOR_BLUE)Use Ctrl+B then D to detach from tmux$(COLOR_RESET)"; \
		tmux attach -t twitter-clone; \
	else \
		echo "$(COLOR_YELLOW)tmux not found. Start backend and frontend separately:$(COLOR_RESET)"; \
		echo "  Terminal 1: make dev-backend"; \
		echo "  Terminal 2: make dev-frontend"; \
		exit 1; \
	fi

dev-backend: ## Start backend development server
	@echo "$(COLOR_BLUE)Starting backend on http://localhost:3000$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)Press Ctrl+C to stop$(COLOR_RESET)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Start frontend development server
	@echo "$(COLOR_BLUE)Starting frontend on http://localhost:5173$(COLOR_RESET)"
	@echo "$(COLOR_YELLOW)Press Ctrl+C to stop$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm run dev

build: ## Build frontend for production
	@echo "$(COLOR_YELLOW)Building frontend...$(COLOR_RESET)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(COLOR_GREEN)✓ Build complete$(COLOR_RESET)"

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
	@echo "$(COLOR_GREEN)✓ Clean complete$(COLOR_RESET)"

reinstall: clean install ## Clean and reinstall all dependencies

test-api: ## Test API health endpoint
	@echo "$(COLOR_YELLOW)Testing API...$(COLOR_RESET)"
	@if command -v curl >/dev/null 2>&1; then \
		curl -s http://localhost:3000/health | python -m json.tool 2>/dev/null || echo "$(COLOR_RED)✗ Backend not running$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_RED)curl not found. Install with: sudo pacman -S curl$(COLOR_RESET)"; \
	fi

status: ## Show service status
	@echo "$(COLOR_BOLD)Service Status:$(COLOR_RESET)"
	@echo -n "Backend (3000):    "
	@curl -s http://localhost:3000/health >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ Stopped$(COLOR_RESET)"
	@echo -n "Frontend (5173):   "
	@curl -s http://localhost:5173 >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ Stopped$(COLOR_RESET)"
	@echo -n "PostgreSQL (5432): "
	@sudo systemctl is-active postgresql >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ Running$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ Stopped$(COLOR_RESET)"

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
	@echo "$(COLOR_GREEN)✓ Ports cleared$(COLOR_RESET)"

backup-db: ## Backup database to backup.sql
	@echo "$(COLOR_YELLOW)Backing up database...$(COLOR_RESET)"
	@PGPASSWORD=$(DB_PASS) pg_dump -h localhost -U $(DB_USER) $(DB_NAME) > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(COLOR_GREEN)✓ Backup complete$(COLOR_RESET)"

restore-db: ## Restore database from backup file
	@echo "$(COLOR_YELLOW)Enter backup file name (e.g., backup_20240101_120000.sql):$(COLOR_RESET)"
	@read -p "File: " FILE; \
	if [ -f "$$FILE" ]; then \
		PGPASSWORD=$(DB_PASS) psql -h localhost -U $(DB_USER) $(DB_NAME) < $$FILE; \
		echo "$(COLOR_GREEN)✓ Restore complete$(COLOR_RESET)"; \
	else \
		echo "$(COLOR_RED)✗ File not found$(COLOR_RESET)"; \
	fi

version: ## Show versions of installed tools
	@echo "$(COLOR_BOLD)Installed Versions:$(COLOR_RESET)"
	@node --version 2>/dev/null | sed 's/^/Node.js:     /' || echo "Node.js:     Not installed"
	@npm --version 2>/dev/null | sed 's/^/npm:         /' || echo "npm:         Not installed"
	@psql --version 2>/dev/null | head -n1 | sed 's/^/PostgreSQL:  /' || echo "PostgreSQL:  Not installed"
	@cd $(BACKEND_DIR) && npx prisma --version 2>/dev/null | grep "prisma" | head -n1 | sed 's/^/Prisma:      /' || echo "Prisma:      Not installed"

env-check: ## Check if .env file exists
	@test -f .env && echo "$(COLOR_GREEN)✓ .env file exists$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ .env file missing - run 'make env-create'$(COLOR_RESET)"

quick-setup: check-system fix-postgres install env-create setup-db migrate ## Complete setup for fresh Arch Linux install
	@echo ""
	@echo "$(COLOR_GREEN)═══════════════════════════════════════════════════════$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)✓ Setup complete! Your application is ready.$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)═══════════════════════════════════════════════════════$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_BOLD)Next steps:$(COLOR_RESET)"
	@echo "  1. Run '$(COLOR_BLUE)make dev$(COLOR_RESET)' to start the application"
	@echo "  2. Open $(COLOR_BLUE)http://localhost:5173$(COLOR_RESET) in your browser"
	@echo "  3. Register with an email ending in @etec.um.edu.ar"
	@echo ""
	@echo "$(COLOR_YELLOW)Happy coding! 🚀$(COLOR_RESET)"