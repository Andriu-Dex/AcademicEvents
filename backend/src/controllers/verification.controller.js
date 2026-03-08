const TokenService = require("../services/TokenService");
const EmailTemplateService = require("../services/EmailTemplateService");
const EmailVerificationService = require("../services/EmailVerificationService");

// Instanciar servicios
const tokenService = new TokenService();
const emailTemplateService = new EmailTemplateService();
const emailVerificationService = new EmailVerificationService(
  tokenService,
  emailTemplateService
);

/**
 * Verifica un token de correo electrónico
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const verificarToken = async (req, res) => {
  try {
    const { token } = req.params;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(
      `[${new Date().toISOString()}] Controller: Solicitud de verificación para token: ${token}, IP: ${ip}`
    );
    console.log(`[${new Date().toISOString()}] Controller: Headers:`, {
      referer: req.headers.referer || "N/A",
      userAgent: req.headers["user-agent"] || "N/A",
    });

    // Validar token
    const resultado = await emailVerificationService.verificarToken(token, ip);
    console.log(
      `[${new Date().toISOString()}] Controller: Resultado de verificación:`,
      {
        success: resultado.success,
        message: resultado.message,
        motivo: resultado.motivo || "N/A",
        tieneAuth: !!resultado.authToken,
      }
    );

    if (!resultado.success) {
      console.log(
        `[${new Date().toISOString()}] Controller: Verificación fallida para token ${token}: ${
          resultado.message
        }`
      );
      return res.status(400).json({
        success: false,
        message: resultado.message,
        motivo: resultado.motivo || "ERROR_GENERICO",
      });
    }

    console.log(
      `[${new Date().toISOString()}] Controller: Verificación exitosa para token ${token}`
    );

    // Respuesta exitosa con datos de autenticación
    const response = {
      success: true,
      message: resultado.message,
    };

    // Si hay datos de autenticación, incluirlos
    if (resultado.authToken && resultado.usuario) {
      response.authToken = resultado.authToken;
      response.usuario = resultado.usuario;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en verificación de token:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al verificar el correo electrónico",
    });
  }
};

/**
 * Reenvía un correo de verificación
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const reenviarVerificacion = async (req, res) => {
  try {
    const { email } = req.params;
    const ip = req.ip || req.connection.remoteAddress;

    // Reenviar verificación
    const resultado = await emailVerificationService.reenviarVerificacion(
      email,
      ip,
      req.tenantId
    );

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: resultado.message,
        tiempoRestante: resultado.tiempoRestante,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Correo de verificación reenviado correctamente",
    });
  } catch (error) {
    console.error("Error al reenviar verificación:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al reenviar el correo de verificación",
    });
  }
};

/**
 * Solicita reenvío de verificación por email
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const solicitarReenvio = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico es requerido",
      });
    }

    const ip = req.ip || req.connection.remoteAddress;

    // Reenviar verificación
    const resultado = await emailVerificationService.reenviarVerificacion(
      correo,
      ip,
      req.tenantId
    );

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: resultado.message,
        tiempoRestante: resultado.tiempoRestante,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Correo de verificación reenviado correctamente",
    });
  } catch (error) {
    console.error("Error al solicitar reenvío:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al solicitar el reenvío",
    });
  }
};

module.exports = {
  verificarToken,
  reenviarVerificacion,
  solicitarReenvio,
};
