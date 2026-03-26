const { prisma } = require("../config/db");
const socketService = require("../services/socket.service");
const { actualizarEstadoYSincronizarCupos } = require("./cupo.utils");

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
 * Validador para reglas de negocio de estados de eventos
 */
class EventStatusValidator {
  /**
   * Valida si un evento puede cambiar de estado
   */
  static validarCambioEstado(event, targetStatus) {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    switch (targetStatus) {
      case "ACTIVE":
        return (
          event.status === "INACTIVE" && now >= startDate && now < endDate
        );

      case "FINISHED":
        return event.status === "ACTIVE" && now >= endDate;

      default:
        return false;
    }
  }

  /**
   * Obtiene eventos candidatos para activación
   */
  static async obtenerEventosCandidatosActivacion() {
    const now = new Date();

    return prisma.event.findMany({
      where: {
        status: "INACTIVE",
        startDate: { lte: now },
        endDate: { gt: now },
      },
      include: {
        eventCareers: {
          include: {
            career: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene eventos candidatos para finalización
   */
  static async obtenerEventosCandidatosFinalizacion() {
    const now = new Date();

    return prisma.event.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: now },
      },
      include: {
        eventCareers: {
          include: {
            career: true,
          },
        },
      },
    });
  }
}

/**
 * Gestor principal de lógica de negocio para estados de eventos
 */
class EventStatusManager {
  /**
   * Actualiza eventos de INACTIVE a ACTIVE
   */
  async actualizarEventosAActivoAsync() {
    try {
      conditionalLog("🔄 Buscando eventos para activar...");

      const candidateEvents =
        await EventStatusValidator.obtenerEventosCandidatosActivacion();

      if (candidateEvents.length === 0) {
        conditionalLog("ℹ️ No hay eventos para activar en este momento");
        return [];
      }

      conditionalLog(
        `🔍 Encontrados ${candidateEvents.length} eventos candidatos para activar`
      );

      const eventsToActivate = candidateEvents.filter((event) =>
        EventStatusValidator.validarCambioEstado(event, "ACTIVE")
      );

      if (eventsToActivate.length === 0) {
        conditionalLog(
          "ℹ️ Ningún evento cumple las condiciones para ser activado"
        );
        return [];
      }

      const activatedEvents = [];

      for (const event of eventsToActivate) {
        try {
          const updatedEvent = await prisma.event.update({
            where: { id: event.id },
            data: { status: "ACTIVE" },
            include: {
              eventCareers: {
                include: {
                  career: true,
                },
              },
            },
          });

          activatedEvents.push(updatedEvent);
          conditionalLog(`✅ Evento activado: ${event.name} (ID: ${event.id})`);
        } catch (error) {
          console.error(`❌ Error al activar evento ${event.id}:`, error);
        }
      }

      return activatedEvents;
    } catch (error) {
      console.error("❌ Error en actualizarEventosAActivoAsync:", error);
      return [];
    }
  }

  /**
   * Actualiza eventos de ACTIVE a FINISHED
   */
  async actualizarEventosAFinalizadoAsync() {
    try {
      conditionalLog("🔄 Buscando eventos para finalizar...");

      const candidateEvents =
        await EventStatusValidator.obtenerEventosCandidatosFinalizacion();

      if (candidateEvents.length === 0) {
        conditionalLog("ℹ️ No hay eventos para finalizar en este momento");
        return [];
      }

      conditionalLog(
        `🔍 Encontrados ${candidateEvents.length} eventos candidatos para finalizar`
      );

      const eventsToFinish = candidateEvents.filter((event) =>
        EventStatusValidator.validarCambioEstado(event, "FINISHED")
      );

      if (eventsToFinish.length === 0) {
        conditionalLog(
          "ℹ️ Ningún evento cumple las condiciones para ser finalizado"
        );
        return [];
      }

      const finishedEvents = [];

      for (const event of eventsToFinish) {
        try {
          const updatedEvent = await prisma.event.update({
            where: { id: event.id },
            data: { status: "FINISHED" },
            include: {
              eventCareers: {
                include: {
                  career: true,
                },
              },
            },
          });

          finishedEvents.push(updatedEvent);
          conditionalLog(
            `✅ Evento finalizado: ${event.name} (ID: ${event.id})`
          );
        } catch (error) {
          console.error(`❌ Error al finalizar evento ${event.id}:`, error);
        }
      }

      return finishedEvents;
    } catch (error) {
      console.error("❌ Error en actualizarEventosAFinalizadoAsync:", error);
      return [];
    }
  }

  /**
   * Procesa inscripciones de eventos recién finalizados
   * Cambia ACCEPTED -> FAILED_TOTAL y PENDING -> REJECTED
   */
  async procesarInscripcionesEventosFinalizadosAsync(eventosFinalizados) {
    try {
      if (eventosFinalizados.length === 0) {
        conditionalLog(
          "ℹ️ No hay inscripciones para procesar (sin eventos finalizados)"
        );
        return [];
      }

      conditionalLog(
        `🔄 Procesando inscripciones de ${eventosFinalizados.length} eventos finalizados...`
      );

      const finishedEventIds = eventosFinalizados.map((event) => event.id);

      const acceptedRegistrations = await prisma.registration.findMany({
        where: {
          eventId: { in: finishedEventIds },
          status: "ACCEPTED",
        },
        include: {
          event: true,
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      const pendingRegistrations = await prisma.registration.findMany({
        where: {
          eventId: { in: finishedEventIds },
          status: "PENDING",
        },
        include: {
          event: true,
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      conditionalLog(
        `🔍 Encontradas ${acceptedRegistrations.length} inscripciones ACCEPTED para reprobación y ${pendingRegistrations.length} inscripciones PENDING para rechazo`
      );

      const processedRegistrations = [];

      for (const registration of acceptedRegistrations) {
        try {
          await actualizarEstadoYSincronizarCupos(
            registration.id,
            "FAILED_TOTAL",
            registration.tenantId
          );

          const updatedRegistration = await prisma.registration.findUnique({
            where: { id: registration.id },
            include: {
              event: true,
              account: {
                include: {
                  user: true,
                },
              },
            },
          });

          processedRegistrations.push(updatedRegistration);

          await prisma.registrationObservation.upsert({
            where: { registrationId: registration.id },
            update: {
              observation:
                "Reprobación automática al finalizar el evento sin registro de asistencia o aprobación",
              createdAt: new Date(),
            },
            create: {
              tenantId: registration.tenantId,
              registrationId: registration.id,
              observation:
                "Reprobación automática al finalizar el evento sin registro de asistencia o aprobación",
            },
          });

          conditionalLog(
            `✅ Inscripción de ${registration.account.user.firstName} ${registration.account.user.lastName} cambiada a FAILED_TOTAL`
          );
        } catch (error) {
          console.error(
            `❌ Error al procesar inscripción ${registration.id}:`,
            error
          );
        }
      }

      for (const registration of pendingRegistrations) {
        try {
          await actualizarEstadoYSincronizarCupos(
            registration.id,
            "REJECTED",
            registration.tenantId
          );

          const updatedRegistration = await prisma.registration.findUnique({
            where: { id: registration.id },
            include: {
              event: true,
              account: {
                include: {
                  user: true,
                },
              },
            },
          });

          processedRegistrations.push(updatedRegistration);

          await prisma.registrationObservation.upsert({
            where: { registrationId: registration.id },
            update: {
              observation:
                "Rechazo automático al finalizar el evento sin haber sido aceptada",
              createdAt: new Date(),
            },
            create: {
              tenantId: registration.tenantId,
              registrationId: registration.id,
              observation:
                "Rechazo automático al finalizar el evento sin haber sido aceptada",
            },
          });

          conditionalLog(
            `✅ Inscripción de ${registration.account.user.firstName} ${registration.account.user.lastName} cambiada a REJECTED`
          );
        } catch (error) {
          console.error(
            `❌ Error al procesar inscripción ${registration.id}:`,
            error
          );
        }
      }

      return processedRegistrations;
    } catch (error) {
      console.error(
        "❌ Error en procesarInscripcionesEventosFinalizadosAsync:",
        error
      );
      return [];
    }
  }
}

/**
 * Notificador para cambios de estado
 */
class EventStatusNotifier {
  /**
   * Notifica cambio de estado de evento vía socket
   */
  async notificarCambioEstadoEvento(event, notificationType) {
    try {
      // Mantiene campos legacy y nuevos para compatibilidad temporal del frontend.
      socketService.notifyEventChange("updated", {
        id: event.id,
        id_eve: event.id,
        eventName: event.name,
        nom_eve: event.name,
        eventStatus: event.status,
        est_eve: event.status,
        tenantId: event.tenantId,
        notificationType,
        timestamp: new Date(),
      });

      console.log(
        `🔔 Notificación enviada: cambio de estado de evento ${event.id} a ${event.status}`
      );
    } catch (error) {
      console.error(
        `❌ Error al notificar cambio de estado de evento ${event.id}:`,
        error
      );
    }
  }

  /**
   * Notifica cambios masivos de inscripciones
   */
  async notificarCambioMasivoInscripciones(inscripcionesProcesadas) {
    try {
      const groupedByEvent = inscripcionesProcesadas.reduce(
        (acc, registration) => {
          const eventId = registration.eventId;
          const status = registration.status;

          if (!acc[eventId]) {
            acc[eventId] = {
              FAILED_TOTAL: [],
              REJECTED: [],
            };
          }

          if (status === "FAILED_TOTAL") {
            acc[eventId].FAILED_TOTAL.push(registration);
          } else if (status === "REJECTED") {
            acc[eventId].REJECTED.push(registration);
          }

          return acc;
        },
        {}
      );

      for (const [eventId, states] of Object.entries(groupedByEvent)) {
        const failedRegistrations = states.FAILED_TOTAL;
        const rejectedRegistrations = states.REJECTED;

        if (failedRegistrations.length > 0) {
          const event = failedRegistrations[0].event;

          socketService.notifyRegistrationChange("bulk-status-change", {
            eventId,
            eventName: event.name,
            registrationsCount: failedRegistrations.length,
            newStatus: "FAILED_TOTAL",
            reason: "Finalización automática del evento",
            timestamp: new Date(),
          });

          console.log(
            `🔔 Notificación enviada: cambio masivo de ${failedRegistrations.length} inscripciones a FAILED_TOTAL para evento ${event.name}`
          );
        }

        if (rejectedRegistrations.length > 0) {
          const event = rejectedRegistrations[0].event;

          socketService.notifyRegistrationChange("bulk-status-change", {
            eventId,
            eventName: event.name,
            registrationsCount: rejectedRegistrations.length,
            newStatus: "REJECTED",
            reason: "Rechazo automático por finalización de evento",
            timestamp: new Date(),
          });

          console.log(
            `🔔 Notificación enviada: cambio masivo de ${rejectedRegistrations.length} inscripciones a REJECTED para evento ${event.name}`
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error al notificar cambios masivos de inscripciones:",
        error
      );
    }
  }
}

module.exports = {
  EventStatusManager,
  EventStatusValidator,
  EventStatusNotifier,
};
