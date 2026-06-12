const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");

// Ruta principal: verificación por código de 6 dígitos
router.post("/codigo", verificationController.verificarCodigo);

// Rutas legacy (backward compatibility con links ya enviados)
router.get("/open/:token", verificationController.openVerificationLink);
router.get("/:token", verificationController.verificarToken);

// Reenvío de verificación
router.post("/reenviar/:email", verificationController.reenviarVerificacion);
router.post("/reenviar", verificationController.solicitarReenvio);

module.exports = router;
