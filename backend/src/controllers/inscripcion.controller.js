const prisma = require("../config/db");

// Mmanejo de errores de multer
const manejarErroresDeMulter = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        msg: "El archivo excede el tamaño máximo permitido (5 MB)",
      });
    }

    if (err.message.includes("Solo se permiten archivos")) {
      return res.status(400).json({ msg: err.message });
    }

    // Otro error desconocido de multer
    return res.status(400).json({ msg: "Error al subir archivo" });
  }

  next();
};

// ==========================================
// Crear inscripción a un evento académico
// ==========================================
const crearInscripcion = async (req, res) => {
  try {
    const { id_usu, id_eve } = req.body;
    const archivo = req.file;

    if (!id_usu || !id_eve) {
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios: id_usu o id_eve" });
    }

    if (!archivo) {
      return res
        .status(400)
        .json({ msg: "Debe adjuntar un archivo PDF o imagen válida" });
    }

    // Validar tipo de archivo
    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return res.status(400).json({
        msg: "Tipo de archivo no permitido. Solo se aceptan PDF o imágenes (JPG, PNG, WEBP)",
      });
    }

    // Validar tamaño del archivo (máximo 5 MB)
    const tamMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamMaximo) {
      return res.status(400).json({
        msg: "El archivo excede el tamaño máximo permitido (5 MB)",
      });
    }

    const usuario = await prisma.usuario.findUnique({ where: { id_usu } });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const evento = await prisma.evento.findUnique({ where: { id_eve } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

    const yaInscrito = await prisma.inscripcion.findFirst({
      where: { id_usu, id_eve },
    });

    if (yaInscrito) {
      return res.status(400).json({ msg: "Ya estás inscrito en este evento" });
    }

    try {
      const nuevaInscripcion = await prisma.inscripcion.create({
        data: {
          id_usu,
          id_eve,
          comprobante: archivo.filename,
          estado: "PENDIENTE",
        },
      });

      res.status(201).json(nuevaInscripcion);
    } catch (error) {
      if (
        error.code === "P2002" &&
        error.meta?.target?.includes("id_usu_id_eve")
      ) {
        return res.status(400).json({
          msg: "Ya existe una inscripción para este evento con este usuario",
        });
      }

      // Otro tipo de error desconocido
      throw error;
    }

    res.status(201).json(nuevaInscripcion);
  } catch (error) {
    console.error("Error en crearInscripcion:", error);
    res.status(500).json({
      msg: "Error al inscribirse al evento",
      error: error.message,
    });
  }
};

// ==============================
// Validar inscripción (admin)
// ==============================
const validarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, asistencia, nota_final } = req.body;

    const estadosPermitidos = [
      "PENDIENTE",
      "ACEPTADA",
      "RECHAZADA",
      "FINALIZADA",
    ];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido" });
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Si el evento es un CURSO, validar nota y asistencia
    if (inscripcion.evento.tip_eve === "CURSO") {
      if (
        typeof asistencia !== "number" ||
        asistencia < 0 ||
        asistencia > 100
      ) {
        return res.status(400).json({ msg: "Asistencia inválida (0–100)" });
      }

      if (typeof nota_final !== "number" || nota_final < 0 || nota_final > 10) {
        return res.status(400).json({ msg: "Nota inválida (0–10)" });
      }

      // Si se intenta finalizar, validar requisitos académicos
      if (estado === "FINALIZADA") {
        const notaMinima = inscripcion.evento.nota_min_eve ?? 8;
        const asistenciaMinima = inscripcion.evento.por_asist_eve ?? 80;

        if (nota_final < notaMinima || asistencia < asistenciaMinima) {
          return res.status(400).json({
            msg: `No cumple requisitos para finalizar: nota mínima ${notaMinima}, asistencia mínima ${asistenciaMinima}%`,
          });
        }
      }
    }

    // Actualizar inscripción con los datos
    const actualizada = await prisma.inscripcion.update({
      where: { id_ins: id },
      data: {
        estado,
        asistencia,
        nota_final,
      },
    });

    res.status(200).json({
      msg: "Inscripción actualizada correctamente",
      inscripcion: actualizada,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al validar inscripción",
      error: error.message,
    });
  }
};

// ===================================================
// Obtener todas las inscripciones de un usuario dado
// ===================================================
const obtenerInscripcionesPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripciones = await prisma.inscripcion.findMany({
      where: { id_usu: id },
      include: {
        evento: {
          include: { carrera: true },
        },
      },
      orderBy: { fec_ins: "desc" },
    });

    res.status(200).json(inscripciones);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener inscripciones del usuario",
      error: error.message,
    });
  }
};

// ==============================
// Verificar si se puede generar certificado
// ==============================
const puedeGenerarCertificado = async (req, res) => {
  try {
    const { id } = req.params; // ID de la inscripción

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (inscripcion.estado !== "FINALIZADA") {
      return res.status(400).json({ msg: "Inscripción no está finalizada" });
    }

    if (inscripcion.evento.tip_eve === "CURSO") {
      const notaMinima = inscripcion.evento.nota_min_eve ?? 8;
      const asistenciaMinima = inscripcion.evento.por_asist_eve ?? 80;

      if (
        inscripcion.nota_final >= notaMinima &&
        inscripcion.asistencia >= asistenciaMinima
      ) {
        return res.status(200).json({ puedeGenerar: true, tipo: "APROBADO" });
      } else {
        return res
          .status(200)
          .json({ puedeGenerar: false, tipo: "NO_APROBADO" });
      }
    } else {
      // Otros tipos de evento: solo asistencia requerida
      if ((inscripcion.asistencia ?? 0) >= 80) {
        return res.status(200).json({ puedeGenerar: true, tipo: "ASISTENTE" });
      } else {
        return res
          .status(200)
          .json({ puedeGenerar: false, tipo: "ASISTENCIA_INSUFICIENTE" });
      }
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error al verificar elegibilidad de certificado",
      error: error.message,
    });
  }
};

const path = require("path");

const reenviarComprobante = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo" });
    }

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { usuario: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Solo puede reenviar el mismo estudiante
    if (inscripcion.id_usu !== req.usuario.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar esta inscripción" });
    }

    const actualizada = await prisma.inscripcion.update({
      where: { id_ins: id },
      data: {
        comprobante: archivo.filename,
        estado: "PENDIENTE",
      },
    });

    res.status(200).json({
      msg: "Comprobante reenviado correctamente",
      inscripcion: actualizada,
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al reenviar comprobante", error: error.message });
  }
};

module.exports = {
  crearInscripcion,
  validarInscripcion,
  obtenerInscripcionesPorUsuario,
  puedeGenerarCertificado,
  reenviarComprobante,
};
