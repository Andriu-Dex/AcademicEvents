const express = require("express");
const router = express.Router();
const {
  crearCarrera,
  obtenerCarreras,
  actualizarCarrera,
  eliminarCarrera,
} = require("../controllers/carrera.controller");

// GET todas las carreras
router.get("/carreras", obtenerCarreras);

// POST nueva carrera
router.post("/carreras", crearCarrera);

// PUT actualizar carrera por ID
router.put("/carreras/:id", actualizarCarrera);

// DELETE carrera por ID
router.delete("/carreras/:id", eliminarCarrera);

module.exports = router;
