const prisma = require("../config/db");

// Crear nueva carrera
const crearCarrera = async (req, res) => {
  try {
    const { nom_car } = req.body;

    const carreraExistente = await prisma.carrera.findUnique({
      where: { nom_car },
    });

    if (carreraExistente) {
      return res.status(400).json({ msg: "La carrera ya existe" });
    }

    const nuevaCarrera = await prisma.carrera.create({
      data: { nom_car },
    });

    res.status(201).json(nuevaCarrera);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear carrera", error });
  }
};

// Obtener todas las carreras
const obtenerCarreras = async (req, res) => {
  try {
    const carreras = await prisma.carrera.findMany();
    res.status(200).json(carreras);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener carreras", error });
  }
};

// Actualizar carrera
const actualizarCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_car } = req.body;

    const actualizada = await prisma.carrera.update({
      where: { id_car: id },
      data: { nom_car },
    });

    res.status(200).json(actualizada);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar carrera", error });
  }
};

// Eliminar carrera
const eliminarCarrera = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.carrera.delete({
      where: { id_car: id },
    });

    res.status(200).json({ msg: "Carrera eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar carrera", error });
  }
};

module.exports = {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
};
