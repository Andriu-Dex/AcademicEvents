const express = require("express");
const router = express.Router();
const reporteIngresosController = require("../controllers/reporte-ingresos.controller");
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

// Middleware para validar JWT y rol de administrador en todas las rutas
router.use(verificarToken, onlyAdmin);

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
