const express = require("express");
const router = express.Router();
const {
  obtenerMVA,
  actualizarMVA,
  obtenerDatosFacultad,
  actualizarDatosFacultad,
} = require("../controllers/mva.controller");

// Middleware de autenticación y autorización
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

// Ruta pública para obtener información MVA
router.get("/", obtenerMVA);

// Ruta protegida para actualizar información MVA (solo administradores)
router.put("/", verificarToken, onlyAdmin, actualizarMVA);

// Ruta pública para obtener datos de la facultad
router.get("/facultad", obtenerDatosFacultad);

// Ruta protegida para actualizar datos de la facultad (solo administradores)
router.put("/facultad", verificarToken, onlyAdmin, actualizarDatosFacultad);

module.exports = router;
