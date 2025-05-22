const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerInscripcionesPorEvento,
  validarInscripcion,
} = require("../controllers/inscripcion.controller");

router.get(
  "/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

router.put(
  "/inscripciones/validar/:id",
  verificarToken,
  onlyAdmin,
  validarInscripcion
);

module.exports = router;
