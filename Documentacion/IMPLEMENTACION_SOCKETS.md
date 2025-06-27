# Implementación de Socket.IO en AcademicEvents

## Descripción General

Se implementó un sistema de comunicación en tiempo real usando Socket.IO para mantener la vista Home sincronizada con los cambios que ocurren en el sistema. Esto permite que cualquier modificación (creación, actualización o eliminación de eventos, cambios en inscripciones y cupos) se refleje inmediatamente en todos los clientes conectados.

## Arquitectura Implementada

### 1. Backend - Servidor Socket.IO

#### Instalación de Dependencias

```bash
npm install socket.io
```

#### Modificaciones en `backend/src/app.js`

- **Importaciones añadidas:**

  - `http` para crear servidor HTTP
  - `{ Server }` de Socket.IO
  - `socketService` personalizado

- **Configuración del servidor:**

  ```javascript
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  ```

- **Inicialización del servicio:**
  ```javascript
  socketService.init(io);
  ```

#### Servicio Socket (`backend/src/services/socket.service.js`)

**Patrón de Diseño:** Singleton - una sola instancia del servicio en toda la aplicación.

**Funcionalidades principales:**

1. **Gestión de Conexiones:**

   - Manejo de conexiones/desconexiones de clientes
   - Almacenamiento de información de clientes conectados
   - Autenticación de usuarios en sockets

2. **Eventos de Notificación Específicos para Home:**

   - `evento-change-hm`: Cambios en eventos (creación, actualización, eliminación)
   - `inscripcion-change-hm`: Cambios en inscripciones
   - `cupos-change-hm`: Actualizaciones de cupos disponibles
   - `system-notification-hm`: Notificaciones generales del sistema

3. **Métodos principales:**
   ```javascript
   notifyEventChange(action, eventoData); // 'created', 'updated', 'deleted'
   notifyInscriptionChange(action, inscripcionData);
   notifyCuposChange(eventoId, cuposDisponibles);
   notifySystemUpdate(message, type);
   ```

#### Integración en Controladores

**Controlador de Eventos (`backend/src/controllers/evento.controller.js`):**

- Importación: `const socketService = require("../services/socket.service");`
- Notificaciones agregadas en:
  - `crearEvento()`: Notifica creación con `socketService.notifyEventChange('created', nuevoEvento)`
  - `actualizarEvento()`: Notifica actualización con `socketService.notifyEventChange('updated', eventoActualizado)`
  - `eliminarEvento()`: Notifica eliminación con `socketService.notifyEventChange('deleted', eventoEliminado)`

**Controlador de Inscripciones (`backend/src/controllers/inscripcion.controller.js`):**

- Importación: `const socketService = require("../services/socket.service");`
- Notificaciones agregadas en:
  - `crearInscripcion()`: Notifica nueva inscripción
  - `validarInscripcion()`: Notifica cambios de estado y actualización de cupos

### 2. Frontend - Cliente Socket.IO

#### Instalación de Dependencias

```bash
npm install socket.io-client
```

#### Contexto Socket (`frontend/src/context/SocketContext.jsx`)

**Características:**

- Maneja la conexión con el servidor Socket.IO
- Proporciona el socket a toda la aplicación
- Configuración de reconexión automática
- Gestión del estado de conexión

```javascript
const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});
```

#### Hook Personalizado (`frontend/src/hooks/useHomeSocket.js`)

**Funcionalidades:**

- Hook específico para la vista Home
- Escucha eventos relacionados con:
  - Cambios en eventos
  - Cambios en inscripciones
  - Actualizaciones de cupos
  - Notificaciones del sistema

**Estados manejados:**

- `notifications`: Array de notificaciones en tiempo real
- `lastEventChange`: Último cambio en eventos
- `lastInscriptionChange`: Último cambio en inscripciones
- `lastCuposChange`: Última actualización de cupos

**Métodos:**

- `clearNotifications()`: Limpia las notificaciones
- `removeNotification(id)`: Elimina una notificación específica

#### Integración en Home (`frontend/src/views/Home.jsx`)

**Modificaciones realizadas:**

1. **Importación del hook:**

   ```javascript
   import { useHomeSocket } from "../hooks/useHomeSocket";
   ```

2. **Uso del hook en el componente:**

   ```javascript
   const {
     notifications,
     lastEventChange,
     lastInscriptionChange,
     lastCuposChange,
     clearNotifications,
     removeNotification,
   } = useHomeSocket();
   ```

3. **Componente de notificaciones en tiempo real:**
   - Muestra notificaciones tipo toast
   - Auto-eliminación después de 5 segundos
   - Diferentes tipos de notificación (success, info, warning, error)
   - Identificadores únicos de clases CSS (`notification-container-hm`, `notification-hm`, etc.)

#### Estilos CSS (`frontend/src/views/Home.css`)

**Clases implementadas con identificadores únicos:**

- `.notification-container-hm`: Contenedor principal de notificaciones
- `.notification-hm`: Estilo base de notificación
- `.notification-success-hm`, `.notification-info-hm`, etc.: Variantes por tipo
- `.notification-enter-hm`, `.notification-exit-hm`: Animaciones de entrada y salida

**Características de diseño:**

- Posicionamiento fijo en esquina superior derecha
- Animaciones suaves de entrada/salida
- Colores diferenciados por tipo de notificación
- Diseño responsive

## Flujo de Datos

### 1. Cambio en el Backend

```
Acción del Usuario → Controlador → Base de Datos → Socket Service → Todos los Clientes
```

### 2. Recepción en Frontend

```
Socket Event → useHomeSocket → Estado Local → UI Update
```

## Eventos Implementados

### Backend → Frontend

| Evento                   | Descripción                | Datos Enviados                              |
| ------------------------ | -------------------------- | ------------------------------------------- |
| `evento-change-hm`       | Cambios en eventos         | `{ action, data, timestamp }`               |
| `inscripcion-change-hm`  | Cambios en inscripciones   | `{ action, data, timestamp }`               |
| `cupos-change-hm`        | Actualización de cupos     | `{ eventoId, cuposDisponibles, timestamp }` |
| `system-notification-hm` | Notificaciones del sistema | `{ message, type, timestamp }`              |

### Frontend → Backend

| Evento         | Descripción              | Datos Enviados     |
| -------------- | ------------------------ | ------------------ |
| `authenticate` | Autenticación de usuario | `{ userId, role }` |
| `join-room`    | Unirse a sala específica | `roomName`         |

## Buenas Prácticas Implementadas

### 1. Programación Orientada a Objetos

- **Encapsulación:** SocketService como clase con métodos privados y públicos
- **Singleton:** Una sola instancia del servicio
- **Separación de responsabilidades:** Cada método tiene una función específica

### 2. Identificadores Únicos de CSS

- Todas las clases CSS tienen sufijo `-hm` (Home)
- Evita conflictos con otros componentes
- Facilita el mantenimiento

### 3. Manejo de Errores

- Validación de conexión antes de emitir eventos
- Logs informativos en consola
- Reconexión automática en cliente

### 4. Performance

- Eventos específicos para evitar sobrecarga
- Auto-eliminación de notificaciones
- Gestión eficiente del estado

## Configuración de Entorno

### Variables de Entorno Requeridas

**Backend (.env):**

```
HOST=localhost
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**

```
VITE_BACKEND_URL=http://localhost:3000
```

## Casos de Uso Implementados

### 1. Creación de Evento

1. Admin crea evento en dashboard
2. Backend notifica: `evento-change-hm` con action `'created'`
3. Home recibe notificación y muestra toast de éxito
4. Vista se actualiza automáticamente

### 2. Inscripción de Usuario

1. Usuario se inscribe a evento
2. Backend actualiza cupos y notifica cambios
3. Home muestra cupos actualizados en tiempo real
4. Notificación de nueva inscripción

### 3. Validación de Inscripción

1. Admin acepta/rechaza inscripción
2. Backend actualiza estado y cupos
3. Home refleja cambios inmediatamente
4. Notificación del cambio de estado

## Escalabilidad Futura

### Salas (Rooms)

- Estructura preparada para implementar salas específicas
- Usuarios podrían unirse a salas de eventos específicos
- Notificaciones dirigidas por rol o evento

### Autenticación Avanzada

- Validación de tokens JWT en sockets
- Permisos específicos por tipo de usuario
- Middleware de autorización para eventos

### Eventos Adicionales

- Chat en tiempo real
- Notificaciones push
- Actualizaciones de perfil
- Estados de conexión de usuarios

## Pruebas y Depuración

### Logs Implementados

- Conexiones/desconexiones de clientes
- Eventos emitidos y recibidos
- Errores de conexión
- Estados de autenticación

### Herramientas de Depuración

- Console logs informativos
- Estados de conexión en DevTools
- Network tab para verificar conexiones WebSocket

## Conclusión

La implementación de Socket.IO proporciona una base sólida para actualizaciones en tiempo real en la vista Home. El sistema es escalable, mantenible y sigue las mejores prácticas de desarrollo. La arquitectura modular permite agregar fácilmente nuevas funcionalidades sin afectar el código existente.

### Beneficios Obtenidos

- **UX mejorada:** Actualizaciones inmediatas sin recarga
- **Consistencia:** Todos los usuarios ven la misma información
- **Escalabilidad:** Fácil extensión a otras vistas
- **Mantenibilidad:** Código modular y bien documentado
