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
    console.log(
      "Intentando subir imagen a Imgur. Archivo:",
      JSON.stringify({
        nombre: archivo.originalname,
        mimetype: archivo.mimetype,
        size: archivo.size,
        path: archivo.path,
      })
    );

    // Verificar que el archivo existe antes de leerlo
    if (!fs.existsSync(archivo.path)) {
      console.error(`El archivo no existe en la ruta: ${archivo.path}`);
      throw new Error("El archivo no existe en el servidor");
    }

    // Leer el archivo del disco
    const imagenBuffer = fs.readFileSync(archivo.path);
    console.log(
      `Archivo leído correctamente. Tamaño: ${imagenBuffer.length} bytes`
    );

    const imagenBase64 = imagenBuffer.toString("base64"); // Convierte buffer a base64

    // Enviar a Imgur
    console.log("Enviando imagen a Imgur...");
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

    console.log("Imagen subida correctamente a Imgur");
    return res.data.data.link;
  } catch (error) {
    console.error("Error al subir imagen a Imgur:", error);

    // Loguear más detalles sobre el error
    if (error.response) {
      console.error("Respuesta de error de Imgur:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No se recibió respuesta de Imgur");
    }

    throw new Error(`No se pudo subir la imagen a Imgur: ${error.message}`);
  }
}

module.exports = {
  subirImagenAImgur,
};
