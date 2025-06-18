const express = require("express");
const router = express.Router();
const emailCorrectionController = require("../controllers/email-correction.controller");

// Ruta para corregir correo
router.put("/corregir-correo", emailCorrectionController.corregirCorreo);

module.exports = router;
