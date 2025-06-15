const prisma = require("../config/db");
const DEFAULT_IMAGE_URL = "https://i.imgur.com/f8adUbZ.png";
const axios = require("axios");
const socketService = require("../services/socket.service");
require("dotenv").config();

/**
 * Valida los campos obligatorios y restricciones de un CURSO
 * Lanza un error si hay algún problema, de lo contrario no hace nada.
 */
function validarCurso(not_min_cur) {
  if (not_min_cur === undefined)
    throw new Error("La nota mínima es obligatoria");
  if (not_min_cur < 8 || not_min_cur > 10)
    throw new Error("La nota mínima debe estar entre 8 y 10");
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
    ); // Validar que el porcentaje mínimo de asistencia esté dentro del rango 80-100
  if (por_min_asi_eve === undefined)
    throw new Error("El porcentaje mínimo de asistencia es obligatorio");
  if (por_min_asi_eve < 80 || por_min_asi_eve > 100)
    throw new Error(
      "El porcentaje mínimo de asistencia debe estar entre 80% y 100%"
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
    const {
      nom_eve,
      des_eve,
      tip_eve,
      fec_ini_eve,
      val_eve,
      dur_hor_eve,
      por_min_asi_eve,
      fec_fin_eve,
      mod_eve,
      cup_max_eve,
      not_min_cur,
    } = req.body; // Convertir valores numéricos y fechas antes de validar
    const durHor = Number(dur_hor_eve);
    const porcMinAsi = Number(por_min_asi_eve);
    const valNum = Number(val_eve);
    const cupoMax = Number(cup_max_eve);

    // Convertir fechas a objetos Date en UTC para evitar problemas de zona horaria
    const fechaIni = parseUTCDate(fec_ini_eve);
    const fechaFin = parseUTCDate(fec_fin_eve);

    const notaMin = not_min_cur !== undefined ? Number(not_min_cur) : undefined; // Validaciones generales (debería validar los campos nuevos)
    try {
      validarEventoGeneral({
        nom_eve,
        tip_eve,
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
    if (tip_eve === "CURSO") {
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

    // Procesar las fechas para mantener las horas exactas
    const fechaInicial = parseUTCDate(fec_ini_eve);
    const fechaFinal = parseUTCDate(fec_fin_eve);

    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        tip_eve,
        fec_ini_eve: fechaInicial,
        val_eve: valNum,
        dur_hor_eve: durHor,
        por_min_asi_eve: porcMinAsi,
        fec_fin_eve: fechaFinal,
        mod_eve: mod_eve || "PRESENCIAL", // Usar valor por defecto si no se proporciona
        cup_max_eve: cupoMax,
        cup_dis_eve: cupoMax, // ✅ Inicialmente disponible = máximo
        img_por_eve: imgUrl,
        est_eve: "ACTIVO", // Estado por defecto según nuevo enum
        id_cue_cre_eve: req.usuario.id, // ID de la cuenta creadora
      },
    });

    // Si es CURSO, crear registro en evento_curso con la nota mínima
    let datosCurso = null;
    if (tip_eve === "CURSO" && notaMin !== undefined) {
      datosCurso = await crearEventoCurso(nuevoEvento.id_eve, notaMin);
    }

    // Procesar carreras asociadas
    const esEventoGeneral = req.body.esEventoGeneral === "true";
    const carrerasIds = req.body.carrerasIds
      ? JSON.parse(req.body.carrerasIds)
      : [];

    // Si no es evento general y hay carreras seleccionadas, crear las asociaciones
    if (!esEventoGeneral && carrerasIds.length > 0) {
      await Promise.all(
        carrerasIds.map(async (carreraId) => {
          await prisma.evento_carrera.create({
            data: {
              id_car_aso: carreraId,
              id_eve_aso: nuevoEvento.id_eve,
            },
          });
        })
      );
    }

    res.status(201).json({
      ...nuevoEvento,
      eventos_curso: datosCurso,
    });

    // 🔌 Notificar a todos los clientes sobre el nuevo evento
    socketService.notifyEventChange("created", {
      ...nuevoEvento,
      eventos_curso: datosCurso,
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({
      msg: "Error al crear evento",
      error: error.message,
    });
  }
};

//Crea un registro en evento_curso vinculado a un evento
const crearEventoCurso = async (eventoId, not_min_cur) => {
  return prisma.evento_curso.create({
    data: {
      id_eve_cur: eventoId,
      not_min_cur: Number(not_min_cur),
    },
  });
};

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        eventos_carrera: {
          include: { carrera: { select: { nom_car: true, id_car: true } } },
        },
        eventos_curso: true, // esto ya es objeto o null, no array
      },
      orderBy: { fec_ini_eve: "asc" },
    });

    // 🔧 AUTO-CORRECCIÓN MASIVA DE CUPOS INCONSISTENTES
    // Verificar y corregir cupos disponibles para todos los eventos si están mal calculados
    console.log("🔄 Verificando cupos disponibles para todos los eventos...");

    const eventosCorregidos = await Promise.allSettled(
      eventos.map(async (evento) => {
        try {
          // Contar inscripciones que ocupan cupo
          const inscripcionesOcupandoCupo = await prisma.inscripcion.count({
            where: {
              id_eve_ins: evento.id_eve,
              cup_ocu: true,
            },
          });

          const cupoMaximo = evento.cup_max_eve;
          const cupoDisponibleActual = evento.cup_dis_eve;
          const cupoDisponibleCorrecto = Math.max(
            0,
            cupoMaximo - inscripcionesOcupandoCupo
          );

          console.log(
            `Evento ${evento.nom_eve}: Cupo actual=${cupoDisponibleActual}, Cupo calculado=${cupoDisponibleCorrecto}`
          );

          // Si hay inconsistencia, corregir automáticamente
          if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
            console.log(`⚠️ Corrigiendo cupo para evento ${evento.nom_eve}...`);

            // Actualizar en la base de datos
            const eventoCorregido = await prisma.evento.update({
              where: { id_eve: evento.id_eve },
              data: { cup_dis_eve: cupoDisponibleCorrecto },
            });

            // Retornar el evento con los cupos corregidos
            return {
              ...evento,
              cup_dis_eve: cupoDisponibleCorrecto,
            };
          }

          return evento;
        } catch (error) {
          console.error(
            `❌ Error en auto-corrección de cupos para evento ${evento.id_eve}:`,
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
const camposCurso = ["not_min_cur"];
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

  try {
    // 4. Extrae el ID del evento a actualizar desde los parámetros de la ruta
    const { id } = req.params;

    // 5. Busca el evento en la base de datos; si no existe, devuelve error 404
    const eventoExistente = await prisma.evento.findUnique({
      where: { id_eve: id },
    });
    if (!eventoExistente) {
      return res.status(404).json({ msg: "Evento no encontrado para editar" });
    } // --- GESTIÓN DE IMAGENES --- //
    let imgUrl = eventoExistente.img_por_eve; // Por defecto, se queda la actual

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
        nom_eve: dataEvento.nom_eve ?? eventoExistente.nom_eve,
        tip_eve: dataEvento.tip_eve ?? eventoExistente.tip_eve,
        fec_ini_eve: dataEvento.fec_ini_eve ?? eventoExistente.fec_ini_eve,
        val_eve: dataEvento.val_eve ?? eventoExistente.val_eve,
        dur_hor_eve: dataEvento.dur_hor_eve ?? eventoExistente.dur_hor_eve,
        por_min_asi_eve:
          dataEvento.por_min_asi_eve ?? eventoExistente.por_min_asi_eve,
        fec_fin_eve: dataEvento.fec_fin_eve ?? eventoExistente.fec_fin_eve,
        cup_max_eve: dataEvento.cup_max_eve ?? eventoExistente.cup_max_eve,
      });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    } // 6. Actualiza evento principal
    // Calcular cup_dis_eve si se actualiza cup_max_eve
    let cupoDisponibleActualizado = eventoExistente.cup_dis_eve;
    if (dataEvento.cup_max_eve !== undefined) {
      const nuevoCupoMax = Number(dataEvento.cup_max_eve);
      const cupoMaxAnterior = eventoExistente.cup_max_eve;
      const cupoDisponibleAnterior = eventoExistente.cup_dis_eve;

      // Calcular cuántos cupos están ocupados actualmente
      const cuposOcupados = cupoMaxAnterior - cupoDisponibleAnterior;

      // El nuevo cupo disponible será el nuevo máximo menos los cupos ocupados
      // Pero asegurándonos de que no sea negativo
      cupoDisponibleActualizado = Math.max(0, nuevoCupoMax - cuposOcupados);
    }

    const eventoActualizado = await prisma.evento.update({
      where: { id_eve: id },
      data: {
        ...dataEvento,
        nom_eve: dataEvento.nom_eve || eventoExistente.nom_eve,
        des_eve: dataEvento.des_eve || eventoExistente.des_eve,
        tip_eve: dataEvento.tip_eve || eventoExistente.tip_eve,
        val_eve:
          dataEvento.val_eve !== undefined
            ? Number(dataEvento.val_eve)
            : eventoExistente.val_eve,
        fec_ini_eve: dataEvento.fec_ini_eve
          ? parseUTCDate(dataEvento.fec_ini_eve)
          : eventoExistente.fec_ini_eve,
        fec_fin_eve: dataEvento.fec_fin_eve
          ? parseUTCDate(dataEvento.fec_fin_eve)
          : eventoExistente.fec_fin_eve,
        dur_hor_eve:
          dataEvento.dur_hor_eve !== undefined
            ? Number(dataEvento.dur_hor_eve)
            : eventoExistente.dur_hor_eve,
        por_min_asi_eve:
          dataEvento.por_min_asi_eve !== undefined
            ? Number(dataEvento.por_min_asi_eve)
            : eventoExistente.por_min_asi_eve,
        cup_max_eve:
          dataEvento.cup_max_eve !== undefined
            ? Number(dataEvento.cup_max_eve)
            : eventoExistente.cup_max_eve,
        cup_dis_eve: cupoDisponibleActualizado,
        est_eve: dataEvento.est_eve || eventoExistente.est_eve,
        img_por_eve: imgUrl,
      },
    });

    // Verifica si el evento ANTES era CURSO y AHORA ya NO lo es
    if (
      eventoExistente.tip_eve === "CURSO" &&
      eventoActualizado.tip_eve !== "CURSO"
    ) {
      // Elimina el registro de evento_curso si existe
      await prisma.evento_curso.deleteMany({
        where: { id_eve_cur: id },
      });
    }

    // 6.1. Si el evento es de tipo CURSO y hay datos de curso para actualizar...
    let cursoActualizado = null; // Inicializa como null para evitar errores si no es CURSO
    if (
      eventoActualizado.tip_eve === "CURSO" &&
      Object.keys(dataCurso).length > 0
    ) {
      // 6.1.1. Busca los datos actuales del curso (evento_curso) relacionados a ese evento

      let cursoBD = await prisma.evento_curso.findUnique({
        where: { id_eve_cur: id },
      });

      // 7. Valida los datos (los nuevos o los actuales si no vienen en el body)
      try {
        validarCurso(
          Number(dataCurso.not_min_cur ?? (cursoBD && cursoBD.not_min_cur))
        );
      } catch (e) {
        // 8. Si no pasa la validación, devuelve un error 400 con el mensaje
        return res.status(400).json({ msg: e.message });
      }

      if (cursoBD) {
        // Si existe, actualiza
        cursoActualizado = await prisma.evento_curso.update({
          where: { id_eve_cur: id },
          data: {
            not_min_cur:
              dataCurso.not_min_cur !== undefined
                ? Number(dataCurso.not_min_cur)
                : cursoBD.not_min_cur,
          },
        });
      } else {
        // Si NO existe, CREA evento_curso
        cursoActualizado = await prisma.evento_curso.create({
          data: {
            id_eve_cur: id,
            not_min_cur: Number(dataCurso.not_min_cur),
          },
        });
      }
    }

    // Actualizar carreras asociadas
    const esEventoGeneral = req.body.esEventoGeneral === "true";
    const carrerasIds = req.body.carrerasIds
      ? JSON.parse(req.body.carrerasIds)
      : [];

    // Eliminar todas las asociaciones existentes
    await prisma.evento_carrera.deleteMany({
      where: { id_eve_aso: id },
    });

    // Si no es evento general y hay carreras seleccionadas, crear nuevas asociaciones
    if (!esEventoGeneral && carrerasIds.length > 0) {
      await Promise.all(
        carrerasIds.map(async (carreraId) => {
          await prisma.evento_carrera.create({
            data: {
              id_car_aso: carreraId,
              id_eve_aso: id,
            },
          });
        })
      );
    }

    // 9. Si todo está OK, actualiza los datos del curso en evento_curso
    res.status(200).json({
      ...eventoActualizado,
      eventos_curso: cursoActualizado,
    });

    // 🔌 Notificar a todos los clientes sobre la actualización del evento
    socketService.notifyEventChange("updated", {
      ...eventoActualizado,
      eventos_curso: cursoActualizado,
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
    const evento = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    } // 2. Si el evento es CURSO, elimina primero el registro en evento_curso
    if (evento.tip_eve === "CURSO") {
      await prisma.evento_curso.deleteMany({ where: { id_eve_cur: id } });
      // (Usamos deleteMany por si acaso, aunque debería haber solo uno)
    }

    // Eliminar todas las relaciones evento-carrera
    await prisma.evento_carrera.deleteMany({ where: { id_eve_aso: id } });

    // 3. Elimina el evento
    await prisma.evento.delete({ where: { id_eve: id } });

    res.status(200).json({ msg: "Evento eliminado correctamente" });

    // 🔌 Notificar a todos los clientes sobre la eliminación del evento
    socketService.notifyEventChange("deleted", {
      id_eve: id,
      nom_eve: evento.nom_eve,
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

    const evento = await prisma.evento.findUnique({
      where: { id_eve: id },
      include: {
        eventos_curso: true,
        eventos_carrera: {
          include: { carrera: { select: { nom_car: true, id_car: true } } },
        },
      },
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    // 🔧 AUTO-CORRECCIÓN DE CUPOS INCONSISTENTES
    // Verificar y corregir cupos disponibles si están mal calculados
    try {
      console.log(`🔄 Verificando cupos para evento ID: ${id}`);

      // Contar inscripciones que ocupan cupo
      const inscripcionesOcupandoCupo = await prisma.inscripcion.count({
        where: {
          id_eve_ins: id,
          cup_ocu: true,
        },
      });

      const cupoMaximo = evento.cup_max_eve;
      const cupoDisponibleActual = evento.cup_dis_eve;
      const cupoDisponibleCorrecto = Math.max(
        0,
        cupoMaximo - inscripcionesOcupandoCupo
      );

      console.log(
        `Cupo actual=${cupoDisponibleActual}, Cupo calculado=${cupoDisponibleCorrecto}`
      );

      // Si hay inconsistencia, corregir automáticamente
      if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
        console.log(`⚠️ Corrigiendo cupo para evento ${evento.nom_eve}...`);

        // Actualizar en la base de datos
        const eventoCorregido = await prisma.evento.update({
          where: { id_eve: id },
          data: { cup_dis_eve: cupoDisponibleCorrecto },
          include: {
            eventos_curso: true,
            eventos_carrera: {
              include: { carrera: { select: { nom_car: true, id_car: true } } },
            },
          },
        });

        // Retornar el evento con los cupos corregidos
        return res.status(200).json(eventoCorregido);
      }
    } catch (correccionError) {
      console.error("❌ Error en auto-corrección de cupos:", correccionError);
      // Si falla la corrección, continuar con el evento original
    }

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
      "CURSO",
      "CONGRESO",
      "WEBINAR",
      "CHARLA",
      "SOCIALIZACION",
      "PUBLICO",
    ];
    if (!tiposValidos.includes(tipo.toUpperCase())) {
      return res.status(400).json({ msg: "Tipo de evento no válido" });
    } // Busca todos los eventos de ese tipo, ordenados por fecha
    const eventos = await prisma.evento.findMany({
      where: { tip_eve: tipo.toUpperCase() },
      orderBy: { fec_ini_eve: "asc" },
      include: {
        eventos_curso: true, // Si quieres incluir datos de curso (serán null si no es CURSO)
        eventos_carrera: {
          include: { carrera: { select: { nom_car: true, id_car: true } } },
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
 * Analiza una fecha en cualquier formato y la convierte a objeto Date
 * Maneja múltiples formatos de entrada: objeto Date, string ISO, string con formato personalizado
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

    // Si es un string, intentar procesarlo
    if (typeof dateInput === "string") {
      // Si es formato ISO completo (con Z al final)
      if (dateInput.endsWith("Z")) {
        console.log("📅 Procesando fecha en formato ISO completo con Z");
        const date = new Date(dateInput);
        return isNaN(date) ? null : date;
      }

      // Si tiene formato ISO pero sin Z (YYYY-MM-DDTHH:mm:ss)
      if (dateInput.includes("T")) {
        const [datePart, timePart] = dateInput.split("T");
        console.log("📅 Partes de la fecha ISO sin Z:", { datePart, timePart });

        const [year, month, day] = datePart
          .split("-")
          .map((num) => parseInt(num));
        let hours = 0,
          minutes = 0,
          seconds = 0;

        if (timePart) {
          const timeParts = timePart.split(":");
          hours = parseInt(timeParts[0] || 0);
          minutes = parseInt(timeParts[1] || 0);
          seconds = parseInt(timeParts[2] || 0);
        }

        console.log("📅 Componentes desglosados:", {
          year,
          month,
          day,
          hours,
          minutes,
          seconds,
        });

        // Crear fecha en UTC para mantener consistencia
        const date = new Date(
          Date.UTC(year, month - 1, day, hours, minutes, seconds)
        );
        return isNaN(date) ? null : date;
      }

      // Si solo tiene formato de fecha (YYYY-MM-DD)
      if (dateInput.includes("-") && !dateInput.includes("T")) {
        console.log("📅 Procesando fecha simple sin hora");
        const [year, month, day] = dateInput
          .split("-")
          .map((num) => parseInt(num));
        const date = new Date(Date.UTC(year, month - 1, day));
        return isNaN(date) ? null : date;
      }
    }

    // En cualquier otro caso, intentar crear un objeto Date estándar
    console.log("📅 Intentando parsear con constructor Date estándar");
    const date = new Date(dateInput);

    // Registrar resultado
    if (!isNaN(date)) {
      console.log("📅 Fecha resultante:", {
        localDate: date.toLocaleString(),
        isoString: date.toISOString(),
        utcHours: date.getUTCHours(),
      });
      return date;
    }

    console.log("📅 No se pudo parsear la fecha");
    return null;
  } catch (error) {
    console.error("Error al parsear fecha:", error);
    return null;
  }
}

// Función para verificar y corregir cupos de un evento
const verificarYCorregirCupos = async (req, res) => {
  try {
    const { id } = req.params; // ID del evento a verificar/corregir

    console.log(`⚙️ Iniciando verificación de cupos para evento ID: ${id}`);

    // 1. Verificar que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id_eve: id },
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    console.log(`Evento encontrado: ${evento.nom_eve}`);
    console.log(`Cupo máximo actual: ${evento.cup_max_eve}`);
    console.log(`Cupo disponible actual: ${evento.cup_dis_eve}`);

    // 2. Contar inscripciones en estado ACEPTADA (las que ocupan cupo)
    const inscripcionesAceptadas = await prisma.inscripcion.count({
      where: {
        id_eve_ins: id,
        est_ins: "ACEPTADA",
      },
    });

    console.log(`Inscripciones ACEPTADAS: ${inscripcionesAceptadas}`);

    // 3. Calcular el cupo disponible correcto
    const cupoMaximo = evento.cup_max_eve;
    const cupoDisponibleActual = evento.cup_dis_eve;
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
          id_eve: evento.id_eve,
          nom_eve: evento.nom_eve,
          cup_max_eve: cupoMaximo,
          cup_dis_eve: cupoDisponibleActual,
          inscripciones_aceptadas: inscripcionesAceptadas,
        },
      });
    }

    // 5. Corregir la inconsistencia
    const eventoCorregido = await prisma.evento.update({
      where: { id_eve: id },
      data: { cup_dis_eve: cupoDisponibleCorrecto },
    });

    // 6. Registrar en la consola y devolver respuesta
    console.log(`✅ Cupos corregidos para evento: ${evento.nom_eve}`);
    console.log(`   Cupo disponible anterior: ${cupoDisponibleActual}`);
    console.log(`   Cupo disponible corregido: ${cupoDisponibleCorrecto}`);

    return res.status(200).json({
      success: true,
      msg: "Cupos corregidos exitosamente",
      detalles: {
        id_eve: evento.id_eve,
        nom_eve: evento.nom_eve,
        cup_max_eve: cupoMaximo,
        cup_dis_eve_anterior: cupoDisponibleActual,
        cup_dis_eve_corregido: cupoDisponibleCorrecto,
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
    console.log("🔄 Iniciando verificación de cupos para todos los eventos");

    // 1. Obtener todos los eventos
    const eventos = await prisma.evento.findMany();
    console.log(`Total de eventos encontrados: ${eventos.length}`);

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
      const inscripcionesOcupandoCupo = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          cup_ocu: true,
        },
      });

      // Para comparación, contar también inscripciones aceptadas
      const inscripcionesAceptadas = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          est_ins: "ACEPTADA",
        },
      });

      // Calcular cupo disponible correcto
      const cupoMaximo = evento.cup_max_eve;
      const cupoDisponibleActual = evento.cup_dis_eve;
      const cupoDisponibleCorrecto = Math.max(
        0,
        cupoMaximo - inscripcionesOcupandoCupo
      );

      console.log(`Evento ${evento.nom_eve}:`);
      console.log(`- Cupo máximo: ${cupoMaximo}`);
      console.log(`- Cupo disponible actual: ${cupoDisponibleActual}`);
      console.log(
        `- Inscripciones ocupando cupo: ${inscripcionesOcupandoCupo}`
      );
      console.log(
        `- Inscripciones en estado ACEPTADA: ${inscripcionesAceptadas}`
      );
      console.log(`- Cupo disponible correcto: ${cupoDisponibleCorrecto}`);

      // Verificar si hay inconsistencia
      if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
        // Corregir la inconsistencia
        await prisma.evento.update({
          where: { id_eve: evento.id_eve },
          data: { cup_dis_eve: cupoDisponibleCorrecto },
        });

        // Registrar resultado
        resultados.corregidos++;
        resultados.detalles.push({
          id_eve: evento.id_eve,
          nom_eve: evento.nom_eve,
          cup_max_eve: cupoMaximo,
          cup_dis_eve_anterior: cupoDisponibleActual,
          cup_dis_eve_corregido: cupoDisponibleCorrecto,
          inscripciones_ocupando_cupo: inscripcionesOcupandoCupo,
          inscripciones_aceptadas: inscripcionesAceptadas,
          diferencia: cupoDisponibleCorrecto - cupoDisponibleActual,
        });

        console.log(`✅ Cupos corregidos para evento: ${evento.nom_eve}`);
        console.log(`   Cupo disponible anterior: ${cupoDisponibleActual}`);
        console.log(`   Cupo disponible corregido: ${cupoDisponibleCorrecto}`);
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
    await desmarcadoAutomaticoEventosPasados();

    // Obtener eventos destacados (máximo 8)
    const eventosDestacados = await prisma.evento.findMany({
      where: {
        eve_des: true,
        est_eve: "ACTIVO",
      },
      orderBy: {
        fec_ini_eve: "asc",
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
    const eventoExistente = await prisma.evento.findUnique({
      where: { id_eve: id },
    });

    console.log("Evento encontrado:", eventoExistente ? "SÍ" : "NO");

    if (!eventoExistente) {
      console.log("ERROR: Evento no encontrado, retornando 404");
      return res.status(404).json({
        msg: "Evento no encontrado",
        ok: false,
      });
    }

    console.log("Evento existente encontrado:", eventoExistente.nom_eve);

    // Si vamos a marcar como destacado, verificar límite de 8
    if (eve_des) {
      console.log("Verificando límite de eventos destacados...");
      const totalDestacados = await prisma.evento.count({
        where: { eve_des: true },
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
    console.log("Actualizando evento con:", { id_eve: id, eve_des });
    const eventoActualizado = await prisma.evento.update({
      where: { id_eve: id },
      data: { eve_des },
    });

    console.log("Evento actualizado exitosamente:", eventoActualizado.nom_eve);

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
const desmarcadoAutomaticoEventosPasados = async () => {
  try {
    const fechaActual = new Date();

    // Buscar eventos destacados que ya finalizaron
    const eventosFinalizados = await prisma.evento.updateMany({
      where: {
        eve_des: true,
        fec_fin_eve: {
          lt: fechaActual,
        },
      },
      data: {
        eve_des: false,
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
};
