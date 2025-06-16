/**
 * Controlador para la gestión de administradores
 * Permite a los super administradores crear otros administradores
 * @module controllers/admin.controller
 */

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { validateCedula } = require("../utils/validations");

/**
 * Clase para la gestión de administradores
 * Implementa el patrón Singleton para asegurar una única instancia
 */
class AdminController {
  static instance;

  /**
   * Obtiene la instancia única del controlador (Singleton)
   * @returns {AdminController} Instancia del controlador
   */
  static getInstance() {
    if (!AdminController.instance) {
      AdminController.instance = new AdminController();
    }
    return AdminController.instance;
  }

  /**
   * Crea un nuevo administrador con correo verificado automáticamente
   * Solo puede ser ejecutado por un ADMIN_GLOBAL
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async crearAdmin(req, res) {
    try {
      const { cedula, nombres, apellidos, celular, correo, contrasena, rol } =
        req.body;

      // Validar datos requeridos
      if (
        !cedula ||
        !nombres ||
        !apellidos ||
        !celular ||
        !correo ||
        !contrasena ||
        !rol
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios",
        });
      }

      // Validar el rol (solo puede ser ADMIN_GLOBAL o ADMIN_GENERAL)
      if (rol !== "ADMIN_GLOBAL" && rol !== "ADMIN_GENERAL") {
        return res.status(400).json({
          error: "El rol debe ser ADMIN_GLOBAL o ADMIN_GENERAL",
        });
      }

      // Validate that the cedula is Ecuadorian
      // if (!validateCedula(cedula)) {
      //   return res.status(400).json({
      //     error: "La cédula ingresada no es válida",
      //   });
      // }

      // Verificar si ya existe un usuario con esa cédula
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { ced_usu: cedula },
      });

      if (usuarioExistente) {
        return res.status(400).json({
          error: "Ya existe un usuario con esa cédula",
        });
      }

      // Verificar si ya existe una cuenta con ese correo
      const cuentaExistente = await prisma.cuenta.findUnique({
        where: { cor_usu: correo },
      });

      if (cuentaExistente) {
        return res.status(400).json({
          error: "Ya existe una cuenta con ese correo",
        });
      }

      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      // Crear el nuevo admin (usuario + cuenta verificada)
      const nuevoAdmin = await prisma.usuario.create({
        data: {
          ced_usu: cedula,
          nom_usu: nombres,
          ape_usu: apellidos,
          cel_usu: celular,
          fec_cre_usu: new Date(),
          cuentas: {
            create: [
              {
                cor_usu: correo,
                con_usu: hashedPassword,
                rol_usu: rol,
                est_ver_cor: true, // Cuenta verificada automáticamente
                fec_ver_cor: new Date(), // Fecha de verificación
              },
            ],
          },
        },
        include: {
          cuentas: true,
        },
      });

      // Omitir la contraseña en la respuesta
      const adminCreado = {
        ...nuevoAdmin,
        cuentas: nuevoAdmin.cuentas.map((cuenta) => ({
          ...cuenta,
          con_usu: undefined,
        })),
      };

      return res.status(201).json({
        mensaje: "Administrador creado correctamente",
        admin: adminCreado,
      });
    } catch (error) {
      console.error("Error al crear administrador:", error);
      return res.status(500).json({
        error: "Error al crear el administrador",
        detalle: error.message,
      });
    }
  }

  /**
   * Obtiene la lista de todos los administradores
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async listarAdmins(req, res) {
    try {
      const administradores = await prisma.cuenta.findMany({
        where: {
          OR: [{ rol_usu: "ADMIN_GLOBAL" }, { rol_usu: "ADMIN_GENERAL" }],
        },
        select: {
          id_cue: true,
          cor_usu: true,
          rol_usu: true,
          fec_cre_cue: true,
          est_ver_cor: true,
          fec_ver_cor: true,
          usuario: {
            select: {
              ced_usu: true,
              nom_usu: true,
              ape_usu: true,
              cel_usu: true,
              img_per_usu: true,
            },
          },
        },
      });

      return res.status(200).json(administradores);
    } catch (error) {
      console.error("Error al listar administradores:", error);
      return res.status(500).json({
        error: "Error al obtener la lista de administradores",
        detalle: error.message,
      });
    }
  }
}

module.exports = AdminController.getInstance();
