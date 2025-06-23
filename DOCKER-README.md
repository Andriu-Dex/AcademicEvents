# 🐳 Despliegue con Docker - Academic Events

Este proyecto incluye configuración completa de Docker para despliegue local.

## 📋 Prerrequisitos

1. **Docker Desktop** instalado y ejecutándose

   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Versión mínima: Docker 20.0+, Docker Compose 2.0+

2. **Git** para clonar el repositorio

3. **PowerShell** (viene preinstalado en Windows)

## 🚀 Despliegue Rápido

### ⚠️ IMPORTANTE - Configuración de Variables de Entorno PRIMERO

**Antes del primer despliegue, DEBES configurar las variables de entorno:**

1. **El archivo `.env` ya existe en el proyecto** con una configuración base funcional.

2. **Genera un JWT Secret seguro (recomendado para producción):**

   ```powershell
   .\generate-jwt-secret.ps1
   ```

3. **Configura las variables críticas en el archivo `.env`:**
   - `POSTGRES_PASSWORD`: Cambia por una contraseña segura para producción
   - `JWT_SECRET`: Usa el generado en el paso anterior (para producción)
   - `SMTP_USER` y `SMTP_PASS`: Configura con tus credenciales de email reales
   - `IMGUR_CLIENT_ID` y `IMGUR_CLIENT_SECRET`: Para subida de imágenes (opcional)

### Opción 1: Script Automático (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\deploy.ps1
```

### Opción 2: Comandos Manuales

```powershell
# 1. Construir imágenes
docker-compose build

# 2. Levantar servicios
docker-compose up -d

# 3. Ver logs (opcional)
docker-compose logs -f
```

## 🌐 Acceso a la Aplicación

Una vez desplegado, podrás acceder a:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Base de Datos**: localhost:5432

### 🔄 Características del Despliegue Actual

- **Frontend con Nginx**: Incluye proxy reverso que dirige las llamadas `/api/` al backend automáticamente
- **Backend con Prisma**: Configuración automática de migraciones y generación del cliente
- **Socket.IO**: Configurado para comunicación en tiempo real a través del proxy de nginx
- **Health Checks**: Todos los servicios incluyen verificaciones de salud
- **Seguridad**: Configuración de headers de seguridad en nginx y usuarios no-root en contenedores

## 🗄️ Configuración de Base de Datos

La base de datos PostgreSQL se configura automáticamente con:

- **Host**: localhost:5432
- **Database**: academicevents (configurado desde `.env`)
- **Usuario**: postgres (configurado desde `.env`)
- **Contraseña**: Configurada desde `.env` (por defecto: Andriu3Dex)

### 🔧 Migraciones Automáticas

El backend incluye un script de inicialización (`docker-entrypoint.sh`) que:

1. **Espera** a que PostgreSQL esté completamente listo
2. **Genera** el cliente de Prisma automáticamente
3. **Ejecuta** todas las migraciones pendientes
4. **Inicia** la aplicación Node.js

Esto significa que **no necesitas ejecutar comandos manuales** para configurar la base de datos.

## 📁 Estructura de Servicios

```
academic-events/
├── postgres        # Base de datos PostgreSQL 15-alpine
├── backend         # API Node.js + Express + Prisma + Socket.IO
└── frontend        # React + Vite servido por Nginx con proxy reverso
```

### 🔧 Características Técnicas

**Backend (Node.js 20-alpine):**

- Entrypoint personalizado para manejo automático de Prisma
- Usuario no-root para seguridad
- Health check en `/health`
- Socket.IO para comunicación en tiempo real
- Manejo automático de uploads y certificados

**Frontend (Nginx 1.27-alpine):**

- Proxy reverso para `/api/` hacia el backend
- Proxy para Socket.IO en `/socket.io/`
- Headers de seguridad configurados
- Compresión gzip habilitada
- Cache optimizado para archivos estáticos

**PostgreSQL (15-alpine):**

- Configuración de seguridad con scram-sha-256
- Health checks automáticos
- Datos persistentes en volumen Docker

## 🔧 Comandos Útiles

```powershell
# Ver estado de servicios
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v

# Reconstruir un servicio específico
docker-compose build backend
docker-compose up -d backend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d academic_events
```

## 🔄 Actualizaciones

Para aplicar cambios en el código:

```powershell
# 1. Detener servicios
docker-compose down

# 2. Reconstruir imágenes
docker-compose build

# 3. Levantar servicios
docker-compose up -d
```

## 🛠️ Troubleshooting

### Problema: Puerto ocupado

```powershell
# Verificar qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :80

# Cambiar puertos en docker-compose.yml si es necesario
```

### Problema: Base de datos no se conecta

```powershell
# Verificar logs de PostgreSQL
docker-compose logs postgres

# Reiniciar solo el servicio de base de datos
docker-compose restart postgres
```

### Problema: Frontend no carga

```powershell
# Verificar logs del frontend
docker-compose logs frontend

# Verificar que nginx esté funcionando y el proxy esté configurado
docker-compose exec frontend nginx -t

# Verificar conectividad con el backend desde el frontend
docker-compose exec frontend wget -qO- http://backend:3000/health
```

### Problema: API no responde desde el frontend

```powershell
# El frontend usa proxy reverso, las llamadas deben ser a:
# http://localhost/api/endpoint (NO http://localhost:3000/api/endpoint)

# Verificar configuración del proxy en nginx
docker-compose exec frontend cat /etc/nginx/nginx.conf | grep -A 10 "location /api"

# Verificar que el backend esté accesible desde el contenedor frontend
docker-compose exec frontend nc -z backend 3000
```

### Problema: Socket.IO no funciona

```powershell
# Verificar que el proxy de Socket.IO esté configurado
docker-compose exec frontend cat /etc/nginx/nginx.conf | grep -A 10 "location /socket.io"

# Verificar logs del backend para conexiones Socket.IO
docker-compose logs backend | grep -i socket
```

### ❌ Error: "ERESOLVE could not resolve" o conflictos de dependencias de React

```powershell
# Si ves errores como:
# "peer react@"^0.14.0 || ^16.0.0 || ^17.0.0 || ^18.0.0" from react-avatar-editor"
# Esto indica conflictos entre versiones de React

# Solución: El Dockerfile ya incluye --legacy-peer-deps para manejar esto
# Si necesitas reconstruir:
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Alternativamente, puedes actualizar dependencias manualmente:
docker-compose exec frontend npm update
```

### Limpiar todo y empezar de nuevo

```powershell
# ¡CUIDADO! Esto elimina todos los datos
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## 🔍 Verificación de Vulnerabilidades

### Script de verificación automática

```powershell
# Verificar vulnerabilidades en imágenes Docker
.\check-vulnerabilities.ps1
```

### Mantener imágenes actualizadas

```powershell
# Actualizar todas las imágenes base
docker pull node:20-alpine
docker pull nginx:1.27-alpine
docker pull postgres:15-alpine

# Reconstruir con imágenes actualizadas
docker-compose build --no-cache
```

### Herramientas adicionales de seguridad

- **Docker Scout**: Análisis de vulnerabilidades integrado
- **Trivy**: Scanner de vulnerabilidades open source
- **Snyk**: Plataforma de seguridad para contenedores

## 🔐 Configuración de Variables de Entorno y Seguridad

### 📁 Archivos de configuración:

- `.env` - Variables reales (NO subir a Git, ya está en .gitignore)
- `.env.example` - Plantilla de ejemplo (SÍ se puede subir a Git)

### 🔑 Variables importantes que DEBES cambiar:

```bash
# En tu archivo .env
POSTGRES_PASSWORD=una-contraseña-super-segura-123!
JWT_SECRET=genera-uno-unico-con-el-script-generate-jwt-secret.ps1
SMTP_USER=tu-email-real@gmail.com
SMTP_PASS=tu-password-de-aplicacion-real
```

### 🛡️ Mejores prácticas de seguridad:

1. **NUNCA** pongas credenciales reales en `docker-compose.yml`
2. **SIEMPRE** usa el archivo `.env` para valores sensibles
3. **GENERA** un JWT_SECRET único usando `.\generate-jwt-secret.ps1`
4. **CAMBIA** las contraseñas por defecto
5. **VERIFICA** que `.env` esté en `.gitignore`

**⚠️ IMPORTANTE**: Cambia el `JWT_SECRET` por algo más seguro en producción.

## 🔐 Configuración de Email

Para que las funciones de email funcionen, configura estas variables en tu archivo `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion
```

**📧 Para Gmail:**

1. Ve a tu cuenta de Google → Seguridad
2. Activa la verificación en dos pasos
3. Genera una "Contraseña de aplicación"
4. Usa esa contraseña en `SMTP_PASS`

## 🚀 Guía Completa de Despliegue

### **Paso 1: Preparación inicial**

```powershell
# Navegar al directorio del proyecto
cd "C:\ruta\a\tu\proyecto\AcademicEvents"

# Verificar que Docker esté ejecutándose
docker --version
docker-compose --version
```

### **Paso 2: Configurar variables de entorno (si es necesario)**

El proyecto ya incluye un archivo `.env` con configuración funcional. Para uso en desarrollo local, puedes usar la configuración actual.

**Para producción o personalización:**

```powershell
# Generar JWT Secret seguro (opcional, recomendado para producción)
.\generate-jwt-secret.ps1

# Editar archivo .env (abrir con tu editor favorito)
notepad .env
```

**Variables críticas que puedes personalizar:**

- `POSTGRES_PASSWORD`: Cambiar para mayor seguridad en producción
- `JWT_SECRET`: Usar el generado por el script para producción
- `SMTP_USER` y `SMTP_PASS`: Configurar para envío de emails reales
- `IMGUR_CLIENT_ID` y `IMGUR_CLIENT_SECRET`: Para subida de imágenes (opcional)

### **Paso 3: Despliegue automático**

```powershell
# Ejecutar script de despliegue (incluye validaciones de seguridad)
.\deploy.ps1
```

### **Paso 4: Verificación**

```powershell
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Deberías ver 3 servicios: postgres, backend, frontend (todos "healthy")
# Si el frontend aparece como "unhealthy", es normal al inicio - dale unos minutos

# Ver logs en tiempo real (Ctrl+C para salir)
docker-compose logs -f

# Probar endpoints
# Frontend: http://localhost
# Backend API: http://localhost:3000/health
# API a través del proxy: http://localhost/api/test (si existe)
```

### **Paso 5: Primer acceso y configuración**

1. **Abre tu navegador en http://localhost**
2. **La aplicación debe cargar correctamente**
3. **Configuración automática:**
   - Las migraciones de base de datos se ejecutan automáticamente
   - El super admin se crea automáticamente con las credenciales del `.env`
   - Los uploads y certificados se configuran automáticamente
4. **Verificar funcionalidades:**
   - Navegación por la aplicación
   - Registro/Login de usuarios
   - Creación de eventos (si tienes permisos)

### 🔐 Credenciales de Super Admin

Por defecto, se crea un super admin con:

- **Email**: admin@uta.edu.ec
- **Contraseña**: Admin12345
- **Cédula**: 9999999999

**⚠️ IMPORTANTE**: Cambia estas credenciales en producción editando las variables `SUPER_ADMIN_*` en el archivo `.env`.

## ⚡ Comandos de Desarrollo Rápido

### Comandos más usados durante desarrollo:

```powershell
# Ver logs en vivo
docker-compose logs -f backend

# Reiniciar solo el backend después de cambios
docker-compose restart backend

# Reconstruir y reiniciar un servicio específico
docker-compose build backend && docker-compose up -d backend

# Acceder al contenedor del backend
docker-compose exec backend sh

# Acceder a la base de datos
docker-compose exec postgres psql -U postgres -d academicevents

# Ver uso de recursos
docker stats
```

### Comandos para debugging:

```powershell
# Ver configuración de docker-compose
docker-compose config

# Ver imágenes construidas
docker images

# Ver volúmenes
docker volume ls

# Ver redes
docker network ls

# Limpiar recursos no utilizados
docker system prune
```

## 🔄 Flujo de Desarrollo Típico

### Para cambios en el código:

```powershell
# 1. Hacer cambios en el código

# 2. Si cambios en backend:
docker-compose build backend
docker-compose up -d backend

# 3. Si cambios en frontend:
docker-compose build frontend
docker-compose up -d frontend

# 4. Si cambios en base de datos/schema de Prisma:
docker-compose exec backend npx prisma migrate dev --name "nombre_descriptivo"
# O si solo necesitas regenerar el cliente:
docker-compose exec backend npx prisma generate
docker-compose restart backend

# NOTA: El docker-entrypoint.sh maneja automáticamente:
# - Generación del cliente Prisma
# - Ejecución de migraciones pendientes
# Por eso normalmente solo necesitas rebuild + restart
```

### Para cambios en dependencias:

```powershell
# 1. Si agregaste nuevas dependencias npm al backend:
# Edita package.json, luego:
docker-compose build --no-cache backend
docker-compose up -d backend

# 2. Si agregaste nuevas dependencias npm al frontend:
# Edita package.json, luego:
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Si cambiaste el schema de Prisma:
# El docker-entrypoint.sh maneja esto automáticamente al reiniciar el backend
docker-compose restart backend

# O manualmente:
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

## 🚨 Solución de Problemas Comunes

### ❌ Error: "puerto ya en uso"

```powershell
# Encontrar qué usa el puerto
netstat -ano | findstr :3000

# Cambiar puerto en .env si es necesario
# PORT=3001

# O detener el proceso que usa el puerto
# taskkill /PID [numero_proceso] /F
```

### ❌ Error: "Cannot connect to database"

```powershell
# Verificar que PostgreSQL esté funcionando
docker-compose logs postgres

# Reiniciar base de datos
docker-compose restart postgres

# Verificar variables de entorno
docker-compose exec backend printenv | grep DATABASE_URL
```

### ❌ Error: "Frontend no carga"

```powershell
# Verificar logs del frontend
docker-compose logs frontend

# Verificar que nginx esté funcionando
docker-compose exec frontend nginx -t

# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### ❌ Error: "Prisma migrations fail"

```powershell
# Verificar logs detallados del backend
docker-compose logs backend

# Verificar que la base de datos esté accesible
docker-compose exec backend npx prisma db pull

# Si hay problemas con migraciones, reset completo (¡CUIDADO! Borra datos)
docker-compose exec backend npx prisma migrate reset --force

# O aplicar migraciones manualmente
docker-compose exec backend npx prisma migrate deploy

# Regenerar cliente si es necesario
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### ❌ Error: "EADDRINUSE: puerto ya en uso"

```powershell
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :80
netstat -ano | findstr :3000

# Detener servicios Docker que puedan estar ejecutándose
docker-compose down

# Limpiar procesos Docker huérfanos
docker system prune -f

# Verificar que no haya otros contenedores ejecutándose
docker ps -a

# Reiniciar Docker Desktop si es necesario
```

### ❌ Error de dependencias de React

```powershell
# Si ves errores como:
# "peer react@"^0.14.0 || ^16.0.0 || ^17.0.0 || ^18.0.0" from react-avatar-editor"
# Esto indica conflictos entre versiones de React

# Solución: El Dockerfile ya incluye --legacy-peer-deps para manejar esto
# Si necesitas reconstruir:
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Alternativamente, puedes actualizar dependencias manualmente:
docker-compose exec frontend npm update
```

### ❌ Error de permisos en uploads

```powershell
# En el host, asegurar permisos de escritura
# (Solo en Linux/Mac, en Windows normalmente no es problema)
chmod -R 755 backend/uploads
```

## 🎯 Lista de Verificación Post-Despliegue

**✅ Verificaciones básicas:**

- [ ] Frontend carga en http://localhost
- [ ] Backend responde en http://localhost:3000/health
- [ ] Base de datos acepta conexiones
- [ ] No hay errores en logs

**✅ Verificaciones funcionales:**

- [ ] Puedes registrar un usuario
- [ ] Puedes iniciar sesión
- [ ] Se envían emails correctamente
- [ ] Puedes subir archivos
- [ ] Las rutas protegidas funcionan

**✅ Verificaciones de seguridad:**

- [ ] JWT_SECRET no es el valor por defecto
- [ ] POSTGRES_PASSWORD es segura
- [ ] Archivo .env no está en Git
- [ ] No hay credenciales en logs

## 📱 Primer Uso

1. Después del despliegue, ve a http://localhost
2. El sistema debe cargar la página principal
3. Si hay datos de prueba, se cargarán automáticamente
4. Puedes acceder al panel de administración si hay usuarios configurados

## 🌟 Resumen Ejecutivo

**Para desplegar rápidamente:**

```powershell
# 1. Configuración inicial (solo primera vez)
Copy-Item .env.example .env
.\generate-jwt-secret.ps1
notepad .env  # Configurar variables

# 2. Despliegue
.\deploy.ps1

# 3. Verificación
# Abrir http://localhost en el navegador
```

**URLs importantes:**

- 🌐 **Aplicación**: http://localhost
- 🔧 **API**: http://localhost:3000
- ❤️ **Health Check**: http://localhost:3000/health
- 🗄️ **Base de Datos**: localhost:5432

---

¿Necesitas ayuda? Revisa la sección de **🛠️ Troubleshooting** o los **🔄 Comandos Útiles** en esta documentación.

## ✨ Mejoras Implementadas en el Despliegue

### 🚀 Automatización Completa

**Backend con Entrypoint Inteligente:**

- El archivo `docker-entrypoint.sh` automatiza completamente la configuración de Prisma
- Espera automáticamente a que PostgreSQL esté listo antes de continuar
- Genera el cliente de Prisma automáticamente en cada inicio
- Ejecuta migraciones pendientes automáticamente
- No requiere comandos manuales después del despliegue

**Proxy Reverso Integrado:**

- Nginx configurado como proxy reverso para el backend
- Las llamadas del frontend van a `/api/` y se redirigen automáticamente al backend
- Socket.IO configurado para funcionar a través del proxy
- Eliminados problemas de CORS entre frontend y backend

### 🔒 Seguridad Mejorada

**Contenedores con Usuarios No-Root:**

- Todos los servicios ejecutan con usuarios no privilegiados
- Configuración de security_opt para mayor protección
- Headers de seguridad configurados en nginx (CSP, X-Frame-Options, etc.)

**Validaciones en el Script de Despliegue:**

- `deploy.ps1` incluye validaciones de seguridad antes del despliegue
- Verifica que las variables críticas no tengan valores por defecto
- Advierte sobre configuraciones inseguras
- Opción de generar JWT_SECRET automáticamente

### ⚡ Optimizaciones de Rendimiento

**Nginx Optimizado:**

- Compresión gzip habilitada
- Cache optimizado para archivos estáticos
- Configuración de timeouts apropiada
- Health checks en todos los servicios

**Docker Multi-Etapa:**

- Frontend construido en etapa separada para optimizar imagen final
- Imágenes Alpine para menor tamaño
- Límites de recursos configurados para cada servicio

### 🔧 Configuración Robusta

**Health Checks Configurados:**

- PostgreSQL: Verificación de disponibilidad de la base de datos
- Backend: Health check endpoint `/health`
- Frontend: Verificación de nginx y disponibilidad del sitio

**Variables de Entorno Organizadas:**

- Archivo `.env` incluido con configuración funcional por defecto
- Documentación clara de qué variables son críticas
- Configuración específica para desarrollo y producción

### 📊 Monitoreo y Debug

**Logs Estructurados:**

- Logs centralizados accesibles con `docker-compose logs`
- Configuración de logs de nginx para debug
- Logs de Socket.IO configurables via variables de entorno

**Comandos de Debug Incluidos:**

- Verificación de conectividad entre servicios
- Comandos para probar proxy reverso
- Herramientas de troubleshooting documentadas

## 🎯 Diferencias con la Configuración Anterior

### ✅ Antes vs. Ahora

**Antes:**

- Configuración manual de Prisma requerida
- Problemas frecuentes con CORS
- Configuración básica de nginx
- Variables de entorno complejas de configurar

**Ahora:**

- ✅ Configuración automática de Prisma
- ✅ Proxy reverso que elimina problemas de CORS
- ✅ Nginx optimizado con seguridad mejorada
- ✅ Variables de entorno pre-configuradas y funcionales
- ✅ Script de despliegue con validaciones
- ✅ Health checks en todos los servicios
- ✅ Documentación actualizada con troubleshooting

### 🎉 Resultado Final

**Un comando para desplegar todo:**

```powershell
.\deploy.ps1
```

**Sin configuración manual adicional requerida** - el proyecto funciona inmediatamente después del despliegue con la configuración incluida.
