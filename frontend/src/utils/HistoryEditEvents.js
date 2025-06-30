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

  /**
   * Registra un evento como editado recientemente
   * @param {string} eventoId - ID del evento editado
   * @returns {boolean} - Éxito de la operación
   */
  registrarEventoEditado(eventoId) {
    try {
      // Limpiar historial antes de agregar nuevo
      const eliminados = this.limpiarHistorial();
      console.log(
        "🧹 [HistoryEditEvents] Elementos eliminados en limpieza:",
        eliminados
      );

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

export default HistoryEditEvents;
