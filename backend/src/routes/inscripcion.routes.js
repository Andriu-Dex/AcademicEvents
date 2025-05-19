const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const manejarErroresDeMulter = require("../middlewares/errores/manejarErroresDeMulter");

// Controladores
const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
  validarInscripcion,
  puedeGenerarCertificado,
  reenviarComprobante,
} = require("../controllers/inscripcion.controller");

// ============================
// Rutas para gestión de inscripciones
// ============================

// Crear nueva inscripción a un evento
// POST /api/inscripciones
router.post(
  "/inscripciones",
  upload.single("archivo"),
  manejarErroresDeMulter,
  crearInscripcion
);

// Obtener todas las inscripciones de un usuario
// GET /api/inscripciones/:id
router.get("/inscripciones/:id", obtenerInscripcionesPorUsuario);

// Validar una inscripción existente (cambia el estado)
// PUT /api/inscripciones/validar/:id
router.put("/inscripciones/validar/:id", validarInscripcion);

// Verificar si puede generar certificado
// GET /api/inscripciones/certificado/:id
router.get("/inscripciones/certificado/:id", puedeGenerarCertificado);

// Reenviar comprobante de inscripción
router.put(
  "/inscripciones/reenviar/:id",
  verificarToken,
  upload.single("archivo"),
  reenviarComprobante
);

module.exports = router;
