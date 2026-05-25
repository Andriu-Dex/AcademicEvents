const { prisma } = require("../config/db");
const { enviarCorreoConCertificado } = require("../services/mailer");
const fs = require("node:fs");
const path = require("node:path");
const {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
  generarHTMLCertificado, // 👈 Agregamos esta función
} = require("../utils/certificado.utils");
const { withTenantWhere } = require("../utils/tenantScope");

// Crear directorio para almacenar los certificados si no existe
const certificadosDir = path.join(__dirname, "../../uploads/certificados");
if (!fs.existsSync(certificadosDir)) {
  fs.mkdirSync(certificadosDir, { recursive: true });
}

const mapEventToLegacy = (event) => ({
  id_eve: event.id,
  nom_eve: event.name,
  tip_eve: event.type,
  val_eve: event.price,
  est_eve: event.status,
  fec_ini_eve: event.startDate,
  fec_fin_eve: event.endDate,
  dur_hor_eve: event.durationHours,
  por_min_asi_eve: event.minAttendancePercent,
  eventos_curso: event.eventCourse
    ? { not_min_cur: event.eventCourse.minPassingGrade }
    : null,
});

const mapRegistrationCourseToLegacy = (registrationCourse) =>
  registrationCourse ? { not_fin_usu: registrationCourse.finalGrade } : null;

const mapUserToLegacy = (user) => ({
  ...user,
  nom_usu: user.firstName,
  ape_usu: user.lastName,
  ced_usu: user.idNumber,
  carrera: user.career ? { ...user.career, nom_car: user.career.name } : null,
});

const mapCertificateTypeToDb = (legacyType) =>
  legacyType === "APROBACION" ? "APPROVAL" : "PARTICIPATION";

// Generar y descargar certificado PDF
const generarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si ya existe un certificado para esta inscripción
    let certificadoExistente = await prisma.certificate.findFirst({
      where: withTenantWhere(req.tenantId, { registrationId: id }),
    }); // Si ya existe un certificado, devolvemos la URL
    if (certificadoExistente) {
      // Enviamos el archivo al cliente
      const filePath = certificadoExistente.fileUrl;
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
        const inscripcion = await prisma.registration.findFirst({
          where: withTenantWhere(req.tenantId, { id: id }),
          include: {
            account: {
              include: {
                user: {
                  include: { career: true },
                },
              },
            },
            event: {
              include: { eventCourse: true },
            },
            registrationCourse: true,
          },
        });

        if (!inscripcion)
          return res.status(404).json({ msg: "Inscripción no encontrada" });

        const eventoLegacy = mapEventToLegacy(inscripcion.event);
        const tipoCertificado = determinarTipoCertificado(eventoLegacy);
        const tipoCertificadoDb = mapCertificateTypeToDb(tipoCertificado);
        const codigoValidacion = generarCodigoValidacion();
        const registrationCourseLegacy = mapRegistrationCourseToLegacy(
          inscripcion.registrationCourse
        );

        const datosCertificado = {
          usuario: mapUserToLegacy(inscripcion.account.user),
          evento: eventoLegacy,
          inscripcion: {
            ...inscripcion,
            por_asi_fin_usu: inscripcion.finalAttendancePercent,
          },
          asistencia: inscripcion.finalAttendancePercent || 0,
          notaFinal: registrationCourseLegacy?.not_fin_usu || null,
          tipoCertificado,
          codigoValidacion,
        };

        const nombreArchivo = `certificado_${inscripcion.id
          }_${Date.now()}.pdf`;
        const rutaArchivo = path.join(certificadosDir, nombreArchivo);

        const pdfBuffer = await generarCertificadoPDF(datosCertificado);

        // Guardar el PDF en disco
        fs.writeFileSync(rutaArchivo, pdfBuffer);

        await prisma.certificate.updateMany({
          where: withTenantWhere(req.tenantId, { registrationId: id }),
          data: {
            fileUrl: rutaArchivo,
            type: tipoCertificadoDb,
            validationCode: codigoValidacion,
          },
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${nombreArchivo}`
        );

        // Enviar el buffer directamente
        res.send(pdfBuffer);
        return;
      }
    }

    // Si no existe, buscamos la información necesaria
    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id: id }),
      include: {
        account: {
          include: {
            user: {
              include: {
                career: true,
              },
            },
          },
        },
        event: {
          include: {
            eventCourse: true,
          },
        },
        registrationCourse: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Verificar si cumple requisitos para certificado
    if (
      !cumpleRequisitosCertificado(
        { ...inscripcion, por_asi_fin_usu: inscripcion.finalAttendancePercent },
        mapEventToLegacy(inscripcion.event),
        mapRegistrationCourseToLegacy(inscripcion.registrationCourse)
      )
    ) {
      return res.status(403).json({
        msg: "No cumple requisitos para certificado",
        detalles: {
          asistenciaActual: inscripcion.finalAttendancePercent || 0,
          asistenciaRequerida: inscripcion.event.minAttendancePercent || 80,
          notaActual: inscripcion.registrationCourse?.finalGrade || 0,
          notaRequerida: inscripcion.event.eventCourse?.minPassingGrade || 7,
        },
      });
    }

    // Determinar tipo de certificado
    const eventoLegacy = mapEventToLegacy(inscripcion.event);
    const tipoCertificado = determinarTipoCertificado(eventoLegacy);
    const tipoCertificadoDb = mapCertificateTypeToDb(tipoCertificado);

    // Generar código de validación único
    const codigoValidacion = generarCodigoValidacion();

    // Preparar datos para el certificado
    const datosCertificado = {
      usuario: mapUserToLegacy(inscripcion.account.user),
      evento: eventoLegacy,
      inscripcion: inscripcion,
      asistencia: inscripcion.finalAttendancePercent || 0,
      notaFinal: inscripcion.registrationCourse?.finalGrade || null,
      tipoCertificado: tipoCertificado,
      codigoValidacion: codigoValidacion,
    }; // Generar el nombre del archivo
    const nombreArchivo = `certificado_${inscripcion.id}_${Date.now()}.pdf`;
    // Guardar en la carpeta uploads/certificados que está expuesta públicamente
    const rutaArchivo = path.join(certificadosDir, nombreArchivo);

    // Generar el PDF
    const pdfBuffer = await generarCertificadoPDF(datosCertificado);

    // Guardar el PDF en disco
    fs.writeFileSync(rutaArchivo, pdfBuffer);

    try {
      // Upsert atómico para evitar condición de carrera cuando hay doble solicitud
      certificadoExistente = await prisma.certificate.upsert({
        where: { registrationId: id },
        update: {
          fileUrl: rutaArchivo,
          type: tipoCertificadoDb,
          validationCode: codigoValidacion,
        },
        create: {
          tenantId: inscripcion.tenantId,
          registrationId: id,
          fileUrl: rutaArchivo,
          type: tipoCertificadoDb,
          validationCode: codigoValidacion,
        },
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${path.basename(certificadoExistente.fileUrl)}`
      );

      // Enviar el buffer directamente
      res.send(pdfBuffer);
    } catch (error) {
      if (
        error?.code === "P2002" &&
        Array.isArray(error?.meta?.target) &&
        error.meta.target.includes("registrationId")
      ) {
        const certificadoEnConflicto = await prisma.certificate.findFirst({
          where: withTenantWhere(req.tenantId, { registrationId: id }),
        });

        if (
          certificadoEnConflicto?.fileUrl &&
          fs.existsSync(certificadoEnConflicto.fileUrl)
        ) {
          const fileName = path.basename(certificadoEnConflicto.fileUrl);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=${fileName}`
          );
          return fs.createReadStream(certificadoEnConflicto.fileUrl).pipe(res);
        }
      }

      console.error("Error al guardar certificado en DB:", error);
      res.status(500).json({
        msg: "Error al guardar el certificado en la base de datos",
        error: error.message,
      });
    }
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
    let certificado = await prisma.certificate.findFirst({
      where: withTenantWhere(req.tenantId, { registrationId: id }),
    });

    // Si no existe, lo generamos aquí mismo para poder enviar el correo sin depender de un redirect.
    if (!certificado) {
      const inscripcion = await prisma.registration.findFirst({
        where: withTenantWhere(req.tenantId, { id: id }),
        include: {
          account: {
            include: {
              user: {
                include: { career: true },
              },
            },
          },
          event: {
            include: { eventCourse: true },
          },
          registrationCourse: true,
        },
      });

      if (!inscripcion) {
        return res.status(404).json({ msg: "Inscripción no encontrada" });
      }

      const eventoLegacy = mapEventToLegacy(inscripcion.event);
      const registrationCourseLegacy = mapRegistrationCourseToLegacy(inscripcion.registrationCourse);

      if (
        !cumpleRequisitosCertificado(
          { ...inscripcion, por_asi_fin_usu: inscripcion.finalAttendancePercent },
          eventoLegacy,
          registrationCourseLegacy
        )
      ) {
        return res.status(403).json({
          msg: "No cumple requisitos para certificado",
        });
      }

      const tipoCertificado = determinarTipoCertificado(eventoLegacy);
      const tipoCertificadoDb = mapCertificateTypeToDb(tipoCertificado);
      const codigoValidacion = generarCodigoValidacion();
      const datosCertificado = {
        usuario: mapUserToLegacy(inscripcion.account.user),
        evento: eventoLegacy,
        inscripcion: {
          ...inscripcion,
          por_asi_fin_usu: inscripcion.finalAttendancePercent,
        },
        asistencia: inscripcion.finalAttendancePercent || 0,
        notaFinal: inscripcion.registrationCourse?.finalGrade || null,
        tipoCertificado,
        codigoValidacion,
      };

      const nombreArchivo = `certificado_${inscripcion.id}_${Date.now()}.pdf`;
      const rutaArchivo = path.join(certificadosDir, nombreArchivo);
      const pdfBuffer = await generarCertificadoPDF(datosCertificado);

      fs.writeFileSync(rutaArchivo, pdfBuffer);

      certificado = await prisma.certificate.upsert({
        where: { registrationId: id },
        update: {
          fileUrl: rutaArchivo,
          type: tipoCertificadoDb,
          validationCode: codigoValidacion,
        },
        create: {
          tenantId: inscripcion.tenantId,
          registrationId: id,
          fileUrl: rutaArchivo,
          type: tipoCertificadoDb,
          validationCode: codigoValidacion,
        },
      });
    }

    // Obtener datos de la inscripción para el correo
    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id: id }),
      include: {
        account: {
          include: {
            user: true,
          },
        },
        event: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Leer el archivo PDF
    const pdfBuffer = fs.readFileSync(certificado.fileUrl); // Enviar por correo
    try {
      const enviado = await enviarCorreoConCertificado(
        inscripcion.account.email,
        pdfBuffer,
        inscripcion.event.name,
        `${inscripcion.account.user.firstName} ${inscripcion.account.user.lastName}`
      );

      if (enviado) {
        // Actualizar estado en la base de datos
        await prisma.registration.updateMany({
          where: withTenantWhere(req.tenantId, { id: id }),
          data: { userApprovedCertificate: true },
        });

        res
          .status(200)
          .json({ msg: "Certificado enviado correctamente por correo" });
      } else {
        console.error(
          "Falló el envío de certificado a:",
          inscripcion.account.email
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

    const certificado = await prisma.certificate.findFirst({
      where: withTenantWhere(req.tenantId, { validationCode: codigo }),
      include: {
        registration: {
          include: {
            account: {
              include: {
                user: {
                  include: {
                    career: true,
                  },
                },
              },
            },
            event: true,
            registrationCourse: true,
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
      tipoCertificado: certificado.type,
      fechaEmision: certificado.generatedAt,
      estudiante: {
        nombre: `${certificado.registration.account.user.firstName} ${certificado.registration.account.user.lastName}`,
        cedula: certificado.registration.account.user.idNumber,
        carrera:
          certificado.registration.account.user.career?.name ||
          "No especificada",
      },
      evento: {
        nombre: certificado.registration.event.name,
        tipo: certificado.registration.event.type,
        fechaInicio: certificado.registration.event.startDate,
        fechaFin: certificado.registration.event.endDate,
        duracion: certificado.registration.event.durationHours,
      },
      rendimiento: {
        asistencia: certificado.registration.finalAttendancePercent || 0,
        notaFinal: certificado.registration.registrationCourse?.finalGrade || null,
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

// Previsualizar certificado como HTML (para desarrollo)
const previsualizarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la inscripción
    const inscripcion = await prisma.registration.findFirst({
      where: withTenantWhere(req.tenantId, { id: id }),
      include: {
        account: {
          include: {
            user: {
              include: { career: true },
            },
          },
        },
        event: {
          include: { eventCourse: true },
        },
        registrationCourse: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Verificar si cumple requisitos para certificado
    if (
      !cumpleRequisitosCertificado(
        { ...inscripcion, por_asi_fin_usu: inscripcion.finalAttendancePercent },
        mapEventToLegacy(inscripcion.event),
        mapRegistrationCourseToLegacy(inscripcion.registrationCourse)
      )
    ) {
      return res.status(403).json({
        msg: "No cumple requisitos para certificado",
        detalles: {
          asistenciaActual: inscripcion.finalAttendancePercent || 0,
          asistenciaRequerida: inscripcion.event.minAttendancePercent || 80,
          notaActual: inscripcion.registrationCourse?.finalGrade || 0,
          notaRequerida: inscripcion.event.eventCourse?.minPassingGrade || 7,
        },
      });
    }

    // Determinar tipo de certificado
    const eventoLegacy = mapEventToLegacy(inscripcion.event);
    const tipoCertificado = determinarTipoCertificado(eventoLegacy);
    const codigoValidacion = generarCodigoValidacion();

    // Preparar datos para el certificado
    const datosCertificado = {
      usuario: mapUserToLegacy(inscripcion.account.user),
      evento: eventoLegacy,
      inscripcion: inscripcion,
      asistencia: inscripcion.finalAttendancePercent || 0,
      notaFinal: inscripcion.registrationCourse?.finalGrade || null,
      tipoCertificado: tipoCertificado,
      codigoValidacion: codigoValidacion,
    };

    // 🎨 Generar HTML del certificado
    const htmlContent = generarHTMLCertificado(datosCertificado);

    // Enviar como HTML para previsualización
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error al previsualizar certificado:", error);
    res.status(500).json({
      msg: "Error al previsualizar certificado",
      error: error.message,
    });
  }
};

module.exports = {
  generarCertificado,
  enviarCertificadoPorCorreo,
  validarCertificado,
  previsualizarCertificado, // 👈 Exportamos la nueva función
};
