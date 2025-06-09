const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const { upload } = require("../middlewares/upload");

const {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventosPorTipo,
  verificarYCorregirCupos,
  verificarYCorregirTodosLosCupos,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos (público)
router.get("/eventos", obtenerEventos);

// Verificar y corregir cupos (público) - Sin autenticación para solucionar el problema de cupos
router.get("/eventos-verificar-cupos", verificarYCorregirTodosLosCupos);

// Obtener un evento por ID (público)
router.get("/eventos/:id", obtenerEventoPorId);

// Crear un nuevo evento (solo admin)
router.post(
  "/eventos",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  crearEvento
);

// Actualizar evento (solo admin)
router.put(
  "/eventos/:id",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  actualizarEvento
);
// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);

// Verificar y corregir cupos (público) - Sin autenticación para solucionar el problema de cupos
router.get("/eventos/verificar-cupos", verificarYCorregirTodosLosCupos);

// Obtener eventos por tipo (público)
router.get("/eventos/tipo/:tipo", obtenerEventosPorTipo);

// Verificar y corregir cupos de un evento específico (solo admin)
router.post(
  "/eventos/:id/verificar-cupos",
  verificarToken,
  onlyAdmin,
  verificarYCorregirCupos
);

// Verificar y corregir cupos de todos los eventos (solo admin)
router.post(
  "/eventos/verificar-todos-cupos",
  verificarToken,
  onlyAdmin,
  verificarYCorregirTodosLosCupos
);

module.exports = router;
