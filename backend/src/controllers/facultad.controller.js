// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

// ============================
// Obtener todas las facultades
// ============================
const obtenerFacultades = async (req, res) => {
  try {
    // Consultamos todas las facultades en la base de datos
    const facultades = await prisma.facultad.findMany({
      orderBy: { nom_fac: "asc" },
    });

    // Respondemos con las facultades obtenidas
    res.status(200).json(facultades);
  } catch (error) {
    console.error("Error al obtener facultades:", error);
    // En caso de error, enviamos respuesta con estado 500
    res.status(500).json({
      msg: "Error al obtener facultades",
      error: error.message,
    });
  }
};

// ======================
// Obtener una facultad
// ======================
const obtenerFacultad = async (req, res) => {
  try {
    const { id } = req.params;

    const facultad = await prisma.facultad.findUnique({
      where: { id_fac: id },
    });

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    res.status(200).json(facultad);
  } catch (error) {
    console.error("Error al obtener facultad:", error);
    res.status(500).json({
      msg: "Error al obtener facultad",
      error: error.message,
    });
  }
};

// ====================
// Crear una facultad
// ====================
const crearFacultad = async (req, res) => {
  try {
    const { nom_fac, des_fac, mis_fac, vis_fac } = req.body;

    if (!nom_fac || nom_fac.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la facultad es obligatorio" });
    }

    if (!des_fac || des_fac.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La descripción de la facultad es obligatoria" });
    }

    if (!mis_fac || mis_fac.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La misión de la facultad es obligatoria" });
    }

    if (!vis_fac || vis_fac.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La visión de la facultad es obligatoria" });
    }

    const facultadExistente = await prisma.facultad.findUnique({
      where: { nom_fac },
    });

    if (facultadExistente) {
      return res.status(400).json({ msg: "La facultad ya existe" });
    }

    const nuevaFacultad = await prisma.facultad.create({
      data: {
        nom_fac,
        des_fac,
        mis_fac,
        vis_fac,
      },
    });

    res.status(201).json(nuevaFacultad);
  } catch (error) {
    console.error("Error al crear facultad:", error);
    res.status(500).json({
      msg: "Error al crear facultad",
      error: error.message,
    });
  }
};

// Exportamos los métodos para que puedan ser usados en las rutas
module.exports = {
  obtenerFacultades,
  obtenerFacultad,
  crearFacultad,
};
