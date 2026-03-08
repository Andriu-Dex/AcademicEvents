const EmailVerificationService = require("../services/EmailVerificationService");
const TokenService = require("../services/TokenService");
const EmailTemplateService = require("../services/EmailTemplateService");

// Instanciar servicios
const tokenService = new TokenService();
const emailTemplateService = new EmailTemplateService();
const emailVerificationService = new EmailVerificationService(
  tokenService,
  emailTemplateService
);

/**
 * Controlador para corregir el correo electrónico de una cuenta no verificada
 * @param {Request} req - Solicitud HTTP
 * @param {Response} res - Respuesta HTTP
 * @returns {Promise<Response>} Respuesta HTTP
 */
const corregirCorreo = async (req, res) => {
  try {
    const { correoAnterior, correoNuevo, carreraNueva } = req.body;

    console.log("=== Solicitud de corrección de correo ===");
    console.log("Correo anterior:", correoAnterior);
    console.log("Correo nuevo:", correoNuevo);
    console.log("Carrera nueva:", carreraNueva);

    // Validaciones básicas
    if (!correoAnterior || !correoNuevo) {
      return res.status(400).json({
        success: false,
        message: "Los correos anterior y nuevo son obligatorios",
      });
    }

    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNuevo)) {
      return res.status(400).json({
        success: false,
        message: "El formato del nuevo correo es inválido",
      });
    }

    // Validar carrera si es correo UTA
    const esUTA = correoNuevo.endsWith("@uta.edu.ec");
    if (esUTA && !carreraNueva) {
      return res.status(400).json({
        success: false,
        message: "Al usar correo institucional, debes seleccionar una carrera",
      });
    }

    // Obtener IP del cliente
    const ip = req.ip || req.connection.remoteAddress;

    // Procesar la corrección
    const resultado = await emailVerificationService.corregirCorreo(
      correoAnterior,
      correoNuevo,
      carreraNueva,
      ip,
      req.tenantId
    );
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }

    console.log("=== Corrección completada con éxito ===");
    console.log("Respuesta:", resultado);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al corregir correo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = {
  corregirCorreo,
};
