const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Función para generar código de validación único
const generarCodigoValidacion = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// ============================
// Generar el contenido del PDF
// ============================
const generarCertificadoPDF = (datos) => {
  // Crear un nuevo documento PDF en orientación horizontal
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });

  // Destructurar los datos necesarios
  const {
    usuario,
    evento,
    inscripcion,
    asistencia,
    notaFinal,
    tipoCertificado,
  } = datos;

  // Colores del certificado
  const colorPrimario = "#8a1538"; // Color principal institucional
  const colorSecundario = "#1a3c6e"; // Color secundario

  // Añadir fondo decorativo
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f9f9f9");

  // Borde decorativo
  doc.lineWidth(10);
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .strokeColor(colorPrimario);
  doc.stroke();

  // Añadir logo (placeholder - reemplazar con tu logo real)
  // doc.image(path.join(__dirname, '../../public/logo-universidad.png'), 50, 40, { width: 100 });

  // Título del certificado
  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(colorPrimario)
    .text("CERTIFICADO", 0, 70, { align: "center" });

  // Subtítulo
  doc
    .font("Helvetica")
    .fontSize(16)
    .fillColor(colorSecundario)
    .text(
      "DE " +
        (tipoCertificado === "APROBACION" ? "APROBACIÓN" : "PARTICIPACIÓN"),
      0,
      105,
      { align: "center" }
    );

  // Línea decorativa
  doc
    .moveTo(doc.page.width / 2 - 100, 135)
    .lineTo(doc.page.width / 2 + 100, 135)
    .lineWidth(2)
    .strokeColor(colorPrimario)
    .stroke();

  // Cuerpo del certificado
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text("Se certifica que:", 0, 160, { align: "center" });

  // Nombre del participante
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(colorSecundario)
    .text(`${usuario.nom_usu} ${usuario.ape_usu}`, 0, 190, { align: "center" });

  // Cédula
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text(`Cédula: ${usuario.ced_usu}`, 0, 225, { align: "center" });

  // Carrera (si aplica)
  if (usuario.carrera) {
    doc.text(`Carrera: ${usuario.carrera.nom_car}`, 0, 250, {
      align: "center",
    });
  }

  // Texto principal
  doc
    .font("Helvetica")
    .fontSize(14)
    .text("Ha ", 150, 285)
    .fillColor(colorPrimario)
    .font("Helvetica-Bold")
    .text(tipoCertificado === "APROBACION" ? "APROBADO" : "PARTICIPADO", {
      continued: true,
    })
    .fillColor("#333333")
    .font("Helvetica")
    .text(" satisfactoriamente en el evento académico:", { continued: false });

  // Nombre del evento
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(colorSecundario)
    .text(`"${evento.nom_eve}"`, 0, 320, { align: "center" });

  // Detalles del evento
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text(`Tipo: ${evento.tip_eve}`, 150, 355);

  doc.text(`Duración: ${evento.dur_hor_eve} horas`, 150, 380);

  doc.text(
    `Fecha: ${new Date(evento.fec_ini_eve).toLocaleDateString(
      "es-EC"
    )} - ${new Date(evento.fec_fin_eve).toLocaleDateString("es-EC")}`,
    150,
    405
  );

  // Información académica
  doc.text(`Porcentaje de asistencia: ${asistencia}%`, 150, 430);

  // Si es un curso, mostrar la nota
  if (evento.tip_eve === "CURSO" && notaFinal !== null) {
    doc.text(`Nota final: ${notaFinal}/10`, 150, 455);
  }

  // Fecha de emisión
  doc
    .fontSize(12)
    .text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-EC")}`,
      0,
      500,
      { align: "center" }
    );

  // Código de validación
  doc
    .fontSize(10)
    .fillColor("#666666")
    .text(`Código de validación: ${datos.codigoValidacion}`, 0, 525, {
      align: "center",
    });

  // Firma (línea para firma)
  doc
    .moveTo(doc.page.width / 2 - 100, 485)
    .lineTo(doc.page.width / 2 + 100, 485)
    .lineWidth(1)
    .strokeColor("#000000")
    .stroke();

  doc
    .fontSize(12)
    .fillColor("#333333")
    .text("Firma del Director", 0, 490, { align: "center" });

  return doc;
};

// ============================
// Verificar si puede generar certificado
// ============================
const cumpleRequisitosCertificado = (inscripcion, evento, inscripcionCurso) => {
  if (inscripcion.est_ins !== "APROBADO") return false;

  const porcentajeAsistencia = inscripcion.por_asi_fin_usu || 0;
  const porcentajeMinimo = evento.por_min_asi_eve || 80;

  // Verificar asistencia mínima
  if (porcentajeAsistencia < porcentajeMinimo) {
    return false;
  }

  // Si es un curso, verificar nota mínima
  if (evento.tip_eve === "CURSO") {
    // Buscar información del curso
    const notaFinal = inscripcionCurso?.not_fin_usu || 0;
    const notaMinima = evento.eventos_curso?.not_min_cur || 7;

    return notaFinal >= notaMinima;
  }

  // Para otros eventos, solo se requiere asistencia
  return true;
};

// Determinar el tipo de certificado (PARTICIPACION o APROBACION)
const determinarTipoCertificado = (evento) => {
  return evento.tip_eve === "CURSO" ? "APROBACION" : "PARTICIPACION";
};

module.exports = {
  generarCertificadoPDF,
  cumpleRequisitosCertificado,
  determinarTipoCertificado,
  generarCodigoValidacion,
};
