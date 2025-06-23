const { prisma } = require("../config/db");
const { enviarCorreoConCertificado } = require("../services/mailer");
const fs = require("fs");
const path = require("path");
const {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
} = require("../utils/certificado.utils");

// Crear directorio para almacenar los certificados si no existe
const certificadosDir = path.join(__dirname, "../../uploads/certificados");
if (!fs.existsSync(certificadosDir)) {
  fs.mkdirSync(certificadosDir, { recursive: true });
}

// Generar y descargar certificado PDF
const generarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si ya existe un certificado para esta inscripción
    let certificadoExistente = await prisma.certificado.findUnique({
      where: { id_ins_per: id },
    }); // Si ya existe un certificado, devolvemos la URL
    if (certificadoExistente) {
      // Enviamos el archivo al cliente
      const filePath = certificadoExistente.url_cer;
      if (fs.existsSync(filePath)) {
        // Obtenemos el nombre del archivo de la ruta
        const fileName = path.basename(filePath);

        // Configurar las cabeceras adecuadas para un archivo PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );

        // Transmitir el archivo al cliente
        return fs.createReadStream(filePath).pipe(res);
      } else {
        console.log("🔄 Archivo no encontrado, regenerando certificado...");

        // 🛠 Regenerar si el archivo fue eliminado
        const inscripcion = await prisma.inscripcion.findUnique({
          where: { id_ins: id },
          include: {
            cuenta: {
              include: {
                usuario: {
                  include: { carrera: true },
                },
              },
            },
            evento: {
              include: { eventos_curso: true },
            },
            inscripcion_curso: true,
          },
        });

        if (!inscripcion)
          return res.status(404).json({ msg: "Inscripción no encontrada" });

        const tipoCertificado = determinarTipoCertificado(inscripcion.evento);
        const codigoValidacion = generarCodigoValidacion();

        const datosCertificado = {
          usuario: inscripcion.cuenta.usuario,
          evento: inscripcion.evento,
          inscripcion,
          asistencia: inscripcion.por_asi_fin_usu || 0,
          notaFinal: inscripcion.inscripcion_curso?.not_fin_usu || null,
          tipoCertificado,
          codigoValidacion,
        };

        const nombreArchivo = `certificado_${
          inscripcion.id_ins
        }_${Date.now()}.pdf`;
        const rutaArchivo = path.join(certificadosDir, nombreArchivo);

        const doc = await generarCertificadoPDF(datosCertificado);
        const stream = fs.createWriteStream(rutaArchivo);
        doc.pipe(stream);

        stream.on("finish", async () => {
          await prisma.certificado.update({
            where: { id_ins_per: id },
            data: {
              url_cer: rutaArchivo,
              tip_cer: tipoCertificado,
              cod_val_cer: codigoValidacion,
            },
          });

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=${nombreArchivo}`
          );
          fs.createReadStream(rutaArchivo).pipe(res);
        });

        doc.end();
        return;
      }
    }

    // Si no existe, buscamos la información necesaria
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: {
        cuenta: {
          include: {
            usuario: {
              include: {
                carrera: true,
              },
            },
          },
        },
        evento: {
          include: {
            eventos_curso: true,
          },
        },
        inscripcion_curso: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Verificar si cumple requisitos para certificado
    if (
      !cumpleRequisitosCertificado(
        inscripcion,
        inscripcion.evento,
        inscripcion.inscripcion_curso
      )
    ) {
      return res.status(403).json({
        msg: "No cumple requisitos para certificado",
        detalles: {
          asistenciaActual: inscripcion.por_asi_fin_usu || 0,
          asistenciaRequerida: inscripcion.evento.por_min_asi_eve || 80,
          notaActual: inscripcion.inscripcion_curso?.not_fin_usu || 0,
          notaRequerida: inscripcion.evento.eventos_curso?.not_min_cur || 7,
        },
      });
    }

    // Determinar tipo de certificado
    const tipoCertificado = determinarTipoCertificado(inscripcion.evento);

    // Generar código de validación único
    const codigoValidacion = generarCodigoValidacion();

    // Preparar datos para el certificado
    const datosCertificado = {
      usuario: inscripcion.cuenta.usuario,
      evento: inscripcion.evento,
      inscripcion: inscripcion,
      asistencia: inscripcion.por_asi_fin_usu || 0,
      notaFinal: inscripcion.inscripcion_curso?.not_fin_usu || null,
      tipoCertificado: tipoCertificado,
      codigoValidacion: codigoValidacion,
    }; // Generar el nombre del archivo
    const nombreArchivo = `certificado_${inscripcion.id_ins}_${Date.now()}.pdf`;
    // Guardar en la carpeta uploads/certificados que está expuesta públicamente
    const rutaArchivo = path.join(certificadosDir, nombreArchivo);
    // URL para acceso público al certificado
    const urlPublica = `/uploads/certificados/${nombreArchivo}`;

    // Generar el PDF
    const doc = generarCertificadoPDF(datosCertificado);

    // Guardar el PDF en disco
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    stream.on("finish", async () => {
      try {
        // Guardar el certificado en la base de datos
        certificadoExistente = await prisma.certificado.create({
          data: {
            id_ins_per: id,
            url_cer: rutaArchivo, // Ruta del archivo en el sistema
            tip_cer: tipoCertificado,
            cod_val_cer: codigoValidacion,
          },
        }); // Si todo ha ido bien, enviamos el archivo al cliente
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${nombreArchivo}`
        );
        fs.createReadStream(rutaArchivo).pipe(res);
      } catch (error) {
        console.error("Error al guardar certificado en DB:", error);
        res.status(500).json({
          msg: "Error al guardar el certificado en la base de datos",
          error: error.message,
        });
      }
    });

    doc.end();
  } catch (error) {
    console.error("Error al generar certificado:", error);
    res.status(500).json({
      msg: "Error al generar certificado",
      error: error.message,
    });
  }
};

// Enviar certificado por correo
const enviarCertificadoPorCorreo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si ya existe un certificado
    let certificado = await prisma.certificado.findUnique({
      where: { id_ins_per: id },
    });

    // Si no existe, primero lo generamos
    if (!certificado) {
      // Redirigir a la generación de certificado
      return res.redirect(`/api/certificados/${id}`);
    }

    // Obtener datos de la inscripción para el correo
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: {
        cuenta: {
          include: {
            usuario: true,
          },
        },
        evento: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Leer el archivo PDF
    const pdfBuffer = fs.readFileSync(certificado.url_cer); // Enviar por correo
    try {
      const enviado = await enviarCorreoConCertificado(
        inscripcion.cuenta.cor_usu,
        pdfBuffer,
        inscripcion.evento.nom_eve,
        `${inscripcion.cuenta.usuario.nom_usu} ${inscripcion.cuenta.usuario.ape_usu}`
      );

      if (enviado) {
        // Actualizar estado en la base de datos
        await prisma.inscripcion.update({
          where: { id_ins: id },
          data: { usu_apr_cer: true },
        });

        res
          .status(200)
          .json({ msg: "Certificado enviado correctamente por correo" });
      } else {
        console.error(
          "Falló el envío de certificado a:",
          inscripcion.cuenta.cor_usu
        );
        res.status(500).json({ msg: "Error al enviar correo con certificado" });
      }
    } catch (emailError) {
      console.error("Error detallado al enviar email:", emailError);
      res.status(500).json({
        msg: "Error al enviar correo con certificado",
        error: emailError.message,
        detalles: "Verifica la configuración SMTP en el archivo .env",
      });
    }
  } catch (error) {
    console.error("Error al enviar certificado:", error);
    res.status(500).json({
      msg: "Error al enviar certificado",
      error: error.message,
    });
  }
};

// Validar un certificado mediante su código
const validarCertificado = async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await prisma.certificado.findFirst({
      where: { cod_val_cer: codigo },
      include: {
        inscripcion: {
          include: {
            cuenta: {
              include: {
                usuario: {
                  include: {
                    carrera: true,
                  },
                },
              },
            },
            evento: true,
            inscripcion_curso: true,
          },
        },
      },
    });

    if (!certificado) {
      return res.status(404).json({
        valido: false,
        msg: "Certificado no encontrado. El código de validación es incorrecto.",
      });
    }

    // Datos para mostrar en la validación
    const datosValidacion = {
      valido: true,
      tipoCertificado: certificado.tip_cer,
      fechaEmision: certificado.fec_gen_cer,
      estudiante: {
        nombre: `${certificado.inscripcion.cuenta.usuario.nom_usu} ${certificado.inscripcion.cuenta.usuario.ape_usu}`,
        cedula: certificado.inscripcion.cuenta.usuario.ced_usu,
        carrera:
          certificado.inscripcion.cuenta.usuario.carrera?.nom_car ||
          "No especificada",
      },
      evento: {
        nombre: certificado.inscripcion.evento.nom_eve,
        tipo: certificado.inscripcion.evento.tip_eve,
        fechaInicio: certificado.inscripcion.evento.fec_ini_eve,
        fechaFin: certificado.inscripcion.evento.fec_fin_eve,
        duracion: certificado.inscripcion.evento.dur_hor_eve,
      },
      rendimiento: {
        asistencia: certificado.inscripcion.por_asi_fin_usu || 0,
        notaFinal:
          certificado.inscripcion.inscripcion_curso?.not_fin_usu || null,
      },
    };

    res.status(200).json(datosValidacion);
  } catch (error) {
    console.error("Error al validar certificado:", error);
    res.status(500).json({
      valido: false,
      msg: "Error al validar el certificado",
      error: error.message,
    });
  }
};

module.exports = {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
};
