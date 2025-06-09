const prisma = require("../config/db");
// const { get } = require("../routes/reporte.routes");
const {
  generarReporteEventoPDF,
  generarReporteMensualPDF,
} = require("../utils/reporte.utils");
const path = require("path");
const fs = require("fs");

async function descargarReporteEventoPDF(req, res) {
  const { id_eve } = req.params;

  const datos = await obtenerDatosReporteEventoPorId(id_eve);

  if (!datos) {
    return res.status(404).json({ msg: "Evento no encontrado" });
  }

  // Asegúrate que la carpeta de reportes existe
  const reportesDir = path.join(process.cwd(), "uploads", "reportes");
  if (!fs.existsSync(reportesDir)) {
    fs.mkdirSync(reportesDir, { recursive: true });
  }

  // Define el path donde guardar temporalmente el PDF
  const filePath = path.join(reportesDir, `reporte_evento_${id_eve}.pdf`);
  await generarReporteEventoPDF(datos, filePath);

  // Lee el PDF como buffer
  const pdfBuffer = fs.readFileSync(filePath);

  // Elimina el archivo temporal después de leer
  fs.unlink(filePath, () => {});

  // Devuelve el PDF como base64 junto con el nombre del evento
  res.json({
    nom_eve: datos.cab_eve.nom_eve,
    pdf: pdfBuffer.toString("base64"),
  });
}

async function descargarReporteMensualPDF(req, res) {
  const { anio, mes } = req.body;

  if (!anio || !mes) {
    return res.status(400).json({ msg: "Debe enviar año y mes." });
  }

  const NOMBRES_MESES = [
    "", // para que 1=enero, 2=febrero...
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const nombreMes = NOMBRES_MESES[Number(mes)];

  // 1. Obtiene los datos del reporte mensual
  const datosReporte = await obtenerDatosReportePorMes(anio, mes);

  // 2. Prepara carpeta y path temporal
  const reportesDir = path.join(process.cwd(), "uploads", "reportes");
  if (!fs.existsSync(reportesDir)) {
    fs.mkdirSync(reportesDir, { recursive: true });
  }
  const filePath = path.join(
    reportesDir,
    `Reporte Mensual de ${nombreMes} del ${anio}.pdf`
  );

  // 3. Genera el PDF
  await generarReporteMensualPDF(
    {
      ...datosReporte,
      anio,
      nombreMes,
    },
    filePath
  );

  // 4. Lee el PDF como buffer
  const pdfBuffer = fs.readFileSync(filePath);

  // 5. Elimina el archivo temporal
  fs.unlink(filePath, () => {});

  // 6. Devuelve el PDF y el nombre del reporte en JSON (para frontend)
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="Reporte Mensual de ${mes} del ${anio}"`
  );
  res.send(pdfBuffer);
  /*res.json({
        nom_eve: `Reporte Mensual de ${mes} del ${anio}`,
        pdf: pdfBuffer.toString('base64')
    });*/
}

async function getEventosParaReportes(req, res) {
  try {
    const eve = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        img_por_eve: true,
      },
      orderBy: {
        fec_ini_eve: "desc", // En orden descendente por fecha de inicio
      },
    });

    res.json({ eve: eve });
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener los eventos para reportes" });
  }
}

async function getReporteEventoPorId(req, res) {
  const { id_eve } = req.params;

  try {
    const datos = await obtenerDatosReporteEventoPorId(id_eve);
    if (!datos) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }
    const { cab_eve, det_ins } = datos;
    return res.json({ cab_eve: cab_eve, det_ins: det_ins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al generar el reporte del evento" });
  }
}

async function obtenerDatosReporteEventoPorId(id_eve) {
  // 1. Buscar el evento con sus datos básicos y el creador
  const evento = await prisma.evento.findUnique({
    where: { id_eve },
    select: {
      id_eve: true,
      nom_eve: true,
      dur_hor_eve: true,
      fec_ini_eve: true,
      fec_fin_eve: true,
      img_por_eve: true,
      tip_eve: true,
      cuenta: {
        select: {
          usuario: {
            select: {
              nom_usu: true,
              ape_usu: true,
            },
          },
        },
      },
    },
  });

  if (!evento) return null;

  // Preparar select para inscripciones (condicional si es curso)
  let inscripcionSelect = {
    id_ins: true,
    por_asi_fin_usu: true,
    est_ins: true,
    cuenta: {
      select: {
        usuario: {
          select: {
            ced_usu: true,
            nom_usu: true,
            ape_usu: true,
          },
        },
      },
    },
  };

  if (evento.tip_eve === "CURSO") {
    inscripcionSelect.inscripcion_curso = { select: { not_fin_usu: true } };
  }

  // Buscar las inscripciones
  const inscripciones = await prisma.inscripcion.findMany({
    where: {
      id_eve_ins: id_eve,
      est_ins: {
        in: [
          "APROBADO",
          "REPROBADO_NOTA",
          "REPROBADO_ASISTENCIA",
          "REPROBADO_TOTAL",
        ],
      },
    },
    select: inscripcionSelect,
  });

  // Formatear detalle
  const det_ins = inscripciones.map((ins) => {
    let detalleBase = {
      ced_usu: ins.cuenta.usuario.ced_usu,
      nom_usu: ins.cuenta.usuario.nom_usu,
      ape_usu: ins.cuenta.usuario.ape_usu,
      por_asi_fin_usu: ins.por_asi_fin_usu,
      est_ins: ins.est_ins,
    };
    if (evento.tip_eve === "CURSO") {
      detalleBase.not_fin_usu = ins.inscripcion_curso?.not_fin_usu ?? null;
    }
    return detalleBase;
  });

  // Armar respuesta
  return {
    cab_eve: {
      id_eve: evento.id_eve,
      nom_eve: evento.nom_eve,
      dur_hor_eve: evento.dur_hor_eve,
      fec_ini_eve: evento.fec_ini_eve,
      fec_fin_eve: evento.fec_fin_eve,
      img_por_eve: evento.img_por_eve,
      tip_eve: evento.tip_eve,
      cre_eve: {
        nom_usu: evento.cuenta.usuario.nom_usu,
        ape_usu: evento.cuenta.usuario.ape_usu,
      },
    },
    det_ins: det_ins,
  };
}

async function obtenerDatosReportePorMes(anio, mes) {
  // Formatea el inicio y fin del mes
  const fechaInicio = new Date(
    `${anio}-${mes.toString().padStart(2, "0")}-01T00:00:00.000Z`
  );
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + 1);
  let totalEventos = 0;

  // Trae todos los eventos cuya fecha de inicio esté dentro del mes y año
  const eventos = await prisma.evento.findMany({
    where: {
      fec_ini_eve: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    },
    select: {
      id_eve: true,
      nom_eve: true,
      val_eve: true,
      tip_eve: true,
      fec_fin_eve: true,
      cuenta: {
        select: {
          usuario: {
            select: {
              nom_usu: true,
              ape_usu: true,
            },
          },
        },
      },
    },
    orderBy: {
      fec_ini_eve: "asc",
    },
  });

  // Para cada evento, cuenta las inscripciones válidas y calcula total
  const resultados = await Promise.all(
    eventos.map(async (evento) => {
      const can_ins = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          est_ins: {
            in: [
              "ACEPTADA",
              "APROBADO",
              "REPROBADO_NOTA",
              "REPROBADO_ASISTENCIA",
              "REPROBADO_TOTAL",
            ],
          },
        },
      });
      const nom_cre = evento.cuenta?.usuario?.nom_usu || "";
      const ape_cre = evento.cuenta?.usuario?.ape_usu || "";
      const tot_eve = can_ins * (evento.val_eve || 0);
      totalEventos += tot_eve;

      return {
        nom_eve: evento.nom_eve,
        val_eve: evento.val_eve,
        tip_eve: evento.tip_eve,
        fec_fin_eve: evento.fec_fin_eve,
        can_ins: can_ins,
        nom_cre,
        ape_cre,
        tot_eve,
      };
    })
  );

  return { eve: resultados, tot_tod_eve: totalEventos };
}

async function getEventosPorMes(req, res) {
  try {
    const { anio, mes } = req.body;
    if (!anio || !mes) {
      return res.status(400).json({ msg: "Debe enviar año y mes." });
    }
    const datos = await obtenerDatosReportePorMes(anio, mes);
    const { eve, tot_tod_eve } = datos;
    res.json({ eve: eve, tot_tod_eve: tot_tod_eve });
  } catch (error) {
    console.error("Error en reporte mensual:", error);
    res.status(500).json({ msg: "Error al generar el reporte por mes." });
  }
}

module.exports = {
  getEventosParaReportes,
  getReporteEventoPorId,
  getEventosPorMes,
  descargarReporteEventoPDF,
  descargarReporteMensualPDF,
};
