const prisma = require("../config/db");
const DEFAULT_IMAGE_URL = "https://i.imgur.com/f8adUbZ.png";
const axios = require("axios");
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
    );
  // Validar que la fecha de fin esté presente
  if (!fec_fin_eve) throw new Error("La fecha de fin es obligatoria");
  // Validar que la fecha de inicio no sea posterior a la fecha de fin
  const fechaInicio = new Date(fec_ini_eve);
  const fechaFin = new Date(fec_fin_eve);
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
async function subirImagenAImgur(buffer) {
  const imagenBase64 = buffer.toString("base64"); // Convierte buffer a base64

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
      not_min_cur,
    } = req.body;

    // Convertir valores numéricos y fechas antes de validar
    const durHor = Number(dur_hor_eve);
    const porcMinAsi = Number(por_min_asi_eve);
    const valNum = Number(val_eve);
    const fechaIni = new Date(fec_ini_eve);
    const fechaFin = new Date(fec_fin_eve);
    const notaMin = not_min_cur !== undefined ? Number(not_min_cur) : undefined;

    // Validaciones generales (debería validar los campos nuevos)
    try {
      validarEventoGeneral({
        nom_eve,
        tip_eve,
        fec_ini_eve: fechaIni,
        val_eve: valNum,
        dur_hor_eve: durHor,
        por_min_asi_eve: porcMinAsi,
        fec_fin_eve: fechaFin,
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
      imgUrl = await subirImagenAImgur(req.file.buffer);
    } // Crear evento en la base de datos
    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        tip_eve,
        fec_ini_eve: fechaIni,
        val_eve: valNum,
        dur_hor_eve: durHor,
        por_min_asi_eve: porcMinAsi,
        fec_fin_eve: fechaFin,
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

    // ¡NO transformes nada, solo devuelve!
    res.status(200).json(eventos);
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
    }

    // --- GESTIÓN DE IMAGENES --- //
    let imgUrl = eventoExistente.img_por_eve; // Por defecto, se queda la actual

    if (req.file) {
      imgUrl = await subirImagenAImgur(req.file.buffer);
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
      });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    } // 6. Actualiza evento principal
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
          ? new Date(dataEvento.fec_ini_eve)
          : eventoExistente.fec_ini_eve,
        fec_fin_eve: dataEvento.fec_fin_eve
          ? new Date(dataEvento.fec_fin_eve)
          : eventoExistente.fec_fin_eve,
        dur_hor_eve:
          dataEvento.dur_hor_eve !== undefined
            ? Number(dataEvento.dur_hor_eve)
            : eventoExistente.dur_hor_eve,
        por_min_asi_eve:
          dataEvento.por_min_asi_eve !== undefined
            ? Number(dataEvento.por_min_asi_eve)
            : eventoExistente.por_min_asi_eve,
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
      },
    });

    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
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
    }

    // Busca todos los eventos de ese tipo, ordenados por fecha
    const eventos = await prisma.evento.findMany({
      where: { tip_eve: tipo.toUpperCase() },
      orderBy: { fec_ini_eve: "asc" },
      include: {
        eventos_curso: true, // Si quieres incluir datos de curso (serán null si no es CURSO)
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

module.exports = {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventosPorTipo,
};
