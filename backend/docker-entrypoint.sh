#!/bin/sh
set -e

echo "🔄 Esperando a que PostgreSQL esté completamente listo..."

# Esperar hasta que PostgreSQL esté disponible
until nc -z postgres 5432; do
  echo "⏳ PostgreSQL no está listo - esperando..."
  sleep 2
done

echo "✅ PostgreSQL está listo!"

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