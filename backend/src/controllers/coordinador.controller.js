// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const { prisma } = require("../config/db");
const { createTenantScoped } = require("../utils/tenantScope");

// =====================
// Crear nuevo coordinador
// =====================
const crearCoordinador = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { nom_coo, ape_coo, cor_coo, url_img_coo, tit_coo } = req.body;

    // Validación básica
    if (!nom_coo || nom_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre del coordinador es obligatorio" });
    }

    if (!ape_coo || ape_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El apellido del coordinador es obligatorio" });
    }

    if (!cor_coo || cor_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El correo del coordinador es obligatorio" });
    }

    if (!tit_coo || tit_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El título del coordinador es obligatorio" });
    }

    // Verificar si ya existe un coordinador con el mismo correo
    const coordinadorExistente = await prisma.coordinator.findUnique({
      where: {
        tenantId_email: {
          tenantId: req.tenantId,
          email: cor_coo,
        },
      },
    });

    if (coordinadorExistente) {
      return res
        .status(400)
        .json({ msg: "Ya existe un coordinador con este correo" });
    }

    // Crear coordinador
    const nuevoCoordinador = await scoped.create("coordinator", {
      data: {
        firstName: nom_coo,
        lastName: ape_coo,
        email: cor_coo,
        imageUrl: url_img_coo || "https://i.imgur.com/user-default.png", // URL por defecto si no se proporciona
        title: tit_coo,
      },
    });

    res.status(201).json(nuevoCoordinador);
  } catch (error) {
    console.error("Error al crear coordinador:", error);
    res.status(500).json({
      msg: "Error al crear coordinador",
      error: error.message,
    });
  }
};

// ==============================
// Obtener todos los coordinadores
// ==============================
const obtenerCoordinadores = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const coordinadores = await scoped.findMany("coordinator", {
      where: {},
      orderBy: { firstName: "asc" },
    });

    res.status(200).json(coordinadores);
  } catch (error) {
    console.error("Error al obtener coordinadores:", error);
    res.status(500).json({
      msg: "Error al obtener coordinadores",
      error: error.message || error,
    });
  }
};

// =======================
// Actualizar un coordinador
// =======================
const actualizarCoordinador = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const id = req.params.id;
    const { nom_coo, ape_coo, cor_coo, url_img_coo, tit_coo } = req.body;

    // Validaciones
    if (!nom_coo || nom_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El nombre del coordinador es obligatorio" });
    }

    if (!ape_coo || ape_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El apellido del coordinador es obligatorio" });
    }

    if (!cor_coo || cor_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El correo del coordinador es obligatorio" });
    }

    if (!tit_coo || tit_coo.trim() === "") {
      return res
        .status(400)
        .json({ msg: "El título del coordinador es obligatorio" });
    }

    // Verificar que el coordinador existe
    const coordinadorExistente = await scoped.findFirst("coordinator", {
      where: { id },
    });

    if (!coordinadorExistente) {
      return res.status(404).json({ msg: "Coordinador no encontrado" });
    }

    // Verificar que el correo no está ya en uso por otro coordinador
    if (cor_coo !== coordinadorExistente.email) {
      const correoExistente = await prisma.coordinator.findUnique({
        where: {
          tenantId_email: {
            tenantId: req.tenantId,
            email: cor_coo,
          },
        },
      });

      if (correoExistente) {
        return res
          .status(400)
          .json({ msg: "El correo ya está en uso por otro coordinador" });
      }
    }

    // Actualizar coordinador
    await scoped.updateMany("coordinator", {
      where: { id },
      data: {
        firstName: nom_coo,
        lastName: ape_coo,
        email: cor_coo,
        imageUrl: url_img_coo || coordinadorExistente.imageUrl,
        title: tit_coo,
      },
    });

    const actualizado = await scoped.findFirst("coordinator", {
      where: { id },
    });

    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar coordinador:", error);
    res.status(500).json({
      msg: "Error al actualizar coordinador",
      error: error.message || error,
    });
  }
};

// ======================
// Eliminar un coordinador
// ======================
const eliminarCoordinador = async (req, res) => {
  try {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const { id } = req.params;

    // Verificar que el coordinador existe
    const coordinadorExistente = await scoped.findFirst("coordinator", {
      where: { id },
      include: {
        careers: true,
      },
    });

    if (!coordinadorExistente) {
      return res.status(404).json({ msg: "Coordinador no encontrado" });
    }

    // Verificar si tiene carreras asociadas
    if (coordinadorExistente.careers.length > 0) {
      return res.status(400).json({
        msg: "No se puede eliminar el coordinador porque tiene carreras asociadas. Quite la asignación de las carreras primero.",
      });
    }

    // Eliminar coordinador
    await scoped.deleteMany("coordinator", {
      where: { id },
    });

    res.status(200).json({ msg: "Coordinador eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar coordinador:", error);
    res.status(500).json({
      msg: "Error al eliminar coordinador",
      error: error.message || error,
    });
  }
};

// Exportamos los métodos para que puedan ser usados en las rutas
module.exports = {
  crearCoordinador,
  obtenerCoordinadores,
  actualizarCoordinador,
  eliminarCoordinador,
};
