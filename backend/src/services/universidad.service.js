const { prisma } = require("../config/db");
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
      const universidad = await prisma.university.findFirst({
        where: {
          isActive: true,
        },
      });

      // Si no hay datos en la BD, devolvemos los valores predeterminados de la configuración
      if (!universidad) {
        return {
          name: config.universidad.nombre,
          acronym: config.universidad.acronimo,
          websiteUrl: config.universidad.sitioWeb,
          address: "Av. de los Chasquis, Ambato",
          phone: "(03) 252-1081",
          email: "info@uta.edu.ec",
        };
      }

      return {
        name: universidad.name,
        acronym: universidad.acronym,
        websiteUrl: universidad.websiteUrl,
        address: universidad.address,
        phone: universidad.phone,
        email: universidad.email,
      };
    } catch (error) {
      console.error("Error al obtener datos de la universidad:", error);
      // En caso de error, devolvemos los valores predeterminados
      return {
        name: config.universidad.nombre,
        acronym: config.universidad.acronimo,
        websiteUrl: config.universidad.sitioWeb,
        address: "Av. de los Chasquis, Ambato",
        phone: "(03) 252-1081",
        email: "info@uta.edu.ec",
      };
    }
  }
}

module.exports = UniversidadService;
