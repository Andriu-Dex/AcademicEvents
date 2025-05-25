const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const upload = require("../middlewares/upload");

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

// Crear un nuevo evento (solo admin) - con upload de imagen
router.post("/eventos", verificarToken, onlyAdmin, upload.single('imagen_portada'), crearEvento);

// Actualizar evento (solo admin) - con upload de imagen
router.put("/eventos/:id", verificarToken, onlyAdmin, upload.single('imagen_portada'), actualizarEvento);

// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);

module.exports = router;
