const { prisma } = require("../../config/db");

/**
 * Middleware para verificar si la cuenta de un usuario está activada
 * @param {Object} req - Objeto request de Express
 * @param {Object} res - Objeto response de Express
 * @param {Function} next - Función next de Express
 * @returns {Promise<void>}
 */
const verificarCuentaActivada = async (req, res, next) => {
  try {
    const idCuenta = req.usuario?.id;

    if (!idCuenta) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Buscar la cuenta
    const cuenta = await prisma.cuenta.findUnique({
      where: { id_cue: idCuenta },
    });

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    // Verificar si la cuenta está activada
    if (!cuenta.est_ver_cor) {
      return res.status(403).json({
        success: false,
        message: "Debes verificar tu correo electrónico antes de continuar",
        requireVerification: true,
        email: cuenta.cor_usu,
      });
    }

    // La cuenta está activada, continuar
    next();
  } catch (error) {
    console.error("Error en middleware de verificación de cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor al verificar estado de cuenta",
    });
  }
};

module.exports = verificarCuentaActivada;
