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
 * Verifica un código de 6 dígitos para confirmar el correo electrónico
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @returns {Promise<Object>} Respuesta HTTP
 */
const verificarCodigo = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico y el código son obligatorios",
      });
    }

    // Validar formato del código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "El código debe ser de 6 dígitos numéricos",
      });
    }

    const ip = req.ip || req.connection.remoteAddress;

    const resultado = await emailVerificationService.verificarCodigo(
      email.trim().toLowerCase(),
      code,
      ip,
      req.tenantId
    );

    if (!resultado.success) {
      return res.status(400).json({
        success: false,
        message: resultado.message,
        motivo: resultado.motivo || "ERROR_GENERICO",
      });
    }

    // Respuesta exitosa con datos de autenticación
    const response = {
      success: true,
      message: resultado.message,
    };

    if (resultado.authToken && resultado.usuario) {
      response.authToken = resultado.authToken;
      response.usuario = resultado.usuario;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error en verificación de código:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al verificar el código",
    });
  }
};

/**
 * Verifica un token de correo electrónico (legacy - para links ya enviados)
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
        `[${new Date().toISOString()}] Controller: Verificación fallida para token ${token}: ${resultado.message
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
 * Endpoint puente para verificación desde correo.
 * Redirige al frontend de verificación.
 * En local, si FRONTEND_URL usa localhost, reemplaza host por el host real de la solicitud
 * para que sea accesible desde dispositivos móviles en la misma red.
 */
const openVerificationLink = async (req, res) => {
  const token = req.params.token || "";
  const safeToken = encodeURIComponent(token);
  const frontendRaw = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

  let frontendTarget = frontendRaw;

  try {
    const parsedFrontend = new URL(frontendRaw);
    const frontendHostIsLocal = /^(localhost|127\.0\.0\.1)$/i.test(parsedFrontend.hostname);

    if (frontendHostIsLocal) {
      const requestHostHeader = req.get("host") || "";
      const requestHostname = requestHostHeader.split(":")[0];
      if (requestHostname) {
        parsedFrontend.hostname = requestHostname;
        frontendTarget = parsedFrontend.toString().replace(/\/$/, "");
      }
    }
  } catch (error) {
    console.warn("⚠️ [OPEN-VERIFICATION-LINK] FRONTEND_URL inválida, usando valor por defecto", error?.message);
  }

  return res.redirect(302, `${frontendTarget}/verificar-correo/${safeToken}`);
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
    const requestHost = req.get("host") || req.headers.host || "";

    // Reenviar verificación
    const resultado = await emailVerificationService.reenviarVerificacion(
      email,
      ip,
      req.tenantId,
      requestHost
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
    const requestHost = req.get("host") || req.headers.host || "";

    // Reenviar verificación
    const resultado = await emailVerificationService.reenviarVerificacion(
      correo,
      ip,
      req.tenantId,
      requestHost
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
  verificarCodigo,
  verificarToken,
  openVerificationLink,
  reenviarVerificacion,
  solicitarReenvio,
};
