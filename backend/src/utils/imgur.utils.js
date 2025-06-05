const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

/**
 * Sube una imagen a Imgur y devuelve la URL
 * @param {Object} archivo - Objeto de archivo de multer
 * @returns {Promise<string>} URL de la imagen en Imgur
 */
async function subirImagenAImgur(archivo) {
  try {
    // Leer el archivo del disco en lugar de usar buffer
    const imagenBuffer = fs.readFileSync(archivo.path);
    const imagenBase64 = imagenBuffer.toString("base64"); // Convierte buffer a base64

    const res = await axios.post(
      "https://api.imgur.com/3/image",
      {
        image: imagenBase64,
        type: "base64",
      },
      {
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
      }
    );

    return res.data.data.link;
  } catch (error) {
    console.error("Error al subir imagen a Imgur:", error);
    throw new Error("No se pudo subir la imagen a Imgur");
  }
}

module.exports = {
  subirImagenAImgur,
};
