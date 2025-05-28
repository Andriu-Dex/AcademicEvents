const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const upload = require("../config/multer");

const {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventosPorTipo,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos (público)
router.get("/eventos", obtenerEventos);

// Obtener un evento por ID (público)
router.get("/eventos/:id", obtenerEventoPorId);

// Crear un nuevo evento (solo admin)
router.post("/eventos", verificarToken, onlyAdmin, upload.single('img_por_eve'), crearEvento);

// Actualizar evento (solo admin)
router.put("/eventos/:id", verificarToken, onlyAdmin, upload.single("img_por_eve"), actualizarEvento);
// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);

// Obtener eventos por tipo (público)
router.get("/eventos/tipo/:tipo", obtenerEventosPorTipo);

module.exports = router;
