const express = require("express");
const {
  obtenerCarreras,
  crearCarrera,
  actualizarCarrera,
  eliminarCarrera,
} = require("../controllers/carrera.controller");

const router = express.Router();

router.get("/carreras", obtenerCarreras);
router.post("/carreras", crearCarrera);
router.put("/carreras/:id", actualizarCarrera);
router.delete("/carreras/:id", eliminarCarrera);

module.exports = router;
