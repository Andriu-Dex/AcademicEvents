## Nombre del Proyecto

AcademicEvents Pro - Plataforma Web y Cliente Móvil para Gestión de Eventos Académicos

## Objetivo del Proyecto

Desarrollar una plataforma centrada primero en la **versión web**, capaz de gestionar eventos académicos de manera integral, incluyendo creación y administración de eventos, control de cupos, inscripciones, generación de certificados digitales, notificaciones en tiempo real y accesibilidad sólida.  

La **app móvil** se abordará únicamente después de cerrar la versión web a nivel funcional y técnico.

**Integrantes:** Erick Aguilar, Steven Paredes, Maybelline Navarro, Gabriel Llerena.

---

## Estado Actual del Proyecto

### Versión Web
- Implementada y en etapa de cierre funcional
- Incluye panel administrativo, perfil de usuario, gestión de eventos, inscripciones, certificados, reportes, notificaciones y accesibilidad web
- Se considera la prioridad absoluta antes de iniciar desarrollo móvil

### Aplicación Móvil
- Planificada, no iniciada como fase de desarrollo principal
- Su alcance será una versión adaptada para estudiantes
- Solo comenzará cuando la versión web esté validada y estable

---

## Funcionalidades del Proyecto

### Aplicación Web
- Registro e inicio de sesión con roles
- Creación, edición y eliminación de eventos
- Control de fechas, estados y cupos disponibles
- Gestión de inscripciones con validaciones
- Panel administrativo con estadísticas y monitoreo
- Generación y descarga de certificados PDF
- Búsqueda, filtros y paginación
- Gestión de usuarios
- Perfil de usuario con imagen y documentos
- Notificaciones en tiempo real y push
- Reportes administrativos
- Configuración institucional dinámica

### Aplicación Móvil (Planificada)
- Inicio de sesión
- Visualización de eventos disponibles
- Inscripción a eventos
- Visualización de mis inscripciones
- Descarga o consulta de certificados
- Notificaciones push
- Perfil básico de usuario

---

## Seguridad

- Autenticación mediante JSON Web Tokens (JWT)
- Encriptación de contraseñas con bcrypt/bcryptjs
- Middleware de autorización basado en roles
- Protección de rutas privadas
- Validación de datos en frontend y backend
- Prisma ORM para acceso seguro a base de datos
- Control de archivos subidos con validación de tipo y tamaño
- Refresh tokens y tokens de cuenta
- Manejo seguro de variables de entorno
- Segmentación multi-tenant

---

## Usabilidad

- Interfaz responsive para escritorio y tablet
- Navegación clara con menús y jerarquía visual definida
- Retroalimentación inmediata con toast y estados visuales
- Formularios con validaciones y mensajes contextuales
- Paneles organizados por módulos
- Filtros, búsqueda y paginación para mejorar eficiencia
- Modo claro y oscuro
- Diseño basado en React, CSS personalizado, variables de tema y apoyo puntual de Bootstrap

---

## Accesibilidad Implementada

1. **Modo oscuro y soporte de alto contraste**
   Mejora la legibilidad y adapta colores de foco y componentes al tema activo.

2. **Compatibilidad con lectores de pantalla**
   Uso de estructura semántica, atributos ARIA, landmarks, labels y mensajes accesibles.

3. **Navegación completa por teclado**
   Soporte de tabulación, focus-visible, menús accesibles y modales con foco atrapado.

4. **Componentes interactivos accesibles**
   Diálogos con `Escape`, restauración de foco, nombres accesibles y paginación navegable con teclado.

---

## Módulos del Sistema

1. **Módulo de Autenticación**
   - Registro
   - Login
   - Roles y permisos
   - Verificación y recuperación de cuenta

2. **Módulo de Gestión de Eventos**
   - CRUD de eventos
   - Estados automáticos
   - Cupos disponibles
   - Asociación con carreras

3. **Módulo de Inscripciones**
   - Registro a eventos
   - Validación administrativa
   - Reenvío de comprobantes
   - Historial personal

4. **Módulo de Certificados**
   - Generación automática en PDF
   - Código único de verificación
   - Descarga segura

5. **Módulo de Notificaciones**
   - WebSockets
   - Notificaciones push
   - Alertas por cambios de estado

6. **Módulo de Reportes y Estadísticas**
   - Panel administrativo
   - Reportes por eventos, ingresos, inscripciones y certificados

7. **Módulo de Perfil de Usuario**
   - Edición de datos
   - Imagen de perfil
   - Documentos personales
   - Historial de inscripciones

8. **Módulo Institucional**
   - Datos de universidad
   - Autoridades
   - Facultades y carreras
   - Enlaces institucionales dinámicos

---

## Herramientas Utilizadas

### Frontend Web
- React
- Vite
- React Router DOM
- Axios
- React Toastify
- Lucide React
- Headless UI
- Bootstrap
- CSS personalizado y variables de tema

### Aplicación Móvil
- React Native con Expo (planificado)

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

### Seguridad
- JSON Web Tokens (JWT)
- bcrypt / bcryptjs

### Tiempo Real
- Socket.IO
- Firebase Cloud Messaging

### Generación de Documentos
- PDFKit
- pdf-lib
- Puppeteer

### Control de Versiones
- Git + GitHub

### Contenerización
- Docker y Docker Compose
