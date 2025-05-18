const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // Middleware para manejar la carga de archivos

/**
 * Ruta: POST /api/comprobantes/subir
 * Descripción: Permite subir un archivo como comprobante (imagen o PDF)
 * Middleware: upload.single('comprobante') - espera un solo archivo en el campo "comprobante"
 */
router.post("/comprobantes/subir", upload.single("comprobante"), (req, res) => {
  try {
    // Verifica si se recibió un archivo
    if (!req.file) {
      return res.status(400).json({ msg: "No se subió ningún archivo" });
    }

    // Respuesta exitosa
    res.status(200).json({
      msg: "Archivo recibido correctamente",
      nombreArchivo: req.file.filename,
      ruta: `/uploads/${req.file.filename}`, // Ruta pública para acceder al archivo si se sirve con static
    });
  } catch (error) {
    // Manejo de errores inesperados
    console.error("Error al subir comprobante:", error);
    res.status(500).json({
      msg: "Error al procesar archivo",
      error: error.message,
    });
  }
});

module.exports = router;