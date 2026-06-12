# AcademicEvents - Sistema de Gestión de Eventos Académicos

**AcademicEvents** es una aplicación web completa desarrollada con Node.js, Express, React y PostgreSQL. Permite a la Facultad de Ingeniería en Sistemas, Electrónica e Industrial gestionar eventos académicos de manera eficiente, incluyendo inscripciones, emisión de certificados, control de cupos y estadísticas en tiempo real. Este proyecto fue desarrollado con fines académicos y profesionales, simulando un entorno de desarrollo real.

---

## 🏷️ Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue.svg)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/Status-Complete-success.svg)](https://github.com/Andriu-Dex/AcademicEvents)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

![Image](https://i.imgur.com/u6stv4Y.png)

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Características Principales](#características-principales)
3. [Funcionalidades Detalladas](#funcionalidades-detalladas)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
6. [Requisitos Previos](#requisitos-previos)
7. [Instalación](#instalación)
8. [Uso](#uso)
9. [API REST](#api-rest)
10. [Despliegue](#despliegue)
11. [Control de Versiones y Contribución](#control-de-versiones-y-contribución)
12. [Changelog](#changelog)
13. [Equipo de Desarrollo](#equipo-de-desarrollo)
14. [Conclusión](#conclusión)
15. [Licencia](#licencia)
16. [Agradecimientos](#agradecimientos)

---

## Introducción

**AcademicEvents** nace como una solución integral para la gestión de eventos académicos universitarios. El objetivo principal es digitalizar y automatizar los procesos de creación de eventos, inscripciones, control de cupos, emisión de certificados y generación de estadísticas, todo en un entorno web moderno y responsivo que facilite tanto la administración como la participación estudiantil.

---

## Características Principales

- Sistema completo de autenticación y autorización con JWT.
- Gestión integral de eventos académicos con control de cupos.
- Inscripciones automatizadas con validaciones en tiempo real.
- Generación automática de certificados en PDF personalizados.
- Panel administrativo con estadísticas y reportes detallados.
- Notificaciones en tiempo real mediante WebSockets.
- Interfaz responsive adaptada para dispositivos móviles y escritorio.

---

## Funcionalidades Detalladas

- **Autenticación:** Sistema robusto de registro e inicio de sesión con roles diferenciados (estudiante, coordinador, administrador).
- **Gestión de Eventos:** CRUD completo de eventos con validaciones, control de fechas, cupos limitados y estados automáticos.
- **Inscripciones:** Sistema inteligente de inscripciones con validación de cupos, prevención de duplicados y confirmaciones automáticas.
- **Certificados:** Generación automática de certificados PDF personalizados con diseño profesional y códigos de verificación únicos.
- **Perfiles de Usuario:** Gestión completa de perfiles con carga de imagen, edición de datos personales y historial de eventos.
- **Panel Administrativo:** Estadísticas en tiempo real, reportes de inscripciones, gestión de usuarios y monitoreo del sistema.
- **Notificaciones:** Sistema de notificaciones push en tiempo real para inscripciones, recordatorios y actualizaciones.
- **Búsqueda y Filtrado:** Motor de búsqueda avanzado con filtros por categoría, fecha, estado y facultad.

---

## Tecnologías Utilizadas

- **Frontend:** React 19.1, Vite, Tailwind CSS, React Router DOM, Socket.io Client, Lucide React.
- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, Socket.io, JWT, Bcrypt.
- **Autenticación:** JSON Web Tokens (JWT), bcryptjs para hash de contraseñas.
- **Base de Datos:** PostgreSQL con Prisma como ORM, migraciones automáticas.
- **Generación de PDFs:** PDFKit, Canvas para certificados personalizados.
- **Carga de Archivos:** Multer para gestión de imágenes de perfil y eventos.
- **Tiempo Real:** Socket.io para notificaciones y actualizaciones instantáneas.
- **Otros:** Axios para peticiones HTTP, React Toastify para notificaciones, React DatePicker.

---

## Requisitos Previos

- Node.js (v18 o superior, recomendado v20)
- npm
- Git
- PostgreSQL (v12 o superior) si vas a trabajar sin Docker
- Docker Desktop + Docker Compose plugin v2 si vas a trabajar con contenedores

Verificación rápida (opcional):

```powershell
node -v
npm -v
docker --version
docker compose version
```

---

## Instalación

### Ruta recomendada para iniciar desde cero

- Si quieres levantar el proyecto rápido y con la menor fricción, usa el flujo Docker en la sección [Despliegue](#despliegue).
- Si vas a desarrollar con hot reload de backend/frontend y PostgreSQL local, sigue esta instalación local.

### 1) Clonar repositorio e instalar dependencias

```powershell
# Clonar el repositorio
git clone https://github.com/Andriu-Dex/AcademicEvents.git
cd AcademicEvents

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Volver a la raíz
cd ..
```

### 2) Configurar variables de entorno para LOCAL (sin Docker)

#### Backend

Crea `backend/.env` a partir de `backend/.Ejemploenv.txt`:

```powershell
Copy-Item backend/.Ejemploenv.txt backend/.env
```

Variables mínimas recomendadas en `backend/.env`:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/academicevents

# JWT
JWT_SECRET=tu_clave_secreta_super_segura

# Servidor
PORT=3000
HOST=localhost
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Email (Proveedores API HTTP o SMTP Legacy)
# Para Brevo (Recomendado para producción/Render - Sin dominio propio necesario):
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=tu_correo_verificado@gmail.com
BREVO_SENDER_NAME="AcademicEvents"

# Para Resend (Opcional - Requiere dominio verificado):
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="AcademicEvents <onboarding@resend.dev>"

# SMTP Legacy (Opcional - Nota: Render bloquea puertos SMTP por defecto):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_gmail

# Firebase Admin (obligatorio para notificaciones push)
FIREBASE_PROJECT_ID=tu_project_id_firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Si usas PostgreSQL local, asegúrate de que `DATABASE_URL` apunte a una base real existente.

#### Frontend

Crea `frontend/.env` a partir de `frontend/Ejemplo.env.txt`:

```powershell
Copy-Item frontend/Ejemplo.env.txt frontend/.env
```

Variables mínimas recomendadas en `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_HOST=localhost
VITE_PORT=5173

# Firebase Web SDK
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id_firebase
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_firebase_app_id
VITE_FIREBASE_VAPID_KEY=tu_web_push_public_vapid_key
```

#### Firebase: cómo obtener los datos (rápido y exacto)

1. Entra a [Firebase Console](https://console.firebase.google.com/) y selecciona tu proyecto.
2. Registra una app Web (`</>`). En el bloque `firebaseConfig` copia:
   - `apiKey` -> `VITE_FIREBASE_API_KEY`
   - `authDomain` -> `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` -> `VITE_FIREBASE_PROJECT_ID`
   - `storageBucket` -> `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` -> `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` -> `VITE_FIREBASE_APP_ID`
3. En **Project settings -> Cloud Messaging**, copia la **Public key** de Web Push y pégala en `VITE_FIREBASE_VAPID_KEY`.
4. En **Project settings -> Service accounts**, genera una clave privada JSON y guárdala como `backend/firebase-service-account.json`.
5. Configura en backend: `FIREBASE_PROJECT_ID` y `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`.

Notas:
- Reinicia frontend/backend después de cambiar variables de entorno.
- Mantén sincronizada la config pública entre `frontend/.env` y `frontend/public/firebase-messaging-sw.js`.
- No subas `firebase-service-account.json` al repositorio (archivo sensible).
- Para guía extendida: `frontend/Ejemplo.env.txt` y `Docs/05_NOTIFICACIONES_PUSH.md`.
- Si no configuras Firebase, la app puede funcionar sin push notifications.

### 3) Crear base de datos local (solo si trabajas sin Docker)

Si ya tienes una base creada y credenciales válidas en `DATABASE_URL`, puedes ir al paso 4.

Ejemplo con `psql`:

```powershell
# Ajusta usuario, contraseña y nombre de base a tu entorno
psql -U postgres -h localhost -p 5432 -c "CREATE USER academicevents_user WITH PASSWORD 'cambia_esta_clave';"
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE academicevents OWNER academicevents_user;"
```

Luego actualiza `backend/.env`:

```env
DATABASE_URL=postgresql://academicevents_user:cambia_esta_clave@localhost:5432/academicevents
```

### 4) Ejecutar Prisma y seed (obligatorio en primer arranque local)

```powershell
# Desde el directorio backend
cd backend

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar la base de datos con datos iniciales (seed completo)
npm run seed

# (Opcional) Ver estado de migraciones
npx prisma migrate status
```

Notas:
- Si cambias el `schema.prisma`, vuelve a ejecutar `npx prisma generate`.
- El `seed` del primer arranque es importante para crear datos base (incluyendo tenant por defecto).
- Para flujo Docker, mira la sección [Despliegue](#despliegue).

---

## Uso

### Desarrollo local (sin Docker)

```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Accesos locales:
- [http://localhost:5173](http://localhost:5173)
- [http://localhost:3000/health](http://localhost:3000/health)

Comandos útiles en local:

```powershell
# Backend
cd backend
npm run dev
npm run start
npm run seed
npx prisma migrate status
npx prisma migrate dev --name nombre_migracion
npx prisma generate

# Frontend
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

### Acceso para desarrollo en red local

Para permitir acceso desde otros dispositivos en la red local:

1. Obtén tu IP local:

   ```powershell
   ipconfig
   ```

2. Edita los archivos `.env`:

   - **Frontend:** Cambia `VITE_HOST` y `VITE_API_URL` por tu IP local
   - **Backend:** Cambia `HOST` por tu IP local

3. Accede desde otros dispositivos: `http://tu_ip_local:5173`

### Si prefieres Docker

Usa la sección [Despliegue](#despliegue). Es la opción más directa para una instalación desde cero.

---

## API REST

### Eventos

| Método | Ruta                   | Descripción                     | Autenticación |
| ------ | ---------------------- | ------------------------------- | ------------- |
| GET    | /api/eventos           | Obtener eventos paginados       | No            |
| POST   | /api/eventos           | Crear nuevo evento              | Sí (Admin)    |
| PUT    | /api/eventos/:id       | Actualizar evento               | Sí (Admin)    |
| DELETE | /api/eventos/:id       | Eliminar evento                 | Sí (Admin)    |
| GET    | /api/eventos/:id/stats | Obtener estadísticas del evento | Sí            |

### Inscripciones

| Método | Ruta                   | Descripción               | Autenticación |
| ------ | ---------------------- | ------------------------- | ------------- |
| POST   | /api/inscripciones     | Inscribirse a un evento   | Sí            |
| GET    | /api/inscripciones/mis | Obtener mis inscripciones | Sí            |
| DELETE | /api/inscripciones/:id | Cancelar inscripción      | Sí            |

### Autenticación

| Método | Ruta               | Descripción       | Autenticación |
| ------ | ------------------ | ----------------- | ------------- |
| POST   | /api/auth/login    | Iniciar sesión    | No            |
| POST   | /api/auth/register | Registrar usuario | No            |
| POST   | /api/auth/refresh  | Refrescar token   | Sí            |

### Certificados

| Método | Ruta                        | Descripción           | Autenticación |
| ------ | --------------------------- | --------------------- | ------------- |
| GET    | /api/certificados/:eventoId | Descargar certificado | Sí            |
| POST   | /api/certificados/verificar | Verificar certificado | No            |

---

## Control de Versiones y Contribución

Este proyecto utiliza **Git Flow** como modelo de ramificación:

- `main`: Producción estable
- `develop`: Desarrollo activo
- `feature/*`: Nuevas funcionalidades
- `hotfix/*`: Correcciones urgentes
- `release/*`: Preparación de versiones

### Cómo contribuir

1. Realiza un fork del repositorio
2. Crea una rama para tu funcionalidad:
   ```powershell
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. Abre un Pull Request con descripción detallada

### Estándares de código

- **Backend:** ESLint con configuración estándar
- **Frontend:** ESLint + Prettier para React
- **Commits:** Conventional Commits (feat, fix, docs, style, refactor, test, chore)

---

## Arquitectura del Proyecto

```
AcademicEvents/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── middlewares/     # Middlewares de autenticación y validación
│   │   ├── routes/          # Definición de rutas API
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades y helpers
│   │   └── app.js           # Configuración principal del servidor
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   ├── migrations/      # Migraciones de BD
│   │   └── seed.js          # Datos iniciales
│   └── uploads/             # Archivos subidos
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── views/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── context/         # Context API para estado global
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilidades del frontend
│   └── public/              # Archivos estáticos
└── Documentacion/           # Documentación técnica detallada
```

---

## Despliegue

### Requisitos para Docker

- Docker Desktop iniciado
- Docker Compose plugin v2 (`docker compose`)
- Archivo `.env` en la raíz del proyecto

### 1) Configuración inicial Docker

```powershell
# Desde la raíz del proyecto
Copy-Item .env.example .env
```

Edita `.env` y valida al menos:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_PORT` (recomendado `8080`)
- `PORT` (backend, recomendado `3000`)

Opcional para JWT seguro:

```powershell
.\generate-jwt-secret.ps1
```

### 2) Levantar servicios con Docker Compose

```powershell
# Build + up (recomendado)
docker compose --env-file .env up -d --build

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f
```

Accesos por defecto:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

### 3) Qué se ejecuta automáticamente en backend Docker

En cada arranque del contenedor backend:
1. `npx prisma generate`
2. `npx prisma migrate deploy`
3. Bootstrap mínimo multi-tenant (tenant + universidad + facultad por defecto)

### 4) Seed de datos completos (manual)

El seed completo **no** corre automáticamente. Ejecútalo cuando necesites datos de prueba:

```powershell
docker compose exec backend npm run seed
```

### 5) Comandos operativos útiles (Docker)

```powershell
# Logs por servicio
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Entrar al backend
docker compose exec backend sh

# Prisma dentro de contenedor
docker compose exec backend npx prisma migrate status
docker compose exec backend npx prisma migrate dev --name nombre_migracion
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma generate
docker compose exec backend npm run seed

# Reiniciar servicios
docker compose restart backend
docker compose restart frontend

# Reconstruir un servicio puntual
docker compose build --no-cache backend
docker compose up -d backend

# Detener stack
docker compose down

# Detener y borrar volumenes (resetea DB)
docker compose down -v
```

### 6) Flujo recomendado para DB Docker desde cero

```powershell
# 1) Levantar contenedores
docker compose --env-file .env up -d --build

# 2) Cargar seed completo
docker compose exec backend npm run seed

# 3) Verificar endpoints
docker compose ps
```

### 7) Solución de problemas comunes

- Error `P1000` (Prisma / autenticación PostgreSQL): suele indicar credenciales distintas entre `.env` y el volumen existente. Solución: alinear variables o resetear volúmenes con `docker compose down -v` y volver a levantar.
- Error `TENANT_HEADER_REQUIRED` o `TENANT_NOT_FOUND`: ejecuta `docker compose exec backend npm run seed` y reinicia backend (`docker compose restart backend`).
- `npm run dev` falla en local: revisa `backend/.env`, la conexión `DATABASE_URL`, y que ejecutaste `npx prisma migrate dev` + `npm run seed`.

### 8) Script automatizado opcional (Windows)

```powershell
.\deploy.ps1
```

Scripts relacionados:
- `deploy.ps1`: despliegue asistido en Windows
- `check-vulnerabilities.ps1`: análisis de seguridad
- `generate-jwt-secret.ps1`: generación de JWT seguro

---

## Changelog

Todas las versiones y cambios notables del proyecto están documentados en nuestro [CHANGELOG.md](CHANGELOG.md).

### Versión Actual: v1.0.0 ✨

#### ¿Qué hay de nuevo?

- ✅ Sistema completo de autenticación y autorización
- ✅ Gestión integral de eventos académicos
- ✅ Generación automática de certificados PDF
- ✅ Panel administrativo con estadísticas en tiempo real
- ✅ Notificaciones en tiempo real (Socket.io) y push web (Firebase Cloud Messaging)
- ✅ Interfaz responsive y moderna

#### Próximas versiones:

- 🔮 **v1.1.0**: Soporte multiidioma

Para ver el historial completo de cambios, consulta el [CHANGELOG.md](CHANGELOG.md).

---

## Equipo de Desarrollo

Este proyecto fue desarrollado por un equipo multidisciplinario de profesionales especializados en diferentes áreas del desarrollo de software:

### 👨‍💻 **Erick Aguilar** - _Desarrollador Senior_

- 📧 **Email:** [eaguilar4722@uta.edu.ec](mailto:eaguilar4722@uta.edu.ec)
- 📱 **Teléfono:** 0983297299
- 🎯 **Especialización:** Liderazgo técnico y arquitectura de soluciones

### 🔧 **Nixon Hurtado** - _Desarrollador Backend_

- 📧 **Email:** [nixon2000paul@gmail.com](mailto:nixon2000paul@gmail.com)
- 📱 **Teléfono:** 0961798049
- 🎯 **Especialización:** APIs REST, bases de datos y servicios del servidor

### 🏗️ **Gabriel Llerena** - _Arquitecto de Software_

- 📧 **Email:** [gabriel0llerena@gmail.com](mailto:gabriel0llerena@gmail.com)
- 📱 **Teléfono:** 0987482734
- 🎯 **Especialización:** Diseño de arquitectura y patrones de software

### 🔍 **Maybelline Navarro** - _Analista QA_

- 📧 **Email:** [mnavarro1337@uta.edu.ec](mailto:mnavarro1337@uta.edu.ec)
- 📱 **Teléfono:** 0998305361
- 🎯 **Especialización:** Testing, control de calidad y aseguramiento de software

### 🌐 **Steven Paredes** - _Desarrollador Full Stack_

- 📧 **Email:** [andriudex@gmail.com](mailto:andriudex@gmail.com)
- 📱 **Teléfono:** 0969008396
- 🎯 **Especialización:** Desarrollo frontend y backend, integración completa

### 💻 **Carlos Ramas** - _Desarrollador Frontend_

- 📧 **Email:** [cramos6303@uta.edu.ec](mailto:cramos6303@uta.edu.ec)
- 📱 **Teléfono:** 0967977374
- 🎯 **Especialización:** Interfaces de usuario, UX/UI y tecnologías del frontend

---

## Conclusión

AcademicEvents representa una solución completa y moderna para la gestión de eventos académicos universitarios. La combinación de tecnologías actuales, arquitectura escalable, funcionalidades robustas y una experiencia de usuario intuitiva hacen de este proyecto una base sólida para implementaciones reales en instituciones educativas.

El proyecto demuestra la aplicación práctica de conceptos avanzados como autenticación JWT, tiempo real con WebSockets, generación dinámica de PDFs, optimización de consultas con ORM, y desarrollo fullstack con las mejores prácticas de la industria.

---

## Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.

---

## Agradecimientos

Este proyecto fue desarrollado como parte del proceso de aprendizaje y aplicación de tecnologías modernas de desarrollo web. Agradecemos a la comunidad de desarrolladores que comparte conocimiento y mejores prácticas, así como a las tecnologías open source que hacen posible proyectos como este.

---
