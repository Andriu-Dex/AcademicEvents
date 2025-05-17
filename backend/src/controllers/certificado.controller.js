const PDFDocument = require("pdfkit");
const prisma = require("../config/db");

// ==========================================
// Generar certificado académico en PDF
// ==========================================
const generarCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: id },
      include: {
        usuario: true,
        evento: true,
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (inscripcion.estado !== "FINALIZADA") {
      return res.status(400).json({ msg: "Inscripción aún no finalizada" });
    }

    const tipoEvento = inscripcion.evento.tip_eve;

    // Validación de requisitos
    const cumpleRequisitos =
      tipoEvento === "CURSO"
        ? inscripcion.nota_final >= (inscripcion.evento.nota_min_eve ?? 8) &&
          inscripcion.asistencia >= (inscripcion.evento.por_asist_eve ?? 80)
        : inscripcion.asistencia >= 80;

    if (!cumpleRequisitos) {
      return res
        .status(403)
        .json({ msg: "No cumple requisitos para certificado" });
    }

    // Generar PDF
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=certificado-${inscripcion.usuario.nom_usu}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("Certificado Académico", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(`Se certifica que:`);
    doc
      .font("Helvetica-Bold")
      .text(`${inscripcion.usuario.nom_usu} ${inscripcion.usuario.ape_usu}`);
    doc
      .font("Helvetica")
      .text(`ha participado satisfactoriamente en el evento académico:`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text(inscripcion.evento.nom_eve);
    doc.font("Helvetica").text(`Tipo de evento: ${inscripcion.evento.tip_eve}`);
    doc.text(`Duración: ${inscripcion.evento.dur_hrs_eve} horas`);

    if (tipoEvento === "CURSO") {
      doc.text(`Nota final: ${inscripcion.nota_final}`);
      doc.text(`Asistencia: ${inscripcion.asistencia}%`);
      doc.moveDown().text("Motivo: Certificado por APROBACIÓN.");
    } else {
      doc.text(`Asistencia: ${inscripcion.asistencia}%`);
      doc.moveDown().text("Motivo: Certificado por ASISTENCIA.");
    }

    doc.moveDown(3);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-EC")}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al generar certificado", error: error.message });
  }
};

module.exports = { generarCertificado };
