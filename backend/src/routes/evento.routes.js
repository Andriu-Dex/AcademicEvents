const express = require("express");
const router = express.Router();

const {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos
router.get("/eventos", obtenerEventos);

// Crear un nuevo evento
router.post("/eventos", crearEvento);

// Actualizar un evento existente por ID
router.put("/eventos/:id", actualizarEvento);

// Eliminar un evento por ID
router.delete("/eventos/:id", eliminarEvento);

module.exports = router;
