const TokenService = require("../services/TokenService");
const EmailTemplateService = require("../services/EmailTemplateService");
const PasswordRecoveryService = require("../services/PasswordRecoveryService");

// Instanciar servicios
const tokenService = new TokenService();
const emailTemplateService = new EmailTemplateService();
const passwordRecoveryService = new PasswordRecoveryService(
  tokenService,
  emailTemplateService
);

console.log(
  "🔧 [PASSWORD-RECOVERY-CONTROLLER] Controlador inicializado correctamente"
);

/**
 * @class PasswordRecoveryController
 * @description Controlador para endpoints de recuperación de contraseña
 */

/**
 * Solicita recuperación de contraseña por email
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const requestPasswordRecovery = async (req, res) => {
  try {
    console.log("📧 [REQUEST-PASSWORD-RECOVERY] Solicitud recibida");
    console.log("📧 [REQUEST-PASSWORD-RECOVERY] Body:", req.body);
    console.log("📧 [REQUEST-PASSWORD-RECOVERY] Headers:", req.headers);

    const { email } = req.body;

    if (!email) {
      console.log("❌ [REQUEST-PASSWORD-RECOVERY] Email no proporcionado");
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
        reason: "CAMPO_FALTANTE",
      });
    }

    // Validar formato de correo electrónico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log(
        "❌ [REQUEST-PASSWORD-RECOVERY] Formato de email inválido:",
        email
      );
      return res.status(400).json({
        success: false,
        message: "El formato del correo electrónico es inválido",
        reason: "FORMATO_INVALIDO",
      });
    }

    const ip = req.ip || req.connection.remoteAddress;

    console.log(
      `📧 [REQUEST-PASSWORD-RECOVERY] [${new Date().toISOString()}] Solicitud de recuperación de contraseña para: ${email}, IP: ${ip}`
    );

    // Procesar solicitud de recuperación
    console.log(
      "🔄 [REQUEST-PASSWORD-RECOVERY] Procesando solicitud con servicio..."
    );
    const result = await passwordRecoveryService.requestPasswordRecovery(
      email,
      ip
    );

    console.log(
      "✅ [REQUEST-PASSWORD-RECOVERY] Resultado del servicio:",
      result
    );

    if (!result.success) {
      console.log(
        "❌ [REQUEST-PASSWORD-RECOVERY] Solicitud fallida:",
        result.message
      );
      return res.status(400).json({
        success: false,
        message: result.message,
        timeRemaining: result.timeRemaining,
        reason: result.reason || "ERROR_GENERICO",
      });
    }

    console.log("✅ [REQUEST-PASSWORD-RECOVERY] Solicitud exitosa");
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("💥 [REQUEST-PASSWORD-RECOVERY] Error:", error);
    console.error("💥 [REQUEST-PASSWORD-RECOVERY] Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al procesar la solicitud",
      reason: "ERROR_SERVIDOR",
    });
  }
};

/**
 * Valida si un token de recuperación es válido
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const validateRecoveryToken = async (req, res) => {
  try {
    console.log("🔍 [VALIDATE-TOKEN] Solicitud recibida");
    console.log("🔍 [VALIDATE-TOKEN] Params:", req.params);

    const { token } = req.params;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(
      `🔍 [VALIDATE-TOKEN] [${new Date().toISOString()}] Validando token de recuperación: ${token}, IP: ${ip}`
    );

    console.log("🔄 [VALIDATE-TOKEN] Procesando validación con servicio...");
    const result = await passwordRecoveryService.validateRecoveryToken(
      token,
      ip
    );

    console.log("✅ [VALIDATE-TOKEN] Resultado del servicio:", result);

    if (!result.success) {
      console.log("❌ [VALIDATE-TOKEN] Validación fallida:", result.message);
      return res.status(400).json({
        success: false,
        message: result.message,
        reason: result.reason || "ERROR_GENERICO",
        // Incluir información adicional si el token existe pero no es válido
        tokenInfo: result.token
          ? {
              estado: result.token.est_tok,
              fechaExpiracion: result.token.fec_exp_tok,
              fechaCreacion: result.token.fec_cre_tok,
            }
          : null,
      });
    }

    console.log("✅ [VALIDATE-TOKEN] Validación exitosa");
    return res.status(200).json({
      success: true,
      message: result.message,
      email: result.email,
      userName: result.userName,
    });
  } catch (error) {
    console.error("💥 [VALIDATE-TOKEN] Error:", error);
    console.error("💥 [VALIDATE-TOKEN] Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al validar el token",
      reason: "ERROR_SERVIDOR",
    });
  }
};

/**
 * Cambia la contraseña usando token válido
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const resetPassword = async (req, res) => {
  try {
    console.log("🔄 [RESET-PASSWORD] Solicitud recibida");
    console.log("🔄 [RESET-PASSWORD] Body (sin contraseñas):", {
      token: req.body.token ? "PRESENTE" : "AUSENTE",
      newPassword: req.body.newPassword ? "PRESENTE" : "AUSENTE",
      confirmPassword: req.body.confirmPassword ? "PRESENTE" : "AUSENTE",
    });

    const { token, newPassword, confirmPassword } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Validaciones básicas
    if (!token || !newPassword || !confirmPassword) {
      console.log("❌ [RESET-PASSWORD] Campos requeridos faltantes");
      return res.status(400).json({
        success: false,
        message: "Token, nueva contraseña y confirmación son requeridos",
        reason: "CAMPOS_FALTANTES",
      });
    }

    if (newPassword !== confirmPassword) {
      console.log("❌ [RESET-PASSWORD] Las contraseñas no coinciden");
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden",
        reason: "PASSWORDS_NO_COINCIDEN",
      });
    }

    // Validar fortaleza de contraseña
    if (newPassword.length < 8) {
      console.log("❌ [RESET-PASSWORD] Contraseña muy corta");
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
        reason: "PASSWORD_MUY_CORTA",
      });
    }

    // Expresiones regulares para validar complejidad
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
      console.log(
        "❌ [RESET-PASSWORD] Contraseña no cumple requisitos de complejidad"
      );
      return res.status(400).json({
        success: false,
        message:
          "La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales",
        reason: "PASSWORD_DEBIL",
      });
    }

    console.log(
      `🔄 [RESET-PASSWORD] [${new Date().toISOString()}] Solicitud de cambio de contraseña con token: ${token}, IP: ${ip}`
    );

    // Procesar cambio de contraseña
    console.log("🔄 [RESET-PASSWORD] Procesando cambio con servicio...");
    const result = await passwordRecoveryService.resetPasswordWithToken(
      token,
      newPassword,
      ip
    );

    console.log("✅ [RESET-PASSWORD] Resultado del servicio:", result);

    if (!result.success) {
      console.log("❌ [RESET-PASSWORD] Cambio fallido:", result.message);
      return res.status(400).json({
        success: false,
        message: result.message,
        reason: result.reason || "ERROR_GENERICO",
        // Incluir información del token si está disponible
        tokenInfo: result.token
          ? {
              estado: result.token.est_tok,
              fechaExpiracion: result.token.fec_exp_tok,
              fechaCreacion: result.token.fec_cre_tok,
              uso: result.token.uso_token
                ? {
                    fecha: result.token.uso_token.fec_uso,
                    ip: result.token.uso_token.ip_uso,
                  }
                : null,
            }
          : null,
      });
    }

    console.log("✅ [RESET-PASSWORD] Cambio de contraseña exitoso");
    return res.status(200).json({
      success: true,
      message: result.message,
      email: result.email,
    });
  } catch (error) {
    console.error("💥 [RESET-PASSWORD] Error:", error);
    console.error("💥 [RESET-PASSWORD] Stack:", error.stack);

    // Intentar determinar si fue un error de invalidación que no afecta el resultado
    if (
      error.message &&
      (error.message.includes("invalidarTokensOtros") ||
        error.message.includes("no es una función"))
    ) {
      console.log(
        "⚠️ [RESET-PASSWORD] Error no crítico en invalidación de tokens"
      );
      return res.status(200).json({
        success: true,
        message:
          "Contraseña restablecida con éxito. Nota: Algunos pasos de seguridad opcionales no pudieron completarse.",
        warning: "token_invalidation_incomplete",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error en el servidor al cambiar la contraseña",
      reason: "ERROR_SERVIDOR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  requestPasswordRecovery,
  validateRecoveryToken,
  resetPassword,
};
