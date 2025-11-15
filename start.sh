#!/bin/sh
set -e

echo "🔄 Esperando a PostgreSQL..."
until npx prisma db push --skip-generate --accept-data-loss; do
  echo "⏳ PostgreSQL no está listo - reintentando en 2 segundos..."
  sleep 2
done

echo "✅ Base de datos sincronizada"
echo "🚀 Iniciando servidor..."

exec node src/index.js