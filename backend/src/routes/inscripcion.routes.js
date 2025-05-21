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
} = require("../controllers/inscripcion.controller");

// =====================================
// Rutas para gestión de inscripciones
// =====================================

// Crear nueva inscripción a un evento
// router.post(
//   "/inscripciones",
//   upload.single("archivo"),
//   manejarErroresDeMulter,
//   crearInscripcion,
//   verificarToken
// );

router.post(
  "/",
  verificarToken,
  upload.single("archivo"),
  manejarErroresDeMulter,
  crearInscripcion
);

// Obtener inscripciones del usuario
router.get(
  "/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// Ruta del admin: lista todas las inscripciones a un evento
router.get("/:idEvento", verificarToken, obtenerInscripcionUsuarioEnEvento);

// Obtener inscripciones por usuario (admin)
router.get(
  "/inscripciones/usuario/:id",
  verificarToken,
  obtenerInscripcionesPorUsuario
);

// Obtener todas las inscripciones de un evento (admin)
router.get(
  "/admin/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// Validar una inscripción (admin)
router.put(
  "/admin/inscripciones/validar/:id",
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
  manejarErroresDeMulter,
  reenviarComprobante
);

module.exports = router;
