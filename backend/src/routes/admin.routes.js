const express = require("express");
const router = express.Router();

const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerInscripcionesPorEvento,
} = require("../controllers/inscripcion.controller");

module.exports = router;
