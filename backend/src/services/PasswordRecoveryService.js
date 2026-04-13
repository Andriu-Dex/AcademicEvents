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
  async requestPasswordRecovery(email, ip, tenantId, requestBaseUrl = null) {
    try {
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Iniciando requestPasswordRecovery"
      );
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] Email:", email);
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] IP:", ip);
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] Tenant:", tenantId);

      // Verificar rate limiting (máximo 3 solicitudes por hora)
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Verificando rate limiting..."
      );
      const rateLimit = await this.tokenService.verificarRateLimit(
        email,
        "RECOVER_PASSWORD",
        3,
        60,
        tenantId
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
      const account = await this.tokenService.obtenerCuentaPorCorreo(email, tenantId);
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
        account.isEmailVerified
      );
      if (!account.isEmailVerified) {
        console.log("❌ [PASSWORD-RECOVERY-SERVICE] Cuenta no verificada");
        return {
          success: false,
          message:
            "Esta cuenta aún no ha sido verificada. Por favor, verifica tu correo primero.",
        };
      }

      // Invalidar tokens anteriores del tipo RECOVER_PASSWORD
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Invalidando tokens anteriores..."
      );
      await this.tokenService.invalidarTokensAnteriores(
        account.id,
        "RECOVER_PASSWORD",
        account.tenantId
      );
      console.log(
        "✅ [PASSWORD-RECOVERY-SERVICE] Tokens anteriores invalidados"
      );

      // Crear nuevo token con 2 horas de duración (en segundos)
      console.log("🔹 [PASSWORD-RECOVERY-SERVICE] Creando nuevo token...");
      const token = await this.tokenService.crearToken({
        idCuenta: account.id,
        tipoToken: "RECOVER_PASSWORD",
        ip,
        horasValidez: 2,
        tenantId: account.tenantId,
      });
      console.log(
        "✅ [PASSWORD-RECOVERY-SERVICE] Token creado:",
        token ? "Sí" : "No"
      );

      // Generar URL de recuperación sobre backend accesible para el cliente solicitante.
      const backendBaseUrl = (
        requestBaseUrl ||
        process.env.BACKEND_URL ||
        process.env.API_BASE_URL ||
        process.env.PUBLIC_BACKEND_URL ||
        "http://localhost:3000"
      ).replace(/\/$/, "");

      const recoveryUrl = `${backendBaseUrl}/api/password-recovery/open/${token.value}`;
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
          nombre: account.user?.firstName || "Usuario",
          urlRecuperacion: recoveryUrl,
          token: token.value,
        });
      console.log("✅ [PASSWORD-RECOVERY-SERVICE] Plantilla obtenida"); // Enviar correo electrónico
      console.log(
        "🔹 [PASSWORD-RECOVERY-SERVICE] Enviando correo electrónico..."
      );
      await this.emailTemplateService.enviarEmail({
        destinatario: account.email,
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
        token: token.value,
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
        tipoToken: "RECOVER_PASSWORD",
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
          `[${new Date().toISOString()}] Token inválido ${tokenValue}. Motivo: ${validationResult.motivo || "ERROR_GENERICO"
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
      const account = await prisma.account.findUnique({
        where: { id: validationResult.token.accountId },
        include: {
          user: true,
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
        accountId: validationResult.token.accountId,
        email: account.email,
        userName: account.user?.firstName || "Usuario",
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
        const currentToken = await tx.accountToken.findUnique({
          where: { value: tokenValue },
        });

        if (currentToken?.status !== "ACTIVE") {
          console.log(
            `[${new Date().toISOString()}] Token ${tokenValue} ya no válido durante la transacción. Estado: ${currentToken?.status || "NO_EXISTE"
            }`
          );
          throw new Error("Token ya no válido durante la transacción");
        }

        // Marcar token como usado
        await tx.accountToken.update({
          where: { value: tokenValue },
          data: { status: "USED" },
        });

        // Registrar el uso del token
        await tx.tokenUsage.create({
          data: {
            tenantId: currentToken.tenantId,
            tokenId: currentToken.id,
            ip: ip || "0.0.0.0",
            successful: true,
          },
        });

        // Actualizar la contraseña en la cuenta
        const updatedAccount = await tx.account.update({
          where: { id: accountId },
          data: {
            password: hashedPassword,
          },
          include: {
            user: true,
          },
        });

        console.log(
          `[${new Date().toISOString()}] Contraseña cambiada con éxito para cuenta ${accountId}`
        );

        return updatedAccount;
      }); // Opcionalmente, invalidar otros tokens de la misma cuenta por seguridad
      try {
        await this.tokenService.invalidarTokensOtros(
          result.id,
          tokenValue,
          "RECOVER_PASSWORD",
          "SECURITY",
          "Invalidado automáticamente tras cambio de contraseña exitoso",
          result.tenantId
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
          nombre: result.user?.firstName || "Usuario",
          fechaCambio: new Date().toLocaleString("es-EC"),
        });

      await this.emailTemplateService.enviarEmail({
        destinatario: result.email,
        asunto,
        cuerpoHtml,
      });

      return {
        success: true,
        message: "Contraseña restablecida con éxito",
        email: result.email,
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
      if (error.message?.includes("invalidarTokensOtros")) {
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
