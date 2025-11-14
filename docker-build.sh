# =====================================
# Twitter Clone - Docker Deploy (Arch Linux)
# =====================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Twitter Clone - Docker Deploy      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Detectar si estamos en Arch
if [ -f /etc/arch-release ]; then
    echo -e "${GREEN}✓ Arch Linux detectado${NC}"
else
    echo -e "${YELLOW}⚠ Sistema no es Arch Linux, pero continuando...${NC}"
fi

# Función para verificar comandos
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 no está instalado${NC}"
        echo -e "${YELLOW}Instala con: sudo pacman -S $2${NC}"
        exit 1
    fi
}

# Verificar Docker
echo -e "${YELLOW}► Verificando dependencias...${NC}"
check_command docker docker
check_command docker-compose docker-compose

# Verificar si Docker está corriendo
echo -e "${YELLOW}► Verificando servicio Docker...${NC}"
if ! systemctl is-active --quiet docker; then
    echo -e "${YELLOW}Docker no está activo. Intentando iniciar...${NC}"
    sudo systemctl start docker || {
        echo -e "${RED}✗ No se pudo iniciar Docker${NC}"
        echo -e "${YELLOW}Intenta manualmente:${NC}"
        echo -e "  sudo systemctl enable docker"
        echo -e "  sudo systemctl start docker"
        exit 1
    }
fi

# Verificar si el usuario está en el grupo docker
if ! groups | grep -q docker; then
    echo -e "${YELLOW}⚠ Usuario no está en el grupo docker${NC}"
    echo -e "${YELLOW}Necesitarás usar sudo para los comandos docker${NC}"
    echo -e "${YELLOW}Para evitar esto en el futuro, ejecuta:${NC}"
    echo -e "  sudo usermod -aG docker $USER"
    echo -e "  Luego cierra sesión y vuelve a entrar${NC}"
    echo ""
    DOCKER_CMD="sudo docker"
    DOCKER_COMPOSE_CMD="sudo docker-compose"
else
    DOCKER_CMD="docker"
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# Verificar conexión a Docker
echo -e "${YELLOW}► Probando conexión a Docker...${NC}"
if ! $DOCKER_CMD info &> /dev/null; then
    echo -e "${RED}✗ No se puede conectar a Docker${NC}"
    echo -e "${YELLOW}Posibles soluciones:${NC}"
    echo -e "  1. sudo systemctl restart docker"
    echo -e "  2. sudo chmod 666 /var/run/docker.sock"
    echo -e "  3. sudo usermod -aG docker $USER && newgrp docker"
    exit 1
fi
echo -e "${GREEN}✓ Docker está funcionando${NC}"

# Crear .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}► Creando archivo .env...${NC}"
    cat > .env <<EOF
DATABASE_URL="postgresql://admin:admin@postgres:5432/twitter_clone?schema=public"
JWT_SECRET="$(openssl rand -hex 32 2>/dev/null || echo 'change-this-secret-key-in-production')"
PORT=3000
NODE_ENV=production
FRONTEND_URL="http://localhost"
EOF
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# Crear init.sql si no existe
if [ ! -f init.sql ]; then
    echo -e "${YELLOW}► Creando init.sql...${NC}"
    cat > init.sql <<'EOF'
-- Database initialization
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO admin;
ALTER SCHEMA public OWNER TO admin;

-- Ensure proper permissions
GRANT ALL PRIVILEGES ON DATABASE twitter_clone TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;

DO $$
BEGIN
  RAISE NOTICE 'Database initialized successfully!';
END
$$;
EOF
    echo -e "${GREEN}✓ Archivo init.sql creado${NC}"
fi

# Verificar puertos
echo -e "${YELLOW}► Verificando puertos disponibles...${NC}"
for port in 80 3000 5432; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗ Puerto $port está en uso${NC}"
        echo -e "${YELLOW}Liberalo con: sudo lsof -ti:$port | xargs sudo kill -9${NC}"
        if [ $port -eq 80 ]; then
            echo -e "${YELLOW}O cambia el puerto en docker-compose.yml (frontend)${NC}"
            echo -e "${YELLOW}Por ejemplo, usa 8080:80 en lugar de 80:80${NC}"
        fi
        exit 1
    fi
done
echo -e "${GREEN}✓ Puertos disponibles${NC}"

# Limpiar contenedores antiguos
echo -e "${YELLOW}► Limpiando contenedores antiguos...${NC}"
$DOCKER_COMPOSE_CMD down -v 2>/dev/null || true
$DOCKER_CMD system prune -f 2>/dev/null || true
echo -e "${GREEN}✓ Limpieza completa${NC}"

# Construir imágenes
echo -e "${YELLOW}► Construyendo imágenes Docker...${NC}"
echo -e "${YELLOW}  Esto puede tomar varios minutos la primera vez...${NC}"
$DOCKER_COMPOSE_CMD build --no-cache || {
    echo -e "${RED}✗ Error al construir imágenes${NC}"
    echo -e "${YELLOW}Revisa los logs arriba para más detalles${NC}"
    exit 1
}
echo -e "${GREEN}✓ Imágenes construidas${NC}"

# Levantar servicios
echo -e "${YELLOW}► Iniciando servicios...${NC}"
$DOCKER_COMPOSE_CMD up -d || {
    echo -e "${RED}✗ Error al iniciar servicios${NC}"
    echo -e "${YELLOW}Intenta ver los logs con:${NC}"
    echo -e "  $DOCKER_COMPOSE_CMD logs"
    exit 1
}

# Esperar a que los servicios estén listos
echo -e "${YELLOW}► Esperando a que los servicios inicien...${NC}"
sleep 10

# Verificar estado de los servicios
echo -e "${YELLOW}► Verificando estado de servicios...${NC}"
services_ok=true
for service in postgres backend frontend; do
    if ! $DOCKER_COMPOSE_CMD ps | grep -q "twitter_clone_$service.*Up"; then
        echo -e "${RED}✗ Servicio $service no está corriendo${NC}"
        services_ok=false
    else
        echo -e "${GREEN}✓ Servicio $service está corriendo${NC}"
    fi
done

if [ "$services_ok" = false ]; then
    echo -e "${RED}✗ Algunos servicios fallaron${NC}"
    echo -e "${YELLOW}Revisa los logs con:${NC}"
    echo -e "  $DOCKER_COMPOSE_CMD logs"
    exit 1
fi

# Test de conectividad
echo -e "${YELLOW}► Probando conectividad...${NC}"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    echo -e "${GREEN}✓ Backend respondiendo${NC}"
else
    echo -e "${YELLOW}⚠ Backend todavía iniciando...${NC}"
fi

# Mostrar información final
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Deployment Completo!            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}URLs de acceso:${NC}"
echo -e "  Frontend:       ${BLUE}http://localhost${NC}"
echo -e "  Backend API:    ${BLUE}http://localhost:3000${NC}"
echo -e "  Health Check:   ${BLUE}http://localhost:3000/health${NC}"
echo ""
echo -e "${GREEN}Comandos útiles:${NC}"
echo -e "  Ver logs:       ${YELLOW}$DOCKER_COMPOSE_CMD logs -f${NC}"
echo -e "  Detener todo:   ${YELLOW}$DOCKER_COMPOSE_CMD down${NC}"
echo -e "  Resetear todo:  ${YELLOW}$DOCKER_COMPOSE_CMD down -v${NC}"
echo -e "  Ver estado:     ${YELLOW}$DOCKER_COMPOSE_CMD ps${NC}"
echo ""

if [ "$DOCKER_CMD" = "sudo docker" ]; then
    echo -e "${YELLOW}Nota: Estás usando sudo para Docker.${NC}"
    echo -e "${YELLOW}Para evitarlo, ejecuta:${NC}"
    echo -e "  sudo usermod -aG docker $USER"
    echo -e "  Luego cierra sesión y vuelve a entrar${NC}"
fi