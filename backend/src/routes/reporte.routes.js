const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth');
const onlyAdmin = require('../middlewares/autorizacion/onlyAdmin');

const { getEventosParaReportes,
    getReporteEventoPorId
} = require('../controllers/reporte.controller');

// Rutas para reportes (solo admin)

// Obtener todos los eventos para reportes (solo admin)
router.get('/reportes', verificarToken, onlyAdmin, getEventosParaReportes);

// Obtener reporte de un evento por ID (solo admin)
router.get('/reportes/:id_eve', verificarToken, onlyAdmin, getReporteEventoPorId);

module.exports = router;
