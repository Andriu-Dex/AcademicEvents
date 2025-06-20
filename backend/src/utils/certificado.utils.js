const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Función para asegurar que exista un directorio
const asegurarDirectorio = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Función para generar código de validación único
const generarCodigoValidacion = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// ============================
// Generar el contenido del PDF
// ============================
const generarCertificadoPDF = (datos) => {
  // Asegurar que existan los directorios necesarios
  const fontsDir = path.join(__dirname, "../../assets/fonts");
  const imagesDir = path.join(__dirname, "../../assets/img");
  asegurarDirectorio(fontsDir);
  asegurarDirectorio(imagesDir);

  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });

  // Verificar y registrar la fuente GreatVibes
  const fontPath = path.join(fontsDir, "GreatVibes-Regular.ttf");
  if (!fs.existsSync(fontPath)) {
    console.warn(
      "⚠️ Fuente GreatVibes no encontrada, usando fuente alternativa"
    );
  } else {
    doc.registerFont("GreatVibes", fontPath);
  }

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

  currentY += 25;

  doc
    .fillColor("#888888")
    .font("Helvetica-Oblique")
    .fontSize(12)
    .text("Se otorga el presente certificado a", 0, currentY, {
      align: "center",
    });

  // 🧑‍🎓 Nombre
  currentY += 30;

  doc
    .fillColor("#000000")
    .font(fs.existsSync(fontPath) ? "GreatVibes" : "Times-Roman")
    .fontSize(42)
    .text(`${usuario.nom_usu} ${usuario.ape_usu}`, 0, currentY, {
      align: "center",
    });

  currentY += 45;

  // Mostrar carrera si existe
  if (usuario.carrera) {
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#666666")
      .text(`${usuario.carrera.nom_car}`, 0, currentY, {
        align: "center",
      });
    currentY += 25;
  }

  currentY += 15;

  // 📄 Descripción elegante en párrafo
  let descripcionTexto = "";

  if (tipoCertificado === "APROBACION") {
    descripcionTexto = `Por haber completado satisfactoriamente el ${evento.tip_eve.toLowerCase()} "${
      evento.nom_eve
    }", con una duración de ${
      evento.dur_hor_eve
    } horas académicas, realizado del ${new Date(
      evento.fec_ini_eve
    ).toLocaleDateString("es-EC")} al ${new Date(
      evento.fec_fin_eve
    ).toLocaleDateString(
      "es-EC"
    )}, obteniendo una calificación de ${notaFinal}/10 puntos y manteniendo un ${asistencia}% de asistencia.`;
  } else {
    descripcionTexto = `Por su destacada participación en el ${evento.tip_eve.toLowerCase()} "${
      evento.nom_eve
    }", con una duración de ${
      evento.dur_hor_eve
    } horas académicas, realizado del ${new Date(
      evento.fec_ini_eve
    ).toLocaleDateString("es-EC")} al ${new Date(
      evento.fec_fin_eve
    ).toLocaleDateString(
      "es-EC"
    )}, cumpliendo con un ${asistencia}% de asistencia y demostrando compromiso académico.`;
  }

  doc
    .font("Helvetica")
    .fontSize(13)
    .fillColor("#333333")
    .text(descripcionTexto, 80, currentY, {
      align: "justify",
      width: doc.page.width - 160,
      lineGap: 4,
    });

  currentY += 80;

  // 🖼 Borde decorativo
  doc
    .lineWidth(0.5)
    .strokeColor("#cccccc")
    .rect(15, 15, doc.page.width - 30, doc.page.height - 30)
    .stroke();

  // 🥇 Sello decorativo
  const selloPath = path.join(imagesDir, "stampa.png");
  if (fs.existsSync(selloPath)) {
    doc.image(selloPath, doc.page.width - 190, doc.page.height - 260, {
      width: 200,
    });
  } else {
    console.warn("⚠️ Imagen de sello no encontrada");
  }

  // ✒️ Firma y fecha de emisión con estilo más elegante
  const yFirma = doc.page.height - 140;

  // Reconocimiento institucional
  doc
    .font("Helvetica-Oblique")
    .fontSize(11)
    .fillColor("#666666")
    .text(
      "En reconocimiento a su dedicación y excelencia académica.",
      0,
      yFirma - 25,
      { align: "center" }
    );

  // Fecha de emisión con mejor formato
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#444444")
    .text(
      `Emitido el ${new Date().toLocaleDateString("es-EC", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      0,
      yFirma + 5,
      { align: "center" }
    );

  // Línea de firma más elegante
  doc
    .moveTo(doc.page.width / 2 - 120, yFirma + 35)
    .lineTo(doc.page.width / 2 + 120, yFirma + 35)
    .strokeColor("#8a1538")
    .lineWidth(1.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#333333")
    .text("Dirección Académica", 0, yFirma + 42, { align: "center" });

  // 🔐 Código de validación más discreto
  doc
    .fontSize(9)
    .fillColor("#888888")
    .text(`Código de validación: ${codigoValidacion}`, 0, yFirma + 65, {
      align: "center",
    });

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
