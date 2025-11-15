# Twitter Clone

A Twitter-like social media application built with React, Node.js, Express, and PostgreSQL.

## Prerequisites

**You only need:**
- Docker
- Docker Compose

That's it. Everything runs in containers.

## Installation (Arch Linux)

### Install Docker
```bash
# Install Docker and Docker Compose
sudo pacman -S docker docker-compose

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to avoid using sudo)
sudo usermod -aG docker $USER
```

**IMPORTANT:** After running `usermod`, **log out and log back in** for changes to take effect.

### Verify Installation
```bash
# Check Docker works without sudo
docker --version
docker-compose --version
```

If it works without `sudo`, you're ready!

---

## Usage
```bash
# 1. Clone repository
git clone https://github.com/etec-programacion-3/programacion-3-2025-saez-Tataso.git
cd programacion-3-2025-saez-Tataso

# 2. Start application (this does EVERYTHING automatically)
docker-compose up -d

# 3. Wait ~30 seconds on first run (downloads images and builds)
```

**Done!** Open your browser:
- **Application:** http://localhost
- **API:** http://localhost:3000

---

## Using the Application

1. Register with an email ending in `@etec.um.edu.ar`
   - Example: `student@etec.um.edu.ar`
2. Log in
3. Create posts, comment, like

---

## Useful Commands
```bash
# View logs in real-time
docker-compose logs -f

# View only backend logs
docker-compose logs -f backend

# Check container status
docker-compose ps

# Stop everything
docker-compose down

# Complete restart (deletes database)
docker-compose down -v
docker-compose up -d --build

# Rebuild without deleting data
docker-compose up -d --build
```

---

## Troubleshooting

### Error: Port 5432 already in use

If you have PostgreSQL installed locally:
```bash
# Stop local PostgreSQL
sudo systemctl stop postgresql

# Restart containers
docker-compose restart
```

### Error: Permission denied when running docker
```bash
# Check if you're in docker group
groups

# If 'docker' doesn't appear:
sudo usermod -aG docker $USER
# Then LOG OUT AND LOG BACK IN
```

### Error: Cannot connect to Docker daemon
```bash
# Start Docker service
sudo systemctl start docker

# Check status
sudo systemctl status docker
```

---

## Testing the API

You can use the included `requests.http` file with VSCode REST Client extension:
```http
### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@etec.um.edu.ar",
  "password": "password123"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@etec.um.edu.ar",
  "password": "password123"
}
```

---

## Project Structure
```
.
├── docker-compose.yml       # Docker configuration
├── Dockerfile.backend       # Backend image
├── start.sh                 # Backend startup script
├── src/                     # Backend code
│   ├── index.js            # Server entry point
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   └── middleware/         # Authentication
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma
│   └── migrations/
└── frontend/
    ├── Dockerfile          # Frontend image
    ├── src/                # React application
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── pages/
    │   ├── components/
    │   └── context/
    └── public/
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)

### Users
- `GET /api/users` - Get all users

---

## Security Notes

- Default credentials are for development only
- Change `JWT_SECRET` in production
- Use strong passwords
- Email validation requires `@etec.um.edu.ar` domain

---

## Local Development (Optional)

If you want to develop without Docker:
```bash
# Stop Docker containers
docker-compose down

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Setup local PostgreSQL
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE mi_proyecto;"
sudo -u postgres psql -c "CREATE USER admin WITH PASSWORD 'admin';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mi_proyecto TO admin;"

# Create .env file
echo 'DATABASE_URL="postgresql://admin:admin@localhost:5432/mi_proyecto?schema=public"' > .env
echo 'JWT_SECRET="your-secret-key"' >> .env
echo 'PORT=3000' >> .env

# Run migrations
npx prisma migrate deploy

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```
---

## 👨Author

Teobaldo Saez

---