# Twitter Clone - Full Stack Application

## 🚀 Quick Start con Docker

# INSTALACIÓN EN ARCH LINUX



## 1. Clonar repo
git clone https://github.com/etec-programacion-3/programacion-3-2025-saez-Tataso.git
cd programacion-3-2025-saez-Tataso

## 2. Instalar Docker (si no lo tiene)

```bash
sudo pacman -S docker docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

## 3. Ejecutar el proyecto
```bash
chmod +x docker-build.sh
./docker-build.sh
```

## 4. Si hay problemas con permisos
```bash
sudo ./docker-build.sh
```

## 5. Si el puerto 80 está ocupado
Editar docker-compose.yml y cambiar:
- "80:80" por "8080:80"
Luego acceder a http://localhost:8080

### Acceso
- **App**: http://localhost
- **API**: http://localhost:3000

### Comandos útiles
```bash
docker-compose logs -f     # Ver logs
docker-compose down        # Detener
docker-compose down -v     # Resetear todo
```

## 📁 Estructura del Proyecto
```
.
├── src/               # Backend (Node.js/Express)
├── frontend/          # Frontend (React/Vite)
├── prisma/           # Schema y migraciones
├── docker-compose.yml # Configuración Docker
└── docker-build.sh   # Script de instalación
```

## 🛠️ Stack Tecnológico
- **Backend**: Node.js, Express, Prisma, JWT
- **Frontend**: React, Vite, React Router
- **Database**: PostgreSQL
- **Deployment**: Docker, Nginx

## 📄 Documentación Completa
Ver [README-DOCKER.md](./README-DOCKER.md) para más detalles.