// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

// =====================
// Crear nueva carrera
// =====================
const crearCarrera = async (req, res) => {
  try {
    // Extraemos el nombre de la carrera desde el cuerpo de la solicitud
    const { nom_car } = req.body;

    // Verificamos si ya existe una carrera con ese nombre
    const carreraExistente = await prisma.carrera.findUnique({
      where: { nom_car },
    });

    // Si ya existe, enviamos una respuesta de error
    if (carreraExistente) {
      return res.status(400).json({ msg: "La carrera ya existe" });
    }

    // Si no existe, creamos una nueva carrera
    const nuevaCarrera = await prisma.carrera.create({
      data: { nom_car },
    });

    // Respondemos con la carrera creada y un código 201 (creado)
    res.status(201).json(nuevaCarrera);
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500 (error interno)
    res.status(500).json({ msg: "Error al crear carrera", error });
  }
};

// ==============================
// Obtener todas las carreras
// ==============================
const obtenerCarreras = async (req, res) => {
  try {
    // Consultamos todas las carreras en la base de datos
    const carreras = await prisma.carrera.findMany();
    
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
    // Obtenemos el ID de la carrera desde los parámetros de la URL
    const { id } = req.params;

    // Obtenemos el nuevo nombre de la carrera desde el cuerpo de la solicitud
    const { nom_car } = req.body;

    // Actualizamos la carrera en la base de datos
    const actualizada = await prisma.carrera.update({
      where: { id_car: id }, // usamos id_car como identificador
      data: { nom_car },
    });

    // Respondemos con la carrera actualizada
    res.status(200).json(actualizada);
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500
    res.status(500).json({ msg: "Error al actualizar carrera", error });
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
