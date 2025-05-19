const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerInscripcionesPorEvento,
} = require("../controllers/inscripcion.controller");

// Ruta: Obtener inscripciones de un evento (solo admins)
router.get(
  "/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

module.exports = router;
