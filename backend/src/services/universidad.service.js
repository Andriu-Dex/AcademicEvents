const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const config = require("../config/emailConfig");

/**
 * Clase que proporciona métodos para obtener datos actualizados de la universidad
 * para ser utilizados en plantillas de correo y otras funcionalidades
 */
class UniversidadService {
  /**
   * Obtiene los datos de la universidad principal
   * @returns {Promise<Object>} Datos de la universidad
   */
  static async getUniversidadData() {
    try {
      // Intentamos obtener los datos de la universidad desde la base de datos
      const universidad = await prisma.universidad.findFirst({
        where: {
          est_uni: true,
        },
      });

      // Si no hay datos en la BD, devolvemos los valores predeterminados de la configuración
      if (!universidad) {
        return {
          nom_uni: config.universidad.nombre,
          acr_uni: config.universidad.acronimo,
          url_web_uni: config.universidad.sitioWeb,
          dir_uni: "Av. de los Chasquis, Ambato",
          tel_uni: "(03) 252-1081",
          cor_uni: "info@uta.edu.ec",
        };
      }

      return universidad;
    } catch (error) {
      console.error("Error al obtener datos de la universidad:", error);
      // En caso de error, devolvemos los valores predeterminados
      return {
        nom_uni: config.universidad.nombre,
        acr_uni: config.universidad.acronimo,
        url_web_uni: config.universidad.sitioWeb,
        dir_uni: "Av. de los Chasquis, Ambato",
        tel_uni: "(03) 252-1081",
        cor_uni: "info@uta.edu.ec",
      };
    }
  }
}

module.exports = UniversidadService;
