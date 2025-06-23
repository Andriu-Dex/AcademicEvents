# 🚀 Guía Rápida de Despliegue - Academic Events

## ⚡ Despliegue en 3 Pasos

### 1️⃣ Configuración Inicial

```powershell
# Copiar variables de entorno
Copy-Item .env.example .env

# Generar JWT Secret seguro
.\generate-jwt-secret.ps1

# Editar configuración (OBLIGATORIO)
notepad .env
```

### 2️⃣ Despliegue

```powershell
# Un solo comando lo hace todo
.\deploy.ps1
```

### 3️⃣ Verificación

- **Frontend**: http://localhost
- **Backend**: http://localhost:3000/health
- **Logs**: `docker-compose logs -f`

## 🔧 Variables Críticas en .env

```bash
# Base de datos (CAMBIAR)
POSTGRES_PASSWORD=tu-password-segura-aqui

# Seguridad (GENERAR CON SCRIPT)
JWT_SECRET=jwt-generado-con-script

# Email (CONFIGURAR)
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion
```

## 🛠️ Comandos Útiles

```powershell
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Limpiar y empezar de nuevo
docker-compose down -v
docker system prune -f
.\deploy.ps1
```

## 🚨 Problemas Comunes

| Problema          | Solución                        |
| ----------------- | ------------------------------- |
| Puerto ocupado    | `netstat -ano \| findstr :3000` |
| BD no conecta     | `docker-compose logs postgres`  |
| Frontend no carga | `docker-compose build frontend` |
| Error de permisos | Verificar variables en `.env`   |

## 📋 Lista de Verificación

- [ ] ✅ Frontend carga (http://localhost)
- [ ] ✅ Backend responde (http://localhost:3000/health)
- [ ] ✅ Base de datos conecta
- [ ] ✅ Variables .env configuradas
- [ ] ✅ No hay errores en logs

---

📖 **Documentación completa**: Ver `DOCKER-README.md`
