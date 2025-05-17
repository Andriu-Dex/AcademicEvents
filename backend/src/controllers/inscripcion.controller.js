const prisma = require("../config/db");

// ==========================================
// Crear inscripción a un evento académico
// ==========================================
const crearInscripcion = async (req, res) => {
  try {
    const { id_usu, id_eve, comprobante } = req.body;

    if (!id_usu || !id_eve) {
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios: id_usu o id_eve" });
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

    const nuevaInscripcion = await prisma.inscripcion.create({
      data: {
        id_usu,
        id_eve,
        comprobante,
        estado: "PENDIENTE",
      },
    });

    res.status(201).json(nuevaInscripcion);
  } catch (error) {
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

module.exports = {
  crearInscripcion,
  validarInscripcion,
  obtenerInscripcionesPorUsuario,
};
