const express = require("express");
const router = express.Router();
const reporteIngresosController = require("../controllers/reporte-ingresos.controller");
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

// Middleware para validar JWT y rol de administrador en todas las rutas
router.use(verificarToken, onlyAdmin);

// ===============================================================
// Canonical Routes (English) - Primary
// ===============================================================

// Routes for general metrics
router.get(
  "/general-metrics",
  reporteIngresosController.getMetricasGenerales
);

// Routes for revenue by event type
router.get("/revenue-by-type", reporteIngresosController.getIngresosPorTipo);

// Routes for most profitable events
router.get("/profitable-events", reporteIngresosController.getEventosRentables);

// Routes for period trends
router.get(
  "/period-trends",
  reporteIngresosController.getTendenciasPeriodo
);

// Routes for rejected receipts
router.get(
  "/rejected-receipts",
  reporteIngresosController.getComprobantesRechazados
);

// Route to generate revenue report PDF
router.post("/pdf", reporteIngresosController.generarReporteIngresosPDF);

// ===============================================================
// Legacy Routes (Spanish) - Backward Compatibility
// ===============================================================

// Rutas para métricas generales
router.get(
  "/metricas-generales",
  reporteIngresosController.getMetricasGenerales
);

// Rutas para ingresos por tipo de evento
router.get("/ingresos-por-tipo", reporteIngresosController.getIngresosPorTipo);

// Rutas para eventos más rentables
router.get("/eventos-rentables", reporteIngresosController.getEventosRentables);

// Rutas para tendencias por período
router.get(
  "/tendencias-periodo",
  reporteIngresosController.getTendenciasPeriodo
);

// Rutas para comprobantes rechazados
router.get(
  "/comprobantes-rechazados",
  reporteIngresosController.getComprobantesRechazados
);

module.exports = router;
