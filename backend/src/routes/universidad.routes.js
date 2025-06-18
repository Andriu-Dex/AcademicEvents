const express = require("express");
const {
  getUniversidadPrincipal,
  updateUniversidadDatos,
} = require("../controllers/universidad.controller");
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const router = express.Router();

/**
 * @route GET /api/universidad-principal
 * @desc Obtiene los datos de la universidad principal
 * @access Public
 */
router.get("/universidad-principal", getUniversidadPrincipal);

/**
 * @route PUT /api/universidad/:id_uni
 * @desc Actualiza los datos básicos de la universidad
 * @access Private (Solo administradores)
 */
router.put(
  "/universidad/:id_uni",
  verificarToken,
  onlyAdmin,
  updateUniversidadDatos
);

module.exports = router;
