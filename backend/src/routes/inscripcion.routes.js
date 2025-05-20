const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const manejarErroresDeMulter = require("../middlewares/errores/manejarErroresDeMulter");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
  validarInscripcion,
  puedeGenerarCertificado,
  reenviarComprobante,
  obtenerInscripcionesPorEvento,
} = require("../controllers/inscripcion.controller");

// =====================================
// Rutas para gestión de inscripciones
// =====================================

// Crear nueva inscripción a un evento
router.post(
  "/inscripciones",
  upload.single("archivo"),
  manejarErroresDeMulter,
  crearInscripcion
);

// Obtener inscripciones por usuario (admin)
// Esta ruta es para que un administrador pueda ver las inscripciones de un usuario específico
router.get(
  "/inscripciones/usuario/:id",
  verificarToken,
  obtenerInscripcionesPorUsuario
);

// Obtener todas las inscripciones de un evento (admin)
router.get(
  "/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// Validar una inscripción (admin)
router.put(
  "/inscripciones/validar/:id",
  verificarToken,
  onlyAdmin,
  validarInscripcion
);

// Verificar si puede generar certificado
router.get("/inscripciones/certificado/:id", puedeGenerarCertificado);

// Reenviar comprobante
router.put(
  "/inscripciones/reenviar/:id",
  verificarToken,
  upload.single("archivo"),
  reenviarComprobante
);

module.exports = router;
