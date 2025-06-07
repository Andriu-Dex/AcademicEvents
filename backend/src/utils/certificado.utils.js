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
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });

  doc.registerFont(
    "GreatVibes",
    path.join(__dirname, "../../assets/fonts/GreatVibes-Regular.ttf")
  );

  const {
    usuario,
    evento,
    asistencia,
    notaFinal,
    tipoCertificado,
    codigoValidacion,
  } = datos;

  // 🎨 Fondo y bandas decorativas igual que ya lo tienes...
  // 🎨 Fondo base
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

  // 🎨 Banda superior tipo Educativa
  doc.save();
  doc.fillColor("#8a1538"); // Color institucional
  doc.moveTo(0, 0).lineTo(150, 0).lineTo(0, 150).closePath().fill();

  doc.fillColor("#e0b747"); // Dorado
  doc
    .moveTo(150, 0)
    .lineTo(180, 0)
    .lineTo(0, 180)
    .lineTo(0, 150)
    .closePath()
    .fill();
  doc.restore();

  // 🎨 Banda inferior tipo Educativa
  doc.save();
  doc.fillColor("#8a1538");
  doc
    .moveTo(doc.page.width, doc.page.height)
    .lineTo(doc.page.width - 150, doc.page.height)
    .lineTo(doc.page.width, doc.page.height - 150)
    .closePath()
    .fill();

  doc.fillColor("#e0b747");
  doc
    .moveTo(doc.page.width - 150, doc.page.height)
    .lineTo(doc.page.width - 180, doc.page.height)
    .lineTo(doc.page.width, doc.page.height - 180)
    .lineTo(doc.page.width, doc.page.height - 150)
    .closePath()
    .fill();
  doc.restore();

  // 🏷️ TÍTULOS SUPERIORES
  let currentY = 90;

  doc
    .fillColor("#000000")
    .font("Times-Bold")
    .fontSize(50)
    .text("CERTIFICADO", 0, currentY, { align: "center" });

  currentY += 50;

  doc
    .fillColor("#e0b747")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("DE RECONOCIMIENTO", 0, currentY, { align: "center" });

  currentY += 30;

  doc
    .fillColor("#999999")
    .font("Helvetica")
    .fontSize(10)
    .text("Otorgado a", 0, currentY, { align: "center" });

  // 🧑‍🎓 Nombre
  currentY += 30;

  doc
    .fillColor("#000000")
    .font("GreatVibes")
    .fontSize(42)
    .text(`${usuario.nom_usu} ${usuario.ape_usu}`, 0, currentY, {
      align: "center",
    });

  currentY += 55;

  // Cédula y carrera
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#555555")
    .text(`Cédula: ${usuario.ced_usu}`, 0, currentY, { align: "center" });

  if (usuario.carrera) {
    currentY += 18;
    doc.text(`Carrera: ${usuario.carrera.nom_car}`, 0, currentY, {
      align: "center",
    });
  }

  currentY += 35;

  // 📄 Descripción
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text(
      `Ha ${
        tipoCertificado === "APROBACION" ? "APROBADO" : "PARTICIPADO"
      } satisfactoriamente en el evento académico:`,
      0,
      currentY,
      { align: "center" }
    );

  currentY += 35;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#e0b747")
    .text(`"${evento.nom_eve}"`, 0, currentY, { align: "center" });

  currentY += 40;

  // 📚 Datos del evento
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#000000")
    .text(`Tipo: ${evento.tip_eve}`, 0, currentY, { align: "center" });

  currentY += 18;
  doc.text(`Duración: ${evento.dur_hor_eve} horas`, { align: "center" });

  currentY += 18;
  doc.text(
    `Fecha: ${new Date(evento.fec_ini_eve).toLocaleDateString(
      "es-EC"
    )} - ${new Date(evento.fec_fin_eve).toLocaleDateString("es-EC")}`,
    { align: "center" }
  );

  currentY += 18;
  doc.text(`Asistencia: ${asistencia}%`, { align: "center" });

  if (evento.tip_eve === "CURSO" && notaFinal !== null) {
    currentY += 18;
    doc.text(`Nota final: ${notaFinal}/10`, { align: "center" });
  }

  // 🖼 Borde decorativo
  doc
    .lineWidth(0.5)
    .strokeColor("#cccccc")
    .rect(15, 15, doc.page.width - 30, doc.page.height - 30)
    .stroke();

  // 🥇 Sello decorativo
  const selloPath = path.join(__dirname, "../../assets/images/stampA.png");
  if (fs.existsSync(selloPath)) {
    doc.image(selloPath, doc.page.width - 170, doc.page.height - 165, {
      width: 110,
    });
  }

  // ✒️ Firma
  const yFirma = doc.page.height - 110;

  doc
    .moveTo(doc.page.width / 2 - 100, yFirma)
    .lineTo(doc.page.width / 2 + 100, yFirma)
    .strokeColor("#000000")
    .lineWidth(1)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#333333")
    .text("Firma del Director", 0, yFirma + 5, { align: "center" });

  // 🔐 Código
  doc
    .fontSize(10)
    .fillColor("#777777")
    .text(`Código de validación: ${codigoValidacion}`, 0, yFirma + 25, {
      align: "center",
    });

  return doc;
};

// ============================
// Verificar si puede generar certificado
// ============================
const cumpleRequisitosCertificado = (inscripcion, evento, inscripcionCurso) => {
  if (inscripcion.est_ins !== "FINALIZADA") return false;

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
