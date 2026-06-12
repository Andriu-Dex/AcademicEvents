## Nombre del Proyecto

**AcademicEvents Pro – Plataforma Web y Móvil para Gestión de Eventos Académicos**

## Objetivo del Proyecto

Desarrollar una plataforma web y móvil que permita gestionar eventos académicos de manera integral, incluyendo creación de eventos, control de cupos, inscripciones, generación de certificados digitales y notificaciones en tiempo real, garantizando seguridad, accesibilidad y una experiencia de usuario optimizada.

**Integrantes:** Erick Aguilar, Steven Paredes, Maybelline Navarro, Gabriel Llerena.

## Funcionalidades del Proyecto (Web y Móvil)

### Aplicación Web

- Registro e inicio de sesión con roles (Estudiante, Coordinador, Administrador)
- Creación, edición y eliminación de eventos (CRUD)
- Control automático de cupos disponibles
- Gestión de inscripciones con validaciones
- Panel administrativo con estadísticas en tiempo real
- Generación y descarga de certificados en PDF
- Búsqueda avanzada y filtrado de eventos
- Gestión de usuarios
- Panel de reportes y monitoreo del sistema

### Aplicación Móvil (Versión adaptada / Cliente móvil)

- Registro e inicio de sesión
- Visualización de eventos disponibles
- Inscripción rápida a eventos
- Visualización de mis inscripciones
- Descarga de certificados
- Notificaciones push de recordatorios
- Perfil de usuario editable
- Alertas en tiempo real sobre cambios en eventos

(La aplicación móvil funciona como cliente optimizado para estudiantes.)

## Seguridad

- Autenticación mediante JSON Web Tokens (JWT)
- Encriptación de contraseñas con bcrypt
- Middleware de autorización basado en roles
- Protección de rutas privadas
- Validación de datos en frontend y backend
- Uso de ORM (Prisma) para prevenir inyecciones SQL
- Control de archivos subidos (Multer con validación de tipo y tamaño)
- Refresh tokens para sesiones seguras
- Manejo seguro de variables de entorno (.env)

## Usabilidad

- Interfaz responsive adaptable a distintos dispositivos
- Navegación intuitiva con menús claros y jerarquía visual definida
- Retroalimentación inmediata (notificaciones tipo toast)
- Paneles organizados por funciones (Eventos, Inscripciones, Reportes)
- Formularios con validaciones en tiempo real
- Búsqueda y filtros dinámicos para mejorar eficiencia
- Diseño limpio con Tailwind CSS

## Accesibilidad (mínimo 2 características implementadas)

1. **Modo Alto Contraste y Modo Oscuro**  
   Permite mejorar la legibilidad para usuarios con dificultades visuales.

2. **Compatibilidad con lectores de pantalla**  
   Implementación de atributos ARIA (aria-label, aria-describedby) y estructura semántica HTML adecuada.

3. **Navegación por teclado**  
   Soporte completo de tabulación con foco visible en todos los elementos interactivos.

4. **Escalabilidad de texto**  
   Uso de unidades relativas (rem/em) para permitir ajuste de tamaño desde el navegador.

## Módulos del Sistema

1. **Módulo de Autenticación**  
   - Registro  
   - Login  
   - Roles y permisos

2. **Módulo de Gestión de Eventos**  
   - CRUD de eventos  
   - Control de fechas y cupos  
   - Estados automáticos

3. **Módulo de Inscripciones**  
   - Registro a eventos  
   - Validación de duplicados  
   - Historial personal

4. **Módulo de Certificados**  
   - Generación automática en PDF  
   - Código único de verificación  
   - Descarga segura

5. **Módulo de Notificaciones**  
   - Notificaciones en tiempo real (WebSockets)  
   - Recordatorios automáticos

6. **Módulo de Reportes y Estadísticas**  
   - Eventos más populares  
   - Inscripciones por periodo  
   - Panel administrativo

7. **Módulo de Perfil de Usuario**  
   - Edición de datos  
   - Imagen de perfil  
   - Historial académico

## Herramientas a Utilizar

**Frontend Web**  
- React  
- Vite  
- Tailwind CSS  
- React Router DOM  
- Axios  
- React Toastify  

**Aplicación Móvil**  
- React Native con Expo  

**Backend**  
- Node.js  
- Express.js  
- Prisma ORM  
- PostgreSQL  

**Seguridad**  
- JSON Web Tokens (JWT)  
- bcryptjs  

**Tiempo Real**  
- Socket.io  

**Generación de Documentos**  
- PDFKit  
- Canvas  

**Control de Versiones**  
- Git + GitHub  

**Contenerización**  
- Docker y Docker Compose

---