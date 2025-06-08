const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const { upload } = require("../middlewares/upload");
const { subirImagen } = require("../controllers/upload.controller-mva");

// ============================
// Rutas para subida de imágenes
// ============================

// Subir imagen genérica (para MVA, autoridades, etc.)
router.post(
  "/imagen",
  verificarToken,
  onlyAdmin,
  upload.single("imagen"),
  subirImagen
);

// Subir imagen de autoridad específicamente
router.post(
  "/imagen/autoridad",
  verificarToken,
  onlyAdmin,
  upload.single("imagen"),
  subirImagen
);

module.exports = router;
