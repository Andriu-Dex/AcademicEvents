const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");

/**
 * @class PasswordRecoveryService
 * @description Servicio para gestionar la recuperación de contraseña
 */
class PasswordRecoveryService {
  constructor(tokenService, emailTemplateService) {
    this.tokenService = tokenService;
    this.emailTemplateService = emailTemplateService;
  }

  /**
   * Solicita recuperación de contraseña
   * @param {string} email - Correo del usuario
   * @param {string} ip - IP de la solicitud
   * @returns {Promise<Object>} Resultado de la operación
   */
  async requestPasswordRecovery(email, ip) {
    try {
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Iniciando requestPasswordRecovery"
      );
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] Email:", email);
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] IP:", ip);

      // Verificar rate limiting (máximo 3 solicitudes por hora)
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Verificando rate limiting..."
      );
      const rateLimit = await this.tokenService.verificarRateLimit(
        email,
        "RECUPERAR_PASSWORD",
        3,
        60
      );
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Rate limit resultado:",
        rateLimit
      );

      if (!rateLimit.permitido) {
        console.log("❌ [PASSWORD-RECOVERY-SERVICE] Rate limit excedido");
        return {
          success: false,
          message: rateLimit.mensaje,
          timeRemaining: rateLimit.tiempoRestante,
        };
      }

      // Validar que el correo existe y está verificado
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Buscando cuenta por correo..."
      );
      const account = await this.tokenService.obtenerCuentaPorCorreo(email);
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Cuenta encontrada:",
        account ? "Sí" : "No"
      );

      if (!account) {
        console.log("❌ [PASSWORD-RECOVERY-SERVICE] Cuenta no encontrada");
        return {
          success: false,
          message: "No existe una cuenta con este correo electrónico",
        };
      }

      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Estado verificación correo:",
        account.est_ver_cor
      );
      if (!account.est_ver_cor) {
        console.log("❌ [PASSWORD-RECOVERY-SERVICE] Cuenta no verificada");
        return {
          success: false,
          message:
            "Esta cuenta aún no ha sido verificada. Por favor, verifica tu correo primero.",
        };
      }

      // Invalidar tokens anteriores del tipo RECUPERAR_PASSWORD
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Invalidando tokens anteriores..."
      );
      await this.tokenService.invalidarTokensAnteriores(
        account.id_cue,
        "RECUPERAR_PASSWORD"
      );
      console.log(
        "✅ [PASSWORD-RECOVERY-SERVICE] Tokens anteriores invalidados"
      );

      // Crear nuevo token con 2 horas de duración (en segundos)
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] Creando nuevo token...");
      const token = await this.tokenService.crearToken({
        idCuenta: account.id_cue,
        tipoToken: "RECUPERAR_PASSWORD",
        ip,
        duracionHoras: 2, // Duración más corta que verificación
      });
      console.log(
        "✅ [PASSWORD-RECOVERY-SERVICE] Token creado:",
        token ? "Sí" : "No"
      );

      // Generar URL para el frontend
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const recoveryUrl = `${frontendUrl}/restablecer-contrasena/${token.tok_val}`;
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] URL de recuperación generada:",
        recoveryUrl
      );

      // Obtener plantilla de correo de recuperación
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Obteniendo plantilla de correo..."
      );
      const { asunto, cuerpoHtml } =
        this.emailTemplateService.obtenerPlantillaRecuperacion({
          nombre: account.usuario?.nom_usu || "Usuario",
          urlRecuperacion: recoveryUrl,
          token: token.tok_val,
        });
      console.log("✅ [PASSWORD-RECOVERY-SERVICE] Plantilla obtenida"); // Enviar correo electrónico
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Enviando correo electrónico..."
      );
      await this.emailTemplateService.enviarEmail({
        destinatario: account.cor_usu,
        asunto,
        cuerpoHtml,
      });

      console.log(
        "✅ [PASSWORD-RECOVERY-SERVICE] Instrucciones de recuperación enviadas correctamente"
      );
      return {
        success: true,
        message:
          "Instrucciones de recuperación enviadas correctamente a tu correo electrónico",
        token: token.tok_val,
      };
    } catch (error) {
      console.error(
        "❌ [PASSWORD-RECOVERY-SERVICE] Error crítico en requestPasswordRecovery:",
        error
      );
      console.error("❌ [PASSWORD-RECOVERY-SERVICE] Stack trace:", error.stack);
      throw new Error(
        "Error al procesar la solicitud de recuperación de contraseña"
      );
    }
  }

  /**
   * Valida token de recuperación
   * @param {string} tokenValue - Token a validar
   * @param {string} ip - IP de la validación
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validateRecoveryToken(tokenValue, ip) {
    try {
      console.log(
        `[${new Date().toISOString()}] Iniciando validación de token de recuperación: ${tokenValue} desde IP: ${ip}`
      );

      // Validar token reutilizando lógica del TokenService
      const validationResult = await this.tokenService.validarToken({
        tokenValue,
        tipoToken: "RECUPERAR_PASSWORD",
        ip,
      });

      console.log(
        `[${new Date().toISOString()}] Resultado validación token ${tokenValue}:`,
        {
          valido: validationResult.valido,
          mensaje: validationResult.mensaje,
          motivo: validationResult.motivo || "N/A",
          estadoToken: validationResult.token?.est_tok || "N/A",
        }
      );

      if (!validationResult.valido) {
        console.log(
          `[${new Date().toISOString()}] Token inválido ${tokenValue}. Motivo: ${
            validationResult.motivo || "ERROR_GENERICO"
          }`
        );
        return {
          success: false,
          message: validationResult.mensaje,
          reason: validationResult.motivo || "ERROR_GENERICO",
          token: validationResult.token, // Pasar información del token
        };
      }

      // Si el token es válido, obtenemos la cuenta asociada
      const account = await prisma.cuenta.findUnique({
        where: { id_cue: validationResult.token.id_cue_per },
        include: {
          usuario: true,
        },
      });

      if (!account) {
        return {
          success: false,
          message: "No se encontró la cuenta asociada al token",
          reason: "CUENTA_NO_ENCONTRADA",
        };
      }

      return {
        success: true,
        message: "Token válido",
        accountId: validationResult.token.id_cue_per,
        email: account.cor_usu,
        userName: account.usuario?.nom_usu || "Usuario",
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error al validar token de recuperación ${tokenValue}:`,
        error
      );
      throw new Error("Error al validar el token de recuperación");
    }
  }

  /**
   * Cambia la contraseña usando token válido
   * @param {string} tokenValue - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @param {string} ip - IP del cambio
   * @returns {Promise<Object>} Resultado del cambio
   */
  async resetPasswordWithToken(tokenValue, newPassword, ip) {
    try {
      console.log(
        `[${new Date().toISOString()}] Intentando cambiar contraseña con token: ${tokenValue}`
      );

      // Primero validamos el token
      const validationResult = await this.validateRecoveryToken(tokenValue, ip);

      if (!validationResult.success) {
        return validationResult; // Retornamos el error de validación
      }

      // Validar que la nueva contraseña sea lo suficientemente fuerte
      // Esta validación debería hacerse en el controlador, pero por seguridad
      // la duplicamos aquí
      if (newPassword.length < 8) {
        return {
          success: false,
          message: "La nueva contraseña debe tener al menos 8 caracteres",
        };
      }

      const accountId = validationResult.accountId;

      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Usar transacción para asegurar atomicidad
      const result = await prisma.$transaction(async (tx) => {
        console.log(
          `[${new Date().toISOString()}] Iniciando transacción para cambio de contraseña, cuenta: ${accountId}`
        );

        // Verificar nuevamente que el token esté activo dentro de la transacción
        const currentToken = await tx.token_cuenta.findUnique({
          where: { tok_val: tokenValue },
        });

        if (!currentToken || currentToken.est_tok !== "ACTIVO") {
          console.log(
            `[${new Date().toISOString()}] Token ${tokenValue} ya no válido durante la transacción. Estado: ${
              currentToken?.est_tok || "NO_EXISTE"
            }`
          );
          throw new Error("Token ya no válido durante la transacción");
        }

        // Marcar token como usado
        await tx.token_cuenta.update({
          where: { tok_val: tokenValue },
          data: { est_tok: "USADO" },
        });

        // Registrar el uso del token
        await tx.uso_token.create({
          data: {
            id_tok_per: currentToken.id_tok,
            fec_uso: new Date(),
            ip_uso: ip || "0.0.0.0",
            exi_uso: true,
          },
        });

        // Actualizar la contraseña en la cuenta
        const updatedAccount = await tx.cuenta.update({
          where: { id_cue: accountId },
          data: {
            con_usu: hashedPassword,
          },
          include: {
            usuario: true,
          },
        });

        console.log(
          `[${new Date().toISOString()}] Contraseña cambiada con éxito para cuenta ${accountId}`
        );

        return updatedAccount;
      }); // Opcionalmente, invalidar otros tokens de la misma cuenta por seguridad
      try {
        await this.tokenService.invalidarTokensOtros(
          result.id_cue,
          tokenValue,
          "RECUPERAR_PASSWORD",
          "SEGURIDAD",
          "Invalidado automáticamente tras cambio de contraseña exitoso"
        );
        console.log(
          `[${new Date().toISOString()}] Otros tokens de recuperación invalidados correctamente`
        );
      } catch (invalidationError) {
        // No interrumpir el flujo si falla la invalidación de otros tokens
        console.warn(
          `[${new Date().toISOString()}] No se pudieron invalidar otros tokens, pero el cambio de contraseña fue exitoso:`,
          invalidationError.message
        );
      }

      // Enviar email de confirmación del cambio
      const { asunto, cuerpoHtml } =
        this.emailTemplateService.obtenerPlantillaConfirmacionCambioContrasena({
          nombre: result.usuario?.nom_usu || "Usuario",
          fechaCambio: new Date().toLocaleString("es-EC"),
        });

      await this.emailTemplateService.enviarEmail({
        destinatario: result.cor_usu,
        asunto,
        cuerpoHtml,
      });

      return {
        success: true,
        message: "Contraseña restablecida con éxito",
        email: result.cor_usu,
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error al cambiar contraseña con token ${tokenValue}:`,
        error
      );

      // Determinar el tipo de error para dar una respuesta más precisa
      if (error.message === "Token ya no válido durante la transacción") {
        return {
          success: false,
          message: "Este enlace ya ha sido utilizado o es inválido",
          reason: "TOKEN_INVALIDO",
        };
      }

      // Si es un error relacionado con la función invalidarTokensOtros
      if (error.message && error.message.includes("invalidarTokensOtros")) {
        // El cambio de contraseña ya se realizó, pero hubo problemas en la invalidación
        return {
          success: true,
          message:
            "Contraseña restablecida con éxito. Nota: No se pudieron invalidar otros tokens antiguos.",
          reason: "ERROR_INVALIDACION",
        };
      }

      return {
        success: false,
        message:
          "Error al cambiar la contraseña. Por favor, intenta nuevamente.",
        reason: "ERROR_INTERNO",
        errorDetails: error.message,
      };
    }
  }
}

module.exports = PasswordRecoveryService;
