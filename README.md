# Twitter Clone

Aplicación estilo Twitter con React, Node.js, Express y PostgreSQL.

## Requisitos

- **Docker** y **Docker Compose**

## Instalación (Arch Linux)
```bash
# Instalar Docker
sudo pacman -S docker docker-compose

# Iniciar servicio Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER
```

**Importante:** Después de agregar tu usuario al grupo docker, cierra sesión y vuelve a iniciar para que los cambios surtan efecto.

## Uso
```bash
# 1. Clonar repositorio
git clone https://github.com/etec-programacion-3/programacion-3-2025-saez-Tataso.git
cd programacion-3-2025-saez-Tataso

# 2. Iniciar aplicación
docker-compose up -d

# 3. Ver logs (opcional)
docker-compose logs -f
```

**¡Listo!** Abre tu navegador en:
- **Frontend:** http://localhost
- **API:** http://localhost:3000

## Comandos útiles
```bash
# Detener todo
docker-compose down

# Detener y eliminar volúmenes (reinicio completo)
docker-compose down -v

# Reconstruir contenedores
docker-compose up -d --build

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Registro de usuarios

- Los emails deben terminar en `@etec.um.edu.ar`
- Ejemplo: `usuario@etec.um.edu.ar`

## Troubleshooting

**Si el puerto 5432 está ocupado:**
```bash
# Detener PostgreSQL local
sudo systemctl stop postgresql
```

**Si hay problemas con permisos de Docker:**
```bash
# Verificar que estás en el grupo docker
groups

# Si no aparece 'docker', ejecutar:
sudo usermod -aG docker $USER
# Luego cerrar sesión y volver a iniciar
```

**Reinicio completo:**
```bash
docker-compose down -v
docker-compose up -d --build
```