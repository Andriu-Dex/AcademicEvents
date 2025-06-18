const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");

// Rutas para verificación de correo
router.get("/:token", verificationController.verificarToken);
router.post("/reenviar/:email", verificationController.reenviarVerificacion);
router.post("/reenviar", verificationController.solicitarReenvio);

module.exports = router;
