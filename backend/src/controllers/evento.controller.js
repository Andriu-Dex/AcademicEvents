const { prisma } = require("../config/db");
const DEFAULT_IMAGE_URL = "https://i.imgur.com/f8adUbZ.png";
const axios = require("axios");
const socketService = require("../services/socket.service");
const { withTenantWhere } = require("../utils/tenantScope");
require("dotenv").config();

/**
 * Función helper para logs condicionales del sistema de verificación de cupos
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} forceShow - Forzar mostrar el mensaje (para errores críticos)
 */
const conditionalCuposLog = (message, forceShow = false) => {
  const logsEnabled = process.env.CUPOS_VERIFICATION_LOGS_ENABLED === "true";
  if (logsEnabled || forceShow) {
    console.log(message);
  }
};

const LEGACY_EVENT_TYPE_TO_DB = {
  CURSO: "COURSE",
  CONGRESO: "CONGRESS",
  WEBINAR: "WEBINAR",
  CHARLA: "TALK",
  SOCIALIZACION: "SOCIALIZATION",
};

const LEGACY_EVENT_MODALITY_TO_DB = {
  PRESENCIAL: "IN_PERSON",
  VIRTUAL: "VIRTUAL",
  SEMIPRESENCIAL: "HYBRID",
};

const LEGACY_EVENT_STATUS_TO_DB = {
  ACTIVO: "ACTIVE",
  INACTIVO: "INACTIVE",
  FINALIZADO: "FINISHED",
  CANCELADO: "CANCELLED",
  SUSPENDIDO: "SUSPENDED",
};

const VALID_EVENT_STATUSES = new Set([
  "ACTIVE",
  "INACTIVE",
  "FINISHED",
  "CANCELLED",
  "SUSPENDED",
]);

const normalizeEventType = (type) => LEGACY_EVENT_TYPE_TO_DB[type] || type;
const normalizeEventModality = (modality) =>
  LEGACY_EVENT_MODALITY_TO_DB[modality] || modality;
const normalizeEventStatus = (status) => LEGACY_EVENT_STATUS_TO_DB[status] || status;
const isValidEventStatus = (status) => VALID_EVENT_STATUSES.has(status);
const isCourseEventType = (type) => normalizeEventType(type) === "COURSE";

const parseBoolean = (value) => value === true || value === "true";

const parseCarrerasIds = (rawCarrerasIds) => {
  if (!rawCarrerasIds) return [];
  if (Array.isArray(rawCarrerasIds)) return rawCarrerasIds;
  try {
    return JSON.parse(rawCarrerasIds);
  } catch {
    return [];
  }
};

/**
 * Valida los campos obligatorios y restricciones de un CURSO
 * Lanza un error si hay algún problema, de lo contrario no hace nada.
 */
function validarCurso(not_min_cur) {
  if (not_min_cur === undefined)
    throw new Error("La nota mínima es obligatoria");
  if (not_min_cur < 0 || not_min_cur > 10)
    throw new Error("La nota mínima debe estar entre 0 y 10");
}
/**
 * Valida los campos obligatorios y restricciones de un evento en general
 * Lanza un error si hay algún problema, de lo contrario no hace nada.
 */
function validarEventoGeneral({
  nom_eve,
  tip_eve,
  fec_ini_eve,
  val_eve,
  dur_hor_eve,
  por_min_asi_eve,
  fec_fin_eve,
  cup_max_eve,
}) {
  // Validar que el nombre del evento esté presente
  if (!nom_eve) throw new Error("El nombre del evento es obligatorio");
  // Validar que el tipo de evento esté presente
  if (!tip_eve) throw new Error("El tipo de evento es obligatorio");
  // Validar que la fecha de inicio esté presente y sea válida
  if (!fec_ini_eve) throw new Error("La fecha de inicio es obligatoria");
  // Validar que el valor del evento sea un número válido
  const valorNum = Number(val_eve);
  if (isNaN(valorNum))
    throw new Error("El valor del evento no es un número válido");
  // Validar que la fecha de inicio sea una fecha válida
  if (isNaN(new Date(fec_ini_eve))) throw new Error("Fecha inválida");
  // Validar que la duración del evento esté definida y sea mayor a 0
  if (dur_hor_eve === undefined || dur_hor_eve <= 0)
    throw new Error(
      "La duración del evento es obligatoria y debe ser mayor a 0"
    ); // Validar que el porcentaje mínimo de asistencia esté dentro del rango 0-100
  if (por_min_asi_eve === undefined)
    throw new Error("El porcentaje mínimo de asistencia es obligatorio");
  if (por_min_asi_eve < 0 || por_min_asi_eve > 100)
    throw new Error(
      "El porcentaje mínimo de asistencia debe estar entre 0% y 100%"
    ); // Validar que la fecha de fin esté presente
  if (!fec_fin_eve) throw new Error("La fecha de fin es obligatoria");

  // Validaciones específicas para cupo máximo
  if (cup_max_eve === undefined || cup_max_eve === null || cup_max_eve === "") {
    throw new Error(
      "❌ El cupo máximo es obligatorio. Por favor ingrese un valor válido."
    );
  }

  // Convertir a número y realizar validaciones detalladas
  const cupoMaxNum = Number(cup_max_eve);

  if (isNaN(cupoMaxNum)) {
    throw new Error(
      "❌ El cupo máximo debe ser un número válido. Ejemplo: 50, 100, 200"
    );
  }

  if (cupoMaxNum <= 0) {
    throw new Error(
      "❌ El cupo máximo debe ser mayor a 0. Valor mínimo permitido: 1 persona"
    );
  }

  if (!Number.isInteger(cupoMaxNum)) {
    throw new Error(
      "❌ El cupo máximo debe ser un número entero (sin decimales). Ejemplo: 50, no 50.5"
    );
  }

  if (cupoMaxNum > 10000) {
    throw new Error(
      "❌ El cupo máximo no puede exceder las 10,000 personas por razones de capacidad"
    );
  }
  // Validar que la fecha de inicio no sea posterior a la fecha de fin
  // Usar parseUTCDate para mantener las horas exactas
  const fechaInicio = parseUTCDate(fec_ini_eve);
  const fechaFin = parseUTCDate(fec_fin_eve);
  if (fechaInicio > fechaFin)
    throw new Error(
      "La fecha de inicio no puede ser posterior a la fecha de fin"
    );
  // Validar que la fecha de inicio sea al menos mañana
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Ignorar la hora y comparar solo fechas
  if (fechaInicio <= hoy)
    throw new Error("La fecha de inicio debe ser a partir de mañana");
}

// Función para subir imagen a Imgur
async function subirImagenAImgur(archivo) {
  try {
    // Leer el archivo del disco en lugar de usar buffer
    const fs = require("fs");
    const imagenBuffer = fs.readFileSync(archivo.path);
    const imagenBase64 = imagenBuffer.toString("base64"); // Convierte buffer a base64

    const res = await axios.post(
      "https://api.imgur.com/3/image",
      {
        image: imagenBase64,
        type: "base64",
      },
      {
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
      }
    );

    return res.data.data.link;
  } catch (error) {
    return DEFAULT_IMAGE_URL; // En caso de error, usar imagen por defecto
  }
}

//Crea un nuevo evento académico, y si es curso, lo vincula a evento_curso
const crearEvento = async (req, res) => {
  try {
    const nombreEvento = req.body.name ?? req.body.nom_eve;
    const descripcionEvento = req.body.description ?? req.body.des_eve;
    const tipoEventoEntrada = req.body.type ?? req.body.tip_eve;
    const fechaInicioEntrada = req.body.startDate ?? req.body.fec_ini_eve;
    const fechaFinEntrada = req.body.endDate ?? req.body.fec_fin_eve;
    const modalidadEntrada = req.body.modality ?? req.body.mod_eve;
    const estadoEntrada = req.body.status ?? req.body.est_eve;
    const durHor = Number(req.body.durationHours ?? req.body.dur_hor_eve);
    const porcMinAsi = Number(
      req.body.minAttendancePercent ?? req.body.por_min_asi_eve
    );
    const valNum = Number(req.body.price ?? req.body.val_eve);
    const cupoMax = Number(req.body.maxCapacity ?? req.body.cup_max_eve);
    const notaMinRaw = req.body.minPassingGrade ?? req.body.not_min_cur;
    const notaMin = notaMinRaw !== undefined ? Number(notaMinRaw) : undefined;

    const tipoEventoFinal = normalizeEventType(tipoEventoEntrada);
    const modalidadFinal = normalizeEventModality(modalidadEntrada || "IN_PERSON");
    const estadoFinal = normalizeEventStatus(estadoEntrada || "INACTIVE");

    if (!isValidEventStatus(estadoFinal)) {
      return res.status(400).json({
        msg: "Estado del evento no válido",
      });
    }

    // Convertir fechas a objetos Date en UTC para evitar problemas de zona horaria
    const fechaIni = parseUTCDate(fechaInicioEntrada);
    const fechaFin = parseUTCDate(fechaFinEntrada);

    // Validaciones generales (debería validar los campos nuevos)
    try {
      validarEventoGeneral({
        nom_eve: nombreEvento,
        tip_eve: tipoEventoFinal,
        fec_ini_eve: fechaIni,
        val_eve: valNum,
        dur_hor_eve: durHor,
        por_min_asi_eve: porcMinAsi,
        fec_fin_eve: fechaFin,
        cup_max_eve: cupoMax,
      });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }

    // Validación específica para CURSO (solo nota mínima)
    if (isCourseEventType(tipoEventoFinal)) {
      try {
        validarCurso(notaMin);
      } catch (e) {
        return res.status(400).json({ msg: e.message });
      }
    }

    // Subir imagen a Imgur o usar la imagen por defecto
    let imgUrl = DEFAULT_IMAGE_URL;
    if (req.file) {
      try {
        imgUrl = await subirImagenAImgur(req.file);
      } catch (error) {
        console.error("Error al subir imagen:", error);
        // Si falla la carga, usamos la imagen por defecto
      }
    } // Crear evento en la base de datos
    // Validación adicional: asegurar que cup_dis_eve se inicialice igual a cup_max_eve
    if (cupoMax !== Number(cupoMax) || cupoMax <= 0) {
      throw new Error(
        "❌ Error interno: El cupo máximo no se pudo procesar correctamente"
      );
    }

    // Procesar carreras asociadas y validar lógica de eventos
    const esEventoGeneral = parseBoolean(req.body.esEventoGeneral);
    const carrerasIds = parseCarrerasIds(req.body.carrerasIds);

    // 🔍 VALIDACIÓN: Debe seleccionar carreras O marcar como evento general
    if (!esEventoGeneral && (!carrerasIds || carrerasIds.length === 0)) {
      return res.status(400).json({
        msg: "Debe seleccionar al menos una carrera o marcar el evento como público para todas las carreras",
      });
    }

    // Procesar las fechas para mantener las horas exactas
    const fechaInicial = parseUTCDate(fechaInicioEntrada);
    const fechaFinal = parseUTCDate(fechaFinEntrada);

    const nuevoEvento = await prisma.event.create({
      data: {
        tenantId: req.tenantId,
        name: nombreEvento,
        description: descripcionEvento,
        type: tipoEventoFinal, // Usar tipo corregido
        startDate: fechaInicial,
        price: valNum,
        durationHours: durHor,
        minAttendancePercent: porcMinAsi,
        endDate: fechaFinal,
        modality: modalidadFinal,
        maxCapacity: cupoMax,
        availableSpots: cupoMax, // ✅ Inicialmente disponible = máximo
        coverImageUrl: imgUrl,
        status: estadoFinal,
        createdByAccountId: req.usuario.id, // ID de la cuenta creadora
      },
    });

    // Si es CURSO, crear registro en eventCourse con la nota mínima
    let datosCurso = null;
    if (isCourseEventType(tipoEventoFinal) && notaMin !== undefined) {
      datosCurso = await crearEventoCurso(nuevoEvento.id, notaMin);
    }

    // 🎯 ASOCIAR CARRERAS: Solo si NO es evento general (público)
    if (!esEventoGeneral && carrerasIds.length > 0) {
      await Promise.all(
        carrerasIds.map(async (carreraId) => {
          await prisma.eventCareer.create({
            data: {
              tenantId: req.tenantId,
              careerId: carreraId,
              eventId: nuevoEvento.id,
            },
          });
        })
      );
    }

    res.status(201).json({
      ...nuevoEvento,
      eventCourse: datosCurso,
    });

    // 🔌 Notificar a todos los clientes sobre el nuevo evento
    socketService.notifyEventChange("created", {
      ...nuevoEvento,
      eventCourse: datosCurso,
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({
      msg: "Error al crear evento",
      error: error.message,
    });
  }
};

//Crea un registro en eventCourse vinculado a un evento
const crearEventoCurso = async (eventoId, not_min_cur) => {
  return prisma.eventCourse.create({
    data: {
      eventId: eventoId,
      minPassingGrade: Number(not_min_cur),
    },
  });
};

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.event.findMany({
      where: withTenantWhere(req.tenantId),
      include: {
        eventCareers: {
          include: { career: { select: { name: true, id: true } } },
        },
        eventCourse: true, // esto ya es objeto o null, no array
      },
      orderBy: { startDate: "asc" },
    });

    // 🔧 AUTO-CORRECCIÓN MASIVA DE CUPOS INCONSISTENTES
    // Verificar y corregir cupos disponibles para todos los eventos si están mal calculados
    conditionalCuposLog(
      "🔄 Verificando cupos disponibles para todos los eventos..."
    );

    const eventosCorregidos = await Promise.allSettled(
      eventos.map(async (evento) => {
        try {
          // Contar inscripciones que ocupan cupo
          const inscripcionesOcupandoCupo = await prisma.registration.count({
            where: withTenantWhere(req.tenantId, {
              eventId: evento.id,
              occupiesSpot: true,
            }),
          });

          const cupoMaximo = evento.maxCapacity;
          const cupoDisponibleActual = evento.availableSpots;
          const cupoDisponibleCorrecto = Math.max(
            0,
            cupoMaximo - inscripcionesOcupandoCupo
          );

          conditionalCuposLog(
            `Evento ${evento.name}: Cupo actual=${cupoDisponibleActual}, Cupo calculado=${cupoDisponibleCorrecto}`
          );

          // Si hay inconsistencia, corregir automáticamente
          if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
            conditionalCuposLog(
              `⚠️ Corrigiendo cupo para evento ${evento.name}...`
            );

            // Actualizar en la base de datos
            await prisma.event.updateMany({
              where: withTenantWhere(req.tenantId, { id: evento.id }),
              data: { availableSpots: cupoDisponibleCorrecto },
            });

            // Retornar el evento con los cupos corregidos
            return {
              ...evento,
              availableSpots: cupoDisponibleCorrecto,
            };
          }

          return evento;
        } catch (error) {
          console.error(
            `❌ Error en auto-corrección de cupos para evento ${evento.id}:`,
            error
          );
          return evento; // Retornar el evento original si falla la corrección
        }
      })
    );

    // Extraer los eventos corregidos (exitosos) de los resultados
    const eventosFinales = eventosCorregidos.map((result) =>
      result.status === "fulfilled" ? result.value : result.reason
    );

    res.status(200).json(eventosFinales);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener eventos",
      error: error.message,
    });
  }
};

// Actualizar un evento por ID

// 1. Campos permitidos para cada tabla (evento y curso)
const camposEvento = [
  "name",
  "description",
  "type",
  "startDate",
  "price",
  "status",
  "durationHours",
  "minAttendancePercent",
  "endDate",
  "maxCapacity",
  "availableSpots",
  "modality",
  "nom_eve",
  "des_eve",
  "tip_eve",
  "fec_ini_eve",
  "val_eve",
  "est_eve",
  "dur_hor_eve",
  "por_min_asi_eve",
  "fec_fin_eve",
  "cup_max_eve",
  "cup_dis_eve",
  "mod_eve",
];
const camposCurso = ["not_min_cur", "minPassingGrade"];
// 2. Función principal para actualizar un evento
const actualizarEvento = async (req, res) => {
  // 3. Extrae solo los campos de evento presentes en el body y que están permitidos
  const dataEvento = Object.fromEntries(
    // Extraer campos específicos del evento
    Object.entries(req.body).filter(([key]) => camposEvento.includes(key))
  );
  // 3.1. Extrae solo los campos de curso presentes en el body y que están permitidos
  const dataCurso = Object.fromEntries(
    // Extraer campos específicos del curso
    Object.entries(req.body).filter(([key]) => camposCurso.includes(key))
  );

  const normalizedEventoData = {
    name: dataEvento.name ?? dataEvento.nom_eve,
    description: dataEvento.description ?? dataEvento.des_eve,
    type: normalizeEventType(dataEvento.type ?? dataEvento.tip_eve),
    startDate: dataEvento.startDate ?? dataEvento.fec_ini_eve,
    endDate: dataEvento.endDate ?? dataEvento.fec_fin_eve,
    price: dataEvento.price ?? dataEvento.val_eve,
    status:
      dataEvento.status !== undefined || dataEvento.est_eve !== undefined
        ? normalizeEventStatus(dataEvento.status ?? dataEvento.est_eve)
        : undefined,
    durationHours: dataEvento.durationHours ?? dataEvento.dur_hor_eve,
    minAttendancePercent:
      dataEvento.minAttendancePercent ?? dataEvento.por_min_asi_eve,
    maxCapacity: dataEvento.maxCapacity ?? dataEvento.cup_max_eve,
    modality: dataEvento.modality ?? dataEvento.mod_eve,
  };

  const minPassingGrade =
    dataCurso.minPassingGrade ?? dataCurso.not_min_cur;

  try {
    // 4. Extrae el ID del evento a actualizar desde los parámetros de la ruta
    const { id } = req.params;

    // 5. Busca el evento en la base de datos; si no existe, devuelve error 404
    const eventoExistente = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });
    if (!eventoExistente) {
      return res.status(404).json({ msg: "Evento no encontrado para editar" });
    } // --- GESTIÓN DE IMAGENES --- //

    if (
      normalizedEventoData.status !== undefined &&
      !isValidEventStatus(normalizedEventoData.status)
    ) {
      return res.status(400).json({ msg: "Estado del evento no válido" });
    }

    let imgUrl = eventoExistente.coverImageUrl; // Por defecto, se queda la actual

    if (req.file) {
      try {
        imgUrl = await subirImagenAImgur(req.file);
      } catch (error) {
        console.error("Error al subir imagen en actualización:", error);
        // Si falla la carga, mantenemos la imagen anterior
      }
    }
    try {
      validarEventoGeneral({
        nom_eve: normalizedEventoData.name ?? eventoExistente.name,
        tip_eve: normalizedEventoData.type ?? eventoExistente.type,
        fec_ini_eve: normalizedEventoData.startDate ?? eventoExistente.startDate,
        val_eve: normalizedEventoData.price ?? eventoExistente.price,
        dur_hor_eve:
          normalizedEventoData.durationHours ?? eventoExistente.durationHours,
        por_min_asi_eve:
          normalizedEventoData.minAttendancePercent ??
          eventoExistente.minAttendancePercent,
        fec_fin_eve: normalizedEventoData.endDate ?? eventoExistente.endDate,
        cup_max_eve: normalizedEventoData.maxCapacity ?? eventoExistente.maxCapacity,
      });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    } // 6. Actualiza evento principal
    // Calcular availableSpots si se actualiza maxCapacity
    let cupoDisponibleActualizado = eventoExistente.availableSpots;
    if (normalizedEventoData.maxCapacity !== undefined) {
      const nuevoCupoMax = Number(normalizedEventoData.maxCapacity);
      const cupoMaxAnterior = eventoExistente.maxCapacity;
      const cupoDisponibleAnterior = eventoExistente.availableSpots;

      // Calcular cuántos cupos están ocupados actualmente
      const cuposOcupados = cupoMaxAnterior - cupoDisponibleAnterior;

      // El nuevo cupo disponible será el nuevo máximo menos los cupos ocupados
      // Pero asegurándonos de que no sea negativo
      cupoDisponibleActualizado = Math.max(0, nuevoCupoMax - cuposOcupados);
    }

    // Procesar carreras asociadas y validar lógica de eventos
    const esEventoGeneral = parseBoolean(req.body.esEventoGeneral);
    const carrerasIds = parseCarrerasIds(req.body.carrerasIds);

    // 🔍 VALIDACIÓN: Debe seleccionar carreras O marcar como evento general
    if (!esEventoGeneral && (!carrerasIds || carrerasIds.length === 0)) {
      return res.status(400).json({
        msg: "Debe seleccionar al menos una carrera o marcar el evento como público para todas las carreras",
      });
    }

    // 🎯 LÓGICA ACTUALIZADA: El tipo de evento define QUÉ es (CURSO, CONGRESO, etc.)
    // Las carreras asociadas definen QUIÉN puede acceder (con carreras = específico, sin carreras = público)
    let tipoEventoFinal = normalizeEventType(
      normalizedEventoData.type || eventoExistente.type
    );

    await prisma.event.updateMany({
      where: withTenantWhere(req.tenantId, { id }),
      data: {
        name: normalizedEventoData.name || eventoExistente.name,
        description: normalizedEventoData.description || eventoExistente.description,
        type: tipoEventoFinal, // Usar tipo corregido
        price:
          normalizedEventoData.price !== undefined
            ? Number(normalizedEventoData.price)
            : eventoExistente.price,
        startDate: normalizedEventoData.startDate
          ? parseUTCDate(normalizedEventoData.startDate)
          : eventoExistente.startDate,
        endDate: normalizedEventoData.endDate
          ? parseUTCDate(normalizedEventoData.endDate)
          : eventoExistente.endDate,
        durationHours:
          normalizedEventoData.durationHours !== undefined
            ? Number(normalizedEventoData.durationHours)
            : eventoExistente.durationHours,
        minAttendancePercent:
          normalizedEventoData.minAttendancePercent !== undefined
            ? Number(normalizedEventoData.minAttendancePercent)
            : eventoExistente.minAttendancePercent,
        maxCapacity:
          normalizedEventoData.maxCapacity !== undefined
            ? Number(normalizedEventoData.maxCapacity)
            : eventoExistente.maxCapacity,
        availableSpots: cupoDisponibleActualizado,
        status:
          normalizedEventoData.status !== undefined
            ? normalizedEventoData.status
            : eventoExistente.status,
        modality: normalizedEventoData.modality
          ? normalizeEventModality(normalizedEventoData.modality)
          : eventoExistente.modality,
        coverImageUrl: imgUrl,
      },
    });

    const eventoActualizado = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });

    // Verifica si el evento ANTES era CURSO y AHORA ya NO lo es
    if (
      isCourseEventType(eventoExistente.type) &&
      !isCourseEventType(eventoActualizado.type)
    ) {
      // Elimina el registro de eventCourse si existe
      await prisma.eventCourse.deleteMany({
        where: { eventId: id },
      });
    }

    // 6.1. Si el evento es de tipo CURSO y hay datos de curso para actualizar...
    let cursoActualizado = null; // Inicializa como null para evitar errores si no es CURSO
    if (
      isCourseEventType(eventoActualizado.type) &&
      Object.keys(dataCurso).length > 0
    ) {
      // 6.1.1. Busca los datos actuales del curso (eventCourse) relacionados a ese evento

      let cursoBD = await prisma.eventCourse.findUnique({
        where: { eventId: id },
      });

      // 7. Valida los datos (los nuevos o los actuales si no vienen en el body)
      try {
        validarCurso(
          Number(minPassingGrade ?? (cursoBD && cursoBD.minPassingGrade))
        );
      } catch (e) {
        // 8. Si no pasa la validación, devuelve un error 400 con el mensaje
        return res.status(400).json({ msg: e.message });
      }

      if (cursoBD) {
        // Si existe, actualiza
        cursoActualizado = await prisma.eventCourse.update({
          where: { eventId: id },
          data: {
            minPassingGrade:
              minPassingGrade !== undefined
                ? Number(minPassingGrade)
                : cursoBD.minPassingGrade,
          },
        });
      } else {
        // Si NO existe, CREA eventCourse
        cursoActualizado = await prisma.eventCourse.create({
          data: {
            eventId: id,
            minPassingGrade: Number(minPassingGrade),
          },
        });
      }
    }

    // Eliminar todas las asociaciones existentes
    await prisma.eventCareer.deleteMany({
      where: { eventId: id },
    });

    // 🎯 ASOCIAR CARRERAS: Solo si NO es evento general (público)
    if (!esEventoGeneral && carrerasIds.length > 0) {
      await Promise.all(
        carrerasIds.map(async (carreraId) => {
          await prisma.eventCareer.create({
            data: {
              tenantId: req.tenantId,
              careerId: carreraId,
              eventId: id,
            },
          });
        })
      );
    }

    // 9. Si todo está OK, actualiza los datos del curso en eventCourse
    res.status(200).json({
      ...eventoActualizado,
      eventCourse: cursoActualizado,
    });

    // 🔌 Notificar a todos los clientes sobre la actualización del evento
    socketService.notifyEventChange("updated", {
      ...eventoActualizado,
      eventCourse: cursoActualizado,
    });
  } catch (error) {
    res.status(500).json({
      // 10. Si hay un error no controlado, devuelve 500 y el mensaje de error
      msg: "Error al actualizar evento",
      error: error.message,
    });
  }
};

// Eliminar un evento por ID
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca el evento primero
    const evento = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    } // 2. Si el evento es CURSO, elimina primero el registro en eventCourse
    if (isCourseEventType(evento.type)) {
      await prisma.eventCourse.deleteMany({ where: { eventId: id } });
      // (Usamos deleteMany por si acaso, aunque debería haber solo uno)
    }

    // Eliminar todas las relaciones evento-carrera
    await prisma.eventCareer.deleteMany({
      where: withTenantWhere(req.tenantId, { eventId: id }),
    });

    // 3. Elimina el evento
    await prisma.event.deleteMany({ where: withTenantWhere(req.tenantId, { id }) });

    res.status(200).json({ msg: "Evento eliminado correctamente" });

    // 🔌 Notificar a todos los clientes sobre la eliminación del evento
    socketService.notifyEventChange("deleted", {
      id: id,
      name: evento.name,
      nom_eve: evento.name,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar evento",
      error: error.message,
    });
  }
};

// Obtener un solo evento por su ID
const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: {
        eventCourse: true,
        eventCareers: {
          include: { career: { select: { name: true, id: true } } },
        },
      },
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // � SUPER DEBUG: Verificar datos del evento específico
    console.log(`🔥 [EVENTO CONTROLLER DEBUG] Evento obtenido por ID:`);
    console.log(`  - name: "${evento.name}"`);
    console.log(`  - type: "${evento.type}"`);
    console.log(
      `  - minAttendancePercent: "${
        evento.minAttendancePercent
      }" (${typeof evento.minAttendancePercent})`
    );
    console.log(`  - eventCourse: ${JSON.stringify(evento.eventCourse)}`);

    if (evento.minAttendancePercent === undefined) {
      console.log(`❌ [EVENTO CONTROLLER DEBUG] minAttendancePercent es UNDEFINED!`);
    } else if (evento.minAttendancePercent === null) {
      console.log(`❌ [EVENTO CONTROLLER DEBUG] minAttendancePercent es NULL!`);
    } else {
      console.log(
        `✅ [EVENTO CONTROLLER DEBUG] minAttendancePercent tiene valor: ${evento.minAttendancePercent}`
      );
    }

    // �🔧 AUTO-CORRECCIÓN DE CUPOS INCONSISTENTES
    // Verificar y corregir cupos disponibles si están mal calculados
    try {
      console.log(`🔄 Verificando cupos para evento ID: ${id}`);

      // Contar inscripciones que ocupan cupo
      const inscripcionesOcupandoCupo = await prisma.registration.count({
        where: withTenantWhere(req.tenantId, {
          eventId: id,
          occupiesSpot: true,
        }),
      });

      const cupoMaximo = evento.maxCapacity;
      const cupoDisponibleActual = evento.availableSpots;
      const cupoDisponibleCorrecto = Math.max(
        0,
        cupoMaximo - inscripcionesOcupandoCupo
      );

      console.log(
        `Cupo actual=${cupoDisponibleActual}, Cupo calculado=${cupoDisponibleCorrecto}`
      );

      // Si hay inconsistencia, corregir automáticamente
      if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
        console.log(`⚠️ Corrigiendo cupo para evento ${evento.name}...`);

        // Actualizar en la base de datos
        await prisma.event.updateMany({
          where: withTenantWhere(req.tenantId, { id }),
          data: { availableSpots: cupoDisponibleCorrecto },
        });

        const eventoCorregido = await prisma.event.findFirst({
          where: withTenantWhere(req.tenantId, { id }),
          include: {
            eventCourse: true,
            eventCareers: {
              include: { career: { select: { name: true, id: true } } },
            },
          },
        });

        // Retornar el evento con los cupos corregidos
        console.log(`🔥 [EVENTO FINAL DEBUG] Enviando evento corregido:`);
        console.log(
          `  - minAttendancePercent: "${
            eventoCorregido.minAttendancePercent
          }" (${typeof eventoCorregido.minAttendancePercent})`
        );
        return res.status(200).json(eventoCorregido);
      }
    } catch (correccionError) {
      console.error("❌ Error en auto-corrección de cupos:", correccionError);
      // Si falla la corrección, continuar con el evento original
    }

    console.log(`🔥 [EVENTO FINAL DEBUG] Enviando evento original:`);
    console.log(
      `  - minAttendancePercent: "${
        evento.minAttendancePercent
      }" (${typeof evento.minAttendancePercent})`
    );
    res.status(200).json(evento);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener el evento",
      error: error.message,
    });
  }
};

const obtenerEventosPorTipo = async (req, res) => {
  try {
    // Extrae el tipo de evento de los parámetros de la ruta
    const { tipo } = req.params;

    // Validar el tipo contra los permitidos
    const tiposValidos = [
      "COURSE",
      "CONGRESS",
      "WEBINAR",
      "TALK",
      "SOCIALIZATION",
    ];
    const tipoNormalizado = normalizeEventType(tipo.toUpperCase());
    if (!tiposValidos.includes(tipoNormalizado)) {
      return res.status(400).json({ msg: "Tipo de evento no válido" });
    } // Busca todos los eventos de ese tipo, ordenados por fecha
    const eventos = await prisma.event.findMany({
      where: withTenantWhere(req.tenantId, { type: tipoNormalizado }),
      orderBy: { startDate: "asc" },
      include: {
        eventCourse: true, // Si quieres incluir datos de curso (serán null si no es CURSO)
        eventCareers: {
          include: { career: { select: { name: true, id: true } } },
        },
      },
    });

    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener eventos por tipo",
      error: error.message,
    });
  }
};

/**
 * Procesa una fecha manteniendo la hora local sin ajustes de zona horaria
 */
/**
 * Analiza una fecha ISO y la convierte a objeto Date UTC
 * Versión simplificada que espera fechas en formato ISO del frontend
 * @param {string|Date} dateInput - Fecha a analizar
 * @returns {Date|null} - Objeto Date o null si la fecha es inválida
 */
function parseUTCDate(dateInput) {
  console.log("📅 parseUTCDate - Input:", dateInput);

  // Si no hay entrada, devolver null
  if (!dateInput) return null;

  try {
    // Si ya es un objeto Date, devolverlo directamente
    if (dateInput instanceof Date) {
      console.log("📅 La entrada ya es un objeto Date");
      return dateInput;
    }

    // Para strings, usar directamente new Date() ya que esperamos formato ISO del frontend
    if (typeof dateInput === "string") {
      const date = new Date(dateInput);

      if (!isNaN(date)) {
        console.log("📅 Fecha parseada exitosamente:", {
          input: dateInput,
          parsed: date.toISOString(),
          utcHours: date.getUTCHours(),
        });
        return date;
      }
    }

    console.log("📅 No se pudo parsear la fecha");
    return null;
  } catch (error) {
    console.error("📅 Error al parsear fecha:", error);
    return null;
  }
}

// Función para verificar y corregir cupos de un evento
const verificarYCorregirCupos = async (req, res) => {
  try {
    const { id } = req.params; // ID del evento a verificar/corregir

    console.log(`⚙️ Iniciando verificación de cupos para evento ID: ${id}`);

    // 1. Verificar que el evento existe
    const evento = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    console.log(`Evento encontrado: ${evento.name}`);
    console.log(`Cupo máximo actual: ${evento.maxCapacity}`);
    console.log(`Cupo disponible actual: ${evento.availableSpots}`);

    // 2. Contar inscripciones en estado ACCEPTED (las que ocupan cupo)
    const inscripcionesAceptadas = await prisma.registration.count({
      where: withTenantWhere(req.tenantId, {
        eventId: id,
        status: "ACCEPTED",
      }),
    });

    console.log(`Inscripciones ACCEPTED: ${inscripcionesAceptadas}`);

    // 3. Calcular el cupo disponible correcto
    const cupoMaximo = evento.maxCapacity;
    const cupoDisponibleActual = evento.availableSpots;
    const cupoDisponibleCorrecto = Math.max(
      0,
      cupoMaximo - inscripcionesAceptadas
    );

    console.log(`Cupo disponible calculado: ${cupoDisponibleCorrecto}`);

    // 4. Verificar si hay inconsistencia
    if (cupoDisponibleActual === cupoDisponibleCorrecto) {
      return res.status(200).json({
        success: true,
        msg: "Los cupos están correctos, no se requiere corrección",
        evento: {
          id: evento.id,
          title: evento.name,
          name: evento.name,
          maxCapacity: cupoMaximo,
          availableSpots: cupoDisponibleActual,
          inscripciones_aceptadas: inscripcionesAceptadas,
        },
      });
    }

    // 5. Corregir la inconsistencia
    await prisma.event.updateMany({
      where: withTenantWhere(req.tenantId, { id }),
      data: { availableSpots: cupoDisponibleCorrecto },
    });

    return res.status(200).json({
      success: true,
      msg: "Cupos corregidos exitosamente",
      detalles: {
        id: evento.id,
        title: evento.name,
        name: evento.name,
        maxCapacity: cupoMaximo,
        availableSpots_anterior: cupoDisponibleActual,
        availableSpots_corregido: cupoDisponibleCorrecto,
        inscripciones_aceptadas: inscripcionesAceptadas,
        diferencia: cupoDisponibleCorrecto - cupoDisponibleActual,
      },
    });
  } catch (error) {
    console.error("Error al verificar y corregir cupos:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al verificar y corregir cupos",
      error: error.message,
    });
  }
};

// Función para verificar y corregir cupos de todos los eventos
const verificarYCorregirTodosLosCupos = async (req, res) => {
  try {
    conditionalCuposLog(
      "🔄 Iniciando verificación de cupos para todos los eventos"
    );

    // 1. Obtener todos los eventos
    const eventos = await prisma.event.findMany({
      where: withTenantWhere(req.tenantId),
    });
    conditionalCuposLog(`Total de eventos encontrados: ${eventos.length}`);

    // 2. Preparar para almacenar resultados
    const resultados = {
      total: eventos.length,
      corregidos: 0,
      correctos: 0,
      detalles: [],
    };

    // 3. Procesar cada evento
    for (const evento of eventos) {
      // Contar inscripciones que ocupan cupo
      const inscripcionesOcupandoCupo = await prisma.registration.count({
        where: withTenantWhere(req.tenantId, {
          eventId: evento.id,
          occupiesSpot: true,
        }),
      });

      // Para comparación, contar también inscripciones aceptadas
      const inscripcionesAceptadas = await prisma.registration.count({
        where: withTenantWhere(req.tenantId, {
          eventId: evento.id,
          status: "ACCEPTED",
        }),
      });

      // Calcular cupo disponible correcto
      const cupoMaximo = evento.maxCapacity;
      const cupoDisponibleActual = evento.availableSpots;
      const cupoDisponibleCorrecto = Math.max(
        0,
        cupoMaximo - inscripcionesOcupandoCupo
      );

      conditionalCuposLog(`Evento ${evento.name}:`);
      conditionalCuposLog(`- Cupo máximo: ${cupoMaximo}`);
      conditionalCuposLog(`- Cupo disponible actual: ${cupoDisponibleActual}`);
      conditionalCuposLog(
        `- Inscripciones ocupando cupo: ${inscripcionesOcupandoCupo}`
      );
      conditionalCuposLog(
        `- Inscripciones en estado ACCEPTED: ${inscripcionesAceptadas}`
      );
      conditionalCuposLog(
        `- Cupo disponible correcto: ${cupoDisponibleCorrecto}`
      );

      // Verificar si hay inconsistencia
      if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
        // Corregir la inconsistencia
        await prisma.event.updateMany({
          where: withTenantWhere(req.tenantId, { id: evento.id }),
          data: { availableSpots: cupoDisponibleCorrecto },
        });

        // Registrar resultado
        resultados.corregidos++;
        resultados.detalles.push({
          id: evento.id,
          title: evento.name,
          name: evento.name,
          maxCapacity: cupoMaximo,
          availableSpots_anterior: cupoDisponibleActual,
          availableSpots_corregido: cupoDisponibleCorrecto,
          inscripciones_ocupando_cupo: inscripcionesOcupandoCupo,
          inscripciones_aceptadas: inscripcionesAceptadas,
          diferencia: cupoDisponibleCorrecto - cupoDisponibleActual,
        });
      } else {
        resultados.correctos++;
      }
    }

    // 4. Devolver resultados
    return res.status(200).json({
      success: true,
      msg: `Verificación de cupos completada. ${resultados.corregidos} eventos corregidos, ${resultados.correctos} eventos correctos.`,
      resultados,
    });
  } catch (error) {
    console.error("Error al verificar y corregir todos los cupos:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al verificar y corregir todos los cupos",
      error: error.message,
    });
  }
};

/**
 * Obtiene todos los eventos destacados activos (máximo 8)
 * @param {Object} req - La solicitud HTTP
 * @param {Object} res - La respuesta HTTP
 * @returns {Promise<void>}
 */
const obtenerEventosDestacados = async (req, res) => {
  try {
    // Verificar eventos pasados para desmarcarlos automáticamente
    await desmarcadoAutomaticoEventosPasados(req.tenantId);

    // Obtener eventos destacados (máximo 8)
    const eventosDestacados = await prisma.event.findMany({
      where: {
        tenantId: req.tenantId,
        isFeatured: true,
        status: "ACTIVE",
      },
      orderBy: {
        startDate: "asc",
      },
      take: 8,
    });

    return res.status(200).json({
      eventosDestacados,
      total: eventosDestacados.length,
      ok: true,
    });
  } catch (error) {
    console.error("Error al obtener eventos destacados:", error);
    return res.status(500).json({
      msg: "Error al obtener eventos destacados",
      error: error.message,
      ok: false,
    });
  }
};

/**
 * Marca o desmarca un evento como destacado
 * @param {Object} req - La solicitud HTTP con id del evento y estado destacado
 * @param {Object} res - La respuesta HTTP
 * @returns {Promise<void>}
 */
const toggleEventoDestacado = async (req, res) => {
  try {
    console.log("=== TOGGLE EVENTO DESTACADO - INICIO ===");
    const { id } = req.params;
    const { eve_des } = req.body;

    console.log("ID recibido:", id);
    console.log("Estado destacado recibido:", eve_des);
    console.log("Params completos:", req.params);
    console.log("Body completo:", req.body);

    // Verificar si el evento existe
    console.log("Buscando evento con ID:", id);
    const eventoExistente = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
      },
    });

    console.log("Evento encontrado:", eventoExistente ? "SÍ" : "NO");

    if (!eventoExistente) {
      console.log("ERROR: Evento no encontrado, retornando 404");
      return res.status(404).json({
        msg: "Evento no encontrado",
        ok: false,
      });
    }

    console.log("Evento existente encontrado:", eventoExistente.name);

    // Evita marcar eventos finalizados/pasados que serán desmarcados automáticamente
    if (eve_des) {
      const ahora = new Date();
      const fechaFin = new Date(eventoExistente.endDate);
      const eventoFinalizado =
        eventoExistente.status === "FINISHED" || fechaFin < ahora;

      if (eventoFinalizado) {
        return res.status(400).json({
          msg: "No se puede destacar un evento finalizado. Selecciona un evento activo o próximo.",
          ok: false,
        });
      }
    }

    // Si vamos a marcar como destacado, verificar límite de 8
    if (eve_des) {
      console.log("Verificando límite de eventos destacados...");
      const totalDestacados = await prisma.event.count({
        where: {
          tenantId: req.tenantId,
          isFeatured: true,
          status: "ACTIVE",
        },
      });

      console.log("Total eventos destacados actuales:", totalDestacados);

      if (totalDestacados >= 8) {
        console.log("ERROR: Límite de eventos destacados alcanzado");
        return res.status(400).json({
          msg: "Ya existen 8 eventos destacados. Debe desmarcar alguno antes de agregar otro.",
          ok: false,
        });
      }
    }

    // Actualizar el evento
    console.log("Actualizando evento con:", { id: id, isFeatured: eve_des });
    await prisma.event.updateMany({
      where: withTenantWhere(req.tenantId, { id }),
      data: { isFeatured: eve_des },
    });

    const eventoActualizado = await prisma.event.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
    });

    console.log("Evento actualizado exitosamente:", eventoActualizado.name);

    // Notificar a todos los clientes mediante socket
    socketService.notifyEventChange("updated", {
      id: eventoActualizado.id,
      tipo: "destacado",
      esDestacado: eve_des,
      evento: eventoActualizado,
    });

    const response = {
      evento: eventoActualizado,
      msg: eve_des
        ? "Evento marcado como destacado"
        : "Evento desmarcado como destacado",
      ok: true,
    };

    console.log("Enviando respuesta:", response);
    console.log("=== TOGGLE EVENTO DESTACADO - FIN EXITOSO ===");
    return res.status(200).json(response);
  } catch (error) {
    console.error("=== ERROR EN TOGGLE EVENTO DESTACADO ===");
    console.error("Error completo:", error);
    console.error("Stack trace:", error.stack);
    console.error("Mensaje:", error.message);
    console.error("=== FIN ERROR ===");
    return res.status(500).json({
      msg: "Error al actualizar evento destacado",
      error: error.message,
      ok: false,
    });
  }
};

/**
 * Desmarca automáticamente eventos pasados (finalizados)
 * @returns {Promise<void>}
 */
const desmarcadoAutomaticoEventosPasados = async (tenantId) => {
  try {
    const fechaActual = new Date();

    // Buscar eventos destacados que ya finalizaron
    const eventosFinalizados = await prisma.event.updateMany({
      where: withTenantWhere(tenantId, {
        isFeatured: true,
        endDate: {
          lt: fechaActual,
        },
      }),
      data: {
        isFeatured: false,
      },
    });

    if (eventosFinalizados.count > 0) {
      console.log(
        `Se desmarcaron automáticamente ${eventosFinalizados.count} eventos destacados que ya finalizaron.`
      );
    }
  } catch (error) {
    console.error("Error en desmarcado automático de eventos:", error);
  }
};

/**
 * Endpoint para verificar manualmente el servicio de estados automáticos
 * Solo para administradores en desarrollo
 */
const verificarEstadosAutomaticos = async (req, res) => {
  try {
    const eventStatusService = require("../services/eventStatusService");

    // Obtener configuración actual del servicio
    const configuracion = eventStatusService.obtenerConfiguracion();

    // Ejecutar manualmente una actualización solo si está habilitado
    if (configuracion.habilitado) {
      await eventStatusService.ejecutarActualizacionEstados();
    }

    // Devolver estado completo de la operación
    res.status(200).json({
      mensaje: configuracion.habilitado
        ? "Verificación de estados automáticos completada"
        : "Servicio deshabilitado - no se ejecutó actualización",
      configuracion: configuracion,
      fechaEjecucion: new Date(),
    });
  } catch (error) {
    console.error("Error al verificar estados automáticos:", error);
    res.status(500).json({
      mensaje: "Error al verificar estados automáticos",
      error: error.message,
    });
  }
};

/**
 * Obtiene eventos para el panel de administración con paginación
 * @param {Object} req - Solicitud HTTP con parámetros de paginación y filtros
 * @param {Object} res - Respuesta HTTP
 */
const obtenerEventosAdminPaginados = async (req, res) => {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    // Extraer filtros
    const {
      search,
      tipoEvento,
      estado,
      fechaInicio,
      fechaFin,
      carrera,
      modalidad,
      capacidadMin,
      capacidadMax,
      valorMin,
      valorMax,
      asistenciaMin,
      esGratuito,
      esPago,
      eventosLlenos,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Construir condición WHERE
    const whereCondition = withTenantWhere(req.tenantId);

    // Filtro por búsqueda (nombre)
    if (search) {
      whereCondition.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento) {
      whereCondition.type = tipoEvento;
    }

    // Filtro por estado
    if (estado) {
      whereCondition.status = estado;
    }

    // Filtro por fecha de inicio
    if (fechaInicio) {
      whereCondition.startDate = {
        gte: new Date(fechaInicio),
      };
    }

    // Filtro por fecha de fin
    if (fechaFin) {
      whereCondition.endDate = {
        lte: new Date(fechaFin),
      };
    }

    // Filtro por modalidad
    if (modalidad) {
      whereCondition.modality = modalidad;
    }

    // Filtro por capacidad mínima
    if (capacidadMin) {
      whereCondition.maxCapacity = {
        gte: parseInt(capacidadMin),
      };
    }

    // Filtro por capacidad máxima
    if (capacidadMax) {
      whereCondition.maxCapacity = {
        lte: parseInt(capacidadMax),
      };
    }

    // Filtro por valor mínimo
    if (valorMin) {
      whereCondition.price = {
        gte: parseFloat(valorMin),
      };
    }

    // Filtro por valor máximo
    if (valorMax) {
      whereCondition.price = {
        lte: parseFloat(valorMax),
      };
    }

    // Filtro por asistencia mínima
    if (asistenciaMin) {
      whereCondition.minAttendancePercent = {
        gte: parseInt(asistenciaMin),
      };
    }

    // Filtro por eventos gratuitos
    if (esGratuito === "true") {
      whereCondition.price = 0;
    }

    // Filtro por eventos de pago
    if (esPago === "true") {
      whereCondition.price = {
        gt: 0,
      };
    }

    // Filtro por eventos llenos o con cupos disponibles
    if (eventosLlenos === "true") {
      whereCondition.availableSpots = 0;
    } else if (eventosLlenos === "false") {
      whereCondition.availableSpots = {
        gt: 0,
      };
    }

    // Filtro por carrera (manejo especial por relación)
    let carreraFilter = undefined;
    if (carrera) {
      if (carrera === "GENERAL") {
        carreraFilter = {
          none: {},
        };
      } else {
        carreraFilter = {
          some: {
            careerId: carrera,
          },
        };
      }
    }

    // Compatibilidad con nombres legacy de columnas de ordenamiento.
    const sortByMap = {
      fec_cre_eve: "createdAt",
      fec_ini_eve: "startDate",
      fec_fin_eve: "endDate",
      nom_eve: "name",
      est_eve: "status",
      tip_eve: "type",
      mod_eve: "modality",
      val_eve: "price",
      cup_max_eve: "maxCapacity",
      cup_dis_eve: "availableSpots",
      por_min_asi_eve: "minAttendancePercent",
      createdAt: "createdAt",
      startDate: "startDate",
      endDate: "endDate",
      name: "name",
      status: "status",
      type: "type",
      modality: "modality",
      price: "price",
      maxCapacity: "maxCapacity",
      availableSpots: "availableSpots",
      minAttendancePercent: "minAttendancePercent",
    };

    const normalizedSortBy = sortByMap[sortBy] || "createdAt";
    const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Configurar ordenamiento
    const orderBy = {};
    orderBy[normalizedSortBy] = normalizedSortOrder;

    // Ejecutar consultas en paralelo
    const [eventos, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: {
          ...whereCondition,
          ...(carreraFilter && { eventCareers: carreraFilter }),
        },
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventCourse: true,
          eventCareers: {
            include: {
              career: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: {
          ...whereCondition,
          ...(carreraFilter && { eventCareers: carreraFilter }),
        },
      }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: eventos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en paginación de eventos admin:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

module.exports = {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventosPorTipo,
  verificarYCorregirCupos,
  verificarYCorregirTodosLosCupos,
  obtenerEventosDestacados,
  toggleEventoDestacado,
  verificarEstadosAutomaticos,
  obtenerEventosAdminPaginados,
};
