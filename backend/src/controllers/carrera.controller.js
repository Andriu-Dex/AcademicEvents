// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

// =====================
// Crear nueva carrera
// =====================
const crearCarrera = async (req, res) => {
  try {
    console.log("Body recibido:", req.body);
    const { nom_car, id_fac_per } = req.body;

    console.log("Nombre de carrera:", nom_car);
    console.log("ID de facultad:", id_fac_per);

    if (!nom_car || nom_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la carrera es obligatorio" });
    }

    if (!id_fac_per) {
      return res
        .status(400)
        .json({ msg: "El ID de la facultad es obligatorio" });
    }

    console.log("Verificando si la carrera existe...");
    const carreraExistente = await prisma.carrera.findUnique({
      where: { nom_car },
    });

    if (carreraExistente) {
      console.log("Error: La carrera ya existe");
      return res.status(400).json({ msg: "La carrera ya existe" });
    }

    console.log("Verificando si la facultad existe...");
    const facultadExistente = await prisma.facultad.findUnique({
      where: { id_fac: id_fac_per },
    });

    if (!facultadExistente) {
      console.log("Error: La facultad no existe");
      return res.status(400).json({ msg: "La facultad no existe" });
    }

    console.log("Creando nueva carrera...");
    const nuevaCarrera = await prisma.carrera.create({
      data: {
        nom_car,
        id_fac_per,
      },
    });

    console.log("Carrera creada exitosamente:", nuevaCarrera);
    res.status(201).json(nuevaCarrera);
  } catch (error) {
    console.error("Error detallado al crear carrera:", error);
    res.status(500).json({
      msg: "Error al crear carrera",
      error: error.message,
    });
  }
};

// ==============================
// Obtener todas las carreras
// ==============================
const obtenerCarreras = async (req, res) => {
  try {
    // Consultamos todas las carreras en la base de datos
    // const carreras = await prisma.carrera.findMany();

    const carreras = await prisma.carrera.findMany({
      where: { est_car: true },
      orderBy: { nom_car: "asc" },
    });

    // Respondemos con las carreras obtenidas
    res.status(200).json(carreras);
  } catch (error) {
    // En caso de error, enviamos respuesta con estado 500
    res.status(500).json({ msg: "Error al obtener carreras", error });
  }
};

// =======================
// Actualizar una carrera
// =======================
const actualizarCarrera = async (req, res) => {
  try {
    const id = req.params.id; // ✅ no parseInt

    const { nom_car } = req.body;

    if (!nom_car || nom_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la carrera no puede estar vacío" });
    }

    const carreraExistente = await prisma.carrera.findUnique({
      where: { id_car: id },
    });

    if (!carreraExistente) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    const actualizada = await prisma.carrera.update({
      where: { id_car: id },
      data: { nom_car },
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar carrera",
      error: error.message || error,
    });
  }
};

// ======================
// Eliminar una carrera
// ======================
const eliminarCarrera = async (req, res) => {
  try {
    // Obtenemos el ID de la carrera a eliminar desde los parámetros
    const { id } = req.params;

    // Eliminamos la carrera de la base de datos
    await prisma.carrera.delete({
      where: { id_car: id },
    });

    // Respondemos con un mensaje de éxito
    res.status(200).json({ msg: "Carrera eliminada correctamente" });
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500
    res.status(500).json({ msg: "Error al eliminar carrera", error });
  }
};

// Exportamos los métodos para que puedan ser usados en las rutas
module.exports = {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
};
