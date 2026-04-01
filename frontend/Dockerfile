# ============================
# ETAPA 1: CONSTRUCCIÓN
# ============================
FROM node:20-alpine AS build

# Actualizar paquetes del sistema para parchar vulnerabilidades
RUN apk update && apk upgrade

# Instalar dependencias del sistema necesarias para algunas librerías de Node
RUN apk add --no-cache libc6-compat

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001

WORKDIR /app

# Cambiar ownership del directorio
RUN chown -R react:nodejs /app
USER react

# Copiar archivos de dependencias
COPY --chown=react:nodejs package*.json ./

# Instalar dependencias con cache optimizado
RUN npm ci --no-audit --no-fund --legacy-peer-deps

# Copiar código fuente
COPY --chown=react:nodejs . .

# Declarar ARGs que serán pasados como variables de entorno durante el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir la aplicación para producción
RUN npm run build

# ============================
# ETAPA 2: PRODUCCIÓN CON NGINX
# ============================
FROM nginx:1.27-alpine AS production

# Actualizar paquetes del sistema para parchar vulnerabilidades
RUN apk update && apk upgrade

# Crear usuario no-root para nginx
RUN addgroup -g 1001 -S nginx-group
RUN adduser -S nginx-user -u 1001 -G nginx-group

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar archivos construidos desde la etapa de build
COPY --from=build --chown=nginx-user:nginx-group /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY --chown=nginx-user:nginx-group nginx.conf /etc/nginx/nginx.conf

# Crear directorio para logs con permisos correctos
RUN mkdir -p /var/log/nginx && chown -R nginx-user:nginx-group /var/log/nginx

# Crear directorio para cache de nginx con permisos correctos
RUN mkdir -p /var/cache/nginx && chown -R nginx-user:nginx-group /var/cache/nginx

# Crear directorio para pid de nginx
RUN mkdir -p /tmp && chown -R nginx-user:nginx-group /tmp

# Exponer puerto 8080 (puerto no privilegiado)
EXPOSE 8080

# Configurar health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1

# Cambiar a usuario no-root
USER nginx-user

# Usar dumb-init y ejecutar nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
