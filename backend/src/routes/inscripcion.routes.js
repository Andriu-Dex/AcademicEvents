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
  obtenerInscripcionUsuarioEnEvento,
  obtenerInscripcionesDelUsuarioActual,
} = require("../controllers/inscripcion.controller");

// =====================================
// Rutas para gestión de inscripciones
// =====================================

// Crear inscripción
router.post(
  "/",
  verificarToken,
  upload.single("archivo"),
  manejarErroresDeMulter,
  crearInscripcion
);

// Obtener inscripciones propias del usuario autenticado
router.get("/propias", verificarToken, obtenerInscripcionesDelUsuarioActual);

// Reenviar comprobante
router.put(
  "/inscripciones/reenviar/:id",
  verificarToken,
  upload.single("archivo"),
  manejarErroresDeMulter,
  reenviarComprobante
);

// Verificar si puede generar certificado
router.get("/inscripciones/certificado/:id", puedeGenerarCertificado);

// ADMIN: Obtener inscripciones por usuario
router.get(
  "/inscripciones/usuario/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorUsuario
);

// ADMIN: Obtener inscripciones por evento (duplicado → puedes revisar)
router.get(
  "/admin/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// ADMIN: Validar inscripción
router.put(
  "/admin/inscripciones/validar/:id",
  verificarToken,
  onlyAdmin,
  validarInscripcion
);

// ADMIN: Obtener inscripciones por evento (para validación)
router.get(
  "/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// Verificar si el usuario ya está inscrito en un evento
router.get("/:idEvento", verificarToken, obtenerInscripcionUsuarioEnEvento);

module.exports = router;
