const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const obtenerCarreras = async (req, res) => {
  try {
    const carreras = await prisma.carrera.findMany();
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener carreras" });
  }
};

const crearCarrera = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nueva = await prisma.carrera.create({
      data: { nombre },
    });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ mensaje: "No se pudo crear la carrera" });
  }
};

const actualizarCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;
    const actualizada = await prisma.carrera.update({
      where: { id },
      data: { nombre, estado },
    });
    res.json(actualizada);
  } catch (error) {
    res.status(404).json({ mensaje: "Carrera no encontrada" });
  }
};

const eliminarCarrera = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.carrera.delete({ where: { id } });
    res.json({ mensaje: "Carrera eliminada" });
  } catch (error) {
    res.status(404).json({ mensaje: "No se pudo eliminar la carrera" });
  }
};

module.exports = {
  obtenerCarreras,
  crearCarrera,
  actualizarCarrera,
  eliminarCarrera,
};