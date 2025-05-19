const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  reenviarComprobante,
} = require("../controllers/inscripcion.controller");

// Controladores
const {
  crearInscripcion,
  obtenerInscripcionesPorUsuario,
  validarInscripcion,
  puedeGenerarCertificado,
} = require("../controllers/inscripcion.controller");

// ============================
// Rutas para gestión de inscripciones
// ============================

// Crear nueva inscripción a un evento
// POST /api/inscripciones
router.post(
  "/inscripciones",
  (req, res, next) => {
    upload.single("archivo")(req, res, function (err) {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            msg: "El archivo excede el tamaño máximo permitido (5 MB)",
          });
        }
        if (err.message.includes("Solo se permiten archivos")) {
          return res.status(400).json({ msg: err.message });
        }

        return res.status(400).json({ msg: "Error al subir archivo" });
      }
      next(); // Si no hay error, continúa al controlador
    });
  },
  crearInscripcion
);

// Obtener todas las inscripciones de un usuario
// GET /api/inscripciones/:id
router.get("/inscripciones/:id", obtenerInscripcionesPorUsuario);

// Validar una inscripción existente (cambia el estado)
// PUT /api/inscripciones/validar/:id
router.put("/inscripciones/validar/:id", validarInscripcion);

// Verificar si puede generar certificado
// GET /api/inscripciones/certificado/:id
router.get("/inscripciones/certificado/:id", puedeGenerarCertificado);

// Reenviar comprobante de inscripción
router.put(
  "/inscripciones/reenviar/:id",
  verificarToken,
  upload.single("archivo"),
  reenviarComprobante
);

module.exports = router;
