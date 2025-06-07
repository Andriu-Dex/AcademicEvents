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

  // 🎨 Fondo blanco
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

  // 🟦 Encabezado decorativo superior
  doc.fillColor("#1a3c6e").rect(0, 0, doc.page.width, 80).fill();

  // 🟨 Banda decorativa inferior
  doc
    .fillColor("#e0b747")
    .rect(0, doc.page.height - 60, doc.page.width, 60)
    .fill();

  // 🏷️ Título
  doc
    .fillColor("#e0b747")
    .font("Helvetica-Bold")
    .fontSize(36)
    .text("CERTIFICADO", 0, 40, { align: "center" });

  doc
    .fillColor("#ffffff")
    .font("Helvetica")
    .fontSize(18)
    .text(
      tipoCertificado === "APROBACION" ? "DE APROBACIÓN" : "DE PARTICIPACIÓN",
      {
        align: "center",
      }
    );

  // 🧑‍🎓 Nombre del participante
  doc
    .moveDown(3)
    .font("GreatVibes")
    .fontSize(36)
    .fillColor("#000000")
    .text(`${usuario.nom_usu} ${usuario.ape_usu}`, { align: "center" });

  // 📄 Cédula y carrera
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#444444")
    .text(`Cédula: ${usuario.ced_usu}`, { align: "center" });

  if (usuario.carrera) {
    doc.text(`Carrera: ${usuario.carrera.nom_car}`, { align: "center" });
  }

  // 📚 Detalles del evento
  doc
    .moveDown()
    .fontSize(13)
    .text(
      `Ha ${
        tipoCertificado === "APROBACION" ? "APROBADO" : "PARTICIPADO"
      } satisfactoriamente en el evento académico:`,
      { align: "center" }
    )
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#1a3c6e")
    .text(`"${evento.nom_eve}"`, { align: "center" })
    .moveDown()
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#333333")
    .text(`Tipo: ${evento.tip_eve}`, 150)
    .text(`Duración: ${evento.dur_hor_eve} horas`)
    .text(
      `Fecha: ${new Date(evento.fec_ini_eve).toLocaleDateString(
        "es-EC"
      )} - ${new Date(evento.fec_fin_eve).toLocaleDateString("es-EC")}`
    )
    .text(`Asistencia: ${asistencia}%`);

  if (evento.tip_eve === "CURSO" && notaFinal !== null) {
    doc.text(`Nota final: ${notaFinal}/10`);
  }
  // 🥇 Sello decorativo
  const selloPath = path.join(__dirname, "../../assets/images/medal.png");
  if (fs.existsSync(selloPath)) {
    doc.image(selloPath, doc.page.width - 180, doc.page.height - 160, {
      width: 100,
    });
  }

  // ✒️ Firma
  const yFirma = doc.page.height - 120;

  doc
    .moveTo(doc.page.width / 2 - 100, yFirma)
    .lineTo(doc.page.width / 2 + 100, yFirma)
    .strokeColor("#000000")
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(10)
    .text("Firma del Director", 0, yFirma + 5, { align: "center" });

  // 🔐 Código de validación
  doc
    .fontSize(10)
    .fillColor("#555555")
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
