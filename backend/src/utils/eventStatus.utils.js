const prisma = require("../config/db");
const socketService = require("../services/socket.service");

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
      console.log("🔄 Buscando eventos para activar...");

      // Obtener eventos candidatos
      const eventosCandidatos =
        await EventStatusValidator.obtenerEventosCandidatosActivacion();

      if (eventosCandidatos.length === 0) {
        console.log("ℹ️ No hay eventos para activar en este momento");
        return [];
      }

      console.log(
        `🔍 Encontrados ${eventosCandidatos.length} eventos candidatos para activar`
      );

      // Filtrar eventos que pueden ser activados usando el validador
      const eventosParaActivar = eventosCandidatos.filter((evento) =>
        EventStatusValidator.validarCambioEstado(evento, "ACTIVO")
      );

      if (eventosParaActivar.length === 0) {
        console.log(
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
          console.log(
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
      console.log("🔄 Buscando eventos para finalizar...");

      // Obtener eventos candidatos
      const eventosCandidatos =
        await EventStatusValidator.obtenerEventosCandidatosFinalizacion();

      if (eventosCandidatos.length === 0) {
        console.log("ℹ️ No hay eventos para finalizar en este momento");
        return [];
      }

      console.log(
        `🔍 Encontrados ${eventosCandidatos.length} eventos candidatos para finalizar`
      );

      // Filtrar eventos que pueden ser finalizados usando el validador
      const eventosParaFinalizar = eventosCandidatos.filter((evento) =>
        EventStatusValidator.validarCambioEstado(evento, "FINALIZADO")
      );

      if (eventosParaFinalizar.length === 0) {
        console.log(
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
          console.log(
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
   * Cambia ACEPTADAS → REPROBADO_TOTAL
   * @param {Array} eventosFinalizados Lista de eventos que se finalizaron
   * @returns {Promise<Array>} Lista de inscripciones procesadas
   */
  async procesarInscripcionesEventosFinalizadosAsync(eventosFinalizados) {
    try {
      if (eventosFinalizados.length === 0) {
        console.log(
          "ℹ️ No hay inscripciones para procesar (sin eventos finalizados)"
        );
        return [];
      }

      console.log(
        `🔄 Procesando inscripciones de ${eventosFinalizados.length} eventos finalizados...`
      );

      // Obtener IDs de eventos finalizados
      const idsEventosFinalizados = eventosFinalizados.map(
        (evento) => evento.id_eve
      );

      // Buscar inscripciones ACEPTADAS de esos eventos
      const inscripcionesAceptadas = await prisma.inscripcion.findMany({
        where: {
          id_eve_per: {
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

      if (inscripcionesAceptadas.length === 0) {
        console.log("ℹ️ No hay inscripciones ACEPTADAS para procesar");
        return [];
      }

      console.log(
        `🔍 Encontradas ${inscripcionesAceptadas.length} inscripciones ACEPTADAS para reprobación`
      );

      // Actualizar estado de inscripciones a REPROBADO_TOTAL
      const inscripcionesProcesadas = [];

      for (const inscripcion of inscripcionesAceptadas) {
        try {
          const inscripcionActualizada = await prisma.inscripcion.update({
            where: {
              id_ins: inscripcion.id_ins,
            },
            data: {
              est_ins: "REPROBADO_TOTAL",
              fec_cam_est_ins: new Date(),
              obs_cam_est_ins:
                "Reprobación automática por finalización de evento",
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

          inscripcionesProcesadas.push(inscripcionActualizada);

          // Crear observación automática
          await prisma.observacion_inscripcion.create({
            data: {
              id_ins_per: inscripcion.id_ins,
              id_cue_per: null, // No hay cuenta de administrador asociada (es automático)
              tex_obs_ins:
                "Reprobación automática al finalizar el evento sin registro de asistencia o aprobación",
              fec_cre_obs_ins: new Date(),
            },
          });

          console.log(
            `✅ Inscripción de ${inscripcion.cuenta.usuario.nom_usu} ${inscripcion.cuenta.usuario.ape_usu} cambiada a REPROBADO_TOTAL`
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
          const idEvento = inscripcion.id_eve_per;
          if (!acc[idEvento]) {
            acc[idEvento] = [];
          }
          acc[idEvento].push(inscripcion);
          return acc;
        },
        {}
      );

      // Enviar notificación por cada evento con sus inscripciones
      for (const [idEvento, inscripciones] of Object.entries(
        inscripcionesPorEvento
      )) {
        const evento = inscripciones[0].evento; // Todos tienen el mismo evento

        socketService.notifyRegistrationChange("bulk-status-change", {
          eventId: idEvento,
          eventName: evento.nom_eve,
          registrationsCount: inscripciones.length,
          newStatus: "REPROBADO_TOTAL",
          reason: "Finalización automática del evento",
          timestamp: new Date(),
        });

        console.log(
          `🔔 Notificación enviada: cambio masivo de ${inscripciones.length} inscripciones a REPROBADO_TOTAL para evento ${evento.nom_eve}`
        );
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
