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

    // Validar token
    const resultado = await emailVerificationService.verificarToken(token, ip);

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: resultado.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: resultado.message,
    });
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
      ip
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
      ip
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
