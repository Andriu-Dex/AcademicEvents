/**
 * Controlador para la gestión de administradores
 * Permite a los super administradores crear otros administradores
 * @module controllers/admin.controller
 */
const { prisma } = require("../config/db");
const bcrypt = require("bcrypt");
const { validateCedula } = require("../utils/validations");
const { auditAdminAction } = require("../utils/adminAudit.utils");
const accountBlockService = require("../services/accountBlock.service");

const ROLE_TO_DB = {
  ADMIN_GLOBAL: "GLOBAL_ADMIN",
  ADMIN_GENERAL: "GENERAL_ADMIN",
  ESTUDIANTE: "STUDENT",
  GENERAL: "GENERAL",
};

const ROLE_FROM_DB = {
  GLOBAL_ADMIN: "ADMIN_GLOBAL",
  GENERAL_ADMIN: "ADMIN_GENERAL",
  STUDENT: "ESTUDIANTE",
  GENERAL: "GENERAL",
};

const ADMIN_DB_ROLES = ["GLOBAL_ADMIN", "GENERAL_ADMIN"];
const USER_DB_ROLES = ["STUDENT", "GENERAL"];

function resolveClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || null;
}

function toLegacyAccountShape(account, activeBlock = null) {
  return {
    id_cue: account.id,
    cor_usu: account.email,
    rol_usu: ROLE_FROM_DB[account.role] || account.role,
    est_ver_cor: account.isEmailVerified,
    est_bloqueado: Boolean(activeBlock?.isActive),
    razon_bloqueo: activeBlock?.blockedReason || null,
    fec_bloqueo: activeBlock?.blockedAt || null,
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

function mapIncomingRoleToDb(role) {
  if (!role) return null;
  if (ROLE_TO_DB[role]) return ROLE_TO_DB[role];
  if (Object.values(ROLE_TO_DB).includes(role)) return role;
  return null;
}

function normalizeReason(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function enrichAccountsWithBlockState(tenantId, accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return [];
  }

  const accountIds = accounts.map((account) => account.id);
  const activeBlocks = await accountBlockService.getActiveBlocksByAccountIds(
    tenantId,
    accountIds
  );

  return accounts.map((account) =>
    toLegacyAccountShape(account, activeBlocks.get(account.id) || null)
  );
}

async function countActiveGlobalAdmins(tenantId) {
  const globalAdmins = await prisma.account.findMany({
    where: {
      tenantId,
      role: "GLOBAL_ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (globalAdmins.length === 0) {
    return 0;
  }

  const activeBlocks = await accountBlockService.getActiveBlocksByAccountIds(
    tenantId,
    globalAdmins.map((account) => account.id)
  );

  return globalAdmins.filter((account) => !activeBlocks.has(account.id)).length;
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
        admin: toLegacyAccountShape(nuevoAdmin),
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

      const formattedAdmins = await enrichAccountsWithBlockState(
        req.tenantId,
        administradores
      );

      return res.status(200).json(formattedAdmins);
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
      const formattedAdmins = await enrichAccountsWithBlockState(
        req.tenantId,
        administradores
      );

      return res.json({
        data: formattedAdmins,
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

  async listarUsuariosPaginados(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 15;
      const offset = (page - 1) * limit;
      const { search, rol } = req.query;

      const whereCondition = {
        tenantId: req.tenantId,
        role: { in: USER_DB_ROLES },
        AND: [],
      };

      if (rol) {
        const dbRole = mapIncomingRoleToDb(rol);
        if (dbRole && USER_DB_ROLES.includes(dbRole)) {
          whereCondition.AND.push({ role: dbRole });
        }
      }

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

      const [usuarios, totalCount] = await Promise.all([
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

      const totalPages = Math.ceil(totalCount / limit);
      const formattedUsers = await enrichAccountsWithBlockState(
        req.tenantId,
        usuarios
      );

      return res.status(200).json({
        data: formattedUsers,
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
      console.error("Error al listar usuarios paginados:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        message: error.message,
      });
    }
  }

  async actualizarCuenta(req, res) {
    const ip = resolveClientIp(req);

    try {
      const { id } = req.params;
      const {
        cedula,
        nombres,
        apellidos,
        celular,
        correo,
        rol,
        est_ver_cor,
      } = req.body;

      const cuentaActual = await prisma.account.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!cuentaActual || cuentaActual.tenantId !== req.tenantId) {
        return res.status(404).json({ error: "Cuenta no encontrada" });
      }

      if (
        req.usuario.id === id &&
        rol &&
        mapIncomingRoleToDb(rol) !== cuentaActual.role
      ) {
        return res.status(400).json({ error: "No puede modificar su propio rol" });
      }

      const newRole = mapIncomingRoleToDb(rol);
      if (rol && !newRole) {
        return res.status(400).json({ error: "Rol inválido" });
      }

      if (correo && correo !== cuentaActual.email) {
        const correoExistente = await prisma.account.findUnique({
          where: {
            tenantId_email: {
              tenantId: req.tenantId,
              email: correo,
            },
          },
        });

        if (correoExistente) {
          return res.status(400).json({ error: "El correo ya está registrado" });
        }
      }

      if (cedula && cedula !== cuentaActual.user.idNumber) {
        const cedulaExistente = await prisma.user.findUnique({
          where: {
            tenantId_idNumber: {
              tenantId: req.tenantId,
              idNumber: cedula,
            },
          },
        });

        if (cedulaExistente) {
          return res.status(400).json({ error: "La cédula ya está registrada" });
        }
      }

      const updatedAccount = await prisma.$transaction(async (tx) => {
        if (cedula || nombres || apellidos || celular) {
          await tx.user.update({
            where: { id: cuentaActual.user.id },
            data: {
              ...(cedula ? { idNumber: cedula } : {}),
              ...(nombres ? { firstName: nombres } : {}),
              ...(apellidos ? { lastName: apellidos } : {}),
              ...(celular ? { phone: celular } : {}),
            },
          });
        }

        return tx.account.update({
          where: { id },
          data: {
            ...(correo ? { email: correo } : {}),
            ...(newRole ? { role: newRole } : {}),
            ...(typeof est_ver_cor === "boolean"
              ? {
                  isEmailVerified: est_ver_cor,
                  emailVerifiedAt: est_ver_cor ? new Date() : null,
                }
              : {}),
          },
          include: {
            user: true,
          },
        });
      });

      auditAdminAction({
        action: "ACCOUNT_UPDATED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        target: {
          accountId: id,
        },
        details: {
          fields: {
            cedula: Boolean(cedula),
            nombres: Boolean(nombres),
            apellidos: Boolean(apellidos),
            celular: Boolean(celular),
            correo: Boolean(correo),
            rol: Boolean(rol),
            est_ver_cor: typeof est_ver_cor === "boolean",
          },
        },
      });

      const activeBlock = await accountBlockService.getActiveBlock(
        req.tenantId,
        updatedAccount.id
      );

      return res.status(200).json({
        mensaje: "Cuenta actualizada correctamente",
        cuenta: toLegacyAccountShape(updatedAccount, activeBlock),
      });
    } catch (error) {
      auditAdminAction({
        action: "ACCOUNT_UPDATED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        success: false,
        details: { error: error.message },
      });

      console.error("Error al actualizar cuenta:", error);
      return res.status(500).json({
        error: "No se pudo actualizar la cuenta",
        detalle: error.message,
      });
    }
  }

  async eliminarCuenta(req, res) {
    const ip = resolveClientIp(req);

    try {
      const { id } = req.params;

      if (req.usuario.id === id) {
        return res.status(400).json({ error: "No puede eliminar su propia cuenta" });
      }

      const cuentaActual = await prisma.account.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!cuentaActual || cuentaActual.tenantId !== req.tenantId) {
        return res.status(404).json({ error: "Cuenta no encontrada" });
      }

      const [
        totalInscripciones,
        totalEventosCreados,
        totalValidacionesInscripciones,
        totalValidacionesComprobantes,
        totalValidacionesCartas,
        totalObservaciones,
      ] = await Promise.all([
        prisma.registration.count({
          where: { tenantId: req.tenantId, accountId: id },
        }),
        prisma.event.count({
          where: { tenantId: req.tenantId, createdByAccountId: id },
        }),
        prisma.registration.count({
          where: { tenantId: req.tenantId, validatedByAdminId: id },
        }),
        prisma.paymentReceipt.count({
          where: { tenantId: req.tenantId, validatedByAdminId: id },
        }),
        prisma.motivationLetter.count({
          where: { tenantId: req.tenantId, validatedByAdminId: id },
        }),
        prisma.registrationObservation.count({
          where: { tenantId: req.tenantId, createdByAdminId: id },
        }),
      ]);

      const tieneDependencias =
        totalInscripciones > 0 ||
        totalEventosCreados > 0 ||
        totalValidacionesInscripciones > 0 ||
        totalValidacionesComprobantes > 0 ||
        totalValidacionesCartas > 0 ||
        totalObservaciones > 0;

      if (tieneDependencias) {
        return res.status(409).json({
          error:
            "No se puede eliminar la cuenta porque tiene información histórica relacionada",
          dependencias: {
            inscripciones: totalInscripciones,
            eventosCreados: totalEventosCreados,
            validacionesInscripciones: totalValidacionesInscripciones,
            validacionesComprobantes: totalValidacionesComprobantes,
            validacionesCartas: totalValidacionesCartas,
            observaciones: totalObservaciones,
          },
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.accountBlockState.updateMany({
          where: {
            tenantId: req.tenantId,
            accountId: id,
            isActive: true,
          },
          data: {
            isActive: false,
            unblockedReason: "Cuenta eliminada por administrador",
            unblockedByAdminId: req.usuario.id,
            unblockedAt: new Date(),
          },
        });

        const accountCountBeforeDelete = await tx.account.count({
          where: {
            tenantId: req.tenantId,
            userId: cuentaActual.userId,
          },
        });

        await tx.account.delete({
          where: { id },
        });

        if (accountCountBeforeDelete === 1) {
          await tx.user.delete({
            where: { id: cuentaActual.userId },
          });
        }
      });

      auditAdminAction({
        action: "ACCOUNT_DELETED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        target: {
          accountId: id,
          role: cuentaActual.role,
        },
      });

      return res.status(200).json({ mensaje: "Cuenta eliminada correctamente" });
    } catch (error) {
      auditAdminAction({
        action: "ACCOUNT_DELETED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        success: false,
        details: { error: error.message },
      });

      console.error("Error al eliminar cuenta:", error);
      return res.status(500).json({
        error: "No se pudo eliminar la cuenta",
        detalle: error.message,
      });
    }
  }

  async bloquearCuenta(req, res) {
    const ip = resolveClientIp(req);

    try {
      const { id } = req.params;
      const reason = normalizeReason(req.body?.motivo);

      if (!reason || reason.length < 8) {
        return res.status(400).json({
          error:
            "Debe proporcionar un motivo de bloqueo con al menos 8 caracteres",
        });
      }

      if (req.usuario.id === id) {
        return res.status(400).json({ error: "No puede bloquear su propia cuenta" });
      }

      const cuentaActual = await prisma.account.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!cuentaActual || cuentaActual.tenantId !== req.tenantId) {
        return res.status(404).json({ error: "Cuenta no encontrada" });
      }

      if (cuentaActual.role === "GLOBAL_ADMIN") {
        const totalGlobalesActivos = await countActiveGlobalAdmins(req.tenantId);
        if (totalGlobalesActivos <= 1) {
          return res.status(409).json({
            error:
              "No se puede bloquear al último Super Administrador activo del tenant",
          });
        }
      }

      const blockData = await prisma.$transaction(async (tx) => {
        const createdBlock = await accountBlockService.blockAccount(
          {
            tenantId: req.tenantId,
            accountId: id,
            reason,
            adminId: req.usuario.id,
          },
          tx
        );

        const activeTokens = await tx.accountToken.findMany({
          where: {
            tenantId: req.tenantId,
            accountId: id,
            status: "ACTIVE",
          },
          select: { id: true },
        });

        if (activeTokens.length > 0) {
          const tokenIds = activeTokens.map((token) => token.id);

          await tx.accountToken.updateMany({
            where: {
              tenantId: req.tenantId,
              id: { in: tokenIds },
              status: "ACTIVE",
            },
            data: {
              status: "INVALIDATED",
            },
          });

          await tx.tokenInvalidation.createMany({
            data: tokenIds.map((tokenId) => ({
              tenantId: req.tenantId,
              tokenId,
              reason: "ADMIN_MANUAL",
              description: `Cuenta bloqueada por administrador: ${reason}`,
              ip,
              adminId: req.usuario.id,
            })),
            skipDuplicates: true,
          });
        }

        return {
          createdBlock,
          invalidatedTokens: activeTokens.length,
        };
      });

      auditAdminAction({
        action: "ACCOUNT_BLOCKED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        target: {
          accountId: id,
          role: cuentaActual.role,
        },
        details: {
          reason,
          invalidatedTokens: blockData.invalidatedTokens,
        },
      });

      return res.status(200).json({
        mensaje: "Cuenta bloqueada correctamente",
        bloqueo: blockData.createdBlock,
      });
    } catch (error) {
      const isUniqueViolation = error?.code === "23505";
      const isPrismaUniqueViolation = error?.code === "P2002";

      if (isUniqueViolation || isPrismaUniqueViolation) {
        return res.status(409).json({
          error: "La cuenta ya se encuentra bloqueada",
        });
      }

      auditAdminAction({
        action: "ACCOUNT_BLOCKED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        success: false,
        details: { error: error.message },
      });

      console.error("Error al bloquear cuenta:", error);
      return res.status(500).json({
        error: "No se pudo bloquear la cuenta",
        detalle: error.message,
      });
    }
  }

  async desbloquearCuenta(req, res) {
    const ip = resolveClientIp(req);

    try {
      const { id } = req.params;
      const reason = normalizeReason(req.body?.motivo);

      if (!reason || reason.length < 8) {
        return res.status(400).json({
          error:
            "Debe proporcionar un motivo de desbloqueo con al menos 8 caracteres",
        });
      }

      const cuentaActual = await prisma.account.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!cuentaActual || cuentaActual.tenantId !== req.tenantId) {
        return res.status(404).json({ error: "Cuenta no encontrada" });
      }

      const updatedBlock = await accountBlockService.unblockAccount({
        tenantId: req.tenantId,
        accountId: id,
        reason,
        adminId: req.usuario.id,
      });

      if (!updatedBlock) {
        return res.status(409).json({
          error: "La cuenta no se encuentra bloqueada",
        });
      }

      auditAdminAction({
        action: "ACCOUNT_UNBLOCKED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        target: {
          accountId: id,
          role: cuentaActual.role,
        },
        details: {
          reason,
        },
      });

      return res.status(200).json({
        mensaje: "Cuenta desbloqueada correctamente",
        bloqueo: updatedBlock,
      });
    } catch (error) {
      auditAdminAction({
        action: "ACCOUNT_UNBLOCKED_BY_GLOBAL_ADMIN",
        actor: req.usuario,
        tenantId: req.tenantId,
        ip,
        success: false,
        details: { error: error.message },
      });

      console.error("Error al desbloquear cuenta:", error);
      return res.status(500).json({
        error: "No se pudo desbloquear la cuenta",
        detalle: error.message,
      });
    }
  }
}

module.exports = AdminController.getInstance();
