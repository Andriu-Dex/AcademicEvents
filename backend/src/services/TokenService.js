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
  async crearToken({ idCuenta, tipoToken, ip, horasValidez = 24 }) {
    try {
      // Generar token aleatorio de 64 caracteres (32 bytes en hex = 64 caracteres)
      const tokenValue = randomBytes(32).toString("hex");

      // Calcular fecha de expiración (24 horas por defecto)
      const fechaExpiracion = new Date();
      fechaExpiracion.setHours(fechaExpiracion.getHours() + horasValidez);

      // Crear token en la base de datos
      const token = await prisma.token_cuenta.create({
        data: {
          id_cue_per: idCuenta,
          tok_val: tokenValue,
          tip_tok: tipoToken,
          fec_exp_tok: fechaExpiracion,
          ip_sol: ip || null,
        },
      });

      return token;
    } catch (error) {
      console.error("Error al crear token:", error);
      throw new Error("Error al generar el token de verificación");
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
      const token = await prisma.token_cuenta.findUnique({
        where: { tok_val: tokenValue },
        include: {
          invalidacion: true,
          uso_token: true,
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
      if (token.tip_tok !== tipoToken) {
        return {
          valido: false,
          mensaje: "El tipo de token no es válido",
        };
      } // Verificar estado del token
      if (token.est_tok !== "ACTIVO") {
        // Si el token ya fue usado, verificar si la cuenta está verificada
        let cuentaVerificada = false;
        if (token.est_tok === "USADO" && tipoToken === "VERIFICAR_CORREO") {
          const cuenta = await prisma.cuenta.findUnique({
            where: { id_cue: token.id_cue_per },
            select: { est_ver_cor: true },
          });
          cuentaVerificada = cuenta?.est_ver_cor || false;
        }

        // Determinar mensaje según el estado
        let motivo = "USO_NORMAL";
        let mensaje = "Este enlace ya ha sido utilizado";

        if (token.est_tok === "INVALIDADO" && token.invalidacion) {
          if (token.invalidacion.raz_inv === "CORREO_INCORRECTO") {
            motivo = "CORRECCION_CORREO";
            mensaje =
              "Este enlace ya no es válido porque se ha corregido el correo electrónico. Por favor, utilice el enlace enviado al nuevo correo.";
          } else {
            motivo = "INVALIDADO";
            mensaje = "Este enlace ha sido invalidado.";
          }
        } else if (token.est_tok === "EXPIRADO") {
          motivo = "EXPIRADO";
          mensaje = "El enlace ha expirado.";
        } else if (token.est_tok === "USADO") {
          motivo = "USO_NORMAL";
          mensaje = "Este enlace ya ha sido utilizado.";
        } else if (token.est_tok === "REEMPLAZADO") {
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
      if (new Date() > token.fec_exp_tok) {
        // Actualizar estado a EXPIRADO
        await prisma.token_cuenta.update({
          where: { id_tok: token.id_tok },
          data: { est_tok: "EXPIRADO" },
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
      // Paso 1: Actualizar el estado del token a USADO
      const tokenActualizado = await prisma.token_cuenta.update({
        where: { tok_val: tokenValue },
        data: {
          est_tok: "USADO",
        },
      });

      // Paso 2: Registrar el uso del token en la tabla uso_token
      await prisma.uso_token.create({
        data: {
          id_tok_per: tokenActualizado.id_tok,
          fec_uso: new Date(),
          ip_uso: ip || "0.0.0.0",
          exi_uso: true,
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
      const cuentaExistente = await prisma.cuenta.findUnique({
        where: { id_cue: idCuenta },
        select: { est_ver_cor: true },
      });

      console.log(
        `[${new Date().toISOString()}] TokenService: Estado actual de verificación para cuenta ${idCuenta}:`,
        cuentaExistente
      );

      const cuentaActualizada = await prisma.cuenta.update({
        where: { id_cue: idCuenta },
        data: {
          est_ver_cor: true,
          fec_ver_cor: new Date(),
        },
      });

      console.log(
        `[${new Date().toISOString()}] TokenService: Cuenta ${idCuenta} actualizada exitosamente`
      );
      return cuentaActualizada;
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
   * @returns {Promise<Object|null>} Cuenta encontrada o null
   */
  async obtenerCuentaPorCorreo(correo) {
    try {
      const cuenta = await prisma.cuenta.findUnique({
        where: { cor_usu: correo },
        include: { usuario: true },
      });

      return cuenta;
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
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarRateLimit(correo, tipoToken, limiteHora = 3, minutos = 60) {
    try {
      const cuenta = await this.obtenerCuentaPorCorreo(correo);
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
      const conteoTokens = await prisma.token_cuenta.count({
        where: {
          id_cue_per: cuenta.id_cue,
          tip_tok: tipoToken,
          fec_cre_tok: {
            gte: fechaLimite,
          },
        },
      });

      if (conteoTokens >= limiteHora) {
        // Obtener el token más reciente para calcular tiempo restante
        const tokenMasReciente = await prisma.token_cuenta.findFirst({
          where: {
            id_cue_per: cuenta.id_cue,
            tip_tok: tipoToken,
          },
          orderBy: {
            fec_cre_tok: "desc",
          },
        });

        // Calcular tiempo restante en minutos
        const tiempoTranscurrido = Math.floor(
          (new Date() - tokenMasReciente.fec_cre_tok) / (1000 * 60)
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
  async invalidarTokensAnteriores(idCuenta, tipoToken) {
    try {
      // Primero, obtener los tokens activos que vamos a invalidar
      const tokensActivos = await prisma.token_cuenta.findMany({
        where: {
          id_cue_per: idCuenta,
          tip_tok: tipoToken,
          est_tok: "ACTIVO",
        },
      });

      // Si no hay tokens activos, retornar 0
      if (tokensActivos.length === 0) {
        return 0;
      }

      // Actualizar tokens activos a estado INVALIDADO
      const resultado = await prisma.token_cuenta.updateMany({
        where: {
          id_cue_per: idCuenta,
          tip_tok: tipoToken,
          est_tok: "ACTIVO",
        },
        data: {
          est_tok: "INVALIDADO",
        },
      });

      // Registrar razón de invalidación para cada token
      for (const token of tokensActivos) {
        await prisma.invalidacion_token.create({
          data: {
            id_tok_per: token.id_tok,
            raz_inv: "CORREO_INCORRECTO",
            des_inv: "Token invalidado por corrección de correo electrónico",
            fec_inv: new Date(),
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
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async verificarExistenciaCorreo(correo) {
    try {
      const cuenta = await prisma.cuenta.findUnique({
        where: { cor_usu: correo },
      });

      return cuenta !== null;
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
      const invalidacion = await prisma.invalidacion_token.findFirst({
        where: {
          id_tok_per: token.id_tok,
        },
      });

      // Si hay un registro de invalidación, usar la razón registrada
      if (invalidacion) {
        if (invalidacion.raz_inv === "CORREO_INCORRECTO") {
          return {
            motivo: "CORRECCION_CORREO",
            mensaje:
              "Este enlace ya no es válido porque se ha corregido el correo electrónico. Por favor, utiliza el enlace enviado al nuevo correo.",
          };
        }

        return {
          motivo: invalidacion.raz_inv,
          mensaje: "Este enlace ha sido invalidado: " + invalidacion.des_inv,
        };
      }

      // Verificar si hay un token más reciente para el mismo usuario y tipo
      const tokenMasReciente = await prisma.token_cuenta.findFirst({
        where: {
          id_cue_per: token.id_cue_per,
          tip_tok: token.tip_tok,
          fec_cre_tok: {
            gt: token.fec_cre_tok, // Tokens creados después del token actual
          },
        },
        orderBy: {
          fec_cre_tok: "desc",
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
    razon = "SEGURIDAD",
    descripcion = "Invalidado por seguridad"
  ) {
    try {
      // Primero, obtener los tokens activos que vamos a invalidar (excluyendo el tokenExcluido)
      const tokensActivos = await prisma.token_cuenta.findMany({
        where: {
          id_cue_per: idCuenta,
          tip_tok: tipoToken,
          est_tok: "ACTIVO",
          tok_val: {
            not: tokenExcluido,
          },
        },
      });

      // Si no hay tokens activos, retornar 0
      if (tokensActivos.length === 0) {
        return 0;
      }

      // Actualizar tokens activos a estado INVALIDADO
      const resultado = await prisma.token_cuenta.updateMany({
        where: {
          id_cue_per: idCuenta,
          tip_tok: tipoToken,
          est_tok: "ACTIVO",
          tok_val: {
            not: tokenExcluido,
          },
        },
        data: {
          est_tok: "INVALIDADO",
        },
      });

      // Registrar razón de invalidación para cada token
      for (const token of tokensActivos) {
        await prisma.invalidacion_token.create({
          data: {
            id_tok_per: token.id_tok,
            raz_inv: razon,
            des_inv: descripcion,
            fec_inv: new Date(),
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
