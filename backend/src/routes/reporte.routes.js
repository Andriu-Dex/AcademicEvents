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

// ===============================================================
// Canonical Routes (English) - Primary
// ===============================================================

// Get paginated events for reports (admin only)
router.get(
  "/reports/events-paginated",
  verificarToken,
  onlyAdmin,
  getEventosParaReportesPaginados
);

// Get all events for reports (admin only)
router.get(
  "/reports/events",
  verificarToken,
  onlyAdmin,
  getEventosParaReportes
);

// Get report for a specific event by ID (admin only)
router.get(
  "/reports/event/:id_eve",
  verificarToken,
  onlyAdmin,
  getReporteEventoPorId
);

// Get events by month (admin only)
router.post("/reports/month", verificarToken, onlyAdmin, getEventosPorMes);

// Download event report PDF (admin only)
router.get(
  "/reports/event/pdf/:id_eve",
  verificarToken,
  onlyAdmin,
  descargarReporteEventoPDF
);

// Download monthly report PDF (admin only)
router.post(
  "/reports/month/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteMensualPDF
);

// Career Report
router.get(
  "/reports/career/statistics/:id_car",
  verificarToken,
  onlyAdmin,
  getReporteCarrera
);
router.get(
  "/reports/career/events/:id_car",
  verificarToken,
  onlyAdmin,
  getReporteCarrera
);
router.get(
  "/reports/career/pdf/:id_car",
  verificarToken,
  onlyAdmin,
  descargarReporteCarreraPDF
);

// Enrollment Report
router.get(
  "/reports/enrollments/statistics",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.get(
  "/reports/enrollments/trends",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.get(
  "/reports/enrollments/validations",
  verificarToken,
  onlyAdmin,
  getReporteInscripciones
);
router.post(
  "/reports/enrollments/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteInscripcionesPDF
);

// Attendance Report
router.get(
  "/reports/attendance/event/:id_evento",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.get(
  "/reports/attendance/comparative",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.get(
  "/reports/attendance/no-shows",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.post(
  "/reports/attendance/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteAsistenciaPDF
);

// Certificates Report
router.get(
  "/reports/certificates/summary",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.get(
  "/reports/certificates/downloads",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.get(
  "/reports/certificates/events",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.post(
  "/reports/certificates/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteCertificadosPDF
);

// Capacity Report
router.post(
  "/reports/capacity/occupancy/:id_evento",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reports/capacity/demand",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reports/capacity/optimization",
  verificarToken,
  onlyAdmin,
  getReporteCupos
);
router.post(
  "/reports/capacity/pdf",
  verificarToken,
  onlyAdmin,
  descargarReporteCuposPDF
);

// ===============================================================
// Legacy Routes (Spanish) - Backward Compatibility
// ===============================================================

// Obtener eventos paginados para reportes (solo admin)
router.get(
  "/reportes-evento-paginados",
  verificarToken,
  onlyAdmin,
  getEventosParaReportesPaginados
);

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
router.get(
  "/reportes-asistencia/evento/:id_evento",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.get(
  "/reportes-asistencia/comparativa",
  verificarToken,
  onlyAdmin,
  getReporteAsistencia
);
router.get(
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
router.get(
  "/reportes-certificados/resumen",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.get(
  "/reportes-certificados/descargas",
  verificarToken,
  onlyAdmin,
  getReporteCertificados
);
router.get(
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

module.exports = router;
