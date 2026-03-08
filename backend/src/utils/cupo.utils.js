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

/**
 * Calcula los cupos disponibles de un evento basado en las inscripciones que ocupan cupo
 * @param {string} idEvento - ID del evento a calcular cupos
 * @param {object} tx - Instancia de transacción de Prisma (opcional)
 * @returns {Promise<{disponibles: number, maximos: number, ocupados: number}>} Objeto con información de cupos
 */
async function calcularCuposDisponibles(idEvento, tx) {
  try {
    const db = tx || prisma;

    // 1. Obtener información del evento
    const evento = await db.event.findUnique({
      where: { id: idEvento },
      select: { maxCapacity: true, name: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    // 2. Contar inscripciones que ocupan cupo
    const inscripcionesOcupandoCupo = await db.registration.count({
      where: {
        eventId: idEvento,
        occupiesSpot: true,
      },
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
async function sincronizarCuposDisponibles(idEvento, tx) {
  try {
    const db = tx || prisma;

    // 1. Obtener información actual del evento
    const evento = await db.event.findUnique({
      where: { id: idEvento },
      select: { maxCapacity: true, availableSpots: true, name: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    const cupoDisponibleAnterior = evento.availableSpots;

    // 2. Calcular cupos disponibles
    const { disponibles: cupoDisponibleCalculado } =
      await calcularCuposDisponibles(idEvento, db);

    // 3. Actualizar solo si hay discrepancia
    if (cupoDisponibleAnterior !== cupoDisponibleCalculado) {
      await db.event.update({
        where: { id: idEvento },
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
  datosAdicionales = {},
  idAdministrador = null
) {
  try {
    // Ejecutamos todo en una transacción atómica para garantizar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener inscripción actual con datos del evento
      const inscripcion = await tx.registration.findUnique({
        where: { id: idInscripcion },
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

      // 2. Determinar si la inscripción debe ocupar cupo con el nuevo estado
      let debeOcuparCupo = ocupabaCupo; // Por defecto, mantener el estado actual

      // Definir los estados finales
      const estadosFinales = [
        "APROBADO",
        "REPROBADO_NOTA",
        "REPROBADO_ASISTENCIA",
        "REPROBADO_TOTAL",
      ];

      // NUEVO ENFOQUE SIMPLIFICADO: Basado únicamente en el estado al que se transiciona
      if (nuevoEstado === "ACEPTADA" || estadosFinales.includes(nuevoEstado)) {
        // Si va a ACEPTADA o cualquier estado final, debe ocupar cupo
        debeOcuparCupo = true;
      } else if (nuevoEstado === "PENDIENTE" || nuevoEstado === "RECHAZADA") {
        // Si va a PENDIENTE o RECHAZADA, no debe ocupar cupo
        debeOcuparCupo = false;
      }

      // Preparar datos de actualización incluyendo información de validación si corresponde
      let datosActualizacion = {
        status: nuevoEstado,
        occupiesSpot: debeOcuparCupo,
        ...datosAdicionales,
      };

      // Si hay un cambio de estado significativo y se proporciona un ID de administrador,
      // registramos quién hizo la validación y cuándo
      if (estadoAnterior !== nuevoEstado && idAdministrador) {
        datosActualizacion.validatedByAdminId = idAdministrador;
        datosActualizacion.validatedAt = new Date();
      }

      // 3. Actualizar estado de inscripción y el campo occupiesSpot
      await tx.registration.update({
        where: { id: idInscripcion },
        data: datosActualizacion,
      });

      // 4. Sincronizar cupos después de la actualización
      const resultadoSincronizacion = await sincronizarCuposDisponibles(
        idEvento,
        tx
      );

      return {
        inscripcion: {
          id: idInscripcion,
          estadoAnterior,
          estadoNuevo: nuevoEstado,
          ocupabaCupo,
          ocupaCupoAhora: debeOcuparCupo,
        },
        evento: {
          id: idEvento,
          cuposAntes: resultadoSincronizacion.anterior,
          cuposDespues: resultadoSincronizacion.nuevo,
          cuposCambiaron:
            resultadoSincronizacion.anterior !== resultadoSincronizacion.nuevo,
          cuposCambiados:
            resultadoSincronizacion.anterior !== resultadoSincronizacion.nuevo,
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
