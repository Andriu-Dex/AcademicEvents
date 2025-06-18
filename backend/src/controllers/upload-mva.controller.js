const { subirImagenAImgur } = require("../utils/imgur.utils");
const fs = require("fs");

// Subir imagen genérica a Imgur
const subirImagen = async (req, res) => {
  try {
    const archivo = req.file;

    console.log(`📤 Subiendo imagen genérica`);
    console.log(`📎 Información del archivo:`, archivo);

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir una imagen válida" });
    }

    // Verificar que el archivo es una imagen
    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "application/pdf",
    ];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return res.status(400).json({
        msg: "El archivo debe ser una imagen (JPG, PNG, GIF, BMP) o PDF",
      });
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        msg: "El archivo debe ser menor a 5MB",
      });
    }

    // Subir imagen a Imgur
    const imgurUrl = await subirImagenAImgur(archivo);
    console.log(`🔗 URL de Imgur obtenida: ${imgurUrl}`);

    // Eliminar el archivo temporal
    if (fs.existsSync(archivo.path)) {
      fs.unlinkSync(archivo.path);
      console.log(`🗑️ Archivo temporal eliminado: ${archivo.path}`);
    }

    return res.status(200).json({
      msg: "Imagen subida correctamente",
      imagenUrl: imgurUrl,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return res
      .status(500)
      .json({ msg: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  subirImagen,
};
