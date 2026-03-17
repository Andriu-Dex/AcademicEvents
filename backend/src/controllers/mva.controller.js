const { prisma } = require("../config/db");
const { createTenantScoped } = require("../utils/tenantScope");

class MVAController {
  static tenantWhere(req, extra = {}) {
    if (req.tenantId) {
      return { tenantId: req.tenantId, ...extra };
    }
    return extra;
  }

  static async obtenerFacultadPrincipal(req) {
    const scoped = createTenantScoped(prisma, req.tenantId);
    return scoped.findFirst("faculty", {
      where: {},
      orderBy: { createdAt: "asc" },
    });
  }

  static traducirTipoAutoridad(tipoAutoridad) {
    const traducciones = {
      DEAN: "Decano",
      VICE_DEAN: "Subdecano",
      COORDINATOR: "Coordinador de Carrera",
      SECRETARY: "Secretario",
    };

    return traducciones[tipoAutoridad] || "Autoridad";
  }

  static determinarTipoAutoridad(cargo = "") {
    const cargoLower = String(cargo).toLowerCase();

    if (
      cargoLower.includes("subdecano") ||
      cargoLower.includes("sub-decano") ||
      cargoLower.includes("sub decano") ||
      cargoLower.includes("vicedecano") ||
      cargoLower.includes("vice decano")
    ) {
      return "VICE_DEAN";
    }

    if (cargoLower.includes("decano")) {
      return "DEAN";
    }

    if (cargoLower.includes("secretario")) {
      return "SECRETARY";
    }

    return "COORDINATOR";
  }

  static separarNombreYTitulo(nombreCompleto = "") {
    const partes = String(nombreCompleto)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      return {
        academicTitle: "",
        firstName: "",
        lastName: "",
      };
    }

    let academicTitle = "";
    let firstName = "";
    let lastName = "";

    if (partes[0].endsWith(".")) {
      academicTitle = partes[0];
      firstName = partes[1] || "";
      lastName = partes.slice(2).join(" ");
    } else {
      firstName = partes[0] || "";
      lastName = partes.slice(1).join(" ");
    }

    return { academicTitle, firstName, lastName };
  }

  static mapearAutoridadParaFrontend(autoridad) {
    return {
      cargo: MVAController.traducirTipoAutoridad(autoridad.type),
      nombre: `${autoridad.academicTitle || ""} ${autoridad.firstName || ""} ${
        autoridad.lastName || ""
      }`.trim(),
      imagen: autoridad.imageUrl || "https://i.imgur.com/hYBsxIf.png",
      email: autoridad.email || "",
    };
  }

  static async obtenerMVADatos(req, facultyId) {
    const scoped = createTenantScoped(prisma, req.tenantId);
    const facultad = await scoped.findFirst("faculty", {
      where: { id: facultyId },
    });

    const autoridadesFacultad = await scoped.findMany("facultyAuthority", {
      where: {
        facultyId,
        isActive: true,
      },
      orderBy: {
        type: "asc",
      },
    });

    const autoridades = autoridadesFacultad.map((autoridad) =>
      MVAController.mapearAutoridadParaFrontend(autoridad)
    );

    return {
      mision: facultad?.mission || "",
      vision: facultad?.vision || "",
      autoridades: JSON.stringify(autoridades),
    };
  }

  static async obtenerMVA(req, res) {
    try {
      const facultad = await MVAController.obtenerFacultadPrincipal(req);

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      const mvaInfo = await MVAController.obtenerMVADatos(req, facultad.id);
      return res.json(mvaInfo);
    } catch (error) {
      console.error("Error al obtener información MVA:", error);
      return res.status(500).json({
        msg: "Error al obtener información MVA",
        error: error.message,
      });
    }
  }

  static async obtenerDatosFacultad(req, res) {
    try {
      const facultad = await MVAController.obtenerFacultadPrincipal(req);

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      return res.json({
        nombre: facultad.name,
        acronimo: facultad.acronym || "FISEI",
        logo: facultad.logoUrl || "https://imgur.com/fch1iy6.png",
        descripcion: facultad.description,
      });
    } catch (error) {
      console.error("Error al obtener datos de la facultad:", error);
      return res.status(500).json({
        msg: "Error al obtener datos de la facultad",
        error: error.message,
      });
    }
  }

  static async actualizarMVA(req, res) {
    try {
      const scoped = createTenantScoped(prisma, req.tenantId);
      const { mision, vision, autoridades } = req.body;
      const facultad = await MVAController.obtenerFacultadPrincipal(req);

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      const datosActualizarFacultad = {};
      if (mision !== undefined) datosActualizarFacultad.mission = mision;
      if (vision !== undefined) datosActualizarFacultad.vision = vision;

      if (Object.keys(datosActualizarFacultad).length > 0) {
        await scoped.updateMany("faculty", {
          where: { id: facultad.id },
          data: datosActualizarFacultad,
        });
      }

      if (autoridades) {
        try {
          const autoridadesData = Array.isArray(autoridades)
            ? autoridades
            : JSON.parse(autoridades);

          const autoridadesActuales = await scoped.findMany(
            "facultyAuthority",
            {
              where: { facultyId: facultad.id },
            }
          );

          for (const autoridadData of autoridadesData) {
            const tipoAutoridad = MVAController.determinarTipoAutoridad(
              autoridadData.cargo
            );
            const { academicTitle, firstName, lastName } =
              MVAController.separarNombreYTitulo(autoridadData.nombre);

            const dataAutoridad = {
              firstName,
              lastName,
              email: autoridadData.email || null,
              imageUrl: autoridadData.imagen || "https://i.imgur.com/hYBsxIf.png",
              academicTitle: academicTitle || null,
              isActive: true,
            };

            const autoridadExistente = autoridadesActuales.find(
              (autoridad) => autoridad.type === tipoAutoridad
            );

            if (autoridadExistente) {
              await scoped.updateMany("facultyAuthority", {
                where: { id: autoridadExistente.id },
                data: dataAutoridad,
              });
            } else {
              await scoped.create("facultyAuthority", {
                data: {
                  facultyId: facultad.id,
                  type: tipoAutoridad,
                  startDate: new Date(),
                  ...dataAutoridad,
                },
              });
            }
          }
        } catch (jsonError) {
          console.error("Error al procesar JSON de autoridades:", jsonError);
        }
      }

      const mvaInfo = await MVAController.obtenerMVADatos(req, facultad.id);
      return res.status(200).json(mvaInfo);
    } catch (error) {
      console.error("Error al actualizar información MVA:", error);
      return res.status(500).json({
        msg: "Error al actualizar información MVA",
        error: error.message,
      });
    }
  }

  static async actualizarDatosFacultad(req, res) {
    try {
      const scoped = createTenantScoped(prisma, req.tenantId);
      const { nombre, acronimo, logo } = req.body;
      const facultad = await MVAController.obtenerFacultadPrincipal(req);

      if (!facultad) {
        return res.status(404).json({ msg: "Facultad no encontrada" });
      }

      if (!nombre && !acronimo && !logo) {
        return res.status(400).json({
          msg: "Debe proporcionar al menos un dato para actualizar",
        });
      }

      const datosActualizar = {};
      if (nombre) datosActualizar.name = nombre;
      if (acronimo) datosActualizar.acronym = acronimo;
      if (logo) datosActualizar.logoUrl = logo;

      await scoped.updateMany("faculty", {
        where: { id: facultad.id },
        data: datosActualizar,
      });

      const facultadActualizada = await scoped.findFirst("faculty", {
        where: { id: facultad.id },
      });

      return res.status(200).json({
        nombre: facultadActualizada.name,
        acronimo: facultadActualizada.acronym || "FISEI",
        logo: facultadActualizada.logoUrl || "https://imgur.com/fch1iy6.png",
      });
    } catch (error) {
      console.error("Error al actualizar datos de la facultad:", error);
      return res.status(500).json({
        msg: "Error al actualizar datos de la facultad",
        error: error.message,
      });
    }
  }
}

module.exports = {
  obtenerMVA: MVAController.obtenerMVA,
  actualizarMVA: MVAController.actualizarMVA,
  obtenerDatosFacultad: MVAController.obtenerDatosFacultad,
  actualizarDatosFacultad: MVAController.actualizarDatosFacultad,
};
