const express = require("express");
const {
  requestPasswordRecovery,
  validateRecoveryToken,
  resetPassword,
} = require("../controllers/password-recovery.controller");
const router = express.Router();

console.log(
  "🚀 [PASSWORD-RECOVERY-ROUTES] Inicializando rutas de recuperación de contraseña"
);

// Middleware para todas las rutas de recuperación de contraseña
router.use((req, res, next) => {
  console.log(
    `🔄 [PASSWORD-RECOVERY-MIDDLEWARE] Ruta accedida: ${req.method} ${req.originalUrl}`
  );
  console.log(`🔄 [PASSWORD-RECOVERY-MIDDLEWARE] Ruta base: ${req.baseUrl}`);
  console.log(`🔄 [PASSWORD-RECOVERY-MIDDLEWARE] Ruta específica: ${req.path}`);
  next();
});

/**
 * @route   POST /api/password-recovery/request
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post("/request", (req, res, next) => {
  console.log(
    "📥 [ROUTE] POST /api/password-recovery/request - Solicitud recibida"
  );
  requestPasswordRecovery(req, res, next);
});

/**
 * @route   GET /api/password-recovery/validate/:token
 * @desc    Validar token de recuperación de contraseña
 * @access  Public
 */
router.get("/validate/:token", (req, res, next) => {
  console.log(
    `📥 [ROUTE] GET /api/password-recovery/validate/${req.params.token} - Solicitud recibida`
  );
  validateRecoveryToken(req, res, next);
});

/**
 * @route   POST /api/password-recovery/reset
 * @desc    Restablecer contraseña usando token validado
 * @access  Public
 */
router.post("/reset", (req, res, next) => {
  console.log(
    "📥 [ROUTE] POST /api/password-recovery/reset - Solicitud recibida"
  );
  resetPassword(req, res, next);
});

console.log("✅ [PASSWORD-RECOVERY-ROUTES] Rutas configuradas:");
console.log("   - POST /api/password-recovery/request");
console.log("   - GET /api/password-recovery/validate/:token");
console.log("   - POST /api/password-recovery/reset");

module.exports = router;
