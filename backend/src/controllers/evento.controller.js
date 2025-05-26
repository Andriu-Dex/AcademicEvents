const prisma = require("../config/db");
const DEFAULT_IMAGE_URL = "https://gllerena-academicevents.s3.us-east-2.amazonaws.com/event_images/Screenshot+2025-05-26+005008.png";
const axios = require("axios");
require("dotenv").config();

/**
 * Valida los campos obligatorios y restricciones de un CURSO
 * Lanza un error si hay algún problema, de lo contrario no hace nada.
 */
function validarCurso(dur_hor_cur, not_min_cur, por_min_asi_cur, fec_ini_eve, fec_fin_cur) {
  if (dur_hor_cur === undefined)
    throw new Error("La duración del curso es obligatoria");
  if (not_min_cur === undefined)
    throw new Error("La nota mínima es obligatoria");
  if (por_min_asi_cur === undefined)
    throw new Error("El porcentaje mínimo de asistencia es obligatorio");
  if (dur_hor_cur <= 0)
    throw new Error("La duración del curso debe ser mayor a 0");
  if (not_min_cur < 8 || not_min_cur > 10)
    throw new Error("La nota mínima debe estar entre 8 y 10");
  if (por_min_asi_cur < 80 || por_min_asi_cur > 100)
    throw new Error("El porcentaje mínimo de asistencia debe estar entre 80% y 100%");
  if (!fec_fin_cur) throw new Error("La fecha de fin es obligatoria");
  if (!fec_ini_eve) throw new Error("La fecha de inicio es obligatoria");
  // Validar que la fecha de inicio sea mañana o posterior
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Ignora hora, solo compara fechas
  const fechaInicio = new Date(fec_ini_eve);
  fechaInicio.setHours(0, 0, 0, 0);
  if (fechaInicio <= hoy) {
    throw new Error("La fecha de inicio debe ser a partir de mañana");
  }
}
/**
 * Valida los campos obligatorios y restricciones de un evento en general
 * Lanza un error si hay algún problema, de lo contrario no hace nada.
 */
function validarEventoGeneral({ nom_eve, tip_eve, fec_ini_eve, val_eve }) {
  if (!nom_eve) throw new Error("El nombre del evento es obligatorio");
  if (!tip_eve) throw new Error("El tipo de evento es obligatorio");
  if (!fec_ini_eve) throw new Error("La fecha de inicio es obligatoria");
  const valorNum = Number(val_eve);
  if (isNaN(valorNum)) throw new Error("El valor del evento no es un número válido");
  if (isNaN(new Date(fec_ini_eve)))
    throw new Error("Fecha inválida");
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
    const { nom_eve, des_eve, tip_eve, fec_ini_eve, val_eve,
      // Específicos para CURSO:
      dur_hor_cur, not_min_cur, por_min_asi_cur, fec_fin_cur,
    } = req.body;

    // Validaciones generales
    try {
      validarEventoGeneral({ nom_eve, tip_eve, fec_ini_eve, val_eve });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }

    // Validaciones específicas para curso
    if (tip_eve === "CURSO") {
      try {
        validarCurso(dur_hor_cur, not_min_cur, por_min_asi_cur, fec_ini_eve, fec_fin_cur);
      } catch (e) {
        return res.status(400).json({ msg: e.message });
      }
    }

    // Si no hay archivo subido, usar la imagen por defecto
    let imgUrl = DEFAULT_IMAGE_URL;
    if (req.file) {
      imgUrl = await subirImagenAImgur(req.file.buffer);
    }

    const valorNum = Number(val_eve);
    // Creación del evento
    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        tip_eve,
        fec_ini_eve: new Date(fec_ini_eve),
        val_eve: valorNum,
        img_por_eve: imgUrl, // URL de la imagen subida a S3 
      },
    });

    // Si es CURSO, crea evento_curso
    let datosCurso = null;
    if (tip_eve === "CURSO") {
      datosCurso = await crearEventoCurso(
        nuevoEvento.id_eve, dur_hor_cur, not_min_cur, por_min_asi_cur, fec_fin_cur);
    }

    res.status(201).json({
      ...nuevoEvento, eventos_curso: datosCurso,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear evento", error: error.message,
    });
    console.error("Error al crear evento:", error);
  }
};

//Crea un registro en evento_curso vinculado a un evento
const crearEventoCurso = async (eventoId, dur_hor_cur, not_min_cur, por_min_asi_cur, fec_fin_cur) => {
  return prisma.evento_curso.create({
    data: {
      id_eve_cur: eventoId,
      dur_hor_cur: Number(dur_hor_cur),
      not_min_cur: Number(not_min_cur),
      por_min_asi_cur: Number(por_min_asi_cur),
      fec_fin_cur: new Date(fec_fin_cur)
    },
  });
};

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        eventos_carrera: {
          include: { carrera: { select: { nom_car: true, id_car: true } } }
        },
        eventos_curso: true // esto ya es objeto o null, no array
      },
      orderBy: { fec_ini_eve: "asc" }
    });

    // ¡NO transformes nada, solo devuelve!
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener eventos", error: error.message,
    });
  }
};

// Actualizar un evento por ID

// 1. Campos permitidos para cada tabla (evento y curso)
const camposEvento = [
  "nom_eve", "des_eve", "tip_eve", "fec_ini_eve", "val_eve", "est_eve"
];
const camposCurso = [
  "dur_hor_cur", "not_min_cur", "por_min_asi_cur", "fec_fin_cur"
];
// 2. Función principal para actualizar un evento
const actualizarEvento = async (req, res) => {
  // 3. Extrae solo los campos de evento presentes en el body y que están permitidos
  const dataEvento = Object.fromEntries( // Extraer campos específicos del evento
    Object.entries(req.body).filter(([key]) => camposEvento.includes(key))
  );
  // 3.1. Extrae solo los campos de curso presentes en el body y que están permitidos
  const dataCurso = Object.fromEntries( // Extraer campos específicos del curso
    Object.entries(req.body).filter(([key]) => camposCurso.includes(key))
  );

  try {
    // 4. Extrae el ID del evento a actualizar desde los parámetros de la ruta
    const { id } = req.params;

    // 5. Busca el evento en la base de datos; si no existe, devuelve error 404
    const eventoExistente = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!eventoExistente) {
      return res.status(404).json({ msg: "Evento no encontrado para editar" });
    }

    // --- GESTIÓN DE IMAGENES --- //
    let imgUrl = eventoExistente.img_por_eve; // Por defecto, se queda la actual

    if (req.file) {
      imgUrl = await subirImagenAImgur(req.file.buffer);
    }

    console.log("-> DATA EVENTO:", dataEvento);
    console.log("-> DATA CURSO:", dataCurso);
    console.log("-> Imagen final:", imgUrl);
    console.log("-> Evento encontrado:", eventoExistente);

    // 5.1. Valida los campos generales usando los nuevos valores o los existentes
    try {
      validarEventoGeneral({
        nom_eve: dataEvento.nom_eve ?? eventoExistente.nom_eve,
        tip_eve: dataEvento.tip_eve ?? eventoExistente.tip_eve,
        fec_ini_eve: dataEvento.fec_ini_eve ?? eventoExistente.fec_ini_eve,
        val_eve: dataEvento.val_eve ?? eventoExistente.val_eve,
      });
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }

    // 6. Actualiza evento principal
    const eventoActualizado = await prisma.evento.update({
      where: { id_eve: id },
      data: {
        ...dataEvento,
        val_eve: dataEvento.val_eve !== undefined ? Number(dataEvento.val_eve) : eventoExistente.val_eve,
        fec_ini_eve: dataEvento.fec_ini_eve ? new Date(dataEvento.fec_ini_eve) : eventoExistente.fec_ini_eve,
        img_por_eve: imgUrl
      }
    });

    // Verifica si el evento ANTES era CURSO y AHORA ya NO lo es
    if (
      eventoExistente.tip_eve === "CURSO" &&
      eventoActualizado.tip_eve !== "CURSO"
    ) {
      // Elimina el registro de evento_curso si existe
      await prisma.evento_curso.deleteMany({
        where: { id_eve_cur: id }
      });
    }

    // 6.1. Si el evento es de tipo CURSO y hay datos de curso para actualizar...
    let cursoActualizado = null; // Inicializa como null para evitar errores si no es CURSO
    if (eventoActualizado.tip_eve === "CURSO" && Object.keys(dataCurso).length > 0) {
      // 6.1.1. Busca los datos actuales del curso (evento_curso) relacionados a ese evento

      let cursoBD = await prisma.evento_curso.findUnique({
        where: { id_eve_cur: id }
      });

      // 7. Valida los datos (los nuevos o los actuales si no vienen en el body)
      try {
        validarCurso(
          Number(dataCurso.dur_hor_cur ?? (cursoBD && cursoBD.dur_hor_cur)),
          Number(dataCurso.not_min_cur ?? (cursoBD && cursoBD.not_min_cur)),
          Number(dataCurso.por_min_asi_cur ?? (cursoBD && cursoBD.por_min_asi_cur)),
          dataEvento.fec_ini_eve ?? eventoExistente.fec_ini_eve,
          dataCurso.fec_fin_cur ?? (cursoBD && cursoBD.fec_fin_cur)
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
            fec_fin_cur: dataCurso.fec_fin_cur ? new Date(dataCurso.fec_fin_cur) : cursoBD.fec_fin_cur,
            dur_hor_cur: dataCurso.dur_hor_cur !== undefined ? Number(dataCurso.dur_hor_cur) : cursoBD.dur_hor_cur,
            not_min_cur: dataCurso.not_min_cur !== undefined ? Number(dataCurso.not_min_cur) : cursoBD.not_min_cur,
            por_min_asi_cur: dataCurso.por_min_asi_cur !== undefined ? Number(dataCurso.por_min_asi_cur) : cursoBD.por_min_asi_cur,
          }
        });
      } else {
        // Si NO existe, CREA evento_curso
        cursoActualizado = await prisma.evento_curso.create({
          data: {
            id_eve_cur: id,
            dur_hor_cur: Number(dataCurso.dur_hor_cur),
            not_min_cur: Number(dataCurso.not_min_cur),
            por_min_asi_cur: Number(dataCurso.por_min_asi_cur),
            fec_fin_cur: new Date(dataCurso.fec_fin_cur)
          }
        });
      }
    }
    // 9. Si todo está OK, actualiza los datos del curso en evento_curso
    res.status(200).json({
      ...eventoActualizado,
      eventos_curso: cursoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar evento:", error.message);
    if (req.file && req.file.location) {
      const key = req.file.location.split(".com/")[1];
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        }).promise();
      } catch (err) {
      }
    }
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
    }

    // 2. Si el evento es CURSO, elimina primero el registro en evento_curso
    if (evento.tip_eve === "CURSO") {
      await prisma.evento_curso.deleteMany({ where: { id_eve_cur: id } });
      // (Usamos deleteMany por si acaso, aunque debería haber solo uno)
    }

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
      "CURSO", "CONGRESO", "WEBINAR", "CHARLA", "SOCIALIZACION", "PUBLICO"
    ];
    if (!tiposValidos.includes(tipo.toUpperCase())) {
      return res.status(400).json({ msg: "Tipo de evento no válido" });
    }

    // Busca todos los eventos de ese tipo, ordenados por fecha
    const eventos = await prisma.evento.findMany({
      where: { tip_eve: tipo.toUpperCase() },
      orderBy: { fec_ini_eve: "asc" },
      include: {
        eventos_curso: true // Si quieres incluir datos de curso (serán null si no es CURSO)
      }
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
