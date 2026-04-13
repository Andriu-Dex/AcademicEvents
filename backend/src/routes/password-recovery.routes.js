const express = require("express");
const {
  requestPasswordRecovery,
  validateRecoveryToken,
  openRecoveryLink,
  resetPassword,
} = require("../controllers/password-recovery.controller");
const router = express.Router();

/**
 * @route   POST /api/password-recovery/request
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post("/request", requestPasswordRecovery);

/**
 * @route   GET /api/password-recovery/validate/:token
 * @desc    Validar token de recuperación de contraseña
 * @access  Public
 */
router.get("/validate/:token", validateRecoveryToken);

/**
 * @route   GET /api/password-recovery/open/:token
 * @desc    Endpoint puente para apertura desde correo (app/web)
 * @access  Public
 */
router.get("/open/:token", openRecoveryLink);

/**
 * @route   POST /api/password-recovery/reset
 * @desc    Restablecer contraseña usando token validado
 * @access  Public
 */
router.post("/reset", resetPassword);

module.exports = router;
