/**
 * Utilidades para el cálculo y gestión de cupos en eventos
 * Esta versión incluye una implementación robusta para manejar cualquier transición de estado
 * y garantizar que los cupos disponibles siempre reflejen el número correcto.
 * * ENFOQUE IMPLEMENTADO:
 * 1. Cada inscripción tiene un campo 'occupiesSpot' que indica si está ocupando un cupo o no
 * 2. Las inscripciones en estado 'ACEPTADA' y estados finales ocupan cupo (occupiesSpot = true)
 * 3. El cálculo de cupos disponibles se basa en el campo 'occupiesSpot', no en el estado
 * 4. La función 'actualizarEstadoYSincronizarCupos' maneja todos los cambios de estado
 *    y actualiza el campo 'occupiesSpot' automáticamente
 * 5. Los cupos disponibles siempre se calculan como: maxCapacity - (número de inscripciones con occupiesSpot = true)
 */
const { prisma } = require("../config/db");
const { withTenantWhere } = require("./tenantScope");

const LEGACY_REG_STATUS_TO_DB = {
  PENDIENTE: "PENDING",
  ACEPTADA: "ACCEPTED",
  RECHAZADA: "REJECTED",
  APROBADO: "APPROVED",
  REPROBADO_NOTA: "FAILED_GRADE",
  REPROBADO_ASISTENCIA: "FAILED_ATTENDANCE",
  REPROBADO_TOTAL: "FAILED_TOTAL",
};

const toDbRegistrationStatus = (status) => LEGACY_REG_STATUS_TO_DB[status] || status;

const OCCUPYING_REGISTRATION_STATUSES = new Set([
  "ACCEPTED",
  "APPROVED",
  "FAILED_GRADE",
  "FAILED_ATTENDANCE",
  "FAILED_TOTAL",
]);

const shouldOccupySpotForStatus = (status) =>
  OCCUPYING_REGISTRATION_STATUSES.has(toDbRegistrationStatus(status));

/**
 * Calcula los cupos disponibles de un evento basado en las inscripciones que ocupan cupo
 * @param {string} idEvento - ID del evento a calcular cupos
 * @param {object} tx - Instancia de transacción de Prisma (opcional)
 * @returns {Promise<{disponibles: number, maximos: number, ocupados: number}>} Objeto con información de cupos
 */
async function calcularCuposDisponibles(idEvento, tenantId, tx) {
  try {
    const db = tx || prisma;

    // 1. Obtener información del evento
    const evento = await db.event.findFirst({
      where: withTenantWhere(tenantId, { id: idEvento }),
      select: { maxCapacity: true, name: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    // 2. Contar inscripciones que ocupan cupo
    const inscripcionesOcupandoCupo = await db.registration.count({
      where: withTenantWhere(tenantId, {
        eventId: idEvento,
        occupiesSpot: true,
      }),
    });

    // 3. Calcular cupos disponibles
    const cupoMaximo = evento.maxCapacity;
    const cuposOcupados = inscripcionesOcupandoCupo;
    const cuposDisponibles = Math.max(
      0,
      cupoMaximo - inscripcionesOcupandoCupo
    );

    return {
      disponibles: cuposDisponibles,
      maximos: cupoMaximo,
      ocupados: cuposOcupados,
    };
  } catch (error) {
    console.error(
      `Error al calcular cupos disponibles para evento ${idEvento}:`,
      error
    );
    throw error;
  }
}

/**
 * Actualiza el campo availableSpots en la tabla event con el valor calculado
 * @param {string} idEvento - ID del evento a actualizar
 * @param {object} tx - Instancia de transacción de Prisma (opcional)
 * @returns {Promise<{anterior: number, nuevo: number}>} Objeto con valores anterior y nuevo
 */
async function sincronizarCuposDisponibles(idEvento, tenantId, tx) {
  try {
    const db = tx || prisma;

    // 1. Obtener información actual del evento
    const evento = await db.event.findFirst({
      where: withTenantWhere(tenantId, { id: idEvento }),
      select: { maxCapacity: true, availableSpots: true, name: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    const cupoDisponibleAnterior = evento.availableSpots;

    // 2. Calcular cupos disponibles
    const { disponibles: cupoDisponibleCalculado } =
      await calcularCuposDisponibles(idEvento, tenantId, db);

    // 3. Actualizar solo si hay discrepancia
    if (cupoDisponibleAnterior !== cupoDisponibleCalculado) {
      await db.event.updateMany({
        where: withTenantWhere(tenantId, { id: idEvento }),
        data: { availableSpots: cupoDisponibleCalculado },
      });
    }

    return {
      anterior: cupoDisponibleAnterior,
      nuevo: cupoDisponibleCalculado,
    };
  } catch (error) {
    console.error(
      `Error al sincronizar cupos disponibles para evento ${idEvento}:`,
      error
    );
    throw error;
  }
}

/**
 * Maneja transiciones de estado de inscripción y actualiza cupos en una sola transacción atómica
 * Esta función es crítica para mantener la consistencia del sistema
 * @param {string} idInscripcion - ID de la inscripción a actualizar
 * @param {string} nuevoEstado - Nuevo estado de la inscripción
 * @param {object} datosAdicionales - Datos adicionales para la actualización de la inscripción
 * @param {string} idAdministrador - ID del administrador que realiza la validación (opcional)
 * @returns {Promise<object>} Resultado de la operación
 */
async function actualizarEstadoYSincronizarCupos(
  idInscripcion,
  nuevoEstado,
  tenantId,
  datosAdicionales = {},
  idAdministrador = null
) {
  try {
    const normalizedNuevoEstado = toDbRegistrationStatus(nuevoEstado);

    // Ejecutamos todo en una transacción atómica para garantizar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener inscripción actual con datos del evento
      const inscripcion = await tx.registration.findFirst({
        where: withTenantWhere(tenantId, { id: idInscripcion }),
        select: {
          id: true,
          status: true,
          eventId: true,
          occupiesSpot: true,
          event: {
            select: {
              id: true,
              name: true,
              maxCapacity: true,
              availableSpots: true,
            },
          },
        },
      });

      if (!inscripcion) {
        throw new Error(
          `No se encontró la inscripción con ID ${idInscripcion}`
        );
      }

      const estadoAnterior = inscripcion.status;
      const idEvento = inscripcion.eventId;
      const ocupabaCupo = inscripcion.occupiesSpot;
      const debeOcuparCupo = shouldOccupySpotForStatus(normalizedNuevoEstado);
      const cuposAntes = inscripcion.event.availableSpots;

      // 2. Reservar o liberar cupos de forma atómica solo cuando cambia la ocupación real
      if (!ocupabaCupo && debeOcuparCupo) {
        const reservationResult = await tx.event.updateMany({
          where: withTenantWhere(tenantId, {
            id: idEvento,
            availableSpots: { gt: 0 },
          }),
          data: {
            availableSpots: {
              decrement: 1,
            },
          },
        });

        if (reservationResult.count === 0) {
          throw new Error("No hay cupos disponibles para este evento");
        }
      } else if (ocupabaCupo && !debeOcuparCupo) {
        await tx.event.updateMany({
          where: withTenantWhere(tenantId, {
            id: idEvento,
            availableSpots: { lt: inscripcion.event.maxCapacity },
          }),
          data: {
            availableSpots: {
              increment: 1,
            },
          },
        });
      }

      // Preparar datos de actualización incluyendo información de validación si corresponde
      let datosActualizacion = {
        status: normalizedNuevoEstado,
        occupiesSpot: debeOcuparCupo,
        ...datosAdicionales,
      };

      // Si hay un cambio de estado significativo y se proporciona un ID de administrador,
      // registramos quién hizo la validación y cuándo
      if (estadoAnterior !== normalizedNuevoEstado && idAdministrador) {
        datosActualizacion.validatedByAdminId = idAdministrador;
        datosActualizacion.validatedAt = new Date();
      }

      // 3. Actualizar estado de inscripción y el campo occupiesSpot
      await tx.registration.update({
        where: { id: idInscripcion },
        data: datosActualizacion,
      });

      const eventoActualizado = await tx.event.findFirst({
        where: withTenantWhere(tenantId, { id: idEvento }),
        select: {
          id: true,
          availableSpots: true,
          maxCapacity: true,
        },
      });

      return {
        inscripcion: {
          id: idInscripcion,
          estadoAnterior,
          estadoNuevo: normalizedNuevoEstado,
          ocupabaCupo,
          ocupaCupoAhora: debeOcuparCupo,
        },
        evento: {
          id: idEvento,
          cuposAntes,
          cuposDespues: eventoActualizado?.availableSpots ?? cuposAntes,
          cuposCambiaron:
            cuposAntes !== (eventoActualizado?.availableSpots ?? cuposAntes),
          cuposCambiados:
            cuposAntes !== (eventoActualizado?.availableSpots ?? cuposAntes),
        },
      };
    });

    return resultado;
  } catch (error) {
    console.error(`Error en actualización de estado:`, error);
    throw error;
  }
}

module.exports = {
  calcularCuposDisponibles,
  sincronizarCuposDisponibles,
  actualizarEstadoYSincronizarCupos,
};
