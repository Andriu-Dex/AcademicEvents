const express = require("express");
const {
  getUniversidadPrincipal,
  getUniversitySocialLinks,
  updateUniversidadDatos,
  createUniversitySocialLink,
  updateUniversitySocialLink,
  deleteUniversitySocialLink,
  reorderUniversitySocialLinks,
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

router.get(
  "/universidad/:id_uni/social-links",
  verificarToken,
  onlyAdmin,
  getUniversitySocialLinks
);

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

router.post(
  "/universidad/:id_uni/social-links",
  verificarToken,
  onlyAdmin,
  createUniversitySocialLink
);

router.put(
  "/universidad/:id_uni/social-links/:id",
  verificarToken,
  onlyAdmin,
  updateUniversitySocialLink
);

router.delete(
  "/universidad/:id_uni/social-links/:id",
  verificarToken,
  onlyAdmin,
  deleteUniversitySocialLink
);

router.patch(
  "/universidad/:id_uni/social-links/reorder",
  verificarToken,
  onlyAdmin,
  reorderUniversitySocialLinks
);

module.exports = router;
