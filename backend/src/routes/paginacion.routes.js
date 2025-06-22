const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerEventosPublicosPaginados,
  obtenerEventosUsuarioPaginados,
  obtenerEventosAdminPaginados,
} = require("../controllers/evento.paginacion.controller");

// ============================
// Rutas para eventos con paginación
// ============================

// Obtener eventos públicos paginados (sin autenticación)
router.get("/eventos-publicos", obtenerEventosPublicosPaginados);

// Obtener eventos para usuario autenticado con paginación
router.get(
  "/eventos-paginados",
  verificarToken,
  obtenerEventosUsuarioPaginados
);

// Obtener eventos para administradores con paginación
router.get(
  "/admin/eventos-paginados",
  verificarToken,
  onlyAdmin,
  obtenerEventosAdminPaginados
);

module.exports = router;
