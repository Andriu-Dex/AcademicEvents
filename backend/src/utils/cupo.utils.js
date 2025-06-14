/**
 * Utilidades para el cálculo y gestión de cupos en eventos
 * Esta versión incluye una implementación robusta para manejar cualquier transición de estado
 * y garantizar que los cupos disponibles siempre reflejen el número correcto.
 * * ENFOQUE IMPLEMENTADO:
 * 1. Cada inscripción tiene un campo 'cup_ocu' que indica si está ocupando un cupo o no
 * 2. Las inscripciones en estado 'ACEPTADA' y estados finales ocupan cupo (cup_ocu = true)
 * 3. El cálculo de cupos disponibles se basa en el campo 'cup_ocu', no en el estado
 * 4. La función 'actualizarEstadoYSincronizarCupos' maneja todos los cambios de estado
 *    y actualiza el campo 'cup_ocu' automáticamente
 * 5. Los cupos disponibles siempre se calculan como: cup_max_eve - (número de inscripciones con cup_ocu = true)
 */
const prisma = require("../config/db");

/**
 * Calcula los cupos disponibles de un evento basado en las inscripciones que ocupan cupo
 * @param {string} idEvento - ID del evento a calcular cupos
 * @param {object} tx - Instancia de transacción de Prisma (opcional)
 * @returns {Promise<{disponibles: number, maximos: number, ocupados: number}>} Objeto con información de cupos
 */
async function calcularCuposDisponibles(idEvento, tx) {
  try {
    const db = tx || prisma;
    console.log(`📊 Calculando cupos para evento ID: ${idEvento}`);

    // 1. Obtener información del evento
    const evento = await db.evento.findUnique({
      where: { id_eve: idEvento },
      select: { cup_max_eve: true, nom_eve: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    console.log(
      `📌 Evento: "${evento.nom_eve}", Cupo máximo: ${evento.cup_max_eve}`
    );

    // 2. Contar inscripciones que ocupan cupo - Usamos el nuevo campo cup_ocu
    const inscripcionesOcupandoCupo = await db.inscripcion.count({
      where: {
        id_eve_ins: idEvento,
        cup_ocu: true,
      },
    });

    console.log(`👥 Inscripciones ocupando cupo: ${inscripcionesOcupandoCupo}`);

    // 3. Calcular cupos disponibles
    const cupoMaximo = evento.cup_max_eve;
    const cuposOcupados = inscripcionesOcupandoCupo;
    const cuposDisponibles = Math.max(
      0,
      cupoMaximo - inscripcionesOcupandoCupo
    );

    console.log(
      `🔢 Cupos: Máximos=${cupoMaximo}, Ocupados=${cuposOcupados}, Disponibles=${cuposDisponibles}`
    );

    return {
      disponibles: cuposDisponibles,
      maximos: cupoMaximo,
      ocupados: cuposOcupados,
    };
  } catch (error) {
    console.error(
      `❌ Error al calcular cupos disponibles para evento ${idEvento}:`,
      error
    );
    throw error;
  }
}

/**
 * Actualiza el campo cup_dis_eve en la tabla evento con el valor calculado
 * @param {string} idEvento - ID del evento a actualizar
 * @param {object} tx - Instancia de transacción de Prisma (opcional)
 * @returns {Promise<{anterior: number, nuevo: number}>} Objeto con valores anterior y nuevo
 */
async function sincronizarCuposDisponibles(idEvento, tx) {
  try {
    const db = tx || prisma;
    console.log(`🔄 Sincronizando cupos para evento ID: ${idEvento}`);

    // 1. Obtener información actual del evento
    const evento = await db.evento.findUnique({
      where: { id_eve: idEvento },
      select: { cup_max_eve: true, cup_dis_eve: true, nom_eve: true },
    });

    if (!evento) {
      throw new Error(`No se encontró el evento con ID ${idEvento}`);
    }

    console.log(
      `📌 Evento: "${evento.nom_eve}", Cupos disponibles actuales: ${evento.cup_dis_eve}`
    );

    const cupoDisponibleAnterior = evento.cup_dis_eve;

    // 2. Calcular cupos disponibles
    const { disponibles: cupoDisponibleCalculado } =
      await calcularCuposDisponibles(idEvento, db);

    // 3. Actualizar solo si hay discrepancia
    if (cupoDisponibleAnterior !== cupoDisponibleCalculado) {
      console.log(
        `⚠️ Detectada discrepancia en cupos disponibles: ${cupoDisponibleAnterior} ≠ ${cupoDisponibleCalculado}`
      );

      await db.evento.update({
        where: { id_eve: idEvento },
        data: { cup_dis_eve: cupoDisponibleCalculado },
      });

      console.log(
        `✅ Cupo disponible corregido: ${cupoDisponibleAnterior} → ${cupoDisponibleCalculado}`
      );
    } else {
      console.log(
        `✅ Cupo disponible ya es correcto: ${cupoDisponibleCalculado}`
      );
    }

    return {
      anterior: cupoDisponibleAnterior,
      nuevo: cupoDisponibleCalculado,
    };
  } catch (error) {
    console.error(
      `❌ Error al sincronizar cupos disponibles para evento ${idEvento}:`,
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
  console.log(
    `⚙️ Iniciando actualización de estado para inscripción ID: ${idInscripcion} → ${nuevoEstado}`
  );

  try {
    // Ejecutamos todo en una transacción atómica para garantizar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtener inscripción actual con datos del evento
      const inscripcion = await tx.inscripcion.findUnique({
        where: { id_ins: idInscripcion },
        select: {
          id_ins: true,
          est_ins: true,
          id_eve_ins: true,
          cup_ocu: true,
          evento: {
            select: {
              id_eve: true,
              nom_eve: true,
              cup_max_eve: true,
              cup_dis_eve: true,
            },
          },
        },
      });

      if (!inscripcion) {
        throw new Error(
          `No se encontró la inscripción con ID ${idInscripcion}`
        );
      }

      const estadoAnterior = inscripcion.est_ins;
      const idEvento = inscripcion.id_eve_ins;
      const ocupabaCupo = inscripcion.cup_ocu;

      console.log(
        `📋 Inscripción: ${idInscripcion}, Evento: "${inscripcion.evento.nom_eve}"`
      );
      console.log(
        `🔄 Transición de estado: ${estadoAnterior} → ${nuevoEstado}`
      );
      console.log(`🔢 Ocupaba cupo anteriormente: ${ocupabaCupo}`);

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
      // Esta lógica es más clara y menos propensa a errores

      if (nuevoEstado === "ACEPTADA" || estadosFinales.includes(nuevoEstado)) {
        // Si va a ACEPTADA o cualquier estado final, debe ocupar cupo
        debeOcuparCupo = true;
        console.log(`🔄 Transición a ${nuevoEstado}: Debe ocupar cupo`);
      } else if (nuevoEstado === "PENDIENTE" || nuevoEstado === "RECHAZADA") {
        // Si va a PENDIENTE o RECHAZADA, no debe ocupar cupo
        debeOcuparCupo = false;
        console.log(`🔄 Transición a ${nuevoEstado}: No debe ocupar cupo`);
      }

      // Validación adicional para transiciones prohibidas
      if (
        estadosFinales.includes(estadoAnterior) &&
        nuevoEstado === "RECHAZADA"
      ) {
        console.warn(
          `⚠️ ADVERTENCIA: Transición de estado final a RECHAZADA no recomendada`
        );
        // La validación real se hace en el controlador, aquí solo advertimos
      }

      console.log(`🔢 Debe ocupar cupo ahora: ${debeOcuparCupo}`);

      // Preparar datos de actualización incluyendo información de validación si corresponde
      let datosActualizacion = {
        est_ins: nuevoEstado,
        cup_ocu: debeOcuparCupo,
        ...datosAdicionales,
      };

      // Si hay un cambio de estado significativo y se proporciona un ID de administrador,
      // registramos quién hizo la validación y cuándo
      if (estadoAnterior !== nuevoEstado && idAdministrador) {
        datosActualizacion.id_adm_val_ins = idAdministrador;
        datosActualizacion.fec_val_ins = new Date();
        console.log(
          `👤 Validación registrada por administrador ID: ${idAdministrador}`
        );
      }

      // 3. Actualizar estado de inscripción y el campo cup_ocu
      await tx.inscripcion.update({
        where: { id_ins: idInscripcion },
        data: datosActualizacion,
      });

      console.log(`✅ Estado de inscripción actualizado a: ${nuevoEstado}`);
      console.log(`✅ Campo cup_ocu actualizado a: ${debeOcuparCupo}`);

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
          cuposCambiados:
            resultadoSincronizacion.anterior !== resultadoSincronizacion.nuevo,
        },
      };
    });

    console.log(`✅ Transacción completada con éxito`);
    console.log(`📊 Resultado: ${JSON.stringify(resultado, null, 2)}`);

    return resultado;
  } catch (error) {
    console.error(`❌ Error en la transacción:`, error);
    throw error;
  }
}

module.exports = {
  calcularCuposDisponibles,
  sincronizarCuposDisponibles,
  actualizarEstadoYSincronizarCupos,
};
