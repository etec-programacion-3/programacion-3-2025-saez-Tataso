# Twitter Clone - Full Stack Application

Complete social media platform built with Node.js, Express, React, PostgreSQL, and Prisma ORM.

## Quick Start (Arch Linux / WSL)


```bash
# 1. Clone repository
git clone https://github.com/etec-programacion-3/programacion-3-2025-saez-Tataso.git
cd programacion-3-2025-saez-Tataso

# 2. Run automated setup
make quick-start

# 3. Start application
make dev
```

That's it. Everything else is handled automatically.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running](#running)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Features

- User registration with email validation (@etec.um.edu.ar only)
- JWT-based authentication with automatic token expiration
- Create, read, and delete posts
- User authorization (only authors can delete their posts)
- Protected routes on both frontend and backend
- Real-time token validation
- Responsive UI with loading states

## Technology Stack

**Backend:**
- Node.js + Express
- PostgreSQL 
- Prisma ORM
- JWT authentication
- bcrypt password hashing

**Frontend:**
- React 18
- Vite
- React Router
- Axios
- Context API

## Prerequisites

Fresh Arch Linux or Arch WSL installation. That's all.

The Makefile will install everything else automatically:
- Node.js (via pacman)
- PostgreSQL (via pacman)
- npm packages
- Database setup
- All dependencies

## Installation

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd programacion-3-2025-saez-Tataso
```

### Step 2: Run Quick Start

```bash
make quick-start
```

This single command will:
1. Check system requirements
2. Install Node.js and PostgreSQL via pacman
3. Configure locales for PostgreSQL
4. Initialize PostgreSQL database
5. Create database user and permissions
6. Install all npm dependencies
7. Generate Prisma client
8. Create .env file from template
9. Run database migrations
10. Restore backup if available

### Step 3: Edit Configuration (Optional)

```bash
nano .env
```

Change `JWT_SECRET` to a strong random string. Everything else can stay as default.

### Step 4: Start Application

```bash
make dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Configuration

### Environment Variables (.env)

The `.env` file is created automatically with sensible defaults:

```bash
DATABASE_URL="postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public"
JWT_SECRET="change-this-to-a-strong-random-secret"
PORT=3000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` in production.

### Database

PostgreSQL is configured automatically with:
- Database: `mi_proyecto`
- User: `admin`
- Password: `admin`
- Port: `5432`

## Running

### Development Mode

```bash
make dev
```

Starts both backend and frontend. Use `Ctrl+C` to stop.

If you prefer separate terminals:

```bash
# Terminal 1 - Backend
make dev-backend

# Terminal 2 - Frontend  
make dev-frontend
```

### Production Build

```bash
make build
make start
```

## API Documentation

### Authentication

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@etec.um.edu.ar",
  "password": "securepass123"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@etec.um.edu.ar",
  "password": "securepass123"
}
```

### Posts

**Get All Posts:**
```http
GET /api/posts
```

**Create Post (Protected):**
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "My first post!"
}
```

**Delete Post (Protected):**
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

## Makefile Commands

```bash
make help              # Show all available commands
make quick-start       # Complete automated setup
make check-system      # Check prerequisites
make install           # Install dependencies only
make dev               # Start development servers
make build             # Build for production
make clean             # Remove node_modules
make status            # Show service status
make db-reset          # Reset database
make backup-db         # Backup database
make restore-backup    # Restore from backup
```

## Troubleshooting

### PostgreSQL Won't Start

```bash
# Check status
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql

# Check logs
sudo journalctl -u postgresql -n 50
```

### Port Already in Use

```bash
# Check ports
make check-ports

# Kill processes
make kill-ports
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U admin -d mi_proyecto
# Password: admin
```

### Node.js Not Found After Installation

```bash
# Reload shell
source ~/.bashrc

# Or restart terminal
exit
# Open new terminal
```

### "Cannot find module" Errors

```bash
# Reinstall dependencies
make clean
make install
```

### Locale Errors (PostgreSQL)

Already handled by `make quick-start`. If issues persist:

```bash
sudo locale-gen en_US.UTF-8
echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf
export LANG=en_US.UTF-8
```

### Permission Denied

```bash
# Fix PostgreSQL data directory
sudo chown -R postgres:postgres /var/lib/postgres/data
sudo chmod 700 /var/lib/postgres/data
```

## Project Structure

```
.
├── src/                      # Backend
│   ├── controllers/          # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── index.js            # Entry point
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   └── services/      # API integration
│   └── package.json
├── Makefile               # Automation scripts
├── package.json           # Backend dependencies
└── README.md
```

## Development Workflow

1. Start development servers: `make dev`
2. Make changes to code
3. Changes auto-reload (both backend and frontend)
4. Test in browser: http://localhost:5173
5. Check API: http://localhost:3000/health
6. View database: `make db-studio`

## Database Management

```bash
# View database in browser GUI
make db-studio

# Create new migration
make migrate-dev

# Reset database (WARNING: deletes data)
make db-reset

# Backup database
make backup-db

# Restore backup
make restore-backup
```

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- CORS configured for localhost only
- Only @etec.um.edu.ar emails allowed
- SQL injection protected by Prisma ORM

## Support

For issues:
1. Check Troubleshooting section above
2. Run `make status` to check service health
3. Check logs: `sudo journalctl -u postgresql`
4. Ensure all prerequisites installed: `make check-system`

## License

Educational project for Programación 3 - ETEC