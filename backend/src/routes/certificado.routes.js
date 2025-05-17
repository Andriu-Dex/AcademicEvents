const express = require("express");
const router = express.Router();

const { generarCertificado } = require("../controllers/certificado.controller");

// ============================
// Ruta para descargar certificado académico
// ============================

// Generar y descargar el certificado en formato PDF
// Endpoint: GET /api/certificados/:id
// Requiere: ID de la inscripción
router.get("/certificados/:id", generarCertificado);

module.exports = router;
