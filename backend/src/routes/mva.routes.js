const express = require("express");
const router = express.Router();
const { obtenerMVA, actualizarMVA } = require("../controllers/mva.controller");

// Middleware de autenticación y autorización
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

// Ruta pública para obtener información MVA
router.get("/", obtenerMVA);

// Ruta protegida para actualizar información MVA (solo administradores)
router.put("/", verificarToken, onlyAdmin, actualizarMVA);

module.exports = router;
