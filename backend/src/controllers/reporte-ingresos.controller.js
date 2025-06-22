const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Función para obtener métricas generales de ingresos y pagos
async function getMetricasGenerales(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.fec_ini_eve = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.tip_eve = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACEPTADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];
    const estadosPendientes = ["PENDIENTE"];
    const estadosRechazados = ["RECHAZADA"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMADO") {
        filtroInscripcion.est_ins = { in: estadosConfirmados };
      } else if (estadoPago === "PENDIENTE") {
        filtroInscripcion.est_ins = { in: estadosPendientes };
      } else if (estadoPago === "RECHAZADO") {
        filtroInscripcion.est_ins = { in: estadosRechazados };
      }
    }

    // Obtener total de inscripciones
    const totalInscripciones = await prisma.inscripcion.count({
      where: {
        evento: {
          ...filtroEvento,
        },
        ...filtroInscripcion,
      },
    });

    // Obtener ingresos confirmados (basado en estado de inscripción)
    const pagosConfirmados = await prisma.evento.findMany({
      where: filtroEvento,
      select: {
        val_eve: true,
        inscritos: {
          where: {
            est_ins: { in: estadosConfirmados },
            ...filtroInscripcion,
          },
          select: {
            id_ins: true,
          },
        },
      },
    });

    // Obtener ingresos pendientes (basado en estado de inscripción)
    const pagosPendientes = await prisma.evento.findMany({
      where: filtroEvento,
      select: {
        val_eve: true,
        inscritos: {
          where: {
            est_ins: { in: estadosPendientes },
            ...filtroInscripcion,
          },
          select: {
            id_ins: true,
          },
        },
      },
    });

    // Obtener inscripciones rechazadas (basado en estado de inscripción)
    const inscripcionesRechazadas = await prisma.inscripcion.count({
      where: {
        est_ins: { in: estadosRechazados },
        evento: {
          ...filtroEvento,
        },
        ...filtroInscripcion,
      },
    }); // Calcular montos
    let montoConfirmado = 0;
    let montoPendiente = 0;

    pagosConfirmados.forEach((evento) => {
      montoConfirmado += evento.val_eve * evento.inscritos.length;
    });

    pagosPendientes.forEach((evento) => {
      montoPendiente += evento.val_eve * evento.inscritos.length;
    });

    // Calcular tasa de conversión (pagos confirmados / total inscripciones)
    const totalPagosConfirmados = pagosConfirmados.reduce(
      (total, evento) => total + evento.inscritos.length,
      0
    );
    const tasaConversion =
      totalInscripciones > 0 ? totalPagosConfirmados / totalInscripciones : 0;

    res.json({
      revenueTotal: montoConfirmado + montoPendiente,
      pagosConfirmados: montoConfirmado,
      pagosPendientes: montoPendiente,
      totalInscripciones,
      comprobantesRechazados: inscripcionesRechazadas,
      tasaConversion,
    });
  } catch (error) {
    console.error("Error al obtener métricas generales:", error);
    res.status(500).json({
      msg: "Error al obtener métricas generales",
      error: error.message,
    });
  }
}

// Función para obtener ingresos por tipo de evento
async function getIngresosPorTipo(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.fec_ini_eve = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.tip_eve = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACEPTADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];
    const estadosPendientes = ["PENDIENTE"];
    const estadosRechazados = ["RECHAZADA"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMADO") {
        filtroInscripcion.est_ins = { in: estadosConfirmados };
      } else if (estadoPago === "PENDIENTE") {
        filtroInscripcion.est_ins = { in: estadosPendientes };
      } else if (estadoPago === "RECHAZADO") {
        filtroInscripcion.est_ins = { in: estadosRechazados };
      }
    }

    // Obtener todos los tipos de eventos disponibles
    const tiposEvento = await prisma.evento.groupBy({
      by: ["tip_eve"],
      where: filtroEvento,
    });

    // Para cada tipo, obtener los datos necesarios
    const ingresosPorTipo = await Promise.all(
      tiposEvento.map(async (tipo) => {
        const eventos = await prisma.evento.findMany({
          where: {
            tip_eve: tipo.tip_eve,
            ...filtroEvento,
          },
          select: {
            id_eve: true,
            val_eve: true,
            inscritos: {
              where: filtroInscripcion,
              select: {
                id_ins: true,
                est_ins: true,
              },
            },
          },
        });

        let inscripcionesTotales = 0;
        let revenueConfirmado = 0;
        let revenuePendiente = 0;

        eventos.forEach((evento) => {
          inscripcionesTotales += evento.inscritos.length;

          evento.inscritos.forEach((inscripcion) => {
            if (estadosConfirmados.includes(inscripcion.est_ins)) {
              revenueConfirmado += evento.val_eve;
            } else if (estadosPendientes.includes(inscripcion.est_ins)) {
              revenuePendiente += evento.val_eve;
            }
          });
        });

        return {
          tipoEvento: tipo.tip_eve,
          cantidadEventos: eventos.length,
          inscripcionesTotales,
          revenueTotal: revenueConfirmado + revenuePendiente,
          revenueConfirmado,
          revenuePendiente,
          promedioRevenuePorEvento:
            eventos.length > 0
              ? (revenueConfirmado + revenuePendiente) / eventos.length
              : 0,
        };
      })
    );

    // Ordenar por ingresos totales (de mayor a menor)
    ingresosPorTipo.sort((a, b) => b.revenueTotal - a.revenueTotal);

    res.json(ingresosPorTipo);
  } catch (error) {
    console.error("Error al obtener ingresos por tipo:", error);
    res.status(500).json({
      msg: "Error al obtener ingresos por tipo",
      error: error.message,
    });
  }
}

// Función para obtener los eventos más rentables
async function getEventosRentables(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.fec_ini_eve = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.tip_eve = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACEPTADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];
    const estadosPendientes = ["PENDIENTE"];
    const estadosRechazados = ["RECHAZADA"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMADO") {
        filtroInscripcion.est_ins = { in: estadosConfirmados };
      } else if (estadoPago === "PENDIENTE") {
        filtroInscripcion.est_ins = { in: estadosPendientes };
      } else if (estadoPago === "RECHAZADO") {
        filtroInscripcion.est_ins = { in: estadosRechazados };
      }
    }

    // Obtener todos los eventos con sus inscripciones
    const eventos = await prisma.evento.findMany({
      where: filtroEvento,
      select: {
        id_eve: true,
        nom_eve: true,
        tip_eve: true,
        val_eve: true,
        fec_ini_eve: true,
        inscritos: {
          where: filtroInscripcion,
          select: {
            id_ins: true,
            est_ins: true,
          },
        },
      },
    });

    // Calcular métricas para cada evento
    const eventosConMetricas = eventos.map((evento) => {
      const inscripcionesTotales = evento.inscritos.length;
      const inscripcionesConfirmadas = evento.inscritos.filter((ins) =>
        estadosConfirmados.includes(ins.est_ins)
      ).length;

      const revenueTotal = inscripcionesTotales * evento.val_eve;
      const revenueConfirmado = inscripcionesConfirmadas * evento.val_eve;

      return {
        id_eve: evento.id_eve,
        nombreEvento: evento.nom_eve,
        tipoEvento: evento.tip_eve,
        valorEvento: evento.val_eve,
        fechaEvento: evento.fec_ini_eve,
        inscripcionesTotales,
        inscripcionesConfirmadas,
        revenueTotal,
        revenueConfirmado,
        tasaConversion:
          inscripcionesTotales > 0
            ? inscripcionesConfirmadas / inscripcionesTotales
            : 0,
      };
    });

    // Ordenar por ingresos totales (de mayor a menor) y tomar los 10 más rentables
    const eventosRentables = eventosConMetricas
      .sort((a, b) => b.revenueTotal - a.revenueTotal)
      .slice(0, 10);

    res.json(eventosRentables);
  } catch (error) {
    console.error("Error al obtener eventos rentables:", error);
    res.status(500).json({
      msg: "Error al obtener eventos rentables",
      error: error.message,
    });
  }
}

// Función para obtener tendencias por período
async function getTendenciasPeriodo(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    let fechaInicio = fechaDesde
      ? new Date(fechaDesde)
      : new Date(new Date().getFullYear(), 0, 1);
    let fechaFin = fechaHasta ? new Date(fechaHasta) : new Date();

    filtroEvento.fec_ini_eve = {
      gte: fechaInicio,
      lte: fechaFin,
    };

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.tip_eve = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACEPTADA",
      "APROBADO",
      "REPROBADO_NOTA",
      "REPROBADO_ASISTENCIA",
      "REPROBADO_TOTAL",
    ];
    const estadosPendientes = ["PENDIENTE"];
    const estadosRechazados = ["RECHAZADA"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMADO") {
        filtroInscripcion.est_ins = { in: estadosConfirmados };
      } else if (estadoPago === "PENDIENTE") {
        filtroInscripcion.est_ins = { in: estadosPendientes };
      } else if (estadoPago === "RECHAZADO") {
        filtroInscripcion.est_ins = { in: estadosRechazados };
      }
    }

    // Obtener todos los eventos en el rango de fechas
    const eventos = await prisma.evento.findMany({
      where: filtroEvento,
      select: {
        id_eve: true,
        nom_eve: true,
        tip_eve: true,
        val_eve: true,
        fec_ini_eve: true,
        inscritos: {
          where: filtroInscripcion,
          select: {
            id_ins: true,
            est_ins: true,
            fec_ins: true,
          },
        },
      },
      orderBy: {
        fec_ini_eve: "asc",
      },
    });

    // Agrupar por períodos (meses)
    const agrupadoPorPeriodo = {};

    eventos.forEach((evento) => {
      const fecha = new Date(evento.fec_ini_eve);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const nombresMeses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const periodo = `${nombresMeses[mes]} ${año}`;

      if (!agrupadoPorPeriodo[periodo]) {
        agrupadoPorPeriodo[periodo] = {
          periodo,
          año,
          mes,
          cantidadEventos: 0,
          inscripcionesTotales: 0,
          revenueTotal: 0,
          revenueConfirmado: 0,
          revenuePendiente: 0,
        };
      }

      agrupadoPorPeriodo[periodo].cantidadEventos++;

      evento.inscritos.forEach((inscripcion) => {
        agrupadoPorPeriodo[periodo].inscripcionesTotales++;

        if (estadosConfirmados.includes(inscripcion.est_ins)) {
          agrupadoPorPeriodo[periodo].revenueConfirmado += evento.val_eve;
        } else if (estadosPendientes.includes(inscripcion.est_ins)) {
          agrupadoPorPeriodo[periodo].revenuePendiente += evento.val_eve;
        }
        agrupadoPorPeriodo[periodo].revenueTotal += evento.val_eve;
      });
    });

    // Convertir a array y calcular tasas de conversión
    const tendenciasPeriodo = Object.values(agrupadoPorPeriodo).map(
      (periodo) => {
        return {
          ...periodo,
          tasaConversion:
            periodo.inscripcionesTotales > 0
              ? periodo.revenueConfirmado / periodo.revenueTotal
              : 0,
        };
      }
    );

    // Ordenar por año y mes
    tendenciasPeriodo.sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.mes - b.mes;
    });

    res.json(tendenciasPeriodo);
  } catch (error) {
    console.error("Error al obtener tendencias por período:", error);
    res
      .status(500)
      .json({ msg: "Error al obtener tendencias", error: error.message });
  }
}

// Función para obtener análisis de comprobantes rechazados
async function getComprobantesRechazados(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    let fechaInicio = fechaDesde
      ? new Date(fechaDesde)
      : new Date(new Date().getFullYear(), 0, 1);
    let fechaFin = fechaHasta ? new Date(fechaHasta) : new Date();

    filtroEvento.fec_ini_eve = {
      gte: fechaInicio,
      lte: fechaFin,
    };

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.tip_eve = tipoEvento;
    }

    // Filtrar inscripciones rechazadas (estado RECHAZADA)
    filtroInscripcion.est_ins = "RECHAZADA"; // Obtener todas las inscripciones rechazadas en el rango de fechas
    const inscripcionesRechazadas = await prisma.inscripcion.findMany({
      where: {
        ...filtroInscripcion,
        evento: filtroEvento,
      },
      select: {
        id_ins: true,
        fec_ins: true,
        evento: {
          select: {
            id_eve: true,
            nom_eve: true,
            val_eve: true,
            fec_ini_eve: true,
          },
        },
        comprobantes_pago: {
          select: {
            id_com_pag: true,
            fec_val_com_pag: true,
            est_com_pag: true,
          },
        },
      },
    }); // Agrupar por períodos (meses)
    const agrupadoPorPeriodo = {};

    // Motivos de rechazo simulados (en una implementación real estos vendrían de la base de datos)
    const motivosRechazo = [
      "Documento ilegible",
      "Monto incorrecto",
      "Documento no válido",
      "Duplicado",
      "Información incompleta",
    ];
    inscripcionesRechazadas.forEach((inscripcion) => {
      // Usar la fecha de validación del comprobante si existe, sino la fecha de inscripción
      let fechaValidacion = inscripcion.fec_ins;
      if (
        inscripcion.comprobantes_pago.length > 0 &&
        inscripcion.comprobantes_pago[0].fec_val_com_pag
      ) {
        fechaValidacion = inscripcion.comprobantes_pago[0].fec_val_com_pag;
      }

      const fecha = new Date(fechaValidacion);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const nombresMeses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const periodo = `${nombresMeses[mes]} ${año}`;

      if (!agrupadoPorPeriodo[periodo]) {
        agrupadoPorPeriodo[periodo] = {
          fechaPeriodo: periodo,
          totalRechazados: 0,
          impactoRevenue: 0,
          motivosRechazo: motivosRechazo.map((motivo) => ({
            motivo,
            cantidad: 0,
          })),
        };
      }

      agrupadoPorPeriodo[periodo].totalRechazados++;
      agrupadoPorPeriodo[periodo].impactoRevenue += inscripcion.evento.val_eve;

      // Asignar un motivo aleatorio para esta simulación
      // En una implementación real, se usaría el motivo real registrado en la BD
      const motivoIndex = Math.floor(Math.random() * motivosRechazo.length);
      agrupadoPorPeriodo[periodo].motivosRechazo[motivoIndex].cantidad++;
    });

    // Convertir a array y ordenar por fecha
    const comprobantesRechazados = Object.values(agrupadoPorPeriodo);

    // Eliminar motivos sin ocurrencias y ordenar motivos por cantidad
    comprobantesRechazados.forEach((periodo) => {
      periodo.motivosRechazo = periodo.motivosRechazo
        .filter((motivo) => motivo.cantidad > 0)
        .sort((a, b) => b.cantidad - a.cantidad);
    });

    // Ordenar períodos por fecha (más recientes primero)
    comprobantesRechazados.sort((a, b) =>
      b.fechaPeriodo.localeCompare(a.fechaPeriodo)
    );

    res.json(comprobantesRechazados);
  } catch (error) {
    console.error("Error al obtener comprobantes rechazados:", error);
    res.status(500).json({
      msg: "Error al obtener comprobantes rechazados",
      error: error.message,
    });
  }
}

module.exports = {
  getMetricasGenerales,
  getIngresosPorTipo,
  getEventosRentables,
  getTendenciasPeriodo,
  getComprobantesRechazados,
};
async function generarReporteIngresosPDF(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.body;

    // Obtener todos los datos necesarios
    const metricas = await obtenerMetricasParaPDF(
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago
    );
    const ingresosPorTipo = await obtenerIngresosPorTipoParaPDF(
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago
    );
    const eventosRentables = await obtenerEventosRentablesParaPDF(
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago
    );
    const tendencias = await obtenerTendenciasParaPDF(
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago
    );

    // Crear el documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Stream del archivo temporal
    const tempFilePath = path.join(
      __dirname,
      "../../uploads/temp",
      `reporte_ingresos_${Date.now()}.pdf`
    );
    const writeStream = fs.createWriteStream(tempFilePath);

    // Pipe el PDF a un archivo temporal
    doc.pipe(writeStream);

    // Configurar metadatos del documento
    doc.info.Title = "Reporte de Ingresos y Pagos";
    doc.info.Author = "Sistema AcademicEvents";

    // Añadir contenido al PDF
    generarEncabezadoPDF(doc, fechaDesde, fechaHasta, tipoEvento, estadoPago);
    generarMetricasPDF(doc, metricas);
    generarIngresosPorTipoPDF(doc, ingresosPorTipo);
    generarEventosRentablesPDF(doc, eventosRentables);
    generarTendenciasPDF(doc, tendencias);

    // Finalizar el documento
    doc.end();

    // Cuando el archivo se haya escrito completamente
    writeStream.on("finish", () => {
      // Leer el archivo y enviarlo como respuesta
      const fileContent = fs.readFileSync(tempFilePath);

      // Configurar headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Reporte_Ingresos_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      // Enviar el archivo
      res.send(fileContent);

      // Eliminar el archivo temporal
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Funciones auxiliares para la generación del PDF
async function obtenerMetricasParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  // Implementación similar a getMetricasGenerales pero sin enviar respuesta
  // Retornar los datos necesarios para el PDF
  return {
    revenueTotal: 50000.0, // Simulado
    pagosConfirmados: 45000.0,
    pagosPendientes: 5000.0,
    totalInscripciones: 500,
    comprobantesRechazados: 15,
    tasaConversion: 0.9,
  };
}

async function obtenerIngresosPorTipoParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  // Implementación similar a getIngresosPorTipo pero sin enviar respuesta
  return [
    {
      tipoEvento: "CURSO",
      cantidadEventos: 10,
      inscripcionesTotales: 200,
      revenueTotal: 20000.0,
      revenueConfirmado: 18000.0,
      revenuePendiente: 2000.0,
      promedioRevenuePorEvento: 2000.0,
    },
  ];
}

async function obtenerEventosRentablesParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  // Implementación similar a getEventosRentables pero sin enviar respuesta
  return [
    {
      id_eve: "uuid1",
      nombreEvento: "Curso de React",
      tipoEvento: "CURSO",
      valorEvento: 50.0,
      fechaEvento: new Date(),
      inscripcionesTotales: 100,
      inscripcionesConfirmadas: 90,
      revenueTotal: 5000.0,
      revenueConfirmado: 4500.0,
      tasaConversion: 0.9,
    },
  ];
}

async function obtenerTendenciasParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  // Implementación similar a getTendenciasPeriodo pero sin enviar respuesta
  return [
    {
      periodo: "Ene 2025",
      cantidadEventos: 5,
      inscripcionesTotales: 150,
      revenueTotal: 7500.0,
      revenueConfirmado: 6750.0,
      revenuePendiente: 750.0,
      tasaConversion: 0.9,
    },
  ];
}

function generarEncabezadoPDF(
  doc,
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  // Título
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("Reporte de Ingresos y Pagos", { align: "center" });
  doc.moveDown();

  // Fecha del reporte
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Generado el: ${new Date().toLocaleDateString("es-ES")}`, {
      align: "center",
    });
  doc.moveDown();

  // Filtros aplicados
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Filtros aplicados:", { underline: true });
  doc.font("Helvetica");

  doc.text(
    `Período: ${
      fechaDesde ? new Date(fechaDesde).toLocaleDateString("es-ES") : "Todos"
    } - ${
      fechaHasta ? new Date(fechaHasta).toLocaleDateString("es-ES") : "Actual"
    }`
  );
  doc.text(`Tipo de Evento: ${tipoEvento !== "todos" ? tipoEvento : "Todos"}`);
  doc.text(`Estado de Pago: ${estadoPago !== "todos" ? estadoPago : "Todos"}`);

  doc.moveDown(2);
}

function generarMetricasPDF(doc, metricas) {
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Métricas Financieras Generales", { underline: true });
  doc.moveDown();

  // Tabla de métricas
  const formatearMoneda = (valor) => `$${valor.toFixed(2)}`;
  const formatearPorcentaje = (valor) => `${Math.round(valor * 100)}%`;

  doc.fontSize(12).font("Helvetica");
  doc.text(`Revenue Total: ${formatearMoneda(metricas.revenueTotal)}`, {
    continued: true,
  });
  doc.text(
    `   Pagos Confirmados: ${formatearMoneda(metricas.pagosConfirmados)}`,
    { align: "right" }
  );

  doc.text(`Pagos Pendientes: ${formatearMoneda(metricas.pagosPendientes)}`, {
    continued: true,
  });
  doc.text(
    `   Tasa de Conversión: ${formatearPorcentaje(metricas.tasaConversion)}`,
    { align: "right" }
  );

  doc.text(`Total Inscripciones: ${metricas.totalInscripciones}`, {
    continued: true,
  });
  doc.text(`   Comprobantes Rechazados: ${metricas.comprobantesRechazados}`, {
    align: "right",
  });

  doc.moveDown(2);
}

function generarIngresosPorTipoPDF(doc, ingresosPorTipo) {
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Ingresos por Tipo de Evento", { underline: true });
  doc.moveDown();

  // Formatear valores
  const formatearMoneda = (valor) => `$${valor.toFixed(2)}`;

  // Definir la tabla
  const headers = [
    "Tipo",
    "Eventos",
    "Inscripciones",
    "Revenue Total",
    "Confirmado",
    "Pendiente",
  ];
  const tableTop = doc.y;
  const tableLeft = 50;
  const cellWidth = (doc.page.width - 100) / headers.length;

  // Dibujar encabezados
  doc.fontSize(10).font("Helvetica-Bold");
  headers.forEach((header, i) => {
    doc.text(header, tableLeft + i * cellWidth, tableTop, {
      width: cellWidth,
      align: "center",
    });
  });

  // Dibujar línea horizontal
  doc
    .moveTo(tableLeft, tableTop + 20)
    .lineTo(tableLeft + cellWidth * headers.length, tableTop + 20)
    .stroke();

  // Dibujar datos
  doc.font("Helvetica");
  let y = tableTop + 30;

  ingresosPorTipo.forEach((tipo) => {
    doc.text(tipo.tipoEvento, tableLeft, y, {
      width: cellWidth,
      align: "center",
    });
    doc.text(tipo.cantidadEventos.toString(), tableLeft + cellWidth, y, {
      width: cellWidth,
      align: "center",
    });
    doc.text(
      tipo.inscripcionesTotales.toString(),
      tableLeft + 2 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );
    doc.text(formatearMoneda(tipo.revenueTotal), tableLeft + 3 * cellWidth, y, {
      width: cellWidth,
      align: "center",
    });
    doc.text(
      formatearMoneda(tipo.revenueConfirmado),
      tableLeft + 4 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );
    doc.text(
      formatearMoneda(tipo.revenuePendiente),
      tableLeft + 5 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );

    y += 20;

    // Verificar si necesitamos una nueva página
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
  });

  doc.y = y + 20;
  doc.moveDown();
}

function generarEventosRentablesPDF(doc, eventosRentables) {
  // Verificar si necesitamos una nueva página
  if (doc.y > doc.page.height - 300) {
    doc.addPage();
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Top Eventos Más Rentables", { underline: true });
  doc.moveDown();

  // Formatear valores
  const formatearMoneda = (valor) => `$${valor.toFixed(2)}`;
  const formatearPorcentaje = (valor) => `${Math.round(valor * 100)}%`;
  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-ES");

  // Mostrar solo los primeros 5 para el PDF
  const eventosMostrados = eventosRentables.slice(0, 5);

  // Para cada evento mostrar info resumida
  doc.fontSize(10).font("Helvetica");

  eventosMostrados.forEach((evento, index) => {
    doc
      .font("Helvetica-Bold")
      .text(`${index + 1}. ${evento.nombreEvento}`, { underline: true });
    doc.font("Helvetica");

    doc.text(`Tipo: ${evento.tipoEvento}`, { continued: true });
    doc.text(`   Valor: ${formatearMoneda(evento.valorEvento)}`, {
      align: "right",
    });

    doc.text(`Inscripciones: ${evento.inscripcionesTotales}`, {
      continued: true,
    });
    doc.text(`   Confirmadas: ${evento.inscripcionesConfirmadas}`, {
      align: "right",
    });

    doc.text(`Revenue: ${formatearMoneda(evento.revenueTotal)}`, {
      continued: true,
    });
    doc.text(
      `   Tasa Conversión: ${formatearPorcentaje(evento.tasaConversion)}`,
      { align: "right" }
    );

    doc.moveDown();
  });

  doc.moveDown();
}

function generarTendenciasPDF(doc, tendencias) {
  // Verificar si necesitamos una nueva página
  if (doc.y > doc.page.height - 300) {
    doc.addPage();
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Tendencias de Ingresos por Período", { underline: true });
  doc.moveDown();

  // Formatear valores
  const formatearMoneda = (valor) => `$${valor.toFixed(2)}`;
  const formatearPorcentaje = (valor) => `${Math.round(valor * 100)}%`;

  // Definir la tabla
  const headers = [
    "Período",
    "Eventos",
    "Inscripciones",
    "Revenue",
    "Tasa Conv.",
  ];
  const tableTop = doc.y;
  const tableLeft = 50;
  const cellWidth = (doc.page.width - 100) / headers.length;

  // Dibujar encabezados
  doc.fontSize(10).font("Helvetica-Bold");
  headers.forEach((header, i) => {
    doc.text(header, tableLeft + i * cellWidth, tableTop, {
      width: cellWidth,
      align: "center",
    });
  });

  // Dibujar línea horizontal
  doc
    .moveTo(tableLeft, tableTop + 20)
    .lineTo(tableLeft + cellWidth * headers.length, tableTop + 20)
    .stroke();

  // Dibujar datos
  doc.font("Helvetica");
  let y = tableTop + 30;

  tendencias.forEach((periodo) => {
    doc.text(periodo.periodo, tableLeft, y, {
      width: cellWidth,
      align: "center",
    });
    doc.text(periodo.cantidadEventos.toString(), tableLeft + cellWidth, y, {
      width: cellWidth,
      align: "center",
    });
    doc.text(
      periodo.inscripcionesTotales.toString(),
      tableLeft + 2 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );
    doc.text(
      formatearMoneda(periodo.revenueTotal),
      tableLeft + 3 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );
    doc.text(
      formatearPorcentaje(periodo.tasaConversion),
      tableLeft + 4 * cellWidth,
      y,
      { width: cellWidth, align: "center" }
    );

    y += 20;
  });

  // Pie de página
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(
      "Este reporte muestra un análisis financiero de los eventos académicos. Para más detalles, consulte el sistema.",
      50,
      doc.page.height - 50,
      { align: "center" }
    );
}

module.exports = {
  getMetricasGenerales,
  getIngresosPorTipo,
  getEventosRentables,
  getTendenciasPeriodo,
  getComprobantesRechazados,
  generarReporteIngresosPDF,
};
