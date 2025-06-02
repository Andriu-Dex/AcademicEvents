const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const upload = require("../config/multer");
const {
  obtenerPerfil,
  actualizarDocumento,
  actualizarDocumentos,
} = require("../controllers/perfil.controller");

// Obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, obtenerPerfil);

// Actualizar documento PDF del usuario (método original - un solo archivo)
router.put(
  "/perfil/documento",
  verificarToken,
  upload.single("documento"),
  actualizarDocumento
);

// Actualizar documentos del usuario (múltiples archivos)
router.put(
  "/perfil/documentos",
  verificarToken,
  upload.fields([
    { name: "cedula", maxCount: 1 },
    { name: "papeleta", maxCount: 1 },
    { name: "matricula", maxCount: 1 },
  ]),
  actualizarDocumentos
);

module.exports = router;
