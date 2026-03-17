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
  obtenerEventosDestacados,
  toggleEventoDestacado,
  verificarEstadosAutomaticos,
  obtenerEventosAdminPaginados,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos (público)
router.get("/eventos", obtenerEventos);
router.get("/events", obtenerEventos);

// Obtener eventos destacados (público)
router.get("/eventos-destacados", obtenerEventosDestacados);
router.get("/events-featured", obtenerEventosDestacados);
router.get("/events/featured", obtenerEventosDestacados);

// Verificar y corregir cupos (público) - Sin autenticación para solucionar el problema de cupos
router.get("/eventos-verificar-cupos", verificarYCorregirTodosLosCupos);
router.get("/events-verify-capacity", verificarYCorregirTodosLosCupos);

// Verificar y corregir cupos (público) - Sin autenticación para solucionar el problema de cupos
router.get("/eventos/verificar-cupos", verificarYCorregirTodosLosCupos);
router.get("/events/verify-capacity", verificarYCorregirTodosLosCupos);

// Obtener eventos por tipo (público)
router.get("/eventos/tipo/:tipo", obtenerEventosPorTipo);
router.get("/events/type/:tipo", obtenerEventosPorTipo);

// Obtener un evento por ID (público)
router.get("/eventos/:id", obtenerEventoPorId);
router.get("/events/:id", obtenerEventoPorId);

// Crear un nuevo evento (solo admin)
router.post(
  "/eventos",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  crearEvento
);
router.post(
  "/events",
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
router.put(
  "/events/:id",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  actualizarEvento
);
// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);
router.delete("/events/:id", verificarToken, onlyAdmin, eliminarEvento);

// Verificar y corregir cupos de un evento específico (solo admin)
router.post(
  "/eventos/:id/verificar-cupos",
  verificarToken,
  onlyAdmin,
  verificarYCorregirCupos
);
router.post(
  "/events/:id/verify-capacity",
  verificarToken,
  onlyAdmin,
  verificarYCorregirCupos
);

// Marcar/desmarcar evento como destacado (solo admin)
router.patch(
  "/eventos/:id/destacado",
  (req, res, next) => {
    console.log("=== RUTA DESTACADO - MIDDLEWARE LOG ===");
    console.log("Método:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    console.log("=== FIN MIDDLEWARE LOG ===");
    next();
  },
  verificarToken,
  onlyAdmin,
  toggleEventoDestacado
);
router.patch(
  "/events/:id/featured",
  (req, res, next) => {
    console.log("=== ROUTE FEATURED - MIDDLEWARE LOG ===");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    console.log("=== END MIDDLEWARE LOG ===");
    next();
  },
  verificarToken,
  onlyAdmin,
  toggleEventoDestacado
);

// Verificar y corregir todos los cupos (solo admin)
router.post(
  "/eventos/verificar-todos-cupos",
  verificarToken,
  onlyAdmin,
  verificarYCorregirTodosLosCupos
);
router.post(
  "/events/verify-all-capacity",
  verificarToken,
  onlyAdmin,
  verificarYCorregirTodosLosCupos
);

// Verificar servicio de estados automáticos (solo admin)
router.get(
  "/eventos/verificar-estados-automaticos",
  verificarToken,
  onlyAdmin,
  verificarEstadosAutomaticos
);
router.get(
  "/events/verify-automatic-statuses",
  verificarToken,
  onlyAdmin,
  verificarEstadosAutomaticos
);

// Obtener eventos paginados (admin)
router.get(
  "/admin/eventos",
  verificarToken,
  onlyAdmin,
  obtenerEventosAdminPaginados
);
router.get(
  "/admin/events",
  verificarToken,
  onlyAdmin,
  obtenerEventosAdminPaginados
);

module.exports = router;
