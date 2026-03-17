// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const { prisma } = require("../config/db");
const { createTenantScoped } = require("../utils/tenantScope");

// ============================
// Obtener todas las facultades
// ============================
const obtenerFacultades = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    // Consultamos todas las facultades en la base de datos
    const facultades = await scoped.findMany("faculty", {
      where: {},
      orderBy: { name: "asc" },
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
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id } = req.params;

    const facultad = await scoped.findFirst("faculty", {
      where: { id },
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

// =============================
// Obtener la primera facultad
// =============================
const obtenerPrimeraFacultad = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const facultad = await scoped.findFirst("faculty", {
      where: {},
      orderBy: { createdAt: "asc" }, // Obtiene la primera facultad creada
    });

    if (!facultad) {
      return res.status(404).json({ msg: "No hay facultades registradas" });
    }

    // Mapear los datos al formato esperado por el frontend
    const facultadFormateada = {
      id: facultad.id,
      nombre: facultad.name,
      acronimo: facultad.acronym,
      descripcion: facultad.description,
      logo: facultad.logoUrl,
      // Mantener también los campos originales por compatibilidad
      id_fac: facultad.id,
      nom_fac: facultad.name,
      acr_fac: facultad.acronym,
      des_fac: facultad.description,
      url_log_fac: facultad.logoUrl,
      fec_cre_fac: facultad.createdAt,
    };

    res.status(200).json(facultadFormateada);
  } catch (error) {
    console.error("Error al obtener la primera facultad:", error);
    res.status(500).json({
      msg: "Error al obtener la primera facultad",
      error: error.message,
    });
  }
};

// ===========================
// Actualizar datos básicos de facultad
// ===========================
const actualizarDatosFacultad = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id } = req.params;
    const { nom_fac, acr_fac, des_fac, url_log_fac } = req.body;

    // Verificar que la facultad existe
    const facultadExistente = await scoped.findFirst("faculty", {
      where: { id },
    });

    if (!facultadExistente) {
      return res.status(404).json({ msg: "Facultad no encontrada" });
    }

    // Validar datos
    if (!nom_fac || nom_fac.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre de la facultad es obligatorio" });
    }

    // Verificar si el nombre ya existe y no es el mismo facultad
    if (nom_fac !== facultadExistente.name) {
      const nombreExiste = await scoped.findFirst("faculty", {
        where: {
          name: nom_fac,
          id: { not: id },
        },
      });

      if (nombreExiste) {
        return res
          .status(400)
          .json({ msg: "Ya existe otra facultad con ese nombre" });
      }
    }

    // Actualizar la facultad
    await scoped.updateMany("faculty", {
      where: { id },
      data: {
        name: nom_fac,
        acronym: acr_fac,
        description: des_fac,
        logoUrl: url_log_fac,
      },
    });

    const facultadActualizada = await scoped.findFirst("faculty", {
      where: { id },
    });

    res.status(200).json({
      msg: "Datos de la facultad actualizados correctamente",
      facultad: facultadActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar datos de facultad:", error);
    res.status(500).json({
      msg: "Error al actualizar datos de facultad",
      error: error.message,
    });
  }
};

// ====================
// Crear una facultad
// ====================
const crearFacultad = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
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

    const facultadExistente = await scoped.findFirst("faculty", {
      where: { name: nom_fac },
    });

    if (facultadExistente) {
      return res.status(400).json({ msg: "La facultad ya existe" });
    }

    const nuevaFacultad = await scoped.create("faculty", {
      data: {
        name: nom_fac,
        description: des_fac,
        mission: mis_fac,
        vision: vis_fac,
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
  obtenerPrimeraFacultad,
  actualizarDatosFacultad,
  crearFacultad,
};
