const { prisma } = require("../config/db");
const { subirImagenAImgur } = require("../utils/imgur.utils");
const fs = require("fs");

// Actualizar imagen de perfil del usuario
const actualizarImagenPerfil = async (req, res) => {
  try {
    const { id } = req.usuario; // ID de la cuenta
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir una imagen válida" });
    }

    // Verificar que el archivo es una imagen
    const tiposPermitidos = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return res.status(400).json({
        msg: "El archivo debe ser una imagen (JPG, PNG, GIF)",
      });
    }

    // Obtener cuenta y usuario asociado
    const cuenta = await prisma.cuenta.findUnique({
      where: { id_cue: id },
      include: { usuario: true },
    });

    if (!cuenta || !cuenta.usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Subir imagen a Imgur
    const imgurUrl = await subirImagenAImgur(archivo);

    // Actualizar el campo img_per_usu del usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usu: cuenta.usuario.id_usu },
      data: {
        img_per_usu: imgurUrl,
      },
    });

    // Eliminar el archivo temporal
    if (fs.existsSync(archivo.path)) {
      fs.unlinkSync(archivo.path);
    }

    return res.status(200).json({
      msg: "Imagen de perfil actualizada correctamente",
      imagenUrl: imgurUrl,
    });
  } catch (error) {
    console.error("Error al actualizar imagen de perfil:", error);
    return res
      .status(500)
      .json({ msg: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  actualizarImagenPerfil,
};
