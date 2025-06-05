const express = require("express");
const router = express.Router();

// Controladores
const {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
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

// Validar certificado por código (público, no requiere autenticación)
// Endpoint: GET /api/certificados/validar/:codigo
router.get("/certificados/validar/:codigo", validarCertificado);

module.exports = router;
