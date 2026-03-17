const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerEventosPublicosPaginados,
  obtenerEventosUsuarioPaginados,
  obtenerEventosAdminPaginados,
} = require("../controllers/evento.paginacion.controller");

// ===============================================================
// Canonical Routes (English) - Primary
// ===============================================================

// Get paginated public events (no authentication)
router.get("/public-events", obtenerEventosPublicosPaginados);

// Get paginated events for authenticated user
router.get(
  "/events-paginated",
  verificarToken,
  obtenerEventosUsuarioPaginados
);

// Get paginated events for administrators
router.get(
  "/admin/events-paginated",
  verificarToken,
  onlyAdmin,
  obtenerEventosAdminPaginados
);

// ===============================================================
// Legacy Routes (Spanish) - Backward Compatibility
// ===============================================================

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
