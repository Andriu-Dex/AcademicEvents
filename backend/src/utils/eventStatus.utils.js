const prisma = require("../config/db");
const socketService = require("../services/socket.service");

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
 * Patrón Validator
 */
class EventStatusValidator {
  /**
   * Valida si un evento puede cambiar de estado
   */
  static validarCambioEstado(evento, estadoDestino) {
    const ahora = new Date();
    const fechaInicio = new Date(evento.fec_ini_eve);
    const fechaFin = new Date(evento.fec_fin_eve);

    switch (estadoDestino) {
      case "ACTIVO":
        // Para activar un evento:
        // 1. Debe estar en estado INACTIVO
        // 2. La fecha actual debe ser >= a la fecha de inicio
        // 3. La fecha actual debe ser < a la fecha de fin
        return (
          evento.est_eve === "INACTIVO" &&
          ahora >= fechaInicio &&
          ahora < fechaFin
        );

      case "FINALIZADO":
        // Para finalizar un evento:
        // 1. Debe estar en estado ACTIVO
        // 2. La fecha actual debe ser >= a la fecha de fin
        return evento.est_eve === "ACTIVO" && ahora >= fechaFin;

      default:
        return false;
    }
  }

  /**
   * Obtiene eventos candidatos para activación
   */
  static async obtenerEventosCandidatosActivacion() {
    const ahora = new Date();

    return await prisma.evento.findMany({
      where: {
        est_eve: "INACTIVO",
        fec_ini_eve: {
          lte: ahora, // Fecha de inicio menor o igual a ahora
        },
        fec_fin_eve: {
          gt: ahora, // Fecha de fin mayor a ahora
        },
      },
      include: {
        eventos_carrera: {
          include: {
            carrera: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene eventos candidatos para finalización
   */
  static async obtenerEventosCandidatosFinalizacion() {
    const ahora = new Date();

    return await prisma.evento.findMany({
      where: {
        est_eve: "ACTIVO",
        fec_fin_eve: {
          lte: ahora, // Fecha de fin menor o igual a ahora
        },
      },
      include: {
        eventos_carrera: {
          include: {
            carrera: true,
          },
        },
      },
    });
  }
}

/**
 * Gestor principal de lógica de negocio para estados de eventos
 * Patrón Strategy + Command
 */
class EventStatusManager {
  /**
   * Actualiza eventos de INACTIVO a ACTIVO
   * @returns {Promise<Array>} Lista de eventos activados
   */
  async actualizarEventosAActivoAsync() {
    try {
      conditionalLog("🔄 Buscando eventos para activar...");

      // Obtener eventos candidatos
      const eventosCandidatos =
        await EventStatusValidator.obtenerEventosCandidatosActivacion();

      if (eventosCandidatos.length === 0) {
        conditionalLog("ℹ️ No hay eventos para activar en este momento");
        return [];
      }

      conditionalLog(
        `🔍 Encontrados ${eventosCandidatos.length} eventos candidatos para activar`
      );

      // Filtrar eventos que pueden ser activados usando el validador
      const eventosParaActivar = eventosCandidatos.filter((evento) =>
        EventStatusValidator.validarCambioEstado(evento, "ACTIVO")
      );

      if (eventosParaActivar.length === 0) {
        conditionalLog(
          "ℹ️ Ningún evento cumple las condiciones para ser activado"
        );
        return [];
      }

      // Actualizar estado de eventos a ACTIVO
      const eventosActivados = [];

      for (const evento of eventosParaActivar) {
        try {
          // Actualizar directamente el estado del evento
          const eventoActualizado = await prisma.evento.update({
            where: {
              id_eve: evento.id_eve,
            },
            data: {
              est_eve: "ACTIVO",
            },
            include: {
              eventos_carrera: {
                include: {
                  carrera: true,
                },
              },
            },
          });

          eventosActivados.push(eventoActualizado);
          conditionalLog(
            `✅ Evento activado: ${evento.nom_eve} (ID: ${evento.id_eve})`
          );
        } catch (error) {
          console.error(`❌ Error al activar evento ${evento.id_eve}:`, error);
        }
      }

      return eventosActivados;
    } catch (error) {
      console.error("❌ Error en actualizarEventosAActivoAsync:", error);
      return [];
    }
  }

  /**
   * Actualiza eventos de ACTIVO a FINALIZADO
   * @returns {Promise<Array>} Lista de eventos finalizados
   */
  async actualizarEventosAFinalizadoAsync() {
    try {
      conditionalLog("🔄 Buscando eventos para finalizar...");

      // Obtener eventos candidatos
      const eventosCandidatos =
        await EventStatusValidator.obtenerEventosCandidatosFinalizacion();

      if (eventosCandidatos.length === 0) {
        conditionalLog("ℹ️ No hay eventos para finalizar en este momento");
        return [];
      }

      conditionalLog(
        `🔍 Encontrados ${eventosCandidatos.length} eventos candidatos para finalizar`
      );

      // Filtrar eventos que pueden ser finalizados usando el validador
      const eventosParaFinalizar = eventosCandidatos.filter((evento) =>
        EventStatusValidator.validarCambioEstado(evento, "FINALIZADO")
      );

      if (eventosParaFinalizar.length === 0) {
        conditionalLog(
          "ℹ️ Ningún evento cumple las condiciones para ser finalizado"
        );
        return [];
      } // Actualizar estado de eventos a FINALIZADO
      const eventosFinalizados = [];

      for (const evento of eventosParaFinalizar) {
        try {
          // Actualizar directamente el estado del evento
          const eventoActualizado = await prisma.evento.update({
            where: {
              id_eve: evento.id_eve,
            },
            data: {
              est_eve: "FINALIZADO",
            },
            include: {
              eventos_carrera: {
                include: {
                  carrera: true,
                },
              },
            },
          });

          eventosFinalizados.push(eventoActualizado);
          conditionalLog(
            `✅ Evento finalizado: ${evento.nom_eve} (ID: ${evento.id_eve})`
          );
        } catch (error) {
          console.error(
            `❌ Error al finalizar evento ${evento.id_eve}:`,
            error
          );
        }
      }

      return eventosFinalizados;
    } catch (error) {
      console.error("❌ Error en actualizarEventosAFinalizadoAsync:", error);
      return [];
    }
  }
  /**
   * Procesa inscripciones de eventos recién finalizados
   * Cambia ACEPTADAS → REPROBADO_TOTAL y PENDIENTES → RECHAZADA
   * @param {Array} eventosFinalizados Lista de eventos que se finalizaron
   * @returns {Promise<Array>} Lista de inscripciones procesadas
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

      // Obtener IDs de eventos finalizados
      const idsEventosFinalizados = eventosFinalizados.map(
        (evento) => evento.id_eve
      ); // Buscar inscripciones ACEPTADAS de esos eventos
      const inscripcionesAceptadas = await prisma.inscripcion.findMany({
        where: {
          id_eve_ins: {
            in: idsEventosFinalizados,
          },
          est_ins: "ACEPTADA",
        },
        include: {
          evento: true,
          cuenta: {
            include: {
              usuario: true,
            },
          },
        },
      });

      // Buscar inscripciones PENDIENTES de esos eventos
      const inscripcionesPendientes = await prisma.inscripcion.findMany({
        where: {
          id_eve_ins: {
            in: idsEventosFinalizados,
          },
          est_ins: "PENDIENTE",
        },
        include: {
          evento: true,
          cuenta: {
            include: {
              usuario: true,
            },
          },
        },
      });

      conditionalLog(
        `🔍 Encontradas ${inscripcionesAceptadas.length} inscripciones ACEPTADAS para reprobación y ${inscripcionesPendientes.length} inscripciones PENDIENTES para rechazo`
      );

      // Actualizar estado de inscripciones
      const inscripcionesProcesadas = []; // Procesar inscripciones ACEPTADAS → REPROBADO_TOTAL
      for (const inscripcion of inscripcionesAceptadas) {
        try {
          const inscripcionActualizada = await prisma.inscripcion.update({
            where: {
              id_ins: inscripcion.id_ins,
            },
            data: {
              est_ins: "REPROBADO_TOTAL",
            },
            include: {
              evento: true,
              cuenta: {
                include: {
                  usuario: true,
                },
              },
            },
          });

          inscripcionesProcesadas.push(inscripcionActualizada); // Crear observación automática
          await prisma.observacion_inscripcion.upsert({
            where: {
              id_ins_per: inscripcion.id_ins,
            },
            update: {
              obs_ins:
                "Reprobación automática al finalizar el evento sin registro de asistencia o aprobación",
              fec_cre_obs: new Date(),
            },
            create: {
              id_ins_per: inscripcion.id_ins,
              obs_ins:
                "Reprobación automática al finalizar el evento sin registro de asistencia o aprobación",
              fec_cre_obs: new Date(),
            },
          });

          conditionalLog(
            `✅ Inscripción de ${inscripcion.cuenta.usuario.nom_usu} ${inscripcion.cuenta.usuario.ape_usu} cambiada a REPROBADO_TOTAL`
          );
        } catch (error) {
          console.error(
            `❌ Error al procesar inscripción ${inscripcion.id_ins}:`,
            error
          );
        }
      }

      // Procesar inscripciones PENDIENTES → RECHAZADA
      for (const inscripcion of inscripcionesPendientes) {
        try {
          const inscripcionActualizada = await prisma.inscripcion.update({
            where: {
              id_ins: inscripcion.id_ins,
            },
            data: {
              est_ins: "RECHAZADA",
            },
            include: {
              evento: true,
              cuenta: {
                include: {
                  usuario: true,
                },
              },
            },
          });

          inscripcionesProcesadas.push(inscripcionActualizada); // Crear observación automática
          await prisma.observacion_inscripcion.upsert({
            where: {
              id_ins_per: inscripcion.id_ins,
            },
            update: {
              obs_ins:
                "Rechazo automático al finalizar el evento sin haber sido aceptada",
              fec_cre_obs: new Date(),
            },
            create: {
              id_ins_per: inscripcion.id_ins,
              obs_ins:
                "Rechazo automático al finalizar el evento sin haber sido aceptada",
              fec_cre_obs: new Date(),
            },
          });

          conditionalLog(
            `✅ Inscripción de ${inscripcion.cuenta.usuario.nom_usu} ${inscripcion.cuenta.usuario.ape_usu} cambiada a RECHAZADA`
          );
        } catch (error) {
          console.error(
            `❌ Error al procesar inscripción ${inscripcion.id_ins}:`,
            error
          );
        }
      }

      return inscripcionesProcesadas;
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
 * Patrón Observer
 */
class EventStatusNotifier {
  /**
   * Notifica cambio de estado de evento vía socket
   */
  async notificarCambioEstadoEvento(evento, tipoNotificacion) {
    try {
      socketService.notifyEventChange("updated", {
        id: evento.id_eve,
        eventName: evento.nom_eve,
        eventStatus: evento.est_eve,
        notificationType: tipoNotificacion,
        timestamp: new Date(),
      });

      console.log(
        `🔔 Notificación enviada: cambio de estado de evento ${evento.id_eve} a ${evento.est_eve}`
      );
    } catch (error) {
      console.error(
        `❌ Error al notificar cambio de estado de evento ${evento.id_eve}:`,
        error
      );
    }
  }
  /**
   * Notifica cambios masivos de inscripciones
   */
  async notificarCambioMasivoInscripciones(inscripcionesProcesadas) {
    try {
      // Agrupar inscripciones por evento para notificaciones más eficientes
      const inscripcionesPorEvento = inscripcionesProcesadas.reduce(
        (acc, inscripcion) => {
          const idEvento = inscripcion.id_eve_ins;
          const estado = inscripcion.est_ins;

          if (!acc[idEvento]) {
            acc[idEvento] = {
              REPROBADO_TOTAL: [],
              RECHAZADA: [],
            };
          }

          if (estado === "REPROBADO_TOTAL") {
            acc[idEvento].REPROBADO_TOTAL.push(inscripcion);
          } else if (estado === "RECHAZADA") {
            acc[idEvento].RECHAZADA.push(inscripcion);
          }

          return acc;
        },
        {}
      );

      // Enviar notificación por cada evento con sus inscripciones
      for (const [idEvento, estados] of Object.entries(
        inscripcionesPorEvento
      )) {
        const inscripcionesReprobadas = estados.REPROBADO_TOTAL;
        const inscripcionesRechazadas = estados.RECHAZADA;

        // Si hay inscripciones reprobadas, notificar
        if (inscripcionesReprobadas.length > 0) {
          const evento = inscripcionesReprobadas[0].evento;

          socketService.notifyRegistrationChange("bulk-status-change", {
            eventId: idEvento,
            eventName: evento.nom_eve,
            registrationsCount: inscripcionesReprobadas.length,
            newStatus: "REPROBADO_TOTAL",
            reason: "Finalización automática del evento",
            timestamp: new Date(),
          });

          console.log(
            `🔔 Notificación enviada: cambio masivo de ${inscripcionesReprobadas.length} inscripciones a REPROBADO_TOTAL para evento ${evento.nom_eve}`
          );
        }

        // Si hay inscripciones rechazadas, notificar
        if (inscripcionesRechazadas.length > 0) {
          const evento = inscripcionesRechazadas[0].evento;

          socketService.notifyRegistrationChange("bulk-status-change", {
            eventId: idEvento,
            eventName: evento.nom_eve,
            registrationsCount: inscripcionesRechazadas.length,
            newStatus: "RECHAZADA",
            reason: "Rechazo automático por finalización de evento",
            timestamp: new Date(),
          });

          console.log(
            `🔔 Notificación enviada: cambio masivo de ${inscripcionesRechazadas.length} inscripciones a RECHAZADA para evento ${evento.nom_eve}`
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
