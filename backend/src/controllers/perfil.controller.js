const { prisma } = require("../config/db");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const sharp = require("sharp");
const { limpiarArchivosTemporales } = require("../middlewares/upload");
const { withTenantWhere } = require("../utils/tenantScope");

const ROLE_TO_LEGACY = {
  GLOBAL_ADMIN: "ADMIN_GLOBAL",
  GENERAL_ADMIN: "ADMIN_GENERAL",
  STUDENT: "ESTUDIANTE",
  GENERAL: "GENERAL",
};

const REG_STATUS_TO_LEGACY = {
  PENDING: "PENDIENTE",
  ACCEPTED: "ACEPTADA",
  REJECTED: "RECHAZADA",
  APPROVED: "APROBADO",
  FAILED_GRADE: "REPROBADO_NOTA",
  FAILED_ATTENDANCE: "REPROBADO_ASISTENCIA",
  FAILED_TOTAL: "REPROBADO_TOTAL",
};

// Obtener perfil de usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.usuario; // Ahora id es el ID de la cuenta

    // Primero buscamos la cuenta
    const account = await prisma.account.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: {
        user: {
          include: {
            career: {
              include: {
                faculty: true,
              },
            },
          },
        },
      },
    });

    if (!account) {
      console.log("❌ [PERFIL] Cuenta no encontrada");
      return res.status(404).json({ msg: "Cuenta no encontrada" });
    }

    // Ahora obtenemos las inscripciones asociadas a la cuenta
    const registrations = await prisma.registration.findMany({
      where: withTenantWhere(req.tenantId, { accountId: account.id }),
      include: {
        event: true,
        registrationCourse: true,
        paymentReceipts: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        motivationLetters: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        observation: true,
        certificate: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    // Combinamos los datos del usuario y sus inscripciones
    const user = account.user;

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    } // Creamos el objeto de respuesta con los datos del usuario y la cuenta
    const inscripcionesLegacy = registrations.map((registration) => ({
      id_ins: registration.id,
      est_ins: REG_STATUS_TO_LEGACY[registration.status] || registration.status,
      fec_ins: registration.registeredAt,
      por_asi_fin_usu: registration.finalAttendancePercent,
      evento: registration.event
        ? {
            id_eve: registration.event.id,
            nom_eve: registration.event.name,
            tip_eve: registration.event.type,
            est_eve: registration.event.status,
            val_eve: registration.event.price,
          }
        : null,
      inscripcion_curso: registration.registrationCourse,
      comprobantes_pago: registration.paymentReceipts,
      cartas_motivacion: registration.motivationLetters,
      observacion: registration.observation,
      certificado: registration.certificate,
    }));

    const perfilData = {
      id_usu: user.id,
      id_cue: account.id,
      ced_usu: user.idNumber,
      nom_usu: user.firstName,
      ape_usu: user.lastName,
      cel_usu: user.phone,
      cor_usu: account.email,
      rol_usu: ROLE_TO_LEGACY[account.role] || account.role,
      img_per_usu: user.profileImageUrl,
      com_usu: user.documentUrl,
      fec_cre_usu: user.createdAt,
      carrera: user.career
        ? {
            id_car: user.career.id,
            nom_car: user.career.name,
            facultad: user.career.faculty
              ? {
                  id_fac: user.career.faculty.id,
                  nom_fac: user.career.faculty.name,
                }
              : null,
          }
        : null,
      inscripciones: inscripcionesLegacy,
    };

    return res.status(200).json(perfilData);
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

// Combinar múltiples PDFs en uno solo y agregar información del usuario
const combinarPDFs = async (archivos, usuario) => {
  try {
    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Registrar fontkit para poder usar fuentes
    pdfDoc.registerFontkit(fontkit);

    // Agregar página de portada con información del usuario
    const portada = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos

    // Usar las fuentes estándar que vienen con todos los PDFs
    const helveticaFont = await pdfDoc.embedFont("Helvetica");
    const helveticaBold = await pdfDoc.embedFont("Helvetica-Bold"); // Título
    portada.drawText("DOCUMENTACIÓN PERSONAL", {
      x: 50,
      y: 750,
      size: 24,
      font: helveticaBold,
      color: rgb(0.53, 0.08, 0.22), // Color UTA (#8A1538)
    });

    // Línea separadora
    portada.drawLine({
      start: { x: 50, y: 730 },
      end: { x: 545, y: 730 },
      thickness: 2,
      color: rgb(0.53, 0.08, 0.22),
    }); // Información del usuario
    const infoUsuario = [
      { label: "Cédula:", valor: usuario.idNumber },
      { label: "Nombres:", valor: usuario.firstName },
      { label: "Apellidos:", valor: usuario.lastName },
      { label: "Teléfono:", valor: usuario.phone },
    ];

    // Buscar la cuenta principal para obtener el correo
    const cuentaPrincipal = await prisma.account.findFirst({
      where: { userId: usuario.id },
      orderBy: { createdAt: "asc" },
    });

    if (cuentaPrincipal) {
      infoUsuario.push({
        label: "Correo electrónico:",
        valor: cuentaPrincipal.email,
      });
    }

    // Si es estudiante, añadir información de carrera
    if (
      cuentaPrincipal &&
      cuentaPrincipal.role === "STUDENT" &&
      usuario.career
    ) {
      infoUsuario.push({ label: "Carrera:", valor: usuario.career.name });
      infoUsuario.push({
        label: "Facultad:",
        valor: usuario.career.faculty?.name || "FISEI",
      });
    }
    infoUsuario.push({
      label: "Tipo de usuario:",
      valor:
        cuentaPrincipal &&
        ["STUDENT", "GLOBAL_ADMIN", "GENERAL_ADMIN"].includes(
          cuentaPrincipal.role
        )
          ? cuentaPrincipal.role === "STUDENT"
            ? "Estudiante"
            : "Administrador"
          : "Usuario General",
    });
    infoUsuario.push({
      label: "Fecha de registro:",
      valor: new Date(usuario.createdAt).toLocaleDateString("es-EC"),
    });

    // Dibujar información
    let y = 680;
    infoUsuario.forEach((info) => {
      portada.drawText(info.label, {
        x: 50,
        y,
        size: 12,
        font: helveticaBold,
      });

      portada.drawText(info.valor, {
        x: 180,
        y,
        size: 12,
        font: helveticaFont,
      });

      y -= 30; // Espaciado entre líneas
    }); // Nota de verificación
    portada.drawText("DOCUMENTOS ADJUNTOS", {
      x: 50,
      y: y - 50,
      size: 14,
      font: helveticaBold,
      color: rgb(0.53, 0.08, 0.22),
    });

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

    // Verificar si se añadieron páginas al documento (además de la portada)
    if (pdfDoc.getPageCount() <= 1) {
      throw new Error("No se pudieron procesar documentos válidos");
    }

    // Generar el PDF combinado
    const pdfBytes = await pdfDoc.save(); // Generar un nombre único para el archivo combinado
    const timestamp = Date.now();
    const nombreArchivoCombinado = `${timestamp}-documentos-${usuario.idNumber}.pdf`;
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
    const { id } = req.usuario; // Ahora id es el ID de la cuenta
    const archivos = req.files ? Object.values(req.files).flat() : [];

    if (!archivos || archivos.length === 0) {
      return res.status(400).json({ msg: "Debes subir al menos un documento" });
    }

    // Verificar que todos son PDF o imágenes
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

    // Obtener cuenta y usuario asociado
    const cuenta = await prisma.account.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: { user: true },
    });

    if (!cuenta || !cuenta.user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    } // Obtener información completa del usuario para el PDF
    const usuario = await prisma.user.findFirst({
      where: withTenantWhere(req.tenantId, { id: cuenta.user.id }),
      include: {
        career: {
          include: {
            faculty: true,
          },
        },
        accounts: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Combinar PDFs en uno solo incluyendo información del usuario
    const archivoFinal = await combinarPDFs(archivos, usuario);

    // Construir la ruta del archivo
    const rutaArchivo = `/uploads/${archivoFinal.filename}`;

    // Actualizar el campo company del usuario
    const usuarioActualizado = await prisma.user.updateMany({
      where: withTenantWhere(req.tenantId, { id: cuenta.user.id }),
      data: {
        documentUrl: rutaArchivo,
      },
    });

    // Limpiar archivos temporales
    limpiarArchivosTemporales();

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
    const { id } = req.usuario; // Ahora id es el ID de la cuenta
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ msg: "Debes subir un archivo válido" });
    }

    // Obtener cuenta y usuario asociado
    const cuenta = await prisma.account.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      include: { user: true },
    });

    if (!cuenta || !cuenta.user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Construir la ruta del archivo
    const rutaArchivo = `/uploads/${archivo.filename}`;

    // Actualizar el campo company del usuario
    const usuarioActualizado = await prisma.user.updateMany({
      where: withTenantWhere(req.tenantId, { id: cuenta.user.id }),
      data: {
        documentUrl: rutaArchivo,
      },
    });

    // Limpiar archivos temporales
    limpiarArchivosTemporales();

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
