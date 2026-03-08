// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const { prisma } = require("../config/db");
const socketService = require("../services/socket.service");

// =====================
// Crear nueva carrera
// =====================
const crearCarrera = async (req, res) => {
  try {
    const {
      nom_car,
      des_car,
      dur_sem_car,
      mod_car,
      ico_car,
      id_fac_per,
      id_coo_per,
    } = req.body;

    if (!nom_car || nom_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la carrera es obligatorio" });
    }

    if (!des_car || des_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La descripción de la carrera es obligatoria" });
    }

    if (!dur_sem_car || isNaN(parseInt(dur_sem_car))) {
      return res
        .status(400)
        .json({ msg: "La duración en semestres debe ser un número válido" });
    }

    if (!mod_car || mod_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La modalidad de la carrera es obligatoria" });
    }

    if (!id_fac_per) {
      return res
        .status(400)
        .json({ msg: "El ID de la facultad es obligatorio" });
    }

    const carreraExistente = await prisma.career.findFirst({
      where: { name: nom_car },
    });

    if (carreraExistente) {
      return res.status(400).json({ msg: "La carrera ya existe" });
    }

    const facultadExistente = await prisma.faculty.findUnique({
      where: { id: id_fac_per },
    });

    if (!facultadExistente) {
      return res.status(400).json({ msg: "La facultad no existe" });
    }

    // Verificar si existe el coordinador, si se proporcionó ID
    if (id_coo_per) {
      const coordinadorExistente = await prisma.coordinator.findUnique({
        where: { id: id_coo_per },
      });

      if (!coordinadorExistente) {
        return res.status(400).json({ msg: "El coordinador no existe" });
      }
    }

    const nuevaCarrera = await prisma.career.create({
      data: {
        name: nom_car,
        description: des_car,
        durationSemesters: parseInt(dur_sem_car),
        modality: mod_car,
        iconUrl: ico_car || null,
        facultyId: id_fac_per,
        coordinatorId: id_coo_per || null,
      },
    });

    // 🔌 Notificar a todos los clientes sobre la nueva carrera
    socketService.notifyCarreraChange("created", nuevaCarrera);

    res.status(201).json(nuevaCarrera);
  } catch (error) {
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
    // Consultamos todas las carreras en la base de datos con relaciones
    const carreras = await prisma.career.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        coordinator: true,
        faculty: true,
      },
    });

    // Formatear respuesta para el frontend
    const carrerasFormateadas = carreras.map((carrera) => ({
      id: carrera.id,
      nombre: carrera.name,
      descripcion: carrera.description,
      duracion: `${carrera.durationSemesters} semestres`,
      modalidad: carrera.modality,
      icon: carrera.iconUrl,
      facultad: carrera.faculty?.name || null,
      coordinador: carrera.coordinator
        ? `${carrera.coordinator.firstName} ${carrera.coordinator.lastName}`
        : null,
      // Incluimos los campos originales también para compatibilidad
      id_car: carrera.id,
      nom_car: carrera.name,
      des_car: carrera.description,
      dur_sem_car: carrera.durationSemesters,
      mod_car: carrera.modality,
      ico_car: carrera.iconUrl,
      est_car: carrera.isActive,
      fec_cre_car: carrera.createdAt,
      id_fac_per: carrera.facultyId,
      id_coo_per: carrera.coordinatorId,
    }));

    // Respondemos con las carreras formateadas
    res.status(200).json(carrerasFormateadas);
  } catch (error) {
    console.error("Error al obtener carreras:", error);
    // En caso de error, enviamos respuesta con estado 500
    res.status(500).json({
      msg: "Error al obtener carreras",
      error: error.message || error,
    });
  }
};

// =======================
// Actualizar una carrera
// =======================
const actualizarCarrera = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nom_car,
      des_car,
      dur_sem_car,
      mod_car,
      ico_car,
      id_fac_per,
      id_coo_per,
    } = req.body;

    // Validaciones
    if (!nom_car || nom_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la carrera no puede estar vacío" });
    }

    if (!des_car || des_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La descripción de la carrera no puede estar vacía" });
    }

    if (!dur_sem_car || isNaN(parseInt(dur_sem_car))) {
      return res
        .status(400)
        .json({ msg: "La duración en semestres debe ser un número válido" });
    }

    if (!mod_car || mod_car.trim() === "") {
      return res
        .status(400)
        .json({ msg: "La modalidad de la carrera no puede estar vacía" });
    }

    // Verificar que la carrera existe
    const carreraExistente = await prisma.career.findUnique({
      where: { id },
    });

    if (!carreraExistente) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    // Verificar si el nombre actualizado ya existe en otra carrera
    if (nom_car !== carreraExistente.name) {
      const carreraConMismoNombre = await prisma.career.findFirst({
        where: {
          name: nom_car,
          id: { not: id }, // Excluir la carrera actual de la búsqueda
        },
      });

      if (carreraConMismoNombre) {
        return res.status(400).json({
          msg: "Ya existe otra carrera con ese nombre",
          detalles: { carreraExistente: carreraConMismoNombre.name },
        });
      }
    }

    // Verificar facultad si se proporcionó
    if (id_fac_per) {
      const facultadExistente = await prisma.faculty.findUnique({
        where: { id: id_fac_per },
      });

      if (!facultadExistente) {
        return res.status(400).json({ msg: "La facultad no existe" });
      }
    }

    // Verificar coordinador si se proporcionó
    if (id_coo_per) {
      const coordinadorExistente = await prisma.coordinator.findUnique({
        where: { id: id_coo_per },
      });

      if (!coordinadorExistente) {
        return res.status(400).json({ msg: "El coordinador no existe" });
      }
    }

    // Preparar datos para actualización
    const datosActualizacion = {
      name: nom_car,
      description: des_car,
      durationSemesters: parseInt(dur_sem_car),
      modality: mod_car,
      iconUrl: ico_car || carreraExistente.iconUrl,
      facultyId: id_fac_per || carreraExistente.facultyId,
    };

    // Solo actualizar id_coo_per si viene un valor o es explícitamente null
    if (id_coo_per !== undefined) {
      datosActualizacion.coordinatorId = id_coo_per === "" ? null : id_coo_per;
    }

    // Actualizar la carrera
    const actualizada = await prisma.career.update({
      where: { id },
      data: datosActualizacion,
    });

    // 🔌 Notificar a todos los clientes sobre la carrera actualizada
    socketService.notifyCarreraChange("updated", actualizada);

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar carrera",
      error: error.message || String(error),
      stack: error.stack,
    });
  }
};

// ======================
// Eliminar una carrera (marcar como inactiva)
// ======================
const eliminarCarrera = async (req, res) => {
  try {
    // Obtenemos el ID de la carrera a desactivar desde los parámetros
    const { id } = req.params;

    // Verificamos que la carrera exista y esté activa
    const carrera = await prisma.career.findUnique({
      where: { id },
    });

    if (!carrera) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    if (!carrera.isActive) {
      return res.status(400).json({ msg: "La carrera ya está inactiva" });
    }

    // Marcamos la carrera como inactiva en lugar de eliminarla
    const carreraDesactivada = await prisma.career.update({
      where: { id },
      data: { isActive: false },
    });

    // 🔌 Notificar a todos los clientes sobre la carrera eliminada/desactivada
    socketService.notifyCarreraChange("updated", carreraDesactivada);

    // Respondemos con un mensaje de éxito
    res.status(200).json({ msg: "Carrera desactivada correctamente" });
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500
    res.status(500).json({
      msg: "Error al desactivar carrera",
      error: error.message || error,
    });
  }
};

// ======================
// Activar una carrera (marcar como activa)
// ======================
const activarCarrera = async (req, res) => {
  try {
    // Obtenemos el ID de la carrera a activar desde los parámetros
    const { id } = req.params;

    // Verificamos que la carrera exista y esté inactiva
    const carrera = await prisma.career.findUnique({
      where: { id },
    });

    if (!carrera) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    if (carrera.isActive) {
      return res.status(400).json({ msg: "La carrera ya está activa" });
    }

    // Marcamos la carrera como activa
    const carreraActivada = await prisma.career.update({
      where: { id },
      data: { isActive: true },
    });

    // 🔌 Notificar a todos los clientes sobre la carrera activada
    socketService.notifyCarreraChange("updated", carreraActivada);

    // Respondemos con un mensaje de éxito
    res.status(200).json({ msg: "Carrera activada correctamente" });
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500
    res.status(500).json({
      msg: "Error al activar carrera",
      error: error.message || error,
    });
  }
};

// ======================
// Eliminar permanentemente una carrera
// ======================
const eliminarCarreraPermanentemente = async (req, res) => {
  try {
    // Obtenemos el ID de la carrera a eliminar desde los parámetros
    const { id } = req.params;

    // Verificamos que la carrera exista
    const carrera = await prisma.career.findUnique({
      where: { id },
    });

    if (!carrera) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    // Verificar si hay eventos o usuarios asociados a esta carrera
    const eventosAsociados = await prisma.eventCareer.findMany({
      where: { careerId: id },
    });

    const usuariosAsociados = await prisma.user.findMany({
      where: { careerId: id },
    });

    if (eventosAsociados.length > 0 || usuariosAsociados.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar la carrera porque tiene eventos o usuarios asociados",
        eventosAsociados: eventosAsociados.length,
        usuariosAsociados: usuariosAsociados.length,
      });
    }

    // Eliminamos permanentemente la carrera
    await prisma.career.delete({
      where: { id },
    });

    // 🔌 Notificar a todos los clientes sobre la carrera eliminada permanentemente
    socketService.notifyCarreraChange("permanentlyDeleted", {
      id_car: id,
    });

    // Respondemos con un mensaje de éxito
    res.status(200).json({ msg: "Carrera eliminada permanentemente" });
  } catch (error) {
    // Si ocurre un error, respondemos con estado 500
    res.status(500).json({
      msg: "Error al eliminar carrera permanentemente",
      error: error.message || error,
    });
  }
};

// ==============================
// Obtener todas las carreras (activas e inactivas)
// ==============================
const obtenerTodasCarreras = async (req, res) => {
  try {
    // Consultamos todas las carreras en la base de datos con relaciones
    const carreras = await prisma.career.findMany({
      orderBy: { name: "asc" },
      include: {
        coordinator: true,
        faculty: true,
      },
    });

    // Formatear respuesta para el frontend
    const carrerasFormateadas = carreras.map((carrera) => ({
      id: carrera.id,
      nombre: carrera.name,
      descripcion: carrera.description,
      duracion: `${carrera.durationSemesters} semestres`,
      modalidad: carrera.modality,
      icon: carrera.iconUrl,
      facultad: carrera.faculty?.name || null,
      coordinador: carrera.coordinator
        ? `${carrera.coordinator.firstName} ${carrera.coordinator.lastName}`
        : null,
      // Incluimos los campos originales también para compatibilidad
      id_car: carrera.id,
      nom_car: carrera.name,
      des_car: carrera.description,
      dur_sem_car: carrera.durationSemesters,
      mod_car: carrera.modality,
      ico_car: carrera.iconUrl,
      est_car: carrera.isActive,
      fec_cre_car: carrera.createdAt,
      id_fac_per: carrera.facultyId,
      id_coo_per: carrera.coordinatorId,
    }));

    // Respondemos con las carreras formateadas
    res.status(200).json(carrerasFormateadas);
  } catch (error) {
    console.error("Error al obtener todas las carreras:", error);
    // En caso de error, enviamos respuesta con estado 500
    res.status(500).json({
      msg: "Error al obtener todas las carreras",
      error: error.message || error,
    });
  }
};

// Exportamos los métodos para que puedan ser usados en las rutas
module.exports = {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
  activarCarrera,
  eliminarCarreraPermanentemente,
  obtenerTodasCarreras,
};
