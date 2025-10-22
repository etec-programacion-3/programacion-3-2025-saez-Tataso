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

### Installing Prerequisites on Arch Linux

```bash
sudo pacman -S nodejs npm postgresql git make
```

### Installing Prerequisites on Ubuntu/Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib git make
```

## Installation

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd programacion-3-2025-saez-Tataso

# Install all dependencies
make install

# Setup database
make setup-db

# Run migrations
make migrate

# Start application
make dev
```

### Manual Installation

If you prefer not to use Makefile:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Generate Prisma client
npx prisma generate

# Setup PostgreSQL database
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE mi_proyecto;
CREATE USER admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mi_proyecto TO admin;
ALTER USER admin CREATEDB;
\q
```

Run migrations:
```bash
npx prisma migrate deploy
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://admin:your_password@localhost:5432/mi_proyecto?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

Important notes:
- Replace `your_password` with your actual PostgreSQL password
- Change `JWT_SECRET` to a strong, random string in production
- Never commit `.env` file to version control

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
# Start both backend and frontend
make dev

# Or start separately
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
│   │   │   ├── Post.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/               # Route components
│   │   │   ├── Feed.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── layouts/             # Layout components
│   │   │   └── Layout.jsx
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/            # API integration
│   │   │   └── api.js
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