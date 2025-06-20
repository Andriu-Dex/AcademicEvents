const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  getEventosParaReportes,
  getEventosParaReportesPaginados,
  getReporteEventoPorId,
  getEventosPorMes,
  descargarReporteEventoPDF,
  descargarReporteMensualPDF,
  // Nuevos controladores para reportes específicos
  getReporteCarrera,
  getReporteInscripciones,
  getReporteAsistencia,
  getReporteCertificados,
  getReporteCupos,
  descargarReporteCarreraPDF,
  descargarReporteInscripcionesPDF,
  descargarReporteAsistenciaPDF,
  descargarReporteCertificadosPDF,
  descargarReporteCuposPDF,
} = require("../controllers/reporte.controller");

// Rutas para reportes (solo admin)

// Obtener todos los eventos para reportes (solo admin)
router.get(
  "/reportes-evento",
  verificarToken,
  onlyAdmin,
  getEventosParaReportes
);

// Obtener reporte de un evento por ID (solo admin)
router.get(
  "/reportes-evento/:id_eve",
  verificarToken,
  onlyAdmin,
  getReporteEventoPorId
);

// Obtener eventos por mes (solo admin)
router.post("/reportes-mes", verificarToken, onlyAdmin, getEventosPorMes);

// Descargar reporte de evento en PDF (solo admin)
router.get(
  "/reportes-evento/pdf/:id_eve",
  verificarToken,
  onlyAdmin,
  descargarReporteEventoPDF
);

// Descargar reporte mensual en PDF (solo admin)
router.post(
  "/reportes-mes/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteMensualPDF
);

// ===============================================================
// Nuevas rutas para reportes específicos
// ===============================================================

// Reporte por Carrera
router.get(
  "/reportes-carrera/estadisticas/:id_car",
  verificarToken,
  onlyAdmin,
  getReporteCarrera
);
router.get(
  "/reportes-carrera/eventos/:id_car",
  verificarToken,
  onlyAdmin,
  getReporteCarrera
);
router.get(
  "/reportes-carrera/pdf/:id_car",
  verificarToken,
  onlyAdmin,
  descargarReporteCarreraPDF
);

// Reporte de Inscripciones
router.get(
  "/reportes-inscripciones/estadisticas",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.get(
  "/reportes-inscripciones/tendencias",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.get(
  "/reportes-inscripciones/validaciones",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.post(
  "/reportes-inscripciones/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteInscripcionesPDF
);

// Reporte de Asistencia
router.post(
  "/reportes-asistencia/evento/:id_evento",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.post(
  "/reportes-asistencia/comparativa",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.post(
  "/reportes-asistencia/no-shows",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.post(
  "/reportes-asistencia/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteAsistenciaPDF
);

// Reporte de Certificados
router.post(
  "/reportes-certificados/resumen",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.post(
  "/reportes-certificados/descargas",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.post(
  "/reportes-certificados/eventos",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.post(
  "/reportes-certificados/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteCertificadosPDF
);

// Reporte de Cupos
router.post(
  "/reportes-cupos/ocupacion/:id_evento",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reportes-cupos/demanda",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reportes-cupos/optimizacion",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reportes-cupos/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteCuposPDF
);

// Obtener eventos paginados para reportes (solo admin)
router.get(
  "/reportes-evento-paginados",
  verificarToken,
  onlyAdmin,
  getEventosParaReportesPaginados
);

module.exports = router;
