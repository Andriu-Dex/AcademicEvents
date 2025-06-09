// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

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

    const carreraExistente = await prisma.carrera.findUnique({
      where: { nom_car },
    });

    if (carreraExistente) {
      return res.status(400).json({ msg: "La carrera ya existe" });
    }

    const facultadExistente = await prisma.facultad.findUnique({
      where: { id_fac: id_fac_per },
    });

    if (!facultadExistente) {
      return res.status(400).json({ msg: "La facultad no existe" });
    }

    // Verificar si existe el coordinador, si se proporcionó ID
    if (id_coo_per) {
      const coordinadorExistente = await prisma.coordinador.findUnique({
        where: { id_coo: id_coo_per },
      });

      if (!coordinadorExistente) {
        return res.status(400).json({ msg: "El coordinador no existe" });
      }
    }

    const nuevaCarrera = await prisma.carrera.create({
      data: {
        nom_car,
        des_car,
        dur_sem_car: parseInt(dur_sem_car),
        mod_car,
        ico_car: ico_car || null,
        id_fac_per,
        id_coo_per: id_coo_per || null,
      },
    });

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
    const carreras = await prisma.carrera.findMany({
      where: { est_car: true },
      orderBy: { nom_car: "asc" },
      include: {
        coordinador: true,
        facultad: true,
      },
    });

    // Formatear respuesta para el frontend
    const carrerasFormateadas = carreras.map((carrera) => ({
      id: carrera.id_car,
      nombre: carrera.nom_car,
      descripcion: carrera.des_car,
      duracion: `${carrera.dur_sem_car} semestres`,
      modalidad: carrera.mod_car,
      icon: carrera.ico_car,
      facultad: carrera.facultad?.nom_fac || null,
      coordinador: carrera.coordinador
        ? `${carrera.coordinador.nom_coo} ${carrera.coordinador.ape_coo}`
        : null,
      // Incluimos los campos originales también para compatibilidad
      ...carrera,
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
    const carreraExistente = await prisma.carrera.findUnique({
      where: { id_car: id },
    });

    if (!carreraExistente) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    // Verificar si el nombre actualizado ya existe en otra carrera
    if (nom_car !== carreraExistente.nom_car) {
      const carreraConMismoNombre = await prisma.carrera.findFirst({
        where: {
          nom_car,
          id_car: { not: id }, // Excluir la carrera actual de la búsqueda
        },
      });

      if (carreraConMismoNombre) {
        return res.status(400).json({
          msg: "Ya existe otra carrera con ese nombre",
          detalles: { carreraExistente: carreraConMismoNombre.nom_car },
        });
      }
    }

    // Verificar facultad si se proporcionó
    if (id_fac_per) {
      const facultadExistente = await prisma.facultad.findUnique({
        where: { id_fac: id_fac_per },
      });

      if (!facultadExistente) {
        return res.status(400).json({ msg: "La facultad no existe" });
      }
    }

    // Verificar coordinador si se proporcionó
    if (id_coo_per) {
      const coordinadorExistente = await prisma.coordinador.findUnique({
        where: { id_coo: id_coo_per },
      });

      if (!coordinadorExistente) {
        return res.status(400).json({ msg: "El coordinador no existe" });
      }
    }

    // Preparar datos para actualización
    const datosActualizacion = {
      nom_car,
      des_car,
      dur_sem_car: parseInt(dur_sem_car),
      mod_car,
      ico_car: ico_car || carreraExistente.ico_car,
      id_fac_per: id_fac_per || carreraExistente.id_fac_per,
    };

    // Solo actualizar id_coo_per si viene un valor o es explícitamente null
    if (id_coo_per !== undefined) {
      datosActualizacion.id_coo_per = id_coo_per === "" ? null : id_coo_per;
    }

    // Actualizar la carrera
    const actualizada = await prisma.carrera.update({
      where: { id_car: id },
      data: datosActualizacion,
    });

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
    const carrera = await prisma.carrera.findUnique({
      where: { id_car: id },
    });

    if (!carrera) {
      return res.status(404).json({ msg: "Carrera no encontrada" });
    }

    if (!carrera.est_car) {
      return res.status(400).json({ msg: "La carrera ya está inactiva" });
    }

    // Marcamos la carrera como inactiva en lugar de eliminarla
    await prisma.carrera.update({
      where: { id_car: id },
      data: { est_car: false },
    });

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

// Exportamos los métodos para que puedan ser usados en las rutas
module.exports = {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
};
