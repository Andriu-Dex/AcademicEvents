const prisma = require("../config/db");

// ===================================
// Crear nuevo evento académico
// ===================================
const crearEvento = async (req, res) => {
  try {
    const {
      nom_eve,
      des_eve,
      tip_eve,
      fec_ini_eve,
      fec_fin_eve,
      dur_hrs_eve,
      pagado_eve,
      nota_min_eve,
      por_asist_eve,
      carreraId,
    } = req.body;

    // Validaciones mínimas (pueden expandirse según necesidades)
    if (!nom_eve || !tip_eve || !fec_ini_eve || !fec_fin_eve || !dur_hrs_eve) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    // Verificar que las fechas son válidas
    if (isNaN(new Date(fec_ini_eve)) || isNaN(new Date(fec_fin_eve))) {
      return res.status(400).json({ msg: "Fechas inválidas" });
    }

    // Creación del evento
    const nuevoEvento = await prisma.evento.create({
      data: {
        nom_eve,
        des_eve,
        tip_eve,
        fec_ini_eve: new Date(fec_ini_eve),
        fec_fin_eve: new Date(fec_fin_eve),
        dur_hrs_eve,
        pagado_eve,
        nota_min_eve,
        por_asist_eve,
        carreraId,
      },
    });

    res.status(201).json(nuevoEvento);
  } catch (error) {
    res.status(500).json({
      msg: "Error al crear evento",
      error: error.message,
    });
  }
};

// ===================================
// Obtener todos los eventos
// ===================================
const obtenerEventos = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: { carrera: true },
      orderBy: { fec_ini_eve: "asc" }, // Orden cronológico opcional
    });

    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener eventos",
      error: error.message,
    });
  }
};

// ===================================
// Actualizar un evento por ID
// ===================================
const actualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const camposPermitidos = [
      "nom_eve",
      "des_eve",
      "tip_eve",
      "fec_ini_eve",
      "fec_fin_eve",
      "dur_hrs_eve",
      "pagado_eve",
      "nota_min_eve",
      "por_asist_eve",
      "carreraId",
    ];

    const data = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => camposPermitidos.includes(key))
    );

    const eventoActualizado = await prisma.evento.update({
      where: { id_eve: id },
      data,
    });

    res.status(200).json(eventoActualizado);
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar evento",
      error: error.message,
    });
  }
};

// ===================================
// Eliminar un evento por ID
// ===================================
const eliminarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({ where: { id_eve: id } });
    if (!evento) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }

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
      select: {
        nom_eve: true,
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

module.exports = {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
};
