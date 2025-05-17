const express = require("express");
const router = express.Router();

// Controladores
const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
  validarInscripcion, // Se agregó la importación faltante
} = require("../controllers/inscripcion.controller");

// ============================
// Rutas para gestión de inscripciones
// ============================

// Crear nueva inscripción a un evento
// POST /api/inscripciones
router.post("/inscripciones", crearInscripcion);

// Obtener todas las inscripciones de un usuario
// GET /api/inscripciones/:id
router.get("/inscripciones/:id", obtenerInscripcionesPorUsuario);

// Validar una inscripción existente (cambia el estado)
// PUT /api/inscripciones/validar/:id
router.put("/inscripciones/validar/:id", validarInscripcion);

module.exports = router;
