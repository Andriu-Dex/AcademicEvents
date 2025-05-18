const express = require("express");
const router = express.Router();

// Controladores
const {
  generarCertificado,
  enviarCertificadoPorCorreo,
} = require("../controllers/certificado.controller");

// Middlewares
const verificarToken = require("../middlewares/auth");
const verificarPropietario = require("../middlewares/verificarPropietarioCertificado");

// ============================
// Rutas protegidas de certificados
// ============================

// Descargar certificado (PDF en navegador)
// Endpoint: GET /api/certificados/:id
// Requiere token válido y que el usuario sea dueño de la inscripción
router.get(
  "/certificados/:id",
  verificarToken,
  verificarPropietario,
  generarCertificado
);

// Enviar certificado por correo (PDF adjunto por email)
// Endpoint: POST /api/certificados/enviar/:id
// Requiere token y propiedad sobre el certificado
router.post(
  "/certificados/enviar/:id",
  verificarToken,
  verificarPropietario,
  enviarCertificadoPorCorreo
);

module.exports = router;
