const prisma = require("../config/db");
const { enviarCorreoConCertificado } = require("../services/mailer");
const {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
} = require("../utils/certificado.utils");

// Descargar certificado PDF
const generarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { usuario: true, evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (!cumpleRequisitosCertificado(inscripcion)) {
      return res
        .status(403)
        .json({ msg: "No cumple requisitos para certificado" });
    }

    const doc = generarCertificadoPDF(inscripcion);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=certificado-${inscripcion.usuario.nom_usu}.pdf`
    );
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al generar certificado", error: error.message });
  }
};

// Enviar certificado por correo
const enviarCertificadoPorCorreo = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: { usuario: true, evento: true },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (!cumpleRequisitosCertificado(inscripcion)) {
      return res
        .status(403)
        .json({ msg: "No cumple requisitos para certificado" });
    }

    const doc = generarCertificadoPDF(inscripcion);
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const enviado = await enviarCorreoConCertificado(
        inscripcion.usuario.cor_usu,
        pdfBuffer
      );

      if (enviado) {
        await prisma.inscripcion.update({
          where: { id_ins: id },
          data: { cert_enviado: true },
        });

        res
          .status(200)
          .json({ msg: "Certificado enviado correctamente por correo" });
      } else {
        console.error(
          "Falló el envío de certificado a:",
          inscripcion.usuario.cor_usu
        );
        res.status(500).json({ msg: "Error al enviar correo con certificado" });
      }
    });

    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al enviar certificado", error: error.message });
  }
};

module.exports = {
  generarCertificado,
  enviarCertificadoPorCorreo,
};
