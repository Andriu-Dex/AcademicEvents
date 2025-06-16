// Importamos la instancia centralizada de Prisma
const prisma = require("../config/db");

/**
 * Clase controladora para gestionar información de Misión, Visión y Autoridades
 */
class MVAController {
  /**
   * Obtiene la información de MVA (Misión, Visión, Autoridades)
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  static async obtenerMVA(req, res) {
    try {
      // Obtenemos la primera facultad (asumimos que es la principal)
      const facultad = await prisma.facultad.findFirst();

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      // Obtenemos las autoridades de la facultad según el nuevo modelo
      const autoridadesFacultad = await prisma.autoridad_facultad.findMany({
        where: {
          id_fac_per: facultad.id_fac,
          est_aut_fac: true, // Solo autoridades activas
        },
        orderBy: {
          tip_aut_fac: "asc", // Ordenar por tipo de autoridad
        },
      });

      // Transformamos los datos al formato esperado por el frontend
      const autoridades = autoridadesFacultad.map((autoridad) => {
        return {
          cargo: MVAController.traducirTipoAutoridad(autoridad.tip_aut_fac),
          nombre: `${autoridad.tit_aut_fac || ""} ${autoridad.nom_aut_fac} ${
            autoridad.ape_aut_fac
          }`.trim(),
          imagen:
            autoridad.url_img_aut_fac || "https://i.imgur.com/hYBsxIf.png", // Imagen predeterminada
          email: autoridad.cor_aut_fac || "",
        };
      });

      // Creamos el objeto de respuesta
      const mvaInfo = {
        mision: facultad.mis_fac,
        vision: facultad.vis_fac,
        autoridades: JSON.stringify(autoridades),
      };

      res.json(mvaInfo);
    } catch (error) {
      console.error("Error al obtener información MVA:", error);
      res.status(500).json({
        msg: "Error al obtener información MVA",
        error: error.message,
      });
    }
  }

  /**
   * Traduce el tipo de autoridad del enum a un formato más legible
   * @param {string} tipoAutoridad - Tipo de autoridad del enum
   * @returns {string} - Descripción legible del cargo
   */
  static traducirTipoAutoridad(tipoAutoridad) {
    const traducciones = {
      DECANO: "Decano",
      SUBDECANO: "Subdecano",
      COORDINADOR_CARRERA: "Coordinador de Carrera",
      SECRETARIO: "Secretario",
      DIRECTOR_INVESTIGACION: "Director de Investigación",
      OTRO: "Autoridad",
    };

    return traducciones[tipoAutoridad] || tipoAutoridad;
  }

  /**
   * Obtiene datos básicos de la facultad
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  static async obtenerDatosFacultad(req, res) {
    try {
      // Obtenemos la primera facultad (asumimos que es la principal)
      const facultad = await prisma.facultad.findFirst();

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      // Creamos el objeto de respuesta con los datos necesarios
      const datosFacultad = {
        nombre: facultad.nom_fac,
        acronimo: facultad.acr_fac || "FISEI", // Valor por defecto si es null
        logo: facultad.url_log_fac || "https://imgur.com/fch1iy6.png", // Valor por defecto si es null
        descripcion: facultad.des_fac,
      };

      res.json(datosFacultad);
    } catch (error) {
      console.error("Error al obtener datos de la facultad:", error);
      res.status(500).json({
        msg: "Error al obtener datos de la facultad",
        error: error.message,
      });
    }
  }

  /**
   * Actualiza la información de MVA
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  static async actualizarMVA(req, res) {
    try {
      const { mision, vision, autoridades } = req.body;

      // Obtenemos la primera facultad
      const facultad = await prisma.facultad.findFirst();

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      // Actualizamos la misión y visión en la facultad
      await prisma.facultad.update({
        where: { id_fac: facultad.id_fac },
        data: {
          mis_fac: mision,
          vis_fac: vision,
        },
      });

      // Si hay autoridades, procesamos
      if (autoridades) {
        try {
          const autoridadesData = JSON.parse(autoridades);

          // Primero, obtenemos las autoridades actuales
          const autoridadesActuales = await prisma.autoridad_facultad.findMany({
            where: { id_fac_per: facultad.id_fac },
          });

          // Para cada autoridad nueva o actualizada
          for (let i = 0; i < autoridadesData.length; i++) {
            const autoridadData = autoridadesData[i];

            // Separamos título, nombre y apellidos
            const nombreCompleto = autoridadData.nombre.split(" ");
            let titulo = "";
            let nombre = "";
            let apellido = "";

            // Si el primer elemento parece un título (Dr., Ing., etc.)
            if (nombreCompleto[0].endsWith(".")) {
              titulo = nombreCompleto[0];
              nombre = nombreCompleto[1] || "";
              apellido = nombreCompleto.slice(2).join(" ");
            } else {
              nombre = nombreCompleto[0] || "";
              apellido = nombreCompleto.slice(1).join(" ");
            }

            // Determinamos el tipo de autoridad basado en el cargo
            const tipoAutoridad = MVAController.determinarTipoAutoridad(
              autoridadData.cargo
            );

            // Si ya existe una autoridad de este tipo, la actualizamos
            const autoridadExistente = autoridadesActuales.find(
              (a) => a.tip_aut_fac === tipoAutoridad
            );

            if (autoridadExistente) {
              await prisma.autoridad_facultad.update({
                where: { id_aut_fac: autoridadExistente.id_aut_fac },
                data: {
                  nom_aut_fac: nombre,
                  ape_aut_fac: apellido,
                  cor_aut_fac: autoridadData.email,
                  url_img_aut_fac: autoridadData.imagen,
                  tit_aut_fac: titulo,
                  est_aut_fac: true,
                },
              });
            } else {
              // Si no existe, creamos una nueva
              await prisma.autoridad_facultad.create({
                data: {
                  id_fac_per: facultad.id_fac,
                  tip_aut_fac: tipoAutoridad,
                  nom_aut_fac: nombre,
                  ape_aut_fac: apellido,
                  cor_aut_fac: autoridadData.email,
                  url_img_aut_fac: autoridadData.imagen,
                  tit_aut_fac: titulo,
                  fec_ini_aut_fac: new Date(), // Fecha actual como inicio
                  est_aut_fac: true,
                },
              });
            }
          }
        } catch (jsonError) {
          console.error("Error al procesar JSON de autoridades:", jsonError);
          // No interrumpimos la operación si hay error en el formato de autoridades
        }
      }

      // Obtenemos la información actualizada mediante el método obtenerMVA
      const mvaInfo = await MVAController.obtenerMVADatos(facultad.id_fac);

      res.status(200).json(mvaInfo);
    } catch (error) {
      console.error("Error al actualizar información MVA:", error);
      res.status(500).json({
        msg: "Error al actualizar información MVA",
        error: error.message,
      });
    }
  }

  /**
   * Determina el tipo de autoridad según el cargo
   * @param {string} cargo - Descripción del cargo
   * @returns {string} - Tipo de autoridad del enum
   */
  static determinarTipoAutoridad(cargo) {
    const cargoLower = cargo.toLowerCase();

    if (cargoLower.includes("decano") && !cargoLower.includes("sub")) {
      return "DECANO";
    } else if (
      cargoLower.includes("subdecano") ||
      cargoLower.includes("sub-decano") ||
      cargoLower.includes("sub decano")
    ) {
      return "SUBDECANO";
    } else if (cargoLower.includes("coordinador")) {
      return "COORDINADOR_CARRERA";
    } else if (cargoLower.includes("secretario")) {
      return "SECRETARIO";
    } else if (
      cargoLower.includes("investigación") ||
      cargoLower.includes("investigacion")
    ) {
      return "DIRECTOR_INVESTIGACION";
    } else {
      return "OTRO";
    }
  }

  /**
   * Método auxiliar para obtener datos MVA
   * @param {string} idFacultad - ID de la facultad
   * @returns {Object} - Objeto con información MVA
   */
  static async obtenerMVADatos(idFacultad) {
    // Obtenemos la facultad
    const facultad = await prisma.facultad.findUnique({
      where: { id_fac: idFacultad },
    });

    // Obtenemos las autoridades
    const autoridadesFacultad = await prisma.autoridad_facultad.findMany({
      where: {
        id_fac_per: idFacultad,
        est_aut_fac: true,
      },
      orderBy: {
        tip_aut_fac: "asc",
      },
    });

    // Transformamos los datos
    const autoridades = autoridadesFacultad.map((autoridad) => {
      return {
        cargo: MVAController.traducirTipoAutoridad(autoridad.tip_aut_fac),
        nombre: `${autoridad.tit_aut_fac || ""} ${autoridad.nom_aut_fac} ${
          autoridad.ape_aut_fac
        }`.trim(),
        imagen: autoridad.url_img_aut_fac || "https://i.imgur.com/hYBsxIf.png",
        email: autoridad.cor_aut_fac || "",
      };
    });

    return {
      mision: facultad.mis_fac,
      vision: facultad.vis_fac,
      autoridades: JSON.stringify(autoridades),
    };
  }

  /**
   * Actualiza datos básicos de la facultad
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   */
  static async actualizarDatosFacultad(req, res) {
    try {
      const { nombre, acronimo, logo } = req.body;

      // Obtenemos la primera facultad
      const facultad = await prisma.facultad.findFirst();

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      // Validamos que al menos uno de los campos no esté vacío
      if (!nombre && !acronimo && !logo) {
        return res.status(400).json({
          msg: "Debe proporcionar al menos un dato para actualizar",
        });
      }

      // Creamos un objeto con los datos a actualizar
      const datosActualizar = {};

      if (nombre) datosActualizar.nom_fac = nombre;
      if (acronimo) datosActualizar.acr_fac = acronimo;
      if (logo) datosActualizar.url_log_fac = logo;

      // Actualizamos los datos de la facultad
      const facultadActualizada = await prisma.facultad.update({
        where: { id_fac: facultad.id_fac },
        data: datosActualizar,
      });

      // Preparamos la respuesta
      const datosFacultad = {
        nombre: facultadActualizada.nom_fac,
        acronimo: facultadActualizada.acr_fac || "FISEI", // Valor por defecto si es null
        logo:
          facultadActualizada.url_log_fac || "https://imgur.com/fch1iy6.png", // Valor por defecto si es null
      };

      res.status(200).json(datosFacultad);
    } catch (error) {
      console.error("Error al actualizar datos de la facultad:", error);
      res.status(500).json({
        msg: "Error al actualizar datos de la facultad",
        error: error.message,
      });
    }
  }
}

// Exportamos las funciones
module.exports = {
  obtenerMVA: MVAController.obtenerMVA,
  actualizarMVA: MVAController.actualizarMVA,
  obtenerDatosFacultad: MVAController.obtenerDatosFacultad,
  actualizarDatosFacultad: MVAController.actualizarDatosFacultad,
};
