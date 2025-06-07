// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

// ============================
// Obtener misión y visión de una facultad
// ============================
const obtenerFacultad = async (req, res) => {
  try {
    const { id } = req.params;

    // Consultamos la facultad por su ID
    const facultad = await prisma.facultad.findUnique({
      where: { id_fac: id },
    });

    if (!facultad) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Respondemos con la facultad, incluyendo misión y visión
    res.status(200).json(facultad);
  } catch (error) {
    console.error("Error al obtener facultad:", error);
    res.status(500).json({
      msg: "Error al obtener facultad",
      error: error.message,
    });
  }
};

// ============================
// Actualizar misión y visión de la facultad (solo ADMIN)
// ============================
const actualizarFacultad = async (req, res) => {
  try {
    const { id } = req.params;
    const { mis_fac, vis_fac } = req.body;

    // Validación de los campos requeridos
    if (!mis_fac || mis_fac.trim() === "") {
      return res.status(400).json({ msg: "La misión de la facultad es obligatoria" });
    }

    if (!vis_fac || vis_fac.trim() === "") {
      return res.status(400).json({ msg: "La visión de la facultad es obligatoria" });
    }

    // Actualizamos los campos misión y visión en la facultad
    const facultad = await prisma.facultad.update({
      where: { id_fac: id },
      data: { mis_fac, vis_fac },
    });

    // Respondemos con la facultad actualizada
    res.status(200).json(facultad);
  } catch (error) {
    console.error("Error al actualizar facultad:", error);
    res.status(500).json({
      msg: "Error al actualizar facultad",
      error: error.message,
    });
  }
};

// ============================
// Crear una facultad (solo si no existe)
// ============================
const crearFacultad = async (req, res) => {
  try {
    const { nom_fac, des_fac, mis_fac, vis_fac } = req.body;

    if (!nom_fac || nom_fac.trim() === "") {
      return res.status(400).json({ msg: "El nombre de la facultad es obligatorio" });
    }

    if (!des_fac || des_fac.trim() === "") {
      return res.status(400).json({ msg: "La descripción de la facultad es obligatoria" });
    }

    if (!mis_fac || mis_fac.trim() === "") {
      return res.status(400).json({ msg: "La misión de la facultad es obligatoria" });
    }

    if (!vis_fac || vis_fac.trim() === "") {
      return res.status(400).json({ msg: "La visión de la facultad es obligatoria" });
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
  obtenerFacultad,
  actualizarFacultad,
  crearFacultad,
};
