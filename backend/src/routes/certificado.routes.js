const express = require("express");
const router = express.Router();

// Controladores
const {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
  previsualizarCertificado, // 👈 Agregamos la nueva función
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

// 🎨 Previsualizar certificado como HTML (para desarrollo)
// Endpoint: GET /api/certificados/preview/:id
// Requiere token válido y que el usuario sea dueño de la inscripción
router.get(
  "/certificados/preview/:id",
  verificarToken,
  verificarPropietario,
  previsualizarCertificado
);

// SOLO PARA DESARROLLO - Ruta temporal
router.get("/certificados/preview-dev/:id", previsualizarCertificado);

module.exports = router;
