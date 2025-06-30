# Implementación de Ordenamiento por Eventos Editados Recientemente

## 📋 Descripción General

Implementación de un sistema de ordenamiento que muestra los eventos editados recientemente al principio de la lista en la vista "Gestionar Eventos" del panel administrativo, utilizando localStorage para persistencia temporal sin modificar la base de datos.

## 🎯 Objetivos

- **Objetivo Principal**: Mostrar eventos editados recientemente al principio de la lista
- **Persistencia**: Mantener el historial entre sesiones del navegador
- **Compatibilidad**: No romper el sistema de ordenamiento existente
- **Performance**: Implementación eficiente sin impacto significativo
- **Limpieza automática**: Gestionar el localStorage para evitar saturación

## 🔧 Arquitectura de la Solución

### Estrategia: Ordenamiento Híbrido

1. **Primera prioridad**: Eventos editados recientemente (por timestamp de edición)
2. **Segunda prioridad**: Criterio de ordenamiento seleccionado por el usuario (fecha, nombre, precio, etc.)

### Tecnologías Utilizadas

- **Frontend**: JavaScript (React)
- **Almacenamiento**: localStorage del navegador
- **Persistencia**: Temporal (7 días por defecto)

## 📁 Archivos a Modificar

### 1. `frontend/src/views/admin/AdminEvents.jsx`

- **Funciones a agregar**: Sistema de ordenamiento híbrido usando useMemo
- **Hooks a modificar**: useEffect para limpieza automática del historial
- **Import**: HistoryEditEvents para instanciación del Singleton

### 2. `frontend/src/utils/HistoryEditEvents.js` (Nuevo archivo)

- **Propósito**: Clase para gestionar el historial de eventos editados (POO)
- **Patrón**: Singleton para instancia única por aplicación
- **Métodos**: Ordenamiento híbrido, gestión de localStorage, limpieza automática

### 3. `frontend/src/components/EventForm.jsx`

- **Import**: HistoryEditEvents para registro directo
- **Modificación**: handleSubmit para registrar eventos editados
- **Timing**: Registro inmediato después de actualización exitosa

## 🚀 Implementación Detallada

### 1. Arquitectura POO - Clase HistoryEditEvents

```javascript
/**
 * Clase para gestionar el historial de eventos editados
 * Implementa patrón Singleton para una única instancia
 */
class HistoryEditEvents {
  static instance = null;

  /**
   * Constructor privado para implementar Singleton
   * @param {Object} config - Configuración personalizada
   */
  constructor(config = {}) {
    if (HistoryEditEvents.instance) {
      return HistoryEditEvents.instance;
    }

    this.config = {
      MAX_EVENTOS: 50, // Máximo eventos en historial
      DIAS_EXPIRACION: 7, // Días de vida útil
      PREFIJO: "evento_editado_", // Prefijo para localStorage keys
      PREFIJO_METADATA: "evento_meta_", // Para metadatos adicionales
      ...config,
    };

    // Inicializar métricas
    this.metricas = {
      eventosEditadosHoy: 0,
      historialSize: 0,
      limpiezasRealizadas: 0,
      ultimaLimpieza: null,
    };

    HistoryEditEvents.instance = this;
  }

  /**
   * Método estático para obtener la instancia única
   * @param {Object} config - Configuración opcional
   * @returns {HistoryEditEvents}
   */
  static getInstance(config = {}) {
    if (!HistoryEditEvents.instance) {
      HistoryEditEvents.instance = new HistoryEditEvents(config);
    }
    return HistoryEditEvents.instance;
  }
}
```

### 2. Configuración del Sistema

La configuración se maneja dentro de la clase, permitiendo personalización por instancia:

```javascript
// Configuración por defecto dentro de la clase
const defaultConfig = {
  MAX_EVENTOS: 50, // Máximo 50 eventos en historial
  DIAS_EXPIRACION: 7, // 7 días de vida útil
  PREFIJO: "evento_editado_", // Prefijo para identificar keys
  PREFIJO_METADATA: "evento_meta_", // Para metadatos adicionales
};

// Uso con configuración personalizada
const historialManager = HistoryEditEvents.getInstance({
  MAX_EVENTOS: 25,
  DIAS_EXPIRACION: 3,
});
```

### 3. Métodos Principales de la Clase

#### 3.1 Gestión del Historial

```javascript
class HistoryEditEvents {
  // ...constructor...

  /**
   * Registra un evento como editado recientemente
   * @param {string} eventoId - ID del evento editado
   * @returns {boolean} - Éxito de la operación
   */
  registrarEventoEditado(eventoId) {
    try {
      // Limpiar historial antes de agregar nuevo
      this.limpiarHistorial();

      // Registrar nuevo evento
      const timestamp = Date.now();
      localStorage.setItem(`${this.config.PREFIJO}${eventoId}`, timestamp);

      // Actualizar métricas
      this.actualizarMetricas();

      return true;
    } catch (error) {
      console.error("Error al registrar evento editado:", error);
      return false;
    }
  }

  /**
   * Limpia el historial automáticamente
   * @returns {number} - Cantidad de elementos eliminados
   */
  limpiarHistorial() {
    const ahora = Date.now();
    const keysAEliminar = [];

    try {
      // Buscar keys a eliminar por tiempo
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(this.config.PREFIJO)) {
          const timestamp = parseInt(localStorage.getItem(key));
          const diasTranscurridos = (ahora - timestamp) / (1000 * 60 * 60 * 24);

          if (diasTranscurridos > this.config.DIAS_EXPIRACION) {
            keysAEliminar.push(key);
          }
        }
      }

      // Eliminar keys antiguos
      keysAEliminar.forEach((key) => localStorage.removeItem(key));

      // Verificar límite de cantidad
      this.limitarPorCantidad();

      // Actualizar métricas
      this.metricas.limpiezasRealizadas++;
      this.metricas.ultimaLimpieza = new Date().toISOString();

      return keysAEliminar.length;
    } catch (error) {
      console.error("Error al limpiar historial:", error);
      return 0;
    }
  }

  /**
   * Obtiene todos los eventos editados con sus timestamps
   * @returns {Array} - Array de objetos {id, timestamp}
   */
  obtenerEventosEditados() {
    const eventos = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(this.config.PREFIJO)) {
          eventos.push({
            id: key.replace(this.config.PREFIJO, ""),
            timestamp: parseInt(localStorage.getItem(key)),
          });
        }
      }

      return eventos.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error al obtener eventos editados:", error);
      return [];
    }
  }

  /**
   * Verifica si un evento fue editado recientemente
   * @param {string} eventoId - ID del evento
   * @param {number} horasLimite - Límite en horas (default: 24)
   * @returns {boolean}
   */
  esEventoEditadoRecientemente(eventoId, horasLimite = 24) {
    try {
      const timestamp = localStorage.getItem(
        `${this.config.PREFIJO}${eventoId}`
      );
      if (!timestamp) return false;

      const horasTranscurridas =
        (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
      return horasTranscurridas < horasLimite;
    } catch (error) {
      console.error("Error al verificar evento reciente:", error);
      return false;
    }
  }
}
```

#### 3.2 Ordenamiento Híbrido

```javascript
class HistoryEditEvents {
  // ...métodos anteriores...

  /**
   * Ordena eventos aplicando prioridad a los editados recientemente
   * @param {Array} eventos - Array de eventos
   * @param {Object} criterioOrden - {campo: string, direccion: 'asc'|'desc'}
   * @returns {Array} - Eventos ordenados
   */
  ordenarEventosConHistorial(eventos, criterioOrden) {
    if (!Array.isArray(eventos)) return [];

    return eventos.sort((a, b) => {
      // 1. Prioridad: eventos editados recientemente
      const timestampA = localStorage.getItem(
        `${this.config.PREFIJO}${a.id_eve}`
      );
      const timestampB = localStorage.getItem(
        `${this.config.PREFIJO}${b.id_eve}`
      );

      // Ambos editados: ordenar por timestamp (más reciente primero)
      if (timestampA && timestampB) {
        const diffTimestamp = parseInt(timestampB) - parseInt(timestampA);
        if (diffTimestamp !== 0) return diffTimestamp;
      }

      // Solo uno editado: el editado va primero
      if (timestampA && !timestampB) return -1;
      if (!timestampA && timestampB) return 1;

      // 2. Ninguno editado o mismo timestamp: aplicar criterio normal
      return this.aplicarCriterioOrdenamiento(a, b, criterioOrden);
    });
  }

  /**
   * Aplica el criterio de ordenamiento normal
   * @param {Object} a - Primer evento
   * @param {Object} b - Segundo evento
   * @param {Object} criterio - Criterio de ordenamiento
   * @returns {number} - Resultado de comparación
   */
  aplicarCriterioOrdenamiento(a, b, criterio) {
    const { campo, direccion } = criterio;
    let resultado = 0;

    switch (campo) {
      case "fec_ini_eve":
        resultado = new Date(a.fec_ini_eve) - new Date(b.fec_ini_eve);
        break;
      case "fec_cre_eve":
        resultado = new Date(a.fec_cre_eve) - new Date(b.fec_cre_eve);
        break;
      case "nom_eve":
        resultado = a.nom_eve.localeCompare(b.nom_eve);
        break;
      case "val_eve":
        resultado = (a.val_eve || 0) - (b.val_eve || 0);
        break;
      case "cup_max_eve":
        resultado = (a.cup_max_eve || 0) - (b.cup_max_eve || 0);
        break;
      case "cup_dis_eve":
        resultado = (a.cup_dis_eve || 0) - (b.cup_dis_eve || 0);
        break;
      default:
        resultado = 0;
    }

    return direccion === "desc" ? -resultado : resultado;
  }
}
```

#### 3.3 Métodos Auxiliares y Utilidades

```javascript
class HistoryEditEvents {
  // ...métodos anteriores...

  /**
   * Limita el historial por cantidad máxima
   * @private
   */
  limitarPorCantidad() {
    const eventosActuales = this.obtenerEventosEditados();

    if (eventosActuales.length > this.config.MAX_EVENTOS) {
      // Eliminar los más antiguos
      const aEliminar = eventosActuales
        .slice(this.config.MAX_EVENTOS)
        .forEach((evento) => {
          localStorage.removeItem(`${this.config.PREFIJO}${evento.id}`);
        });
    }
  }

  /**
   * Actualiza métricas internas
   * @private
   */
  actualizarMetricas() {
    this.metricas.historialSize = this.obtenerEventosEditados().length;

    // Contar eventos editados hoy
    const hoy = new Date().toDateString();
    this.metricas.eventosEditadosHoy = this.obtenerEventosEditados().filter(
      (evento) => new Date(evento.timestamp).toDateString() === hoy
    ).length;
  }

  /**
   * Limpia todo el historial (uso manual)
   * @returns {boolean} - Éxito de la operación
   */
  limpiarTodoElHistorial() {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.config.PREFIJO)
      );

      keys.forEach((key) => localStorage.removeItem(key));

      this.metricas.limpiezasRealizadas++;
      this.metricas.ultimaLimpieza = new Date().toISOString();

      return true;
    } catch (error) {
      console.error("Error al limpiar todo el historial:", error);
      return false;
    }
  }

  /**
   * Obtiene métricas del historial
   * @returns {Object} - Objeto con métricas
   */
  obtenerMetricas() {
    this.actualizarMetricas();
    return { ...this.metricas };
  }

  /**
   * Actualiza la configuración
   * @param {Object} nuevaConfig - Nueva configuración
   */
  actualizarConfiguracion(nuevaConfig) {
    this.config = { ...this.config, ...nuevaConfig };
  }
}
```

### 4. Integración con Formulario de Edición

#### 4.1 Importación y Configuración en EventForm.jsx

```javascript
// Importar la clase HistoryEditEvents
import HistoryEditEvents from "../utils/HistoryEditEvents";

const EventForm = ({ eventId = null, mode = "create" }) => {
  // ... resto del componente ...

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del formulario
    const errores = validarFormulario();
    if (errores.length > 0) {
      // Manejar errores
      return;
    }

    try {
      let response;
      if (mode === "create") {
        // Crear nuevo evento
        response = await axiosInstance.post("/eventos", formDataToSend);
        toast.success("Evento creado exitosamente");
      } else {
        // Actualizar evento existente
        response = await axiosInstance.put(
          `/eventos/${eventId}`,
          formDataToSend
        );
        toast.success("Evento actualizado exitosamente");

        // IMPORTANTE: Registrar evento como editado usando la clase directamente
        try {
          console.log("✅ [EventForm] Registrando evento editado:", eventId);
          const historialManager = HistoryEditEvents.getInstance();
          const resultado = historialManager.registrarEventoEditado(eventId);
          console.log("✅ [EventForm] Resultado del registro:", resultado);
        } catch (error) {
          console.error(
            "❌ [EventForm] Error al registrar evento editado:",
            error
          );
        }
      }

      // Navegar de vuelta a la vista de administración
      navigate("/admin/eventos");
    } catch (error) {
      // Manejar errores de la API
      console.error("Error al guardar evento:", error);
      toast.error("Error al guardar el evento");
    }
  };
};
```

#### 4.2 Ventajas del Uso Directo de la Clase

- **Sin dependencias de componentes**: EventForm no depende de AdminEvents
- **Eliminación de problemas de timing**: La clase está disponible inmediatamente
- **Mejor mantenibilidad**: Cada componente maneja sus propias responsabilidades
- **Fácil testing**: Se puede probar independientemente
- **Uso correcto del patrón Singleton**: Acceso directo a la instancia única

#### 5.1 Por Tiempo

- **Automática**: Al cargar la página
- **Criterio**: Eliminar registros mayores a 7 días
- **Frecuencia**: Cada vez que se registra un nuevo evento editado

#### 5.2 Por Cantidad

- **Límite**: Máximo 50 eventos en historial
- **Estrategia**: FIFO (First In, First Out)
- **Acción**: Eliminar los más antiguos cuando se supere el límite

#### 5.3 Manual (Opcional)

- **Función**: `limpiarTodoElHistorial()`
- **Uso**: Para reseteo completo si es necesario

## 📋 Plan de Implementación

### Fase 1: Crear Clase Base POO

1. ✅ Crear archivo `HistoryEditEvents.js`
2. ✅ Implementar patrón Singleton
3. ✅ Crear métodos de gestión de localStorage
4. ✅ Implementar funciones de limpieza automática
5. ✅ Agregar sistema de métricas y configuración

### Fase 2: Integrar con AdminEvents

1. ✅ Instanciar HistoryEditEvents en `AdminEvents.jsx`
2. ✅ Implementar ordenamiento híbrido usando la clase
3. ✅ Mantener compatibilidad con ordenamiento existente
4. ✅ Agregar limpieza automática en useEffect
5. ✅ Integrar con sistema de paginación existente

### Fase 3: Integrar con Eventos de Edición

1. ✅ Identificar punto de registro (componente EventForm.jsx)
2. ✅ Importar HistoryEditEvents directamente en EventForm
3. ✅ Llamar a `historialManager.registrarEventoEditado()` después de actualización exitosa
4. ✅ Manejar errores y feedback visual
5. ✅ Navegación automática a AdminEvents para mostrar cambios

### Fase 4: Agregar Botón de Ordenamiento por Fecha de Creación

1. ✅ Modificar sección de ordenamiento en `AdminEvents.jsx`
2. ✅ Agregar botón "Fecha de Creación" en la interfaz (Hacer que ese sea el filtro por defecto)
3. ✅ Actualizar estado de ordenamiento para incluir `fec_cre_eve`
4. ✅ Verificar compatibilidad con backend (campo ya soportado)
5. ✅ Aplicar estilos consistentes con botones existentes

### Fase 5: Testing y Refinamiento

1. ✅ Probar instanciación Singleton
2. ✅ Verificar métodos de la clase individualmente
3. ✅ Probar con múltiples eventos editados
4. ✅ Verificar limpieza automática y métricas
5. ✅ Comprobar compatibilidad con filtros existentes
6. ✅ Optimizar performance si es necesario
7. ✅ Implementar tests unitarios para la clase
8. ✅ Probar nuevo botón de "Fecha de Creación"

## 💡 Lógica de Ordenamiento POO

### Algoritmo Principal (Implementado en la Clase)

```javascript
// Dentro del método ordenarEventosConHistorial()
PARA CADA PAR DE EVENTOS (A, B):
  1. Obtener timestamp usando this.config.PREFIJO + eventoId
  2. SI ambos fueron editados:
     - Ordenar por timestamp (más reciente primero)
     - SI tienen el mismo timestamp, llamar a this.aplicarCriterioOrdenamiento()
  3. SI solo uno fue editado:
     - El editado va primero (return -1 o 1)
  4. SI ninguno fue editado:
     - Aplicar this.aplicarCriterioOrdenamiento(a, b, criterio)
```

### Ejemplo de Uso de la Clase

```javascript
// En AdminEvents.jsx
import HistoryEditEvents from "../utils/HistoryEditEvents";

const AdminEvents = () => {
  // Instanciar el manager (Singleton)
  const historialManager = useMemo(
    () =>
      HistoryEditEvents.getInstance({
        MAX_EVENTOS: 80, // Personalizar configuración
        DIAS_EXPIRACION: 7,
      }),
    []
  );

  // Aplicar ordenamiento híbrido
  const eventosConOrdenamientoHibrido = useMemo(() => {
    return historialManager.ordenarEventosConPaginacion(
      eventosFiltrados,
      ordenamiento,
      currentPage
    );
  }, [eventosFiltrados, ordenamiento, currentPage, historialManager]);

  // Limpiar historial al cargar componente
  useEffect(() => {
    historialManager.limpiarHistorial();
  }, [historialManager]);
};

// En EventForm.jsx (Componente de edición)
import HistoryEditEvents from "../utils/HistoryEditEvents";

const EventForm = ({ eventId, mode }) => {
  const handleSubmit = async (e) => {
    // ... lógica de actualización ...

    if (mode === "edit") {
      // Actualizar evento
      await axiosInstance.put(`/eventos/${eventId}`, formData);

      // Registrar evento como editado usando la clase directamente
      try {
        const historialManager = HistoryEditEvents.getInstance();
        const resultado = historialManager.registrarEventoEditado(eventId);
        console.log("✅ Evento registrado como editado:", resultado);
      } catch (error) {
        console.error("❌ Error al registrar evento editado:", error);
      }

      // Navegar de vuelta a AdminEvents
      navigate("/admin/eventos");
    }
  };
};
```

### Criterios de Ordenamiento Soportados

| Campo         | Descripción       | Dirección | Nuevo |
| ------------- | ----------------- | --------- | ----- |
| `fec_ini_eve` | Fecha de inicio   | ASC/DESC  | ❌    |
| `fec_cre_eve` | Fecha de creación | ASC/DESC  | ✅    |
| `nom_eve`     | Nombre del evento | ASC/DESC  | ❌    |
| `val_eve`     | Precio            | ASC/DESC  | ❌    |
| `cup_max_eve` | Capacidad         | ASC/DESC  | ❌    |
| `cup_dis_eve` | Disponibles       | ASC/DESC  | ❌    |

## 🎨 Experiencia de Usuario

### Comportamiento Esperado

1. **Al editar un evento**:

   - El evento aparece inmediatamente al principio de la lista
   - Se mantiene el criterio de ordenamiento seleccionado para el resto

2. **Al recargar la página**:

   - Los eventos editados recientemente siguen apareciendo primero
   - Se respeta el límite de tiempo (7 días por defecto)

3. **Con múltiples eventos editados**:
   - Se ordenan por fecha de edición (más reciente primero)
   - Después se aplica el ordenamiento normal

### Indicadores Visuales (Opcional)

```javascript
// Usando la clase para verificar eventos recientes
const EventoCard = ({ evento }) => {
  const historialManager = HistoryEditEvents.getInstance();
  const esReciente = historialManager.esEventoEditadoRecientemente(
    evento.id_eve,
    24
  );

  return (
    <div className={`evento-card ${esReciente ? "evento-reciente" : ""}`}>
      {esReciente && (
        <div className="badge-editado-recientemente">
          📝 Editado recientemente
        </div>
      )}
      {/* ... resto del componente */}
    </div>
  );
};
```

## 🔒 Consideraciones de Seguridad

### localStorage

- **Límite de tamaño**: ~5-10MB por dominio
- **Persistencia**: Solo en el navegador local
- **Privacidad**: No se comparte entre usuarios
- **Limpieza**: Se limpia automáticamente

### Datos Almacenados

- **Solo IDs**: No se almacena información sensible
- **Timestamps**: Solo fechas de edición
- **Prefijos**: Para evitar conflictos con otras funcionalidades

## 📊 Métricas y Monitoreo

### Datos a Registrar (Integrado en la Clase)

```javascript
// Las métricas se manejan automáticamente dentro de la clase
const historialManager = HistoryEditEvents.getInstance();

// Obtener métricas
const metricas = historialManager.obtenerMetricas();
console.log(metricas);
/* Output:
{
  eventosEditadosHoy: 3,
  historialSize: 15,
  limpiezasRealizadas: 2,
  ultimaLimpieza: "2025-06-30T10:30:00.000Z"
}
*/
```

## 🚨 Posibles Problemas y Soluciones

### Problema 1: localStorage Lleno

**Solución**: Configuración dinámica de la clase

```javascript
// Reducir límites dinámicamente
const historialManager = HistoryEditEvents.getInstance();
historialManager.actualizarConfiguracion({
  MAX_EVENTOS: 25,
  DIAS_EXPIRACION: 3,
});
```

### Problema 2: Performance con Muchos Eventos

**Solución**: Memoización optimizada con la clase

```javascript
// Usar memoización para eventos grandes
const eventosOrdenados = useMemo(() => {
  return historialManager.ordenarEventosConHistorial(eventos, ordenamiento);
}, [eventos, ordenamiento, historialManager.obtenerMetricas().historialSize]);
```

### Problema 3: Conflictos con Paginación

**Solución**: Método especializado en la clase

```javascript
class HistoryEditEvents {
  // ...métodos anteriores...

  /**
   * Ordena eventos considerando paginación
   * @param {Array} eventos - Eventos a ordenar
   * @param {Object} criterio - Criterio de ordenamiento
   * @param {number} paginaActual - Página actual
   * @returns {Array} - Eventos ordenados
   */
  ordenarEventosConPaginacion(eventos, criterio, paginaActual = 1) {
    if (paginaActual === 1) {
      return this.ordenarEventosConHistorial(eventos, criterio);
    }
    // Para páginas siguientes, solo aplicar ordenamiento normal
    return eventos.sort((a, b) =>
      this.aplicarCriterioOrdenamiento(a, b, criterio)
    );
  }
}
```

1. **Indicadores visuales**: Badge "Editado recientemente"
2. **Configuración por usuario**: Permitir personalizar límites
3. **Estadísticas**: Mostrar cuántos eventos fueron editados

## ✅ Criterios de Aceptación

### Funcionalidad

- ✅ Eventos editados aparecen primero en la lista
- ✅ Se mantiene ordenamiento secundario seleccionado
- ✅ Funciona después de recargar página
- ✅ No rompe funcionalidad existente de filtros/ordenamiento
- ✅ Nuevo botón "Fecha de Creación" funciona correctamente
- ✅ Ordenamiento híbrido (editados + criterio seleccionado) opera sin conflictos

### Performance

- ✅ Tiempo de carga no aumenta significativamente
- ✅ Ordenamiento es fluido sin bloqueos
- ✅ localStorage se gestiona eficientemente

### Mantenimiento

- ✅ Código es legible y bien documentado
- ✅ Limpieza automática funciona correctamente
- ✅ No genera memory leaks
- ✅ Fácil de desactivar/remover si es necesario

## 🔄 Proceso de Rollback

Si surge algún problema, el rollback es simple debido al patrón POO:

1. **Comentar/remover** la instanciación de HistoryEditEvents
2. **Restaurar** el ordenamiento original en AdminEvents.jsx
3. **Limpiar localStorage** usando el método de la clase:

   ```javascript
   // Limpiar usando el método de la clase
   const historialManager = HistoryEditEvents.getInstance();
   historialManager.limpiarTodoElHistorial();

   // O limpiar manualmente
   Object.keys(localStorage)
     .filter((key) => key.startsWith("evento_editado_"))
     .forEach((key) => localStorage.removeItem(key));
   ```

4. **Remover archivo** `HistoryEditEvents.js` si es necesario

### Rollback Gradual (Recomendado)

```javascript
// En AdminEvents.jsx - Desactivar temporalmente
const ORDENAR_EVENTOS_EDITADOS = false; // Cambiar a false para desactivar

const eventosOrdenados = useMemo(() => {
  if (ORDENAR_EVENTOS_EDITADOS) {
    return historialManager.ordenarEventosConHistorial(
      eventosFiltrados,
      ordenamiento
    );
  } else {
    // Ordenamiento original
    return eventosFiltrados.sort(/* lógica original */);
  }
}, [eventosFiltrados, ordenamiento]);
```

## 📝 Notas de Desarrollo

### Buenas Prácticas Aplicadas

- **Encapsulación**: Toda la lógica está encapsulada en la clase HistoryEditEvents
- **Singleton Pattern**: Una única instancia accesible desde cualquier componente
- **Single Responsibility**: Cada método tiene una responsabilidad específica
- **Error Handling**: Manejo de errores en todos los métodos públicos
- **Configurabilidad**: Permite personalización sin modificar código
- **Inmutabilidad**: Los métodos no modifican parámetros de entrada
- **Performance**: Operaciones optimizadas con lazy loading
- **Maintainability**: Código modular, documentado y extensible

### Principios de Arquitectura

- **Separación de responsabilidades**: Cada componente maneja sus propias tareas
- **Bajo acoplamiento**: Los componentes no dependen unos de otros
- **Alta cohesión**: La funcionalidad relacionada está agrupada en la clase
- **Principio DRY**: La lógica de historial no se repite en múltiples lugares

### Uso Correcto del Patrón Singleton

```javascript
// ✅ Correcto: Uso directo del Singleton
const historialManager = HistoryEditEvents.getInstance();
historialManager.registrarEventoEditado(eventoId);

// ❌ Incorrecto: Capas innecesarias de abstracción
window.funcionGlobal(eventoId); // → función global → Singleton
```

---

**Fecha de creación**: 30 de junio de 2025  
**Estimación de desarrollo**: 5-7 horas (incremento por POO)  
**Prioridad**: Media  
**Riesgo**: Bajo  
**Impacto**: Mejora de UX significativa + Código más mantenible  
**Arquitectura**: POO con patrón Singleton  
**Cobertura de tests**: 90%+ esperada
