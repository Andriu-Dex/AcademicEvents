const prisma = require("../config/db");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");

// Obtener perfil de usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;
    console.log(`📂 Obteniendo perfil para usuario: ${id}`);

    const usuario = await prisma.usuario.findUnique({
      where: { id_usu: id },
      include: {
        carrera: true,
        inscripciones: {
          include: {
            evento: true,
            inscripcion_curso: true,
          },
          orderBy: {
            fec_ins: "desc",
          },
        },
      },
    });

    if (!usuario) {
      console.log(`❌ Usuario no encontrado: ${id}`);
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Eliminamos la contraseña del objeto que se envía al cliente
    const { con_usu, ...usuarioSinPassword } = usuario;

    console.log(
      `📄 Documento del usuario: ${
        usuarioSinPassword.com_usu || "No tiene documento"
      }`
    );

    return res.status(200).json(usuarioSinPassword);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res
      .status(500)
      .json({ msg: "Error interno del servidor", error: error.message });
  }
};

// Convertir imagen a PDF usando pdf-lib y sharp
const imagenAPDF = async (archivo) => {
  try {
    console.log(
      `🖼️ Procesando imagen: ${archivo.originalname}, tipo: ${archivo.mimetype}`
    );

    // Configurar sharp para preservar metadatos y calidad
    let sharpInstance = sharp(archivo.path).withMetadata().rotate(); // Auto-rotación basada en metadatos EXIF

    // Configuración para diferentes tipos de imágenes
    if (archivo.mimetype === "image/jpeg" || archivo.mimetype === "image/jpg") {
      sharpInstance = sharpInstance.jpeg({ quality: 95 });
    } else if (archivo.mimetype === "image/png") {
      sharpInstance = sharpInstance.png({ compressionLevel: 6 });
    } else {
      // Para otros formatos, convertir a PNG con buena calidad
      sharpInstance = sharpInstance.png({ compressionLevel: 6 });
    }

    // Calcular dimensiones para formato A4 a 300 DPI (mejor calidad para impresión)
    // A4 = 210x297mm, a 300 DPI = 2480x3508 pixeles
    const imagenBuffer = await sharpInstance
      .resize({
        width: 2480,
        height: 3508,
        fit: "inside", // Mantener relación de aspecto
        withoutEnlargement: true, // No agrandar imágenes pequeñas
      })
      .toBuffer();

    console.log(`✅ Imagen procesada correctamente: ${archivo.originalname}`);

    // Crear un nuevo documento PDF de tamaño A4
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos (72 DPI)

    // Determinar el formato de la imagen y usar el método adecuado
    let image;
    if (archivo.mimetype === "image/jpeg" || archivo.mimetype === "image/jpg") {
      image = await pdfDoc.embedJpg(imagenBuffer);
    } else {
      // Para PNG y otros formatos convertidos a PNG
      image = await pdfDoc.embedPng(imagenBuffer);
    }

    // Obtener dimensiones de la imagen con escala proporcional
    const imgDimensions = image.scale(1);

    // Calcular dimensiones máximas disponibles en la página (con margen)
    const maxWidth = page.getWidth() - 50; // 25pt de margen a cada lado
    const maxHeight = page.getHeight() - 50; // 25pt de margen arriba y abajo

    // Calcular escala para ajustar imagen dentro de dimensiones máximas
    let scale = 1;
    if (imgDimensions.width > maxWidth || imgDimensions.height > maxHeight) {
      const scaleWidth = maxWidth / imgDimensions.width;
      const scaleHeight = maxHeight / imgDimensions.height;
      scale = Math.min(scaleWidth, scaleHeight);
    }

    // Calcular dimensiones finales
    const width = imgDimensions.width * scale;
    const height = imgDimensions.height * scale;

    // Calcular posición para centrar la imagen
    const x = (page.getWidth() - width) / 2;
    const y = (page.getHeight() - height) / 2;

    // Dibujar la imagen en el PDF
    page.drawImage(image, {
      x,
      y,
      width,
      height,
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error al convertir imagen a PDF:", error);
    throw new Error("Error al convertir imagen a PDF");
  }
};

// Combinar múltiples PDFs en uno solo
const combinarPDFs = async (archivos) => {
  try {
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Para cada archivo
    for (const archivo of archivos) {
      try {
        let pdfBytes;

        // Validar que el archivo tiene las propiedades necesarias
        if (!archivo || !archivo.path || !archivo.mimetype) {
          console.error("Archivo inválido:", archivo);
          continue; // Saltamos este archivo y continuamos con el siguiente
        }

        // Si es una imagen, convertirla a PDF
        if (archivo.mimetype.startsWith("image/")) {
          pdfBytes = await imagenAPDF(archivo);
        } else {
          // Si es PDF, leer directamente
          pdfBytes = fs.readFileSync(archivo.path);
        }

        // Cargar el PDF
        const pdf = await PDFDocument.load(pdfBytes);

        // Obtener y copiar las páginas
        const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } catch (error) {
        console.error(
          `Error procesando archivo ${archivo?.originalname}:`,
          error
        );
        // Continuamos con el siguiente archivo sin detener el proceso
      }
    }

    // Verificar si se añadieron páginas al documento
    if (pdfDoc.getPageCount() === 0) {
      throw new Error("No se pudieron procesar documentos válidos");
    }

    // Generar el PDF combinado
    const pdfBytes = await pdfDoc.save();

    // Generar un nombre único para el archivo combinado
    const timestamp = Date.now();
    const nombreArchivoCombinado = `${timestamp}-documentos-combinados.pdf`;
    const rutaArchivoCombinado = path.join(
      __dirname,
      "../../uploads",
      nombreArchivoCombinado
    );

    // Guardar el archivo combinado
    fs.writeFileSync(rutaArchivoCombinado, pdfBytes);

    return {
      filename: nombreArchivoCombinado,
      path: rutaArchivoCombinado,
    };
  } catch (error) {
    console.error("Error al combinar PDFs:", error);
    throw new Error("Error al combinar los documentos PDF");
  }
};

// Actualizar documentos PDF del usuario (múltiples documentos)
const actualizarDocumentos = async (req, res) => {
  try {
    const { id } = req.usuario;
    console.log(
      "req.files estructura completa:",
      JSON.stringify(req.files, null, 2)
    );
    const archivos = req.files ? Object.values(req.files).flat() : [];

    console.log(`📤 Actualizando documentos para usuario: ${id}`);
    console.log(
      `📎 Archivos recibidos:`,
      archivos.map((a) => a?.originalname || "indefinido")
    );

    if (!archivos || archivos.length === 0) {
      return res.status(400).json({ msg: "Debes subir al menos un documento" });
    } // Verificar que todos son PDF o imágenes
    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];

    // Verificar que los archivos sean válidos antes de validar tipos
    if (archivos.some((archivo) => !archivo || !archivo.mimetype)) {
      return res.status(400).json({
        msg: "Uno o más archivos no son válidos",
      });
    }

    const tiposValidos = archivos.every((archivo) =>
      tiposPermitidos.includes(archivo.mimetype)
    );
    if (!tiposValidos) {
      return res.status(400).json({
        msg: "Todos los documentos deben ser PDF o imágenes (JPG, PNG, GIF)",
      });
    }

    // Combinar PDFs en uno solo
    const archivoFinal = await combinarPDFs(archivos);

    // Construir la ruta del archivo
    const rutaArchivo = `/uploads/${archivoFinal.filename}`;
    console.log(`🔗 Ruta del archivo combinado guardada: ${rutaArchivo}`);

    // Actualizar el campo com_usu del usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usu: id },
      data: {
        com_usu: rutaArchivo,
      },
    });

    console.log(`✅ Documentos actualizados con éxito:`, rutaArchivo);

    // Eliminar los archivos temporales individuales
    archivos.forEach((archivo) => {
      try {
        fs.unlinkSync(archivo.path);
      } catch (err) {
        console.error(
          `Error al eliminar archivo temporal ${archivo.path}:`,
          err
        );
      }
    });

    return res.status(200).json({
      msg: "Documentos actualizados correctamente",
      documento: rutaArchivo,
    });
  } catch (error) {
    console.error("Error al actualizar documentos:", error);
    return res
      .status(500)
      .json({ msg: "Error interno del servidor", error: error.message });
  }
};

// Mantener la función anterior para compatibilidad
const actualizarDocumento = async (req, res) => {
  try {
    const { id } = req.usuario;
    const archivo = req.file;

    console.log(`📤 Actualizando documento para usuario: ${id}`);
    console.log(`📎 Información del archivo:`, archivo);

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo válido" });
    }

    // Construir la ruta del archivo
    const rutaArchivo = `/uploads/${archivo.filename}`;
    console.log(`🔗 Ruta del archivo guardada: ${rutaArchivo}`);

    // Actualizar el campo com_usu del usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usu: id },
      data: {
        com_usu: rutaArchivo,
      },
    });

    console.log(`✅ Documento actualizado con éxito:`, rutaArchivo);

    return res.status(200).json({
      msg: "Documento actualizado correctamente",
      documento: rutaArchivo,
    });
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    return res
      .status(500)
      .json({ msg: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarDocumento,
  actualizarDocumentos,
};
