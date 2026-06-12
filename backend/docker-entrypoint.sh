#!/bin/sh
set -e

# Esperar hasta que PostgreSQL esté disponible si estamos en entorno local/docker-compose
if echo "$DATABASE_URL" | grep -q "@postgres"; then
  echo "🔄 Esperando a que PostgreSQL local esté listo..."
  until nc -z postgres 5432; do
    echo "⏳ PostgreSQL no está listo - esperando..."
    sleep 2
  done
  echo "✅ PostgreSQL local está listo!"
else
  echo "ℹ️ Conexión a base de datos externa detectada, omitiendo espera del contenedor 'postgres' local..."
fi

# CRÍTICO: Generar el cliente de Prisma antes de cualquier otra cosa
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

# Inicializar tenant base en despliegues limpios
echo "🏢 Verificando datos base de tenant..."
node src/scripts/ensureDefaultTenant.js

echo "🚀 Iniciando aplicación..."

# Ejecutar el comando principal (npm start)
exec "$@"