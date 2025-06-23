# 🐳 Despliegue con Docker - Academic Events

Este proyecto incluye configuración completa de Docker para despliegue local.

## 📋 Prerrequisitos

1. **Docker Desktop** instalado y ejecutándose

   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Versión mínima: Docker 20.0+, Docker Compose 2.0+

2. **Git** para clonar el repositorio

3. **PowerShell** (viene preinstalado en Windows)

## 🚀 Despliegue Rápido

### ⚠️ IMPORTANTE - Configuración de Seguridad PRIMERO

**Antes del primer despliegue, DEBES configurar las variables de entorno:**

1. **Copia el archivo de ejemplo:**

   ```powershell
   Copy-Item .env.example .env
   ```

2. **Genera un JWT Secret seguro:**

   ```powershell
   .\generate-jwt-secret.ps1
   ```

3. **Edita el archivo .env con tus valores reales:**
   - Cambia `POSTGRES_PASSWORD` por una contraseña segura
   - Usa el JWT_SECRET generado en el paso anterior
   - Configura tus credenciales de email reales

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

## 🗄️ Configuración de Base de Datos

La base de datos PostgreSQL se configura automáticamente con:

- **Host**: localhost:5432
- **Database**: Configurado desde `.env` (por defecto: academic_events)
- **Usuario**: Configurado desde `.env` (por defecto: postgres)
- **Contraseña**: Configurada desde `.env` (DEBES cambiarla)

## 📁 Estructura de Servicios

```
academic-events/
├── postgres        # Base de datos PostgreSQL
├── backend         # API Node.js + Express + Prisma
└── frontend        # React + Vite + Nginx
```

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

# Verificar que el backend esté funcionando
curl http://localhost:3000
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

### **Paso 2: Configurar variables de entorno**

```powershell
# Copiar archivo de ejemplo
Copy-Item .env.example .env

# Generar JWT Secret seguro
.\generate-jwt-secret.ps1

# Editar archivo .env (abrir con tu editor favorito)
notepad .env
```

**Variables críticas que DEBES configurar:**

- `POSTGRES_PASSWORD`: Una contraseña segura para la base de datos
- `JWT_SECRET`: El generado por el script (64+ caracteres)
- `SMTP_USER`: Tu email real para envío de correos
- `SMTP_PASS`: Tu contraseña de aplicación de email

### **Paso 3: Despliegue automático**

```powershell
# Ejecutar script de despliegue (incluye validaciones de seguridad)
.\deploy.ps1
```

### **Paso 4: Verificación**

```powershell
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs en tiempo real (Ctrl+C para salir)
docker-compose logs -f

# Probar endpoints
# Frontend: http://localhost
# Backend: http://localhost:3000
# Health check: http://localhost:3000/health
```

### **Paso 5: Primer acceso**

1. Abre tu navegador en http://localhost
2. La aplicación debe cargar correctamente
3. Si hay un seed de datos, se ejecutará automáticamente
4. Verifica que puedes navegar por la aplicación

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
docker-compose restart backend

# 3. Si cambios en frontend:
docker-compose build frontend
docker-compose up -d frontend

# 4. Si cambios en base de datos/migraciones:
docker-compose exec backend npx prisma migrate deploy
```

### Para cambios en dependencias:

```powershell
# 1. Si agregaste nuevas dependencias npm:
docker-compose build --no-cache backend
docker-compose up -d backend

# 2. Si cambiaste el schema de Prisma:
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
# Reset de migraciones (¡CUIDADO! Borra datos)
docker-compose exec backend npx prisma migrate reset --force

# O aplicar migraciones manualmente
docker-compose exec backend npx prisma migrate deploy
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
