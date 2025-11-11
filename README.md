# Social Media Application

A full-stack social media application featuring user authentication and post management built with React, Node.js, Express, Prisma, and PostgreSQL.

## Prerequisites

The following software must be installed on your system:
- Docker & Docker Compose
- Node.js v18 or higher
- npm (included with Node.js)

No additional system-level packages are required. All other dependencies are installed via npm.

## Quick Start

### 1. Start the Database

From the project root directory:
```bash
docker-compose up -d
```

Verify the container is running:
```bash
docker ps
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Generate Prisma Client
npx prisma generate
```

### 3. Configure Environment

Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
NODE_ENV=development
```

### 4. Run Database Migrations
```bash
npx prisma migrate deploy
```

Or use the Makefile:
```bash
make migrate
```

### 5. Start the Application

Option A - Using Makefile (requires tmux):
```bash
make dev
```

Option B - Manual start in separate terminals:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure
```
.
├── src/                          # Backend source code
│   ├── controllers/              # Request handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   └── postController.js     # Post management
│   ├── routes/                   # API route definitions
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   └── postRoutes.js         # /api/posts routes
│   ├── middleware/               # Custom middleware
│   │   └── auth.js               # JWT verification
│   └── index.js                  # Express server entry point
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── context/              # React Context (Auth)
│   │   ├── services/             # API integration (axios)
│   │   ├── App.jsx               # Main application component
│   │   └── main.jsx              # Application entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml            # PostgreSQL container configuration
├── requests.http                 # API endpoint examples
├── Dependencies.txt              # Minimal dependencies documentation
├── Makefile                      # Build automation commands
├── package.json                  # Backend dependencies
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
└── README.md
```

## Technology Stack

### Backend
- Node.js & Express - Web server and RESTful API
- Prisma ORM - Database management and migrations
- PostgreSQL - Relational database
- JWT (jsonwebtoken) - Authentication tokens
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing

### Frontend
- React 18 - UI library
- React Router DOM - Client-side routing
- Axios - HTTP client for API requests
- Vite - Build tool and development server
- Context API - State management

### Infrastructure
- Docker - Container platform for PostgreSQL
- Docker Compose - Database orchestration

## API Endpoints

### Authentication

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@etec.um.edu.ar",
  "password": "password123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@etec.um.edu.ar",
  "password": "password123"
}
```

### Posts

**Get All Posts**
```http
GET /api/posts
```

**Create Post** (requires authentication)
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is my first post!"
}
```

**Delete Post** (requires authentication, author only)
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Users

**Get All Users**
```http
GET /api/users
```

**Create User**
```http
POST /api/users
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@etec.um.edu.ar",
  "password": "password123"
}
```

## Database Schema

### User Model
- id (Int, Primary Key, Auto-increment)
- email (String, Unique)
- name (String)
- password (String, Hashed with bcrypt)
- createdAt (DateTime)
- posts (Relation to Post[])

### Post Model
- id (Int, Primary Key, Auto-increment)
- content (String)
- createdAt (DateTime)
- updatedAt (DateTime)
- authorId (Int, Foreign Key to User)
- author (Relation to User)

## Available Make Commands
```bash
make help            # Show all available commands
make install         # Install all dependencies
make migrate         # Run database migrations
make db-studio       # Open Prisma Studio
make db-reset        # Reset database (WARNING: deletes all data)
make dev             # Start both backend and frontend (requires tmux)
make dev-backend     # Start only backend
make dev-frontend    # Start only frontend
make status          # Show service status
make check-ports     # Check if ports are in use
make clean           # Clean node_modules and build artifacts
```

## Testing the API

Use the included `requests.http` file with VS Code's REST Client extension, or use curl:
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@etec.um.edu.ar","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@etec.um.edu.ar","password":"123456"}'

# Get all posts
curl http://localhost:3000/api/posts
```

## Troubleshooting

### Database Connection Issues

Verify Docker is running:
```bash
docker ps
```

Check the DATABASE_URL in `.env`:
```
postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public
```

### Port 5432 Already in Use

Modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```

Update DATABASE_URL:
```
postgresql://admin:admin@localhost:5433/mi_proyecto?schema=public
```

### Reset Database Completely
```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate reset
```

Or use Makefile:
```bash
make db-reset
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

Or use Makefile:
```bash
make setup-prisma
```

## Development Notes

This application implements:
- RESTful API design principles
- JWT-based authentication with Bearer tokens
- Password hashing with bcryptjs
- Protected routes requiring authentication
- Database relationships using Prisma ORM
- Authorization checks (users can only delete their own posts)
- CORS configuration for frontend-backend communication
- React Context API for authentication state management

## Educational Context

This project was developed as part of a full-stack web development course, demonstrating:
- Modern web development practices
- RESTful API design
- Database relationship modeling with Prisma
- Authentication and authorization
- React hooks and Context API
- Docker containerization
- Database migrations