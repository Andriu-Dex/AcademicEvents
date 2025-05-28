// Importamos la instancia centralizada de Prisma
const prisma = require("../config/db");

// ==============================
// Obtener configuración general
// ==============================
const obtenerConfiguracion = async (req, res) => {
  try {
    const conf = await prisma.configuracion.findUnique({
      where: { id_conf: 1 },
    });

    res.json(conf);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener configuración", error: error.message });
  }
};

// ==============================
// Actualizar (o crear) configuración
// ==============================
const actualizarConfiguracion = async (req, res) => {
  try {
    const { mision, vision, autoridades } = req.body;

    const conf = await prisma.configuracion.upsert({
      where: { id_conf: 1 },
      update: { mision, vision, autoridades },
      create: { id_conf: 1, mision, vision, autoridades },
    });

    res.json(conf);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al actualizar configuración", error: error.message });
  }
};

// ==============================
// Exportamos las funciones
// ==============================
module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
};
