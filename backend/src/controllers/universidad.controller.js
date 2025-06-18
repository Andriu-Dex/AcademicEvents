const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

/**
 * Obtiene los datos de la universidad principal
 * @param {object} req - Objeto de solicitud HTTP
 * @param {object} res - Objeto de respuesta HTTP
 */
const getUniversidadPrincipal = async (req, res) => {
  try {
    // Obtenemos la primera universidad (asumiendo que solo hay una)
    const universidad = await prisma.universidad.findFirst({
      where: {
        est_uni: true,
      },
    });

    if (!universidad) {
      return res.status(404).json({
        message: "No se encontró información de la universidad",
      });
    }

    res.status(200).json(universidad);
  } catch (error) {
    console.error("Error al obtener universidad:", error);
    res.status(500).json({
      message: "Error al obtener información de la universidad",
      error: error.message,
    });
  }
};

/**
 * Actualiza los datos básicos de la universidad
 * @param {object} req - Objeto de solicitud HTTP
 * @param {object} res - Objeto de respuesta HTTP
 */
const updateUniversidadDatos = async (req, res) => {
  try {
    const { id_uni } = req.params;
    const {
      nom_uni,
      acr_uni,
      url_log_uni,
      url_web_uni,
      dir_uni,
      tel_uni,
      cor_uni,
    } = req.body;

    // Validamos que exista el ID
    if (!id_uni) {
      return res.status(400).json({
        message: "Se requiere el ID de la universidad",
      });
    }

    // Verificamos que la universidad exista
    const universidadExistente = await prisma.universidad.findUnique({
      where: {
        id_uni,
      },
    });

    if (!universidadExistente) {
      return res.status(404).json({
        message: "Universidad no encontrada",
      });
    }

    // Actualizamos los datos
    const universidadActualizada = await prisma.universidad.update({
      where: {
        id_uni,
      },
      data: {
        nom_uni: nom_uni || universidadExistente.nom_uni,
        acr_uni: acr_uni || universidadExistente.acr_uni,
        url_log_uni: url_log_uni || universidadExistente.url_log_uni,
        url_web_uni: url_web_uni || universidadExistente.url_web_uni,
        dir_uni: dir_uni || universidadExistente.dir_uni,
        tel_uni: tel_uni || universidadExistente.tel_uni,
        cor_uni: cor_uni || universidadExistente.cor_uni,
      },
    });

    res.status(200).json({
      message: "Datos de la universidad actualizados correctamente",
      universidad: universidadActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar universidad:", error);
    res.status(500).json({
      message: "Error al actualizar información de la universidad",
      error: error.message,
    });
  }
};

module.exports = {
  getUniversidadPrincipal,
  updateUniversidadDatos,
};
