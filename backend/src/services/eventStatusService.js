const cron = require("node-cron");
const {
  EventStatusManager,
  EventStatusNotifier,
} = require("../utils/eventStatus.utils");

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
   * Ejecuta cada 5 minutos usando expresión cron
   */
  inicializarServicio() {
    if (this.isActive) {
      console.log("⚠️ EventStatusService ya está activo");
      return;
    }

    console.log("🚀 Iniciando EventStatusService...");

    // Ejecutar una vez al iniciar
    this.ejecutarActualizacionEstados();

    // Programar ejecución cada 5 minutos
    this.cronJob = cron.schedule(
      "*/5 * * * *",
      async () => {
        await this.ejecutarActualizacionEstados();
      },
      {
        timezone: "America/Guayaquil", // Ajustar según tu zona horaria
      }
    );

    this.isActive = true;
    console.log("✅ EventStatusService iniciado correctamente");
  }

  /**
   * Método principal ejecutado por el cron job
   * Coordina todas las actualizaciones de estado
   */
  async ejecutarActualizacionEstados() {
    try {
      console.log("🔄 Iniciando actualización automática de estados...");

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

      console.log(
        `✅ Actualización automática completada en ${executionTime}ms`
      );
      console.log(
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
}

// Exportar instancia singleton
module.exports = new EventStatusService();
