# AcademicEvents - Sistema de Gestión de Eventos Académicos

**AcademicEvents** es una aplicación web completa desarrollada con Node.js, Express, React y PostgreSQL. Permite a la Facultad de Ingeniería en Sistemas, Electrónica e Industrial gestionar eventos académicos de manera eficiente, incluyendo inscripciones, emisión de certificados, control de cupos y estadísticas en tiempo real. Este proyecto fue desarrollado con fines académicos y profesionales, simulando un entorno de desarrollo real.

---

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
12. [Equipo de Desarrollo](#equipo-de-desarrollo)
13. [Conclusión](#conclusión)
14. [Licencia](#licencia)
15. [Agradecimientos](#agradecimientos)

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

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Git

---

## Instalación

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
```

### Configuración del entorno

#### Backend
Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/academic_events"
DIRECT_URL="postgresql://usuario:contraseña@localhost:5432/academic_events"

# JWT
JWT_SECRET=tu_clave_secreta_super_segura

# Servidor
PORT=3000
HOST=localhost

# Email (opcional para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

#### Frontend
Crea un archivo `.env` en la carpeta `frontend/` basado en `Ejemplo.env.txt`:

```env
VITE_API_URL=http://localhost:3000
VITE_HOST=localhost
```

### Configuración de la base de datos

```powershell
# Desde el directorio backend
cd backend

# Ejecutar migraciones
npx prisma migrate dev

# Poblar la base de datos con datos iniciales
npx prisma db seed
```

**Nota importante**: Si usas Docker para el despliegue, las migraciones se deben ejecutar dentro del contenedor la primera vez. Ver la sección [Despliegue](#despliegue) para comandos específicos de Docker.

---

## Uso

```powershell
# Terminal 1: Iniciar el backend
cd backend
npm run dev

# Terminal 2: Iniciar el frontend
cd frontend
npm run dev
```

Accede a la aplicación desde:
[http://localhost:5173](http://localhost:5173)

### Acceso para Desarrollo en Red Local

Para permitir acceso desde otros dispositivos en la red local:

1. Obtén tu IP local:
   ```powershell
   ipconfig
   ```

2. Edita los archivos `.env`:
   - **Frontend:** Cambia `VITE_HOST` y `VITE_API_URL` por tu IP local
   - **Backend:** Cambia `HOST` por tu IP local

3. Accede desde otros dispositivos: `http://tu_ip_local:5173`

---

## API REST

### Eventos
| Método | Ruta                    | Descripción                        | Autenticación |
|--------|-------------------------|------------------------------------|---------------|
| GET    | /api/eventos           | Obtener eventos paginados          | No            |
| POST   | /api/eventos           | Crear nuevo evento                 | Sí (Admin)    |
| PUT    | /api/eventos/:id       | Actualizar evento                  | Sí (Admin)    |
| DELETE | /api/eventos/:id       | Eliminar evento                    | Sí (Admin)    |
| GET    | /api/eventos/:id/stats | Obtener estadísticas del evento    | Sí            |

### Inscripciones
| Método | Ruta                           | Descripción                     | Autenticación |
|--------|--------------------------------|---------------------------------|---------------|
| POST   | /api/inscripciones            | Inscribirse a un evento         | Sí            |
| GET    | /api/inscripciones/mis        | Obtener mis inscripciones       | Sí            |
| DELETE | /api/inscripciones/:id        | Cancelar inscripción            | Sí            |

### Autenticación
| Método | Ruta                | Descripción           | Autenticación |
|--------|---------------------|-----------------------|---------------|
| POST   | /api/auth/login     | Iniciar sesión        | No            |
| POST   | /api/auth/register  | Registrar usuario     | No            |
| POST   | /api/auth/refresh   | Refrescar token       | Sí            |

### Certificados
| Método | Ruta                                  | Descripción                    | Autenticación |
|--------|---------------------------------------|--------------------------------|---------------|
| GET    | /api/certificados/:eventoId          | Descargar certificado          | Sí            |
| POST   | /api/certificados/verificar          | Verificar certificado          | No            |

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

### Requisitos para Despliegue

- **Docker** y **Docker Compose** instalados y ejecutándose
- **Codificación UTF-8 con BOM** para máxima compatibilidad con los archivos de configuración
- Verificar que Docker Desktop esté iniciado antes de ejecutar los comandos

### Docker

El proyecto incluye configuración Docker completa para despliegue:

```powershell
# Script automatizado para despliegue completo
.\deploy.ps1

# Construcción y ejecución manual con Docker Compose
docker-compose up --build

# Para producción
docker-compose -f docker-compose.prod.yml up -d
```

### Gestión de Migraciones con Docker

#### Primera vez - Configuración inicial:

```powershell
# 1. Ejecutar el script de despliegue
.\deploy.ps1

# 2. Verificar estado de las migraciones
docker-compose exec backend npx prisma migrate status

# 3. Si es necesario, ejecutar migraciones
docker-compose exec backend npx prisma migrate dev --name agregar_cupos

# 4. Cargar datos iniciales del seed
docker-compose exec backend npm run seed
```

#### Comandos útiles para migraciones:

```powershell
# Estado de las migraciones
docker-compose exec backend npx prisma migrate status

# Forzar limpieza de la base de datos (¡CUIDADO: Borra todos los datos!)
docker-compose exec backend npx prisma migrate reset --force

# Crear nueva migración
docker-compose exec backend npx prisma migrate dev --name nombre_de_la_migracion

# Cargar datos iniciales del seed
docker-compose exec backend npm run seed

# Regenerar el cliente Prisma
docker-compose exec backend npx prisma generate
```

### Scripts de Despliegue

- `deploy.ps1`: Script automatizado para despliegue completo en Windows
- `check-vulnerabilities.ps1`: Análisis de seguridad
- `generate-jwt-secret.ps1`: Generación segura de claves JWT

### Notas Importantes

- **Codificación**: Asegúrate de que todos los archivos de configuración estén guardados con codificación UTF-8 con BOM
- **Docker**: Docker Desktop debe estar iniciado antes de ejecutar cualquier comando
- **Primera ejecución**: Las migraciones se deben ejecutar la primera vez después del despliegue
- **Datos de prueba**: El comando `npm run seed` carga datos iniciales para pruebas

---

## Equipo de Desarrollo

Este proyecto fue desarrollado por un equipo multidisciplinario de profesionales especializados en diferentes áreas del desarrollo de software:

### 👨‍💻 **Erick Aguilar** - *Desarrollador Senior*
- 📧 **Email:** [eaguilar4722@uta.edu.ec](mailto:eaguilar4722@uta.edu.ec)
- 📱 **Teléfono:** 0983297299
- 🎯 **Especialización:** Liderazgo técnico y arquitectura de soluciones

### 🔧 **Nixon Hurtado** - *Desarrollador Backend*
- 📧 **Email:** [nixon2000paul@gmail.com](mailto:nixon2000paul@gmail.com)
- 📱 **Teléfono:** 0961798049
- 🎯 **Especialización:** APIs REST, bases de datos y servicios del servidor

### 🏗️ **Gabriel Llerena** - *Arquitecto de Software*
- 📧 **Email:** [gabriel0llerena@gmail.com](mailto:gabriel0llerena@gmail.com)
- 📱 **Teléfono:** 0987482734
- 🎯 **Especialización:** Diseño de arquitectura y patrones de software

### 🔍 **Maybelline Navarro** - *Analista QA*
- 📧 **Email:** [mnavarro1337@uta.edu.ec](mailto:mnavarro1337@uta.edu.ec)
- 📱 **Teléfono:** 0998305361
- 🎯 **Especialización:** Testing, control de calidad y aseguramiento de software

### 🌐 **Steven Paredes** - *Desarrollador Full Stack*
- 📧 **Email:** [andriudex@gmail.com](mailto:andriudex@gmail.com)
- 📱 **Teléfono:** 0969008396
- 🎯 **Especialización:** Desarrollo frontend y backend, integración completa

### 💻 **Carlos Ramas** - *Desarrollador Frontend*
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
