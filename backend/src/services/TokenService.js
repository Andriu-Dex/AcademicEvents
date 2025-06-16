const { randomBytes } = require("crypto");
const prisma = require("../config/db");

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
   */
  async validarToken({ tokenValue, tipoToken, ip }) {
    try {
      // Buscar token en la base de datos
      const token = await prisma.token_cuenta.findUnique({
        where: { tok_val: tokenValue },
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
      }

      // Verificar si ya fue usado
      if (token.est_uso) {
        return {
          valido: false,
          mensaje: "Este enlace ya ha sido utilizado",
        };
      }

      // Verificar expiración
      if (new Date() > token.fec_exp_tok) {
        return {
          valido: false,
          mensaje: "El enlace ha expirado",
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
   */
  async marcarTokenComoUsado(tokenValue, ip) {
    try {
      const tokenActualizado = await prisma.token_cuenta.update({
        where: { tok_val: tokenValue },
        data: {
          est_uso: true,
          fec_uso: new Date(),
          ip_uso: ip || null,
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
   */
  async actualizarEstadoVerificacion(idCuenta) {
    try {
      const cuentaActualizada = await prisma.cuenta.update({
        where: { id_cue: idCuenta },
        data: {
          est_ver_cor: true,
          fec_ver_cor: new Date(),
        },
      });

      return cuentaActualizada;
    } catch (error) {
      console.error("Error al actualizar estado de verificación:", error);
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
      const resultado = await prisma.token_cuenta.updateMany({
        where: {
          id_cue_per: idCuenta,
          tip_tok: tipoToken,
          est_uso: false,
        },
        data: {
          est_uso: true,
          fec_uso: new Date(),
        },
      });

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
}

module.exports = TokenService;
