const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos (público)
router.get("/eventos", obtenerEventos);

// Obtener un evento por ID (público)
router.get("/eventos/:id", obtenerEventoPorId);

// Crear un nuevo evento (solo admin)
router.post("/eventos", verificarToken, onlyAdmin, crearEvento);

// Actualizar evento (solo admin)
router.put("/eventos/:id", verificarToken, onlyAdmin, actualizarEvento);

// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);

module.exports = router;
