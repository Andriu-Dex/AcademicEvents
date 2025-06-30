# Guía de Contribución

¡Gracias por tu interés en contribuir a **AcademicEvents - Sistema de Gestión de Eventos Académicos**! Este documento establece las directrices necesarias para colaborar en el proyecto de manera efectiva, clara y organizada.

---

## Índice

1. [Cómo Contribuir](#cómo-contribuir)
2. [Pautas de Contribución](#pautas-de-contribución)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Historial de Contribuciones y Problemas Resueltos](#historial-de-contribuciones-y-problemas-resueltos)
5. [Restricciones y Decisiones Técnicas](#restricciones-y-decisiones-técnicas)
6. [Reportar Problemas](#reportar-problemas)
7. [Código de Conducta](#código-de-conducta)
8. [Recursos Útiles](#recursos-útiles)
9. [Equipo del Proyecto](#equipo-del-proyecto)

---

## Cómo Contribuir

1. **Haz un fork del repositorio**
   [Fork el proyecto](https://github.com/Andriu-Dex/AcademicEvents) a tu cuenta personal de GitHub.

2. **Clona el repositorio**

   ```powershell
   git clone https://github.com/tu-usuario/AcademicEvents.git
   cd AcademicEvents
   ```

3. **Crea una nueva rama**
   Usa una convención descriptiva para nombrar ramas siguiendo **Git Flow**:

   ```powershell
   # Para nuevas funcionalidades
   git checkout -b feature/nueva-funcionalidad
   
   # Para correcciones de errores
   git checkout -b fix/corregir-error-inscripciones
   
   # Para correcciones urgentes
   git checkout -b hotfix/corregir-error-critico
   ```

4. **Haz los cambios necesarios**
   Asegúrate de seguir las convenciones de estilo, incluir comentarios claros y que tu código sea reutilizable y mantenible.

5. **Prueba tus cambios**
   - Valida que la funcionalidad siga operando correctamente
   - Ejecuta las migraciones de base de datos si es necesario
   - Verifica que los tests pasen (si existen)

6. **Haz commit y push**
   Sigue las convenciones de [Conventional Commits](https://www.conventionalcommits.org/):

   ```powershell
   git commit -m "feat: agregar validación de cupos en inscripciones"
   git commit -m "fix: corregir error de autenticación en certificados"
   git commit -m "docs: actualizar documentación de API REST"
   git push origin feature/nueva-funcionalidad
   ```

7. **Abre un Pull Request**
   Explica detalladamente qué has cambiado, por qué y si se relaciona con algún issue.

---

## Pautas de Contribución

### Estilo de Código

#### Backend (Node.js/Express)
- Usa **ESLint** con la configuración estándar del proyecto
- Sigue las convenciones de **Prisma ORM** para modelos de datos
- Implementa manejo de errores apropiado con try-catch
- Usa **async/await** en lugar de promesas encadenadas
- Documenta las funciones complejas con JSDoc

#### Frontend (React)
- Usa **ESLint + Prettier** para mantener consistencia
- Sigue las convenciones de **React Hooks**
- Utiliza **Tailwind CSS** para estilos
- Mantén los componentes pequeños y reutilizables
- Usa **TypeScript** cuando sea posible (en futuras migraciones)

### Documentación

- Toda nueva funcionalidad debe ir acompañada de comentarios claros
- Actualiza el README.md si introduces cambios significativos
- Documenta los nuevos endpoints de API en la sección correspondiente
- Incluye ejemplos de uso cuando sea apropiado

### Base de Datos

- Usa **Prisma** para todas las operaciones de base de datos
- Crea migraciones apropiadas para cambios en el esquema
- Incluye datos de prueba en el archivo `seed.js` si es necesario
- Mantén las consultas optimizadas y usa índices cuando sea apropiado

### Pruebas

- Verifica que el proyecto se ejecuta sin errores en desarrollo
- Prueba las nuevas rutas API usando herramientas como **Postman** o **Thunder Client**
- Valida que las funcionalidades del frontend funcionen correctamente
- Asegúrate de que las migraciones de base de datos se ejecuten sin problemas

---

## Estructura del Proyecto

El proyecto sigue una arquitectura moderna con separación clara entre frontend y backend:

```
AcademicEvents/
│
├── backend/                    # API con Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/        # Controladores de rutas
│   │   ├── middlewares/        # Middlewares (auth, validación, etc.)
│   │   ├── routes/             # Definición de rutas API
│   │   ├── services/           # Lógica de negocio
│   │   ├── utils/              # Utilidades y helpers
│   │   └── app.js              # Configuración principal
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   ├── migrations/         # Migraciones de PostgreSQL
│   │   └── seed.js             # Datos iniciales
│   └── uploads/                # Archivos subidos
│
├── frontend/                   # Aplicación React + Vite
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── views/              # Páginas principales
│   │   ├── services/           # Servicios API (Axios)
│   │   ├── context/            # Context API para estado global
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utilidades del frontend
│   └── public/                 # Archivos estáticos
│
├── Documentacion/              # Documentación técnica
├── docker-compose.yml          # Configuración Docker
└── deploy.ps1                  # Script de despliegue
```

---

## Historial de Contribuciones y Problemas Resueltos

Durante el desarrollo del proyecto **AcademicEvents** se han presentado diversos problemas técnicos que han sido resueltos de forma progresiva. A continuación, se detallan los incidentes más relevantes y las contribuciones asociadas:

### Correcciones y mejoras técnicas

- ✅ **Implementación de control de cupos en eventos**, añadiendo validaciones en tiempo real para evitar inscripciones cuando se alcanza el límite máximo de participantes.

- ✅ **Optimización de generación de certificados PDF**, mejorando el rendimiento y añadiendo diseños personalizados con fuentes y elementos gráficos profesionales.

- ✅ **Corrección de errores de autenticación JWT**, implementando middleware robusto para validar tokens y manejar expiración automática de sesiones.

- ✅ **Implementación de notificaciones en tiempo real**, usando Socket.io para informar sobre inscripciones, cambios de estado de eventos y recordatorios.

- ✅ **Resolución de problemas de migración de base de datos**, estableciendo un flujo consistente con Prisma para entornos de desarrollo y producción.

- ✅ **Mejora en la gestión de imágenes de perfil**, implementando validación de tipos de archivo, redimensionamiento automático y almacenamiento seguro.

- ✅ **Optimización de consultas a la base de datos**, añadiendo índices apropiados y relaciones eficientes entre modelos.

- ✅ **Implementación de paginación en listados**, mejorando el rendimiento de la aplicación al cargar grandes cantidades de eventos e inscripciones.

- ✅ **Corrección de problemas de CORS**, estableciendo configuración apropiada para desarrollo local y despliegue en producción.

- ✅ **Implementación de roles y permisos**, creando un sistema de autorización granular para estudiantes, coordinadores y administradores.

### Funcionalidades principales implementadas

- 🎯 **Sistema de inscripciones automáticas** con validación de cupos y prevención de duplicados
- 📊 **Panel administrativo** con estadísticas en tiempo real y reportes detallados
- 📜 **Generación automática de certificados** con códigos de verificación únicos
- 🔐 **Autenticación robusta** con JWT y roles diferenciados
- 📱 **Interfaz responsive** adaptada para dispositivos móviles y escritorio
- 🔍 **Motor de búsqueda avanzado** con filtros múltiples
- 📧 **Sistema de notificaciones** por email y push notifications

---

## Restricciones y Decisiones Técnicas

### Stack Tecnológico

- **Frontend**: React 19.1 con Vite como bundler para mejor rendimiento
- **Backend**: Node.js con Express.js para API REST
- **Base de Datos**: PostgreSQL con Prisma ORM para type-safety y migraciones
- **Autenticación**: JWT con bcryptjs para hash de contraseñas
- **Tiempo Real**: Socket.io para notificaciones instantáneas
- **Estilos**: Tailwind CSS para desarrollo rápido y consistente

### Convenciones de Desarrollo

- **Git Flow**: Modelo de ramificación obligatorio para mantener orden
- **Conventional Commits**: Formato estándar para mensajes de commit
- **ESLint + Prettier**: Herramientas de linting y formateo automático
- **Prisma**: Único ORM permitido para operaciones de base de datos
- **Docker**: Containerización para entornos de desarrollo y producción

### Limitaciones Técnicas

- Las imágenes de perfil están limitadas a 2MB máximo
- Los certificados se generan en formato PDF únicamente
- La autenticación JWT tiene una expiración de 7 días
- Los eventos no pueden ser eliminados si tienen inscripciones activas
- La base de datos debe usar PostgreSQL (no se admiten otras bases)

---

## Reportar Problemas

Antes de abrir un nuevo issue:

1. **Revisa los issues existentes** para evitar duplicados
2. **Verifica que has seguido la documentación** correctamente
3. **Si no existe, abre uno nuevo** incluyendo:

   - **Descripción detallada del problema**
   - **Pasos para reproducirlo**
   - **Comportamiento esperado vs. actual**
   - **Capturas de pantalla o logs relevantes**
   - **Información del entorno** (OS, versión de Node.js, etc.)

### Plantilla para Issues

```markdown
## Descripción del Problema
Descripción clara y concisa del problema.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Desplazarse hacia abajo hasta '...'
4. Ver error

## Comportamiento Esperado
Descripción clara de lo que esperabas que sucediera.

## Capturas de Pantalla
Si es aplicable, agrega capturas de pantalla.

## Información del Entorno
- OS: [ej. Windows 11]
- Node.js: [ej. v18.17.0]
- Navegador: [ej. Chrome 118]
```

---

## Código de Conducta

Este proyecto sigue el [Código de Conducta de Contributor Covenant](https://www.contributor-covenant.org/es/version/2/1/code_of_conduct/). Se espera respeto, inclusión y colaboración de todos los participantes.

### Comportamientos Esperados

- Usar lenguaje inclusivo y acogedor
- Ser respetuoso con diferentes puntos de vista
- Aceptar críticas constructivas
- Centrarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamientos Inaceptables

- Uso de lenguaje o imágenes sexualizadas
- Comentarios despectivos, insultos o ataques personales
- Acoso público o privado
- Publicar información privada de otros sin consentimiento
- Otras conductas consideradas inapropiadas

---

## Recursos Útiles

### Documentación General
- [Documentación de GitHub](https://docs.github.com/)
- [Guía para Pull Requests](https://opensource.guide/how-to-contribute/#opening-a-pull-request)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

### Tecnologías Específicas
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)

### Herramientas de Desarrollo
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [Docker](https://docs.docker.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

## Equipo del Proyecto

Este proyecto fue desarrollado por un equipo multidisciplinario:

### 👨‍💻 **Erick Aguilar** - *Desarrollador Senior*
- 📧 **Email:** [eaguilar4722@uta.edu.ec](mailto:eaguilar4722@uta.edu.ec)
- 🎯 **Rol:** Liderazgo técnico y arquitectura de soluciones

### 🔧 **Nixon Hurtado** - *Desarrollador Backend*
- 📧 **Email:** [nixon2000paul@gmail.com](mailto:nixon2000paul@gmail.com)
- 🎯 **Rol:** APIs REST, bases de datos y servicios del servidor

### 🏗️ **Gabriel Llerena** - *Arquitecto de Software*
- 📧 **Email:** [gabriel0llerena@gmail.com](mailto:gabriel0llerena@gmail.com)
- 🎯 **Rol:** Diseño de arquitectura y patrones de software

### 🔍 **Maybelline Navarro** - *Analista QA*
- 📧 **Email:** [mnavarro1337@uta.edu.ec](mailto:mnavarro1337@uta.edu.ec)
- 🎯 **Rol:** Testing, control de calidad y aseguramiento de software

### 🌐 **Steven Paredes** - *Desarrollador Full Stack*
- 📧 **Email:** [andriudex@gmail.com](mailto:andriudex@gmail.com)
- 🎯 **Rol:** Desarrollo frontend y backend, integración completa

### 💻 **Carlos Ramas** - *Desarrollador Frontend*
- 📧 **Email:** [cramos6303@uta.edu.ec](mailto:cramos6303@uta.edu.ec)
- 🎯 **Rol:** Interfaces de usuario, UX/UI y tecnologías del frontend

---

¡Gracias por contribuir a **AcademicEvents**! Juntos estamos construyendo una herramienta que facilita la gestión de eventos académicos para instituciones educativas. 🎓✨
