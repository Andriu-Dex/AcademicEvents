const { randomBytes } = require("crypto");
const { prisma } = require("../config/db");

/**
 * @class TokenService
 * @description Servicio para gestionar tokens de verificación y seguridad
 */
class TokenService {
  /**
   * Crea un nuevo token en la base de datos
   * @param {Object} options - Opciones para la creación del token
   * @param {string} options.idCuenta - ID de la cuenta asociada al token
   * @param {string} options.tipoToken - Tipo de token (VERIFICAR_CORREO, etc.)
   * @param {string} options.ip - Dirección IP desde donde se solicita el token
   * @param {number} options.horasValidez - Horas de validez del token (default: 24)
   * @returns {Promise<Object>} Token creado
   */
  async crearToken({ idCuenta, tipoToken, ip, horasValidez = 24, tenantId }) {
    try {
      // Generar token aleatorio de 64 caracteres (32 bytes en hex = 64 caracteres)
      const tokenValue = randomBytes(32).toString("hex");

      // Calcular fecha de expiración (24 horas por defecto)
      const fechaExpiracion = new Date();
      fechaExpiracion.setHours(fechaExpiracion.getHours() + horasValidez);

      // Crear token en la base de datos
      const token = await prisma.accountToken.create({
        data: {
          tenantId,
          accountId: idCuenta,
          value: tokenValue,
          type: tipoToken,
          expiresAt: fechaExpiracion,
          requestIp: ip || null,
        },
      });

      return token;
    } catch (error) {
      console.error("Error al crear token:", error);
      throw new Error("Error al generar el token de verificación");
    }
  }

  /**
   * Crea un token con código numérico de 6 dígitos para verificación
   * @param {Object} options - Opciones para la creación
   * @param {string} options.idCuenta - ID de la cuenta
   * @param {string} options.tipoToken - Tipo de token
   * @param {string} options.ip - Dirección IP
   * @param {number} options.minutosValidez - Minutos de validez (default: 15)
   * @param {string} options.tenantId - ID del tenant
   * @returns {Promise<Object>} Token creado con código
   */
  async crearTokenConCodigo({ idCuenta, tipoToken, ip, minutosValidez = 15, tenantId }) {
    try {
      // Generar código numérico de 6 dígitos (100000-999999)
      const codigoNumerico = String(
        100000 + Math.floor(Math.random() * 900000)
      );

      // Generar value interno para tracking (no se muestra al usuario)
      const tokenValue = randomBytes(32).toString("hex");

      // Calcular fecha de expiración (15 minutos por defecto)
      const fechaExpiracion = new Date();
      fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + minutosValidez);

      // Crear token en la base de datos
      const token = await prisma.accountToken.create({
        data: {
          tenantId,
          accountId: idCuenta,
          value: tokenValue,
          code: codigoNumerico,
          type: tipoToken,
          expiresAt: fechaExpiracion,
          requestIp: ip || null,
        },
      });

      return token;
    } catch (error) {
      console.error("Error al crear token con código:", error);
      throw new Error("Error al generar el código de verificación");
    }
  }

  /**
   * Valida un código de verificación de 6 dígitos
   * @param {Object} options - Opciones para la validación
   * @param {string} options.accountId - ID de la cuenta
   * @param {string} options.code - Código de 6 dígitos ingresado por el usuario
   * @param {string} options.tipoToken - Tipo de token esperado
   * @param {string} options.ip - IP desde donde se realiza la validación
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validarCodigo({ accountId, code, tipoToken, ip }) {
    try {
      // Buscar token activo con ese código para esa cuenta
      const token = await prisma.accountToken.findFirst({
        where: {
          accountId,
          code,
          type: tipoToken,
          status: "ACTIVE",
        },
        include: {
          invalidation: true,
          usage: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Verificar existencia del token
      if (!token) {
        // Verificar si el código ya fue usado (para dar mejor mensaje)
        const tokenUsado = await prisma.accountToken.findFirst({
          where: {
            accountId,
            code,
            type: tipoToken,
            status: "USED",
          },
        });

        if (tokenUsado) {
          const cuenta = await prisma.account.findUnique({
            where: { id: accountId },
            select: { isEmailVerified: true },
          });

          return {
            valido: false,
            mensaje: "Este código ya ha sido utilizado.",
            motivo: "USO_NORMAL",
            cuentaVerificada: cuenta?.isEmailVerified || false,
          };
        }

        return {
          valido: false,
          mensaje: "El código ingresado no es válido.",
          motivo: "CODIGO_INVALIDO",
        };
      }

      // Verificar expiración
      if (new Date() > token.expiresAt) {
        await prisma.accountToken.update({
          where: { id: token.id },
          data: { status: "EXPIRED" },
        });

        return {
          valido: false,
          mensaje: "El código ha expirado. Por favor solicita uno nuevo.",
          motivo: "EXPIRADO",
          expirado: true,
          token,
        };
      }

      return {
        valido: true,
        mensaje: "Código válido",
        token,
      };
    } catch (error) {
      console.error("Error al validar código:", error);
      throw new Error("Error al validar el código");
    }
  }

  /**
   * Valida un token existente
   * @param {Object} options - Opciones para la validación
   * @param {string} options.tokenValue - Valor del token a validar
   * @param {string} options.tipoToken - Tipo de token esperado
   * @param {string} options.ip - IP desde donde se realiza la validación
   * @returns {Promise<Object>} Resultado de la validación
   */ async validarToken({ tokenValue, tipoToken, ip }) {
    try {
      // Buscar token en la base de datos con sus relaciones
      const token = await prisma.accountToken.findUnique({
        where: { value: tokenValue },
        include: {
          invalidation: true,
          usage: true,
        },
      });

      // Verificar existencia del token
      if (!token) {
        return {
          valido: false,
          mensaje: "El token no existe o es inválido",
        };
      }

      // Verificar tipo de token
      if (token.type !== tipoToken) {
        return {
          valido: false,
          mensaje: "El tipo de token no es válido",
        };
      } // Verificar estado del token
      if (token.status !== "ACTIVE") {
        // Si el token ya fue usado, verificar si la cuenta está verificada
        let cuentaVerificada = false;
        if (token.status === "USED" && tipoToken === "VERIFY_EMAIL") {
          const account = await prisma.account.findUnique({
            where: { id: token.accountId },
            select: { isEmailVerified: true },
          });
          cuentaVerificada = account?.isEmailVerified || false;
        }

        // Determinar mensaje según el estado
        let motivo = "USO_NORMAL";
        let mensaje = "Este enlace ya ha sido utilizado";

        if (token.status === "INVALIDATED" && token.invalidation) {
          if (token.invalidation.reason === "INCORRECT_EMAIL") {
            motivo = "CORRECCION_CORREO";
            mensaje =
              "Este enlace ya no es válido porque se ha corregido el correo electrónico. Por favor, utilice el enlace enviado al nuevo correo.";
          } else {
            motivo = "INVALIDADO";
            mensaje = "Este enlace ha sido invalidado.";
          }
        } else if (token.status === "EXPIRED") {
          motivo = "EXPIRADO";
          mensaje = "El enlace ha expirado.";
        } else if (token.status === "USED") {
          motivo = "USO_NORMAL";
          mensaje = "Este enlace ya ha sido utilizado.";
        } else if (token.status === "REPLACED") {
          motivo = "REEMPLAZADO";
          mensaje = "Este enlace ha sido reemplazado por uno nuevo.";
        }
        return {
          valido: false,
          mensaje: mensaje,
          motivo: motivo,
          token,
          cuentaVerificada,
        };
      }

      // Verificar expiración
      if (new Date() > token.expiresAt) {
        // Actualizar estado a EXPIRED
        await prisma.accountToken.update({
          where: { id: token.id },
          data: { status: "EXPIRED" },
        });

        return {
          valido: false,
          mensaje: "El enlace ha expirado",
          motivo: "EXPIRADO",
          expirado: true,
          token,
        };
      }

      return {
        valido: true,
        mensaje: "Token válido",
        token,
      };
    } catch (error) {
      console.error("Error al validar token:", error);
      throw new Error("Error al validar el token");
    }
  }

  /**
   * Marca un token como usado
   * @param {string} tokenValue - Valor del token a marcar
   * @param {string} ip - Dirección IP desde donde se utiliza
   * @returns {Promise<Object>} Token actualizado
   */ async marcarTokenComoUsado(tokenValue, ip) {
    try {
      // Paso 1: Actualizar el estado del token a USED
      const tokenActualizado = await prisma.accountToken.update({
        where: { value: tokenValue },
        data: {
          status: "USED",
        },
      });

      // Paso 2: Registrar el uso del token en la tabla TokenUsage
      await prisma.tokenUsage.create({
        data: {
          tenantId: tokenActualizado.tenantId,
          tokenId: tokenActualizado.id,
          ip: ip || "0.0.0.0",
          successful: true,
        },
      });

      return tokenActualizado;
    } catch (error) {
      console.error("Error al marcar token como usado:", error);
      throw new Error("Error al procesar el token");
    }
  }

  /**
   * Actualiza el estado de verificación de una cuenta
   * @param {string} idCuenta - ID de la cuenta a actualizar
   * @returns {Promise<Object>} Cuenta actualizada
   */ async actualizarEstadoVerificacion(idCuenta) {
    try {
      console.log(
        `[${new Date().toISOString()}] TokenService: Actualizando estado de verificación para cuenta ID: ${idCuenta}`
      );

      // Primero, verificar si la cuenta ya está verificada
      const accountExists = await prisma.account.findUnique({
        where: { id: idCuenta },
        select: { isEmailVerified: true },
      });

      console.log(
        `[${new Date().toISOString()}] TokenService: Estado actual de verificación para cuenta ${idCuenta}:`,
        accountExists
      );

      const accountUpdated = await prisma.account.update({
        where: { id: idCuenta },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      console.log(
        `[${new Date().toISOString()}] TokenService: Cuenta ${idCuenta} actualizada exitosamente`
      );
      return accountUpdated;
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] TokenService: Error al actualizar estado de verificación para cuenta ${idCuenta}:`,
        error
      );
      throw new Error("Error al actualizar estado de verificación");
    }
  }

  /**
   * Obtiene una cuenta por su correo electrónico
   * @param {string} correo - Correo electrónico
   * @param {string} tenantId - ID del tenant (requerido por index compuesto)
   * @returns {Promise<Object|null>} Cuenta encontrada o null
   */
  async obtenerCuentaPorCorreo(correo, tenantId) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email: correo,
          },
        },
        include: { user: true },
      });

      return account;
    } catch (error) {
      console.error("Error al obtener cuenta por correo:", error);
      throw new Error("Error al buscar la cuenta");
    }
  }

  /**
   * Verifica si una cuenta ha excedido el límite de solicitudes
   * @param {string} correo - Correo electrónico de la cuenta
   * @param {string} tipoToken - Tipo de token a verificar
   * @param {number} limiteHora - Número máximo de solicitudes por hora
   * @param {number} minutos - Minutos para calcular el límite (default: 60)
   * @param {string} tenantId - ID del tenant
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarRateLimit(correo, tipoToken, limiteHora = 3, minutos = 60, tenantId) {
    try {
      const cuenta = await this.obtenerCuentaPorCorreo(correo, tenantId);
      if (!cuenta) {
        return {
          permitido: false,
          mensaje: "No existe una cuenta con este correo electrónico",
        };
      }

      // Calcular fecha límite (1 hora atrás por defecto)
      const fechaLimite = new Date();
      fechaLimite.setMinutes(fechaLimite.getMinutes() - minutos);

      // Contar tokens del mismo tipo en la última hora
      const conteoTokens = await prisma.accountToken.count({
        where: {
          accountId: cuenta.id,
          type: tipoToken,
          createdAt: {
            gte: fechaLimite,
          },
        },
      });

      if (conteoTokens >= limiteHora) {
        // Obtener el token más reciente para calcular tiempo restante
        const tokenMasReciente = await prisma.accountToken.findFirst({
          where: {
            accountId: cuenta.id,
            type: tipoToken,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        // Calcular tiempo restante en minutos
        const tiempoTranscurrido = Math.floor(
          (new Date() - tokenMasReciente.createdAt) / (1000 * 60)
        );
        const tiempoRestante = minutos - tiempoTranscurrido;

        return {
          permitido: false,
          mensaje: `Has excedido el límite de solicitudes. Intenta nuevamente en ${tiempoRestante} minutos.`,
          tiempoRestante,
        };
      }

      return {
        permitido: true,
        mensaje: "Solicitud permitida",
      };
    } catch (error) {
      console.error("Error al verificar rate limit:", error);
      throw new Error("Error al verificar límite de solicitudes");
    }
  }
  /**
   * Invalida tokens anteriores del mismo tipo para una cuenta
   * @param {string} idCuenta - ID de la cuenta
   * @param {string} tipoToken - Tipo de token a invalidar
   * @returns {Promise<number>} Número de tokens invalidados
   */
  async invalidarTokensAnteriores(idCuenta, tipoToken, tenantId) {
    try {
      // Primero, obtener los tokens activos que vamos a invalidar
      const tokensActivos = await prisma.accountToken.findMany({
        where: {
          accountId: idCuenta,
          type: tipoToken,
          status: "ACTIVE",
        },
      });

      // Si no hay tokens activos, retornar 0
      if (tokensActivos.length === 0) {
        return 0;
      }

      // Actualizar tokens activos a estado INVALIDATED
      const resultado = await prisma.accountToken.updateMany({
        where: {
          accountId: idCuenta,
          type: tipoToken,
          status: "ACTIVE",
        },
        data: {
          status: "INVALIDATED",
        },
      });

      // Registrar razón de invalidación para cada token
      for (const token of tokensActivos) {
        await prisma.tokenInvalidation.create({
          data: {
            tenantId,
            tokenId: token.id,
            reason: "INCORRECT_EMAIL",
            description: "Token invalidado por corrección de correo electrónico",
          },
        });
      }

      return resultado.count;
    } catch (error) {
      console.error("Error al invalidar tokens anteriores:", error);
      throw new Error("Error al invalidar tokens anteriores");
    }
  }

  /**
   * Verifica si ya existe una cuenta con el correo especificado
   * @param {string} correo - Correo electrónico a verificar
   * @param {string} tenantId - ID del tenant (requerido por index compuesto)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async verificarExistenciaCorreo(correo, tenantId) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email: correo,
          },
        },
      });

      return account !== null;
    } catch (error) {
      console.error("Error al verificar existencia de correo:", error);
      throw new Error("Error al verificar existencia del correo");
    }
  }
  /**
   * Determina el motivo por el cual un token fue invalidado
   * @private
   * @param {Object} token - Token a analizar
   * @returns {Promise<Object>} Objeto con motivo y mensaje
   */
  async _determinarMotivoInvalidacion(token) {
    try {
      // Primero, verificar si hay un registro de invalidación para este token
      const invalidacion = await prisma.tokenInvalidation.findFirst({
        where: {
          tokenId: token.id,
        },
      });

      // Si hay un registro de invalidación, usar la razón registrada
      if (invalidacion) {
        if (invalidacion.reason === "INCORRECT_EMAIL") {
          return {
            motivo: "CORRECCION_CORREO",
            mensaje:
              "Este enlace ya no es válido porque se ha corregido el correo electrónico. Por favor, utiliza el enlace enviado al nuevo correo.",
          };
        }

        return {
          motivo: invalidacion.reason,
          mensaje: "Este enlace ha sido invalidado: " + (invalidacion.description || ""),
        };
      }

      // Verificar si hay un token más reciente para el mismo usuario y tipo
      const tokenMasReciente = await prisma.accountToken.findFirst({
        where: {
          accountId: token.accountId,
          type: token.type,
          createdAt: {
            gt: token.createdAt, // Tokens creados después del token actual
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Si existe un token más reciente, fue invalidado por corrección de correo
      if (tokenMasReciente) {
        return {
          motivo: "CORRECCION_CORREO",
          mensaje:
            "Este enlace ya no es válido porque se ha corregido el correo electrónico. Por favor, utiliza el enlace enviado al nuevo correo.",
        };
      }

      // Si no hay token más reciente, fue usado normalmente
      return {
        motivo: "USO_NORMAL",
        mensaje: "Este enlace ya ha sido utilizado",
      };
    } catch (error) {
      console.error("Error al determinar motivo de invalidación:", error);
      return {
        motivo: "DESCONOCIDO",
        mensaje: "Este enlace ya no es válido",
      };
    }
  }

  /**
   * Invalida tokens específicos excepto el token activo
   * @param {string} idCuenta - ID de la cuenta
   * @param {string} tokenExcluido - Token que no debe invalidarse
   * @param {string} tipoToken - Tipo de token a invalidar
   * @param {string} razon - Razón de la invalidación
   * @param {string} descripcion - Descripción detallada de la invalidación
   * @returns {Promise<number>} Número de tokens invalidados
   */
  async invalidarTokensOtros(
    idCuenta,
    tokenExcluido,
    tipoToken,
    razon = "SECURITY",
    descripcion = "Invalidado por seguridad",
    tenantId
  ) {
    try {
      // Primero, obtener los tokens activos que vamos a invalidar (excluyendo el tokenExcluido)
      const tokensActivos = await prisma.accountToken.findMany({
        where: {
          accountId: idCuenta,
          type: tipoToken,
          status: "ACTIVE",
          value: {
            not: tokenExcluido,
          },
        },
      });

      // Si no hay tokens activos, retornar 0
      if (tokensActivos.length === 0) {
        return 0;
      }

      // Actualizar tokens activos a estado INVALIDATED
      const resultado = await prisma.accountToken.updateMany({
        where: {
          accountId: idCuenta,
          type: tipoToken,
          status: "ACTIVE",
          value: {
            not: tokenExcluido,
          },
        },
        data: {
          status: "INVALIDATED",
        },
      });

      // Registrar razón de invalidación para cada token
      for (const token of tokensActivos) {
        await prisma.tokenInvalidation.create({
          data: {
            tenantId,
            tokenId: token.id,
            reason: razon,
            description: descripcion,
          },
        });
      }

      console.log(
        `[${new Date().toISOString()}] TokenService: ${
          resultado.count
        } tokens invalidados por seguridad para cuenta ${idCuenta}`
      );
      return resultado.count;
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error al invalidar otros tokens:`,
        error
      );
      throw new Error("Error al invalidar otros tokens por seguridad");
    }
  }

  /**
   * Método auxiliar que verifica si un método existe en este servicio
   * @param {string} methodName - Nombre del método a verificar
   * @returns {boolean} - true si el método existe, false en caso contrario
   */
  hasMethod(methodName) {
    return typeof this[methodName] === "function";
  }
}

module.exports = TokenService;
