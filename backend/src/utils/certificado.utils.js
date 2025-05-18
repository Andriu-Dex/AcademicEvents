const PDFDocument = require("pdfkit");

// ============================
// Generar el contenido del PDF
// ============================
const generarCertificadoPDF = (inscripcion) => {
  const doc = new PDFDocument();

  doc.font("Helvetica");
  doc.fontSize(22).text("Certificado Académico", { align: "center" });
  doc.moveDown(2);

  doc.fontSize(14).text(`Se certifica que:`);
  doc
    .font("Helvetica-Bold")
    .text(`${inscripcion.usuario.nom_usu} ${inscripcion.usuario.ape_usu}`);
  doc
    .font("Helvetica")
    .text("ha participado satisfactoriamente en el evento académico:");
  doc.moveDown();
  doc.font("Helvetica-Bold").text(inscripcion.evento.nom_eve);
  doc.font("Helvetica").text(`Tipo: ${inscripcion.evento.tip_eve}`);
  doc.text(`Duración: ${inscripcion.evento.dur_hrs_eve} horas`);

  if (inscripcion.evento.tip_eve === "CURSO") {
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

  return doc;
};

// ============================
// Verificar si puede generar certificado
// ============================
const cumpleRequisitosCertificado = (inscripcion) => {
  if (inscripcion.estado !== "FINALIZADA") return false;

  const tipoEvento = inscripcion.evento.tip_eve;

  if (tipoEvento === "CURSO") {
    const notaMin = inscripcion.evento.nota_min_eve ?? 8;
    const asistMin = inscripcion.evento.por_asist_eve ?? 80;
    return (
      inscripcion.nota_final >= notaMin && inscripcion.asistencia >= asistMin
    );
  } else {
    return inscripcion.asistencia >= 80;
  }
};

module.exports = {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
};
