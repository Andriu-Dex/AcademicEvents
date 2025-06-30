# 📋 Control de Logs del Sistema

## 🎯 **Descripción**

Se implementó un sistema de control de logs para múltiples servicios del sistema, permitiendo al desarrollador decidir cuándo ver o no los mensajes de logging de diferentes componentes.

## 🔧 **Servicios con Control de Logs**

### 1. **Sistema de Estados Automáticos**

### 2. **Sistema de Socket.IO**

### 3. **Sistema de Verificación de Cupos** _(NUEVO)_

### 4. **Sistema de Paginación de Eventos** _(NUEVO)_

## 🔧 **Implementación**

---

## 🤖 **1. SISTEMA DE ESTADOS AUTOMÁTICOS**

### **Variable de Entorno**

Se agregó la variable `EVENT_STATUS_LOGS_ENABLED` al archivo `.env`:

```bash
# Habilitar/deshabilitar logs del sistema de estados automáticos
EVENT_STATUS_LOGS_ENABLED=false  # true para mostrar, false para ocultar
```

### **Función Helper**

Se creó una función `conditionalLog()` que controla la visualización de logs:

```javascript
/**
 * Función helper para logs condicionales del sistema de estados automáticos
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} forceShow - Forzar mostrar el mensaje (para errores críticos)
 */
const conditionalLog = (message, forceShow = false) => {
  const logsEnabled = process.env.EVENT_STATUS_LOGS_ENABLED !== "false";
  if (logsEnabled || forceShow) {
    console.log(message);
  }
};
```

---

## 🔌 **2. SISTEMA DE SOCKET.IO**

### **Variable de Entorno**

Se agregó la variable `SOCKET_LOGS_ENABLED` al archivo `.env`:

```bash
# Configuración de logs de Socket.IO
# Habilitar/deshabilitar logs del sistema de sockets
SOCKET_LOGS_ENABLED=true  # true para mostrar, false para ocultar
```

### **Implementación en Clase**

Se modificó la clase `SocketService` para incluir control de logs:

```javascript
class SocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    // Configuración de logs desde variables de entorno
    this.logsEnabled = process.env.SOCKET_LOGS_ENABLED === "true";
  }

  /**
   * Método helper para logs condicionales de sockets
   * @param {string} message - Mensaje a loggear
   * @param {Object} data - Datos adicionales (opcional)
   */
  log(message, data = null) {
    if (!this.logsEnabled) return;

    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}
```

---

## ✅ **3. SISTEMA DE VERIFICACIÓN DE CUPOS** _(NUEVO)_

### **Variable de Entorno**

Se agregó la variable `CUPOS_VERIFICATION_LOGS_ENABLED` al archivo `.env`:

```bash
# Configuración de logs de Verificación de Cupos
# Habilitar/deshabilitar logs del sistema de verificación de cupos
CUPOS_VERIFICATION_LOGS_ENABLED=false  # true para mostrar, false para ocultar
```

### **Función Helper**

Se creó una función `conditionalCuposLog()` que controla la visualización de logs:

```javascript
/**
 * Función helper para logs condicionales del sistema de verificación de cupos
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} forceShow - Forzar mostrar el mensaje (para errores críticos)
 */
const conditionalCuposLog = (message, forceShow = false) => {
  const logsEnabled = process.env.CUPOS_VERIFICATION_LOGS_ENABLED === "true";
  if (logsEnabled || forceShow) {
    console.log(message);
  }
};
```

---

## 📊 **4. SISTEMA DE PAGINACIÓN DE EVENTOS** _(NUEVO)_

### **Variable de Entorno**

Se agregó la variable `EVENT_PAGINATION_LOGS_ENABLED` al archivo `.env`:

```bash
# Configuración de logs de Paginación de Eventos
# Habilitar/deshabilitar logs del sistema de paginación de eventos
EVENT_PAGINATION_LOGS_ENABLED=false  # true para mostrar, false para ocultar
```

### **Función Helper**

Se creó una función `conditionalPaginationLog()` que controla la visualización de logs:

```javascript
/**
 * Función helper para logs condicionales del sistema de paginación de eventos
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} forceShow - Forzar mostrar el mensaje (para errores críticos)
 */
const conditionalPaginationLog = (message, forceShow = false) => {
  const logsEnabled = process.env.EVENT_PAGINATION_LOGS_ENABLED === "true";
  if (logsEnabled || forceShow) {
    console.log(message);
  }
};
```

## 📁 **Archivos Modificados**

---

## 🤖 **SISTEMA DE ESTADOS AUTOMÁTICOS**

### 1. **`backend/src/services/eventStatusService.js`**

- ✅ Agregada función `conditionalLog()`
- ✅ Reemplazados todos los `console.log()` por `conditionalLog()`
- ✅ Logs del servicio principal ahora controlables

### 2. **`backend/src/utils/eventStatus.utils.js`**

- ✅ Agregada función `conditionalLog()`
- ✅ Reemplazados logs de:
  - Búsqueda de eventos para activar
  - Búsqueda de eventos para finalizar
  - Procesamiento de inscripciones
  - Activación/finalización individual de eventos
  - Cambios de estado de inscripciones

---

## 🔌 **SISTEMA DE SOCKET.IO**

### 3. **`backend/src/services/socket.service.js`**

- ✅ Agregada propiedad `this.logsEnabled` en constructor
- ✅ Agregado método `log()` helper
- ✅ Reemplazados todos los `console.log()` por `this.log()`
- ✅ Logs de conexiones, notificaciones y eventos ahora controlables

### 4. **`backend/src/controllers/evento.controller.js`** _(NUEVO)_

- ✅ Agregada función `conditionalCuposLog()`
- ✅ Reemplazados logs de verificación de cupos por `conditionalCuposLog()`
- ✅ Logs del sistema de verificación de cupos ahora controlables

### 5. **`backend/src/controllers/evento.paginacion.controller.js`** _(NUEVO)_

- ✅ Agregada función `conditionalPaginationLog()`
- ✅ Reemplazados logs de paginación de eventos por `conditionalPaginationLog()`
- ✅ Logs del sistema de paginación de eventos ahora controlables

### 6. **`backend/.env`**

- ✅ Agregada variable `EVENT_STATUS_LOGS_ENABLED=false`
- ✅ Agregada variable `SOCKET_LOGS_ENABLED=true`
- ✅ Agregada variable `CUPOS_VERIFICATION_LOGS_ENABLED=false` _(NUEVO)_
- ✅ Agregada variable `EVENT_PAGINATION_LOGS_ENABLED=false` _(NUEVO)_

## 🔄 **¿Qué logs se controlan?**

---

## 🤖 **SISTEMA DE ESTADOS AUTOMÁTICOS**

### **Logs que ahora son controlables:**

- `🔄 Iniciando actualización automática de estados...`
- `🔄 Buscando eventos para activar...`
- `ℹ️ No hay eventos para activar en este momento`
- `🔄 Buscando eventos para finalizar...`
- `ℹ️ No hay eventos para finalizar en este momento`
- `ℹ️ No hay inscripciones para procesar (sin eventos finalizados)`
- `✅ Actualización automática completada en Xms`
- `📊 Resumen: X activados, Y finalizados, Z inscripciones actualizadas`
- `🔍 Encontrados X eventos candidatos para activar/finalizar`
- `✅ Evento activado/finalizado: [nombre] (ID: X)`
- `✅ Inscripción de [usuario] cambiada a [estado]`

### **Logs que SIEMPRE se muestran:**

- `❌ Error en actualización automática de estados:`
- `❌ Error al activar/finalizar evento:`
- `❌ Error al procesar inscripción:`
- `❌ Error enviando notificaciones:`

---

## 🔌 **SISTEMA DE SOCKET.IO** _(NUEVO)_

### **Logs que ahora son controlables:**

- `✅ [SOCKET] Nuevo cliente conectado: [socket_id]`
- `❌ [SOCKET] Cliente desconectado: [socket_id]`
- `📊 [SOCKET] Total de clientes conectados: X`
- `🔐 [SOCKET] Usuario autenticado en socket: [userId] (Rol: [role])`
- `🏠 [SOCKET] Cliente [socket_id] se unió a la sala: [roomName]`
- `📡 [SOCKET] Enviando evento "[evento]" para acción "[acción]"`
- `✅ [SOCKET] [Tipo] notificado a X clientes`
- `📊 [SOCKET] Estadísticas de conexiones:`
- `⚠️ [SOCKET] Datos incompletos para [método]:`

### **Logs que SIEMPRE se muestran:**

- `❌ [SOCKET] No hay instancia de io disponible para [método]`
- Errores críticos del sistema de sockets

---

## ✅ **SISTEMA DE VERIFICACIÓN DE CUPOS** _(NUEVO)_

### **Logs que ahora son controlables:**

- `🔄 Iniciando verificación de cupos para todos los eventos`
- `Total de eventos encontrados: X`
- `Evento [nombre]:`
- `- Cupo máximo: X`
- `- Cupo disponible actual: X`
- `- Inscripciones ocupando cupo: X`
- `- Inscripciones en estado ACEPTADA: X`
- `- Cupo disponible correcto: X`
- Todos los logs detallados de verificación por evento

### **Logs que SIEMPRE se muestran:**

- `❌ Error al verificar/corregir cupos:`
- Errores críticos del sistema de verificación de cupos

---

## 📊 **SISTEMA DE PAGINACIÓN DE EVENTOS** _(NUEVO)_

### **Logs que ahora son controlables:**

- `📊 [EVENTOS USUARIO PAGINADOS] Información de usuario:`
- `  - Rol: [rol]`
- `  - Tiene carrera: [boolean]`
- `  - Carrera: [nombre] (ID: [id])`
- `📊 [EVENTOS USUARIO PAGINADOS] Filtros recibidos:`
- `  - search: "[texto]"`
- `  - gratuito: [boolean]`
- `  - pagado: [boolean]`
- `  - completo: [boolean]`
- `  - modalidad: "[modalidad]"`
- `  - finalizado: [boolean]`
- `  - cancelado: [boolean]`
- `  - suspendido: [boolean]`
- `📊 [EVENTOS USUARIO PAGINADOS] Reglas aplicadas:`
- `  - [descripción de reglas según rol]`
- `📊 [EVENTOS USUARIO PAGINADOS] Condición WHERE:`
- `[JSON de condición WHERE]`
- `📊 [EVENTOS USUARIO PAGINADOS] Resultados:`
- `  - Total eventos encontrados: X`
- `  - Eventos en esta página: X`
- `  - Eventos devueltos:`
- `    X. [nombre] (Tipo: [tipo]) [carreras/público]`

### **Logs que SIEMPRE se muestran:**

- `❌ Error al obtener eventos de usuario paginados:`
- Errores críticos del sistema de paginación

## 🚀 **Cómo usar**

---

## 🤖 **SISTEMA DE ESTADOS AUTOMÁTICOS**

### **Para OCULTAR los logs:**

```bash
# En archivo .env
EVENT_STATUS_LOGS_ENABLED=false
```

### **Para MOSTRAR los logs:**

```bash
# En archivo .env
EVENT_STATUS_LOGS_ENABLED=true
```

---

## 🔌 **SISTEMA DE SOCKET.IO**

### **Para OCULTAR los logs:**

```bash
# En archivo .env
SOCKET_LOGS_ENABLED=false
```

### **Para MOSTRAR los logs:**

```bash
# En archivo .env
SOCKET_LOGS_ENABLED=true
```

---

## ✅ **SISTEMA DE VERIFICACIÓN DE CUPOS** _(NUEVO)_

### **Para OCULTAR los logs:**

```bash
# En archivo .env
CUPOS_VERIFICATION_LOGS_ENABLED=false
```

### **Para MOSTRAR los logs:**

```bash
# En archivo .env
CUPOS_VERIFICATION_LOGS_ENABLED=true
```

---

## 📊 **SISTEMA DE PAGINACIÓN DE EVENTOS** _(NUEVO)_

### **Para OCULTAR los logs:**

```bash
# En archivo .env
EVENT_PAGINATION_LOGS_ENABLED=false
```

### **Para MOSTRAR los logs:**

```bash
# En archivo .env
EVENT_PAGINATION_LOGS_ENABLED=true
```

## ⚙️ **Configuración Actual**

En el archivo `.env` actual:

```bash
# Sistema de estados automáticos
EVENT_STATUS_CRON_ENABLED=false      # Cron DESHABILITADO
EVENT_STATUS_LOGS_ENABLED=false      # Logs DESHABILITADOS

# Sistema de Socket.IO
SOCKET_LOGS_ENABLED=true             # Logs HABILITADOS

# Sistema de Verificación de Cupos (NUEVO)
CUPOS_VERIFICATION_LOGS_ENABLED=false    # Logs DESHABILITADOS

# Sistema de Paginación de Eventos (NUEVO)
EVENT_PAGINATION_LOGS_ENABLED=false     # Logs DESHABILITADOS
```

## ⚠️ **Notas Importantes**

### **🤖 Estados Automáticos:**

1. **Los errores siempre se muestran** para no perder información crítica
2. **Es necesario reiniciar el servidor** para que los cambios en `.env` tomen efecto
3. **El sistema de cron está deshabilitado** (`EVENT_STATUS_CRON_ENABLED=false`)
4. **La configuración por defecto** es mostrar logs si no se especifica la variable

### **🔌 Socket.IO:**

1. **Los errores críticos siempre se muestran** para no perder información importante
2. **Es necesario reiniciar el servidor** para que los cambios en `.env` tomen efecto
3. **La configuración por defecto** es NO mostrar logs si no se especifica la variable
4. **Los logs son muy verbosos** - recomendado desactivar en producción

### **✅ Verificación de Cupos:**

1. **Los errores siempre se muestran** para no perder información crítica
2. **Es necesario reiniciar el servidor** para que los cambios en `.env` tomen efecto
3. **La configuración por defecto** es NO mostrar logs si no se especifica la variable
4. **Los logs son muy detallados** - incluyen información por cada evento verificado

### **📊 Paginación de Eventos:**

1. **Los errores críticos siempre se muestran** para no perder información importante
2. **Es necesario reiniciar el servidor** para que los cambios en `.env` tomen efecto
3. **La configuración por defecto** es NO mostrar logs si no se especifica la variable
4. **Los logs son extremadamente verbosos** - recomendado desactivar en producción
5. **Incluye información de filtros, reglas de negocio y resultados detallados**

## 🔍 **Testing**

### **🤖 Estados Automáticos:**

Para probar la funcionalidad:

1. **Habilitar el cron**: `EVENT_STATUS_CRON_ENABLED=true`
2. **Configurar logs**: `EVENT_STATUS_LOGS_ENABLED=true/false`
3. **Reiniciar servidor**
4. **Esperar 5 minutos** o ejecutar manualmente
5. **Observar** si aparecen o no los logs según configuración

### **🔌 Socket.IO:**

Para probar la funcionalidad:

1. **Configurar logs**: `SOCKET_LOGS_ENABLED=true/false`
2. **Reiniciar servidor**
3. **Abrir la aplicación** en el navegador
4. **Realizar acciones** que generen eventos de socket
5. **Observar** si aparecen o no los logs según configuración

#### **Acciones que generan logs de Socket.IO:**

- Conectar/desconectar clientes
- Crear/editar eventos
- Crear/validar inscripciones
- Cambios de estado en tiempo real

### **✅ Verificación de Cupos:**

Para probar la funcionalidad:

1. **Configurar logs**: `CUPOS_VERIFICATION_LOGS_ENABLED=true/false`
2. **Reiniciar servidor**
3. **Ejecutar endpoint**: `POST /api/eventos/verificar-cupos`
4. **Observar** si aparecen o no los logs según configuración

#### **Acciones que generan logs de Verificación de Cupos:**

- Ejecutar verificación manual de cupos
- Logs detallados por cada evento verificado
- Información de cupos máximos, disponibles y ocupados
- Datos de inscripciones por evento

### **📊 Paginación de Eventos:**

Para probar la funcionalidad:

1. **Configurar logs**: `EVENT_PAGINATION_LOGS_ENABLED=true/false`
2. **Reiniciar servidor**
3. **Realizar consultas paginadas** desde el frontend
4. **Observar** si aparecen o no los logs según configuración

#### **Acciones que generan logs de Paginación de Eventos:**

- Consultar eventos paginados (usuarios, públicos, admin)
- Aplicar filtros de búsqueda
- Cambiar páginas o límites de resultados
- Logs detallados de reglas de negocio aplicadas

## 📝 **Beneficios**

### **🤖 Estados Automáticos:**

- ✅ **Control granular** sobre la verbosidad del sistema
- ✅ **Desarrollo más limpio** sin ruido en consola
- ✅ **Debugging flexible** cuando se necesita
- ✅ **Errores siempre visibles** para monitoreo
- ✅ **Configuración simple** con una sola variable
- ✅ **No afecta funcionalidad** del sistema automático

### **🔌 Socket.IO:**

- ✅ **Mejor rendimiento** en producción sin logs verbosos
- ✅ **Debugging efectivo** en desarrollo
- ✅ **Control total** sobre logging de conexiones y eventos
- ✅ **Logs muy detallados** cuando se necesitan
- ✅ **Configuración instantánea** con reinicio de servidor
- ✅ **Consistencia** con otros sistemas de logs del proyecto

### **✅ Verificación de Cupos:**

- ✅ **Control granular** sobre logs de verificación de cupos
- ✅ **Información detallada** de cada evento verificado
- ✅ **Debugging efectivo** para problemas de cupos
- ✅ **Errores siempre visibles** para monitoreo
- ✅ **Configuración simple** con una sola variable
- ✅ **No afecta funcionalidad** del sistema de verificación

### **📊 Paginación de Eventos:**

- ✅ **Mejor rendimiento** en producción sin logs verbosos
- ✅ **Debugging completo** de reglas de negocio
- ✅ **Visibilidad total** de filtros y condiciones aplicadas
- ✅ **Logs muy detallados** para troubleshooting
- ✅ **Control de verbosidad** para diferentes entornos
- ✅ **Consistencia** con otros sistemas de logs del proyecto

## 🎯 **Casos de Uso Recomendados**

### **🔧 Desarrollo:**

```bash
EVENT_STATUS_LOGS_ENABLED=true       # Ver logs de estados automáticos
SOCKET_LOGS_ENABLED=true             # Ver logs detallados de sockets
CUPOS_VERIFICATION_LOGS_ENABLED=true # Ver logs de verificación de cupos
EVENT_PAGINATION_LOGS_ENABLED=true   # Ver logs de paginación de eventos
```

### **🧪 Testing:**

```bash
EVENT_STATUS_LOGS_ENABLED=false      # Menos ruido en testing
SOCKET_LOGS_ENABLED=false            # Menos ruido en testing
CUPOS_VERIFICATION_LOGS_ENABLED=false # Menos ruido en testing
EVENT_PAGINATION_LOGS_ENABLED=false  # Menos ruido en testing
```

### **🚀 Producción:**

```bash
EVENT_STATUS_LOGS_ENABLED=false      # Rendimiento optimizado
SOCKET_LOGS_ENABLED=false            # Rendimiento optimizado
CUPOS_VERIFICATION_LOGS_ENABLED=false # Rendimiento optimizado
EVENT_PAGINATION_LOGS_ENABLED=false  # Rendimiento optimizado
```

### **🐛 Debugging:**

```bash
EVENT_STATUS_LOGS_ENABLED=true       # Activar solo lo que necesitas debuggear
SOCKET_LOGS_ENABLED=true             # Activar solo lo que necesitas debuggear
CUPOS_VERIFICATION_LOGS_ENABLED=true # Activar solo lo que necesitas debuggear
EVENT_PAGINATION_LOGS_ENABLED=true   # Activar solo lo que necesitas debuggear
```
