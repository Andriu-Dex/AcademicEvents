const express = require("express");
const router = express.Router();
const {
  obtenerConfiguracion,
  actualizarConfiguracion,
} = require("../controllers/configuracion.controller");

router.get("/", obtenerConfiguracion);
router.put("/", actualizarConfiguracion);

module.exports = router;
