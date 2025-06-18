const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const { upload } = require("../middlewares/upload");
const { subirImagen } = require("../controllers/upload-mva.controller");

// Middleware para manejar errores de multer
const manejarErroresMulter = (error, req, res, next) => {
  if (error) {
    console.error("Error de multer:", error.message);

    // Si es un error de multer, enviar solo el mensaje limpio
    return res.status(400).json({
      msg: error.message,
      error: "Archivo no válido",
    });
  }

  next();
};

// ============================
// Rutas para subida de imágenes
// ============================

// Subir imagen genérica (para MVA, autoridades, etc.)
router.post(
  "/imagen",
  verificarToken,
  onlyAdmin,
  upload.single("imagen"),
  manejarErroresMulter,
  subirImagen
);

// Subir imagen de autoridad específicamente
router.post(
  "/imagen/autoridad",
  verificarToken,
  onlyAdmin,
  upload.single("imagen"),
  manejarErroresMulter,
  subirImagen
);

module.exports = router;
