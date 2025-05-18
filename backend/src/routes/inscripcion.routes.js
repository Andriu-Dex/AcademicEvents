const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

// Controladores
const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
  validarInscripcion,
  puedeGenerarCertificado,
} = require("../controllers/inscripcion.controller");

// ============================
// Rutas para gestión de inscripciones
// ============================

// Crear nueva inscripción a un evento
// POST /api/inscripciones
router.post("/inscripciones", upload.single("archivo"), crearInscripcion);

// Obtener todas las inscripciones de un usuario
// GET /api/inscripciones/:id
router.get("/inscripciones/:id", obtenerInscripcionesPorUsuario);

// Validar una inscripción existente (cambia el estado)
// PUT /api/inscripciones/validar/:id
router.put("/inscripciones/validar/:id", validarInscripcion);

// Verificar si puede generar certificado
// GET /api/inscripciones/certificado/:id
router.get("/inscripciones/certificado/:id", puedeGenerarCertificado);

module.exports = router;
