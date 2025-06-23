const cron = require("node-cron");
const {
  EventStatusManager,
  EventStatusNotifier,
} = require("../utils/eventStatus.utils");

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

/**
 * Servicio principal para gestión automática de estados de eventos
 * Patrón Singleton para garantizar una sola instancia
 */
class EventStatusService {
  constructor() {
    if (EventStatusService.instance) {
      return EventStatusService.instance;
    }

    this.cronJob = null;
    this.isActive = false;
    this.manager = new EventStatusManager();
    this.notifier = new EventStatusNotifier();

    EventStatusService.instance = this;
  }

  /**
   * Inicializa el servicio cron para actualización automática de estados
   * Usa variables de entorno para configuración flexible
   */
  inicializarServicio() {
    // Verificar si el servicio está habilitado
    const isEnabled = process.env.EVENT_STATUS_CRON_ENABLED === "true";
    if (!isEnabled) {
      conditionalLog("⚠️ EventStatusService deshabilitado por configuración");
      return;
    }

    if (this.isActive) {
      conditionalLog("⚠️ EventStatusService ya está activo");
      return;
    }

    conditionalLog("🚀 Iniciando EventStatusService...");

    // Obtener configuración desde variables de entorno
    const cronSchedule =
      process.env.EVENT_STATUS_CRON_SCHEDULE || "*/5 * * * *";
    const timezone = process.env.EVENT_STATUS_TIMEZONE || "America/Guayaquil";

    conditionalLog(`⚙️ Configuración cron: ${cronSchedule} (${timezone})`);

    // Ejecutar una vez al iniciar
    this.ejecutarActualizacionEstados();

    // Programar ejecución según configuración
    this.cronJob = cron.schedule(
      cronSchedule,
      async () => {
        await this.ejecutarActualizacionEstados();
      },
      {
        timezone: timezone,
      }
    );

    this.isActive = true;
    conditionalLog("✅ EventStatusService iniciado correctamente");
  }

  /**
   * Método principal ejecutado por el cron job
   * Coordina todas las actualizaciones de estado
   */
  async ejecutarActualizacionEstados() {
    try {
      conditionalLog("🔄 Iniciando actualización automática de estados...");

      // Medir tiempo de ejecución
      const startTime = Date.now();

      // Paso 1: Activar eventos que han llegado a su fecha de inicio
      const eventosActivados =
        await this.manager.actualizarEventosAActivoAsync();

      // Paso 2: Finalizar eventos que han llegado a su fecha de fin
      const eventosFinalizados =
        await this.manager.actualizarEventosAFinalizadoAsync();

      // Paso 3: Procesar inscripciones de eventos finalizados (cambiar a REPROBADO_TOTAL)
      const inscripcionesProcesadas =
        await this.manager.procesarInscripcionesEventosFinalizadosAsync(
          eventosFinalizados
        );

      // Paso 4: Enviar notificaciones de los cambios
      await this.enviarNotificaciones(
        eventosActivados,
        eventosFinalizados,
        inscripcionesProcesadas
      );

      // Calcular tiempo total de ejecución
      const executionTime = Date.now() - startTime;

      conditionalLog(
        `✅ Actualización automática completada en ${executionTime}ms`
      );
      conditionalLog(
        `📊 Resumen: ${eventosActivados.length} activados, ${eventosFinalizados.length} finalizados, ${inscripcionesProcesadas.length} inscripciones actualizadas`
      );
    } catch (error) {
      console.error("❌ Error en actualización automática de estados:", error);
      // No relanzar el error para evitar que se detenga el cron
    }
  }

  /**
   * Envía notificaciones de los cambios realizados
   */
  async enviarNotificaciones(
    eventosActivados,
    eventosFinalizados,
    inscripcionesProcesadas
  ) {
    try {
      // Notificar eventos activados
      if (eventosActivados.length > 0) {
        for (const evento of eventosActivados) {
          await this.notifier.notificarCambioEstadoEvento(evento, "ACTIVO");
        }
      }

      // Notificar eventos finalizados
      if (eventosFinalizados.length > 0) {
        for (const evento of eventosFinalizados) {
          await this.notifier.notificarCambioEstadoEvento(evento, "FINALIZADO");
        }
      }

      // Notificar cambios en inscripciones (solo si hay cambios)
      if (inscripcionesProcesadas.length > 0) {
        await this.notifier.notificarCambioMasivoInscripciones(
          inscripcionesProcesadas
        );
      }
    } catch (error) {
      console.error("❌ Error enviando notificaciones:", error);
    }
  }

  /**
   * Detiene el servicio (útil para testing y shutdown)
   */
  detenerServicio() {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    this.isActive = false;
    console.log("🛑 EventStatusService detenido");
  }

  /**
   * Getter para verificar si el servicio está activo
   */
  get estaActivo() {
    return this.isActive;
  }

  /**
   * Obtiene la configuración actual del servicio
   * Útil para debugging y monitoreo
   */
  obtenerConfiguracion() {
    return {
      habilitado: process.env.EVENT_STATUS_CRON_ENABLED === "true",
      cronSchedule: process.env.EVENT_STATUS_CRON_SCHEDULE || "*/5 * * * *",
      timezone: process.env.EVENT_STATUS_TIMEZONE || "America/Guayaquil",
      estaActivo: this.isActive,
      proximaEjecucion: this.cronJob
        ? this.cronJob.nextDate().toISOString()
        : null,
    };
  }
}

// Exportar instancia singleton
module.exports = new EventStatusService();
