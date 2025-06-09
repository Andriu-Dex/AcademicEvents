const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth');
const onlyAdmin = require('../middlewares/autorizacion/onlyAdmin');

const { getEventosParaReportes,
    getReporteEventoPorId,
    getEventosPorMes,
    descargarReporteEventoPDF,
    descargarReporteMensualPDF,
} = require('../controllers/reporte.controller');

// Rutas para reportes (solo admin)

// Obtener todos los eventos para reportes (solo admin)
router.get('/reportes-evento', verificarToken, onlyAdmin, getEventosParaReportes);

// Obtener reporte de un evento por ID (solo admin)
router.get('/reportes-evento/:id_eve', verificarToken, onlyAdmin, getReporteEventoPorId);

// Obtener eventos por mes (solo admin)
router.post('/reportes-mes', verificarToken, onlyAdmin, getEventosPorMes);

// Descargar reporte de evento en PDF (solo admin)
router.get('/reportes-evento/pdf/:id_eve', verificarToken, onlyAdmin, descargarReporteEventoPDF);

// Descargar reporte mensual en PDF (solo admin)
router.post('/reportes-mes/pdf', verificarToken, onlyAdmin, descargarReporteMensualPDF);

module.exports = router;
