# programacion-3-2025-saez-Tataso
# Twitter Clone - Full Stack Application

A complete social media application built with modern web technologies, featuring user authentication, post management, and real-time interactions.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is a Twitter-like social media platform that demonstrates full-stack development practices including RESTful API design, secure authentication, database relationships, and modern frontend architecture.

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v13+)
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Security**: Helmet, CORS

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: Context API
- **Styling**: CSS-in-JS (inline styles)

## Features

- User registration with email domain validation (@etec.um.edu.ar)
- Secure authentication with JWT tokens
- Password hashing with bcrypt
- Create, read, and delete posts
- User authorization (only post authors can delete their posts)
- Protected routes on frontend
- Real-time token expiration handling
- Responsive user interface
- Loading states and error handling
- RESTful API architecture

## Prerequisites

Before installing, ensure you have the following installed on your system:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 13.0
- **Git**
- **make** (for using Makefile commands)

### Installing Prerequisites on Arch Linux (FRESH INSTALL)

```bash
# Update system
sudo pacman -Syyu

# Install all required packages
sudo pacman -S nodejs npm postgresql git make base-devel lsof tmux

# Configure locales (REQUIRED for PostgreSQL)
# Edit locale.gen and uncomment en_US.UTF-8
sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
sudo locale-gen
echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Initialize PostgreSQL with locale
sudo -u postgres initdb -D /var/lib/postgres/data --locale=en_US.UTF-8

# Enable and start PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Verify it's running
sudo systemctl status postgresql
```

### Installing Prerequisites on Ubuntu/Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib git make lsof tmux
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## Installation

### Quick Start for Arch Linux

```bash
# 1. Clone repository
git clone https://github.com/etec-programacion-3/programacion-3-2025-saez-Tataso.git
cd programacion-3-2025-saez-Tataso

# 2. Configure system locales (REQUIRED for PostgreSQL)
sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
sudo locale-gen
echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 3. Initialize PostgreSQL with locale
sudo -u postgres initdb -D /var/lib/postgres/data --locale=en_US.UTF-8

# 4. Enable and start PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 5. Verify PostgreSQL is running
sudo systemctl status postgresql

# 6. Install all dependencies
make install

# 7. Create .env file
make env-create

# 8. Setup database
make setup-db

# 9. Run migrations
make migrate

# 10. Start application
make dev
```

**Or use the automatic setup (after configuring locales):**
```bash
make quick-setup
```

### Step by Step Installation (Arch Linux)

If you prefer to understand each step or if Makefile doesn't work:

#### 1. System Setup
```bash
# Ensure PostgreSQL is installed and running
sudo pacman -S postgresql
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 2. Initialize PostgreSQL (ONLY on first install)
```bash
# Check if PostgreSQL data directory exists
if [ ! -d "/var/lib/postgres/data" ]; then
    sudo -u postgres initdb -D /var/lib/postgres/data
fi
sudo systemctl restart postgresql
```

#### 3. Install Node.js dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Generate Prisma client
npx prisma generate
```

#### 4. Setup PostgreSQL database
```bash
# Access PostgreSQL as postgres user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
-- Create database
CREATE DATABASE mi_proyecto;

-- Create user with password
CREATE USER admin WITH PASSWORD 'admin';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE mi_proyecto TO admin;

-- Allow user to create databases (for testing)
ALTER USER admin CREATEDB;

-- Exit
\q
```

#### 5. Configure environment
Create a `.env` file in the project root:
```bash
DATABASE_URL="postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

#### 6. Run migrations
```bash
npx prisma migrate deploy
```

## Configuration

### Environment Variables

The `.env` file should contain:

```bash
DATABASE_URL="postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

**Important notes:**
- The default password is 'admin' for development. Change it in production!
- Change `JWT_SECRET` to a strong, random string in production
- Never commit `.env` file to version control

### PostgreSQL Configuration for Arch Linux

If you have authentication issues, you may need to edit PostgreSQL configuration:

```bash
# Edit pg_hba.conf
sudo nano /var/lib/postgres/data/pg_hba.conf

# Ensure these lines exist:
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Restart PostgreSQL after changes
sudo systemctl restart postgresql
```

### Database Schema

The application uses Prisma for database management. The schema includes:

**Users Table:**
- id (Integer, Primary Key)
- email (String, Unique)
- name (String)
- password (String, Hashed)
- createdAt (DateTime)

**Posts Table:**
- id (Integer, Primary Key)
- content (String)
- createdAt (DateTime)
- updatedAt (DateTime)
- authorId (Integer, Foreign Key to Users)

## Running the Application

### Using Makefile (Recommended)

```bash
# Start both backend and frontend (requires tmux)
make dev

# Or start separately in different terminals
make dev-backend  # Terminal 1
make dev-frontend # Terminal 2
```

### Manual Start

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555 (run `make db-studio`)

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@etec.um.edu.ar",
  "password": "securePassword123"
}
```

Response:
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@etec.um.edu.ar",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@etec.um.edu.ar",
  "password": "securePassword123"
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts
```

#### Create Post (Protected)
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is my first post!"
}
```

#### Delete Post (Protected)
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Users Endpoints

#### Get All Users (Protected)
```http
GET /api/users
Authorization: Bearer <token>
```

## Project Structure

```
.
├── src/                          # Backend source code
│   ├── controllers/              # Request handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   └── postController.js     # Post management
│   ├── routes/                   # API route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── postRoutes.js
│   ├── middleware/               # Custom middleware
│   │   └── auth.js               # JWT verification
│   └── index.js                  # Application entry point
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Route components
│   │   ├── layouts/             # Layout components
│   │   ├── context/             # React Context
│   │   ├── services/            # API integration
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Application entry
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Makefile                     # Build automation
├── package.json                 # Backend dependencies
├── .env                         # Environment variables (not in repo)
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

## Development

### Available Make Commands

```bash
make help           # Show all available commands
make install        # Install all dependencies
make setup-db       # Setup PostgreSQL database
make migrate        # Run database migrations
make dev            # Start development servers
make build          # Build for production
make clean          # Remove node_modules and build artifacts
make test-api       # Test API health endpoint
make status         # Show service status
make check-ports    # Check port availability
make kill-ports     # Kill processes on used ports
make db-studio      # Open Prisma Studio
make backup-db      # Backup database
make version        # Show installed versions
make env-create     # Create .env file from template
```

### Database Management

```bash
# Create new migration
make migrate-dev

# Reset database (WARNING: deletes all data)
make db-reset

# Push schema changes without migration
make db-push

# Open Prisma Studio GUI
make db-studio

# Backup database
make backup-db
```

### Code Quality

The project follows these conventions:
- RESTful API design patterns
- Separation of concerns (MVC architecture)
- Reusable React components
- Centralized state management
- Error handling at all levels
- Secure authentication practices

## Deployment

### Production Build

```bash
# Build frontend
make build

# Start backend in production mode
make start
```

### Environment Variables for Production

Update `.env` for production:
```bash
DATABASE_URL="postgresql://user:pass@production-host:5432/db"
JWT_SECRET="strong-random-production-secret"
PORT=3000
NODE_ENV=production
```

### Security Considerations

- Change JWT_SECRET to a strong random string
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set appropriate CORS origins
- Use strong database passwords
- Implement rate limiting
- Regular security updates

## Troubleshooting

### PostgreSQL Locale Error (Arch Linux) - VERY COMMON

If you get this error:
```
initdb: error: invalid locale settings; check LANG and LC_* environment variables
```

**Solution:**
```bash
# 1. Configure system locales
sudo sed -i 's/#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
sudo locale-gen
echo "LANG=en_US.UTF-8" | sudo tee /etc/locale.conf

# 2. Export locale variables
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 3. Initialize PostgreSQL with locale
sudo -u postgres initdb -D /var/lib/postgres/data --locale=en_US.UTF-8

# 4. Start PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### PostgreSQL Not Starting (Arch Linux)

If you get this error:
```
Job for postgresql.service failed because the control process exited with error code.
```

**Solution:**
```bash
# Use the automatic fix command
make fix-postgres
```

This command will:
1. Configure system locales
2. Stop PostgreSQL if running
3. Backup any existing data
4. Initialize a fresh PostgreSQL installation with correct locale
5. Start the service

### Permission Denied Errors

```bash
# Fix PostgreSQL permissions
sudo chown -R postgres:postgres /var/lib/postgres
sudo chmod 700 /var/lib/postgres/data

# Restart service
sudo systemctl restart postgresql
```

### Port Already in Use

```bash
# Check which process is using the port
make check-ports

# Kill processes on ports
make kill-ports
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test database connection
psql -h localhost -U admin -d mi_proyecto

# If authentication fails, check pg_hba.conf
sudo nano /var/lib/postgres/data/pg_hba.conf
```

### Cannot Find Module

```bash
# Clean and reinstall
make clean
make install
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
npx prisma generate
```

### Token Expiration Issues

Tokens expire after 24 hours. Users will be automatically logged out when their token expires. To adjust expiration time, modify `expiresIn` in `src/controllers/authController.js`.

### CORS Errors

Ensure backend CORS is configured correctly in `src/index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

### tmux Not Found

```bash
# Install tmux for parallel development
sudo pacman -S tmux

# Or run backend and frontend separately
make dev-backend  # Terminal 1
make dev-frontend # Terminal 2
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes as part of Programación 3 course at ETEC.

## Contact

For questions or support, please contact the development team or open an issue in the repository.