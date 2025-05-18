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

const {
  generarCertificado,
  enviarCertificadoPorCorreo,
} = require("../controllers/certificado.controller");

// Descargar certificado (PDF en navegador)
router.get("/certificados/:id", generarCertificado);

// Enviar certificado por correo (PDF adjunto)
router.post("/certificados/enviar/:id", enviarCertificadoPorCorreo);

module.exports = router;
