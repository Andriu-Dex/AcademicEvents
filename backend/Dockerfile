# ============================
# DOCKERFILE SIMPLIFICADO PARA PRISMA
# ============================
FROM node:20-alpine

# Actualizar paquetes del sistema
RUN apk update && apk upgrade --no-cache

# Instalar herramientas necesarias
RUN apk add --no-cache wget netcat-openbsd

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --no-audit --no-fund

# Copiar archivos de Prisma
COPY prisma ./prisma

# Copiar código fuente
COPY src ./src

# Copiar el script de entrada
COPY docker-entrypoint.sh ./

# Hacer ejecutable el script de entrada
RUN chmod +x docker-entrypoint.sh

# Crear directorios necesarios
RUN mkdir -p uploads/certificados uploads/profiles uploads/reportes uploads/temp

# Cambiar permisos al usuario no privilegiado
RUN chown -R nodeuser:nodejs /app

# Cambiar a usuario no privilegiado
USER nodeuser

# Exponer puerto
EXPOSE 3000

# Usar el entrypoint personalizado
ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando por defecto
CMD ["npm", "start"]