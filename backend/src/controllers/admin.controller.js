/**
 * Controlador para la gestión de administradores
 * Permite a los super administradores crear otros administradores
 * @module controllers/admin.controller
 */
const { prisma } = require("../config/db");
const bcrypt = require("bcrypt");
const { validateCedula } = require("../utils/validations");

const ROLE_TO_DB = {
  ADMIN_GLOBAL: "GLOBAL_ADMIN",
  ADMIN_GENERAL: "GENERAL_ADMIN",
};

const ROLE_FROM_DB = {
  GLOBAL_ADMIN: "ADMIN_GLOBAL",
  GENERAL_ADMIN: "ADMIN_GENERAL",
};

const ADMIN_DB_ROLES = ["GLOBAL_ADMIN", "GENERAL_ADMIN"];

function toLegacyAdminShape(account) {
  return {
    id_cue: account.id,
    cor_usu: account.email,
    rol_usu: ROLE_FROM_DB[account.role] || account.role,
    est_ver_cor: account.isEmailVerified,
    fec_cre_cue: account.createdAt,
    usuario: account.user
      ? {
          id_usu: account.user.id,
          ced_usu: account.user.idNumber,
          nom_usu: account.user.firstName,
          ape_usu: account.user.lastName,
          cel_usu: account.user.phone,
          img_per_usu: account.user.profileImageUrl,
        }
      : null,
  };
}

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

      // Validar el rol (solo puede ser GLOBAL_ADMIN o GENERAL_ADMIN)
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
      const usuarioExistente = await prisma.user.findUnique({
        where: {
          tenantId_idNumber: {
            tenantId: req.tenantId,
            idNumber: cedula,
          },
        },
      });

      if (usuarioExistente) {
        return res.status(400).json({
          error: "Ya existe un usuario con esa cédula",
        });
      }

      // Verificar si ya existe una cuenta con ese correo
      const cuentaExistente = await prisma.account.findUnique({
        where: {
          tenantId_email: {
            tenantId: req.tenantId,
            email: correo,
          },
        },
      });

      if (cuentaExistente) {
        return res.status(400).json({
          error: "Ya existe una cuenta con ese correo",
        });
      }

      // Cifrar la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      const roleForDb = ROLE_TO_DB[rol];

      // Crear el nuevo admin (usuario + cuenta verificada)
      const nuevoAdmin = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            tenantId: req.tenantId,
            idNumber: cedula,
            firstName: nombres,
            lastName: apellidos,
            phone: celular,
          },
        });

        const newAccount = await tx.account.create({
          data: {
            tenantId: req.tenantId,
            userId: newUser.id,
            email: correo,
            password: hashedPassword,
            role: roleForDb,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
          },
          include: {
            user: true,
          },
        });

        return newAccount;
      });

      return res.status(201).json({
        mensaje: "Administrador creado correctamente",
        admin: toLegacyAdminShape(nuevoAdmin),
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
      const administradores = await prisma.account.findMany({
        where: {
          tenantId: req.tenantId,
          role: { in: ADMIN_DB_ROLES },
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          isEmailVerified: true,
          emailVerifiedAt: true,
          user: {
            select: {
              id: true,
              idNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
              profileImageUrl: true,
            },
          },
        },
      });

      return res.status(200).json(administradores.map(toLegacyAdminShape));
    } catch (error) {
      console.error("Error al listar administradores:", error);
      return res.status(500).json({
        error: "Error al obtener la lista de administradores",
        detalle: error.message,
      });
    }
  }

  /**
   * Obtiene la lista de administradores con paginación
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   */
  async listarAdminsPaginados(req, res) {
    try {
      // Extraer parámetros de paginación
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const offset = (page - 1) * limit;

      // Extraer filtros
      const { search, rol } = req.query;

      // Construir condición WHERE base
      const whereCondition = {
        tenantId: req.tenantId,
        role: { in: ADMIN_DB_ROLES },
        AND: [],
      };

      // Filtro por rol específico
      if (rol) {
        const dbRole = ROLE_TO_DB[rol];
        if (dbRole) {
          whereCondition.AND.push({ role: dbRole });
        }
      }

      // Filtro de búsqueda
      if (search) {
        whereCondition.AND.push({
          OR: [
            {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { idNumber: { contains: search, mode: "insensitive" } },
                ],
              },
            },
            { email: { contains: search, mode: "insensitive" } },
          ],
        });
      }

      // Ejecutar consultas en paralelo
      const [administradores, totalCount] = await Promise.all([
        prisma.account.findMany({
          where: whereCondition,
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            isEmailVerified: true,
            emailVerifiedAt: true,
            user: {
              select: {
                id: true,
                idNumber: true,
                firstName: true,
                lastName: true,
                phone: true,
                profileImageUrl: true,
              },
            },
          },
          skip: offset,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.account.count({ where: whereCondition }),
      ]);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalCount / limit);

      return res.json({
        data: administradores.map(toLegacyAdminShape),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error en paginación de administradores:", error);
      res.status(500).json({
        error: "Error interno del servidor",
        message: error.message,
      });
    }
  }
}

module.exports = AdminController.getInstance();
