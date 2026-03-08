const { prisma } = require("../config/db");
const path = require("path");
const fs = require("fs");

// Función para obtener métricas generales de ingresos y pagos
async function getMetricasGenerales(req, res) {
  try {
    const { fechaDesde, fechaHasta, tipoEvento, estadoPago } = req.query;

    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];
    const estadosPendientes = ["PENDING"];
    const estadosRechazados = ["REJECTED"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMED") {
        filtroInscripcion.status = { in: estadosConfirmados };
      } else if (estadoPago === "PENDING") {
        filtroInscripcion.status = { in: estadosPendientes };
      } else if (estadoPago === "REJECTED") {
        filtroInscripcion.status = { in: estadosRechazados };
      }
    }

    // Obtener total de inscripciones
    const totalInscripciones = await prisma.registration.count({
      where: {
        event: {
          ...filtroEvento,
        },
        ...filtroInscripcion,
      },
    });

    // Obtener ingresos confirmados (basado en estado de inscripción)
    const pagosConfirmados = await prisma.event.findMany({
      where: filtroEvento,
      select: {
        price: true,
        registrations: {
          where: {
            status: { in: estadosConfirmados },
            ...filtroInscripcion,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Obtener ingresos pendientes (basado en estado de inscripción)
    const pagosPendientes = await prisma.event.findMany({
      where: filtroEvento,
      select: {
        price: true,
        registrations: {
          where: {
            status: { in: estadosPendientes },
            ...filtroInscripcion,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Obtener inscripciones rechazadas (basado en estado de inscripción)
    const inscripcionesRechazadas = await prisma.registration.count({
      where: {
        status: { in: estadosRechazados },
        event: {
          ...filtroEvento,
        },
        ...filtroInscripcion,
      },
    }); // Calcular montos
    let montoConfirmado = 0;
    let montoPendiente = 0;

    pagosConfirmados.forEach((evento) => {
      montoConfirmado += evento.price * evento.registrations.length;
    });

    pagosPendientes.forEach((evento) => {
      montoPendiente += evento.price * evento.registrations.length;
    });

    // Calcular tasa de conversión (pagos confirmados / total inscripciones)
    const totalPagosConfirmados = pagosConfirmados.reduce(
      (total, evento) => total + evento.registrations.length,
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
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];
    const estadosPendientes = ["PENDING"];
    const estadosRechazados = ["REJECTED"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMED") {
        filtroInscripcion.status = { in: estadosConfirmados };
      } else if (estadoPago === "PENDING") {
        filtroInscripcion.status = { in: estadosPendientes };
      } else if (estadoPago === "REJECTED") {
        filtroInscripcion.status = { in: estadosRechazados };
      }
    }

    // Obtener todos los tipos de eventos disponibles
    const tiposEvento = await prisma.event.groupBy({
      by: ["type"],
      where: filtroEvento,
    });

    // Para cada tipo, obtener los datos necesarios
    const ingresosPorTipo = await Promise.all(
      tiposEvento.map(async (tipo) => {
        const eventos = await prisma.event.findMany({
          where: {
            type: tipo.type,
            ...filtroEvento,
          },
          select: {
            id: true,
            price: true,
            registrations: {
              where: filtroInscripcion,
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        let inscripcionesTotales = 0;
        let revenueConfirmado = 0;
        let revenuePendiente = 0;

        eventos.forEach((evento) => {
          inscripcionesTotales += evento.registrations.length;

          evento.registrations.forEach((inscripcion) => {
            if (estadosConfirmados.includes(inscripcion.status)) {
              revenueConfirmado += evento.price;
            } else if (estadosPendientes.includes(inscripcion.status)) {
              revenuePendiente += evento.price;
            }
          });
        });

        return {
          tipoEvento: tipo.type,
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
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];
    const estadosPendientes = ["PENDING"];
    const estadosRechazados = ["REJECTED"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMED") {
        filtroInscripcion.status = { in: estadosConfirmados };
      } else if (estadoPago === "PENDING") {
        filtroInscripcion.status = { in: estadosPendientes };
      } else if (estadoPago === "REJECTED") {
        filtroInscripcion.status = { in: estadosRechazados };
      }
    }

    // Obtener todos los eventos con sus inscripciones
    const eventos = await prisma.event.findMany({
      where: filtroEvento,
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        startDate: true,
        registrations: {
          where: filtroInscripcion,
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Calcular métricas para cada evento
    const eventosConMetricas = eventos.map((evento) => {
      const inscripcionesTotales = evento.registrations.length;
      const inscripcionesConfirmadas = evento.registrations.filter((ins) =>
        estadosConfirmados.includes(ins.status)
      ).length;

      const revenueTotal = inscripcionesTotales * evento.price;
      const revenueConfirmado = inscripcionesConfirmadas * evento.price;

      return {
        id: evento.id,
        nombreEvento: evento.name,
        tipoEvento: evento.type,
        valorEvento: evento.price,
        fechaEvento: evento.startDate,
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

    filtroEvento.startDate = {
      gte: fechaInicio,
      lte: fechaFin,
    };

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Definir estados según el flujo de pagos correcto
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];
    const estadosPendientes = ["PENDING"];
    const estadosRechazados = ["REJECTED"];

    // Filtro por estado de pago (mapear parámetros del frontend a estados de inscripción)
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMED") {
        filtroInscripcion.status = { in: estadosConfirmados };
      } else if (estadoPago === "PENDING") {
        filtroInscripcion.status = { in: estadosPendientes };
      } else if (estadoPago === "REJECTED") {
        filtroInscripcion.status = { in: estadosRechazados };
      }
    }

    // Obtener todos los eventos en el rango de fechas
    const eventos = await prisma.event.findMany({
      where: filtroEvento,
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        startDate: true,
        registrations: {
          where: filtroInscripcion,
          select: {
            id: true,
            status: true,
            registeredAt: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Agrupar por períodos (meses)
    const agrupadoPorPeriodo = {};

    eventos.forEach((evento) => {
      const fecha = new Date(evento.startDate);
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

      evento.registrations.forEach((inscripcion) => {
        agrupadoPorPeriodo[periodo].inscripcionesTotales++;

        if (estadosConfirmados.includes(inscripcion.status)) {
          agrupadoPorPeriodo[periodo].revenueConfirmado += evento.price;
        } else if (estadosPendientes.includes(inscripcion.status)) {
          agrupadoPorPeriodo[periodo].revenuePendiente += evento.price;
        }
        agrupadoPorPeriodo[periodo].revenueTotal += evento.price;
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

    filtroEvento.startDate = {
      gte: fechaInicio,
      lte: fechaFin,
    };

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Filtrar inscripciones rechazadas (estado REJECTED)
    filtroInscripcion.status = "REJECTED"; // Obtener todas las inscripciones rechazadas en el rango de fechas
    const inscripcionesRechazadas = await prisma.registration.findMany({
      where: {
        ...filtroInscripcion,
        event: filtroEvento,
      },
      select: {
        id: true,
        registeredAt: true,
        event: {
          select: {
            id: true,
            name: true,
            price: true,
            startDate: true,
          },
        },
        paymentReceipts: {
          select: {
            id: true,
            validatedAt: true,
            status: true,
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
      let fechaValidacion = inscripcion.registeredAt;
      if (
        inscripcion.paymentReceipts.length > 0 &&
        inscripcion.paymentReceipts[0].validatedAt
      ) {
        fechaValidacion = inscripcion.paymentReceipts[0].validatedAt;
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
      agrupadoPorPeriodo[periodo].impactoRevenue += inscripcion.event.price;

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

    console.log("💰 [CONTROLLER] Iniciando generación de PDF de ingresos...");
    console.log("💰 [CONTROLLER] Parámetros recibidos:", {
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago,
    });

    // Obtener todos los datos necesarios para el PDF
    const [
      metricas,
      ingresosPorTipo,
      eventosRentables,
      tendencias,
      comprobantesRechazados,
    ] = await Promise.all([
      obtenerMetricasParaPDF(fechaDesde, fechaHasta, tipoEvento, estadoPago),
      obtenerIngresosPorTipoParaPDF(
        fechaDesde,
        fechaHasta,
        tipoEvento,
        estadoPago
      ),
      obtenerEventosRentablesParaPDF(
        fechaDesde,
        fechaHasta,
        tipoEvento,
        estadoPago
      ),
      obtenerTendenciasParaPDF(fechaDesde, fechaHasta, tipoEvento, estadoPago),
      obtenerComprobantesRechazadosParaPDF(
        fechaDesde,
        fechaHasta,
        tipoEvento,
        estadoPago
      ),
    ]);

    console.log("💰 [CONTROLLER] Datos obtenidos correctamente");

    // Preparar la carpeta de reportes
    const reportesDir = path.join(process.cwd(), "uploads", "reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }

    // Definir el path del archivo PDF temporal
    const nombreArchivo = `Reporte_Ingresos_${fechaDesde}_al_${fechaHasta}.pdf`;
    const filePath = path.join(reportesDir, nombreArchivo);

    // Preparar los datos para la función de generación de PDF
    const datosParaPDF = {
      metricas,
      ingresosPorTipo,
      eventosRentables,
      tendencias,
      comprobantesRechazados,
      fechaInicio: fechaDesde,
      fechaFin: fechaHasta,
      tipoEvento: tipoEvento || "todos",
      estadoPago: estadoPago || "todos",
    };

    // Importar la función de generación de PDF
    const {
      generarReporteIngresosPagosPDF,
    } = require("../utils/reporte.utils");

    // Generar el PDF
    await generarReporteIngresosPagosPDF(datosParaPDF, filePath);

    console.log("💰 [CONTROLLER] PDF generado exitosamente");

    // Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // Configurar headers y enviar respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("💰 [CONTROLLER] Error al generar PDF:", error);
    res.status(500).json({
      msg: "Error al generar el PDF",
      error: error.message,
    });
  }
}

// Funciones auxiliares para la generación del PDF
async function obtenerMetricasParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  try {
    // Construir los filtros (similar a getMetricasGenerales)
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Definir estados según el flujo de pagos
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];
    const estadosPendientes = ["PENDING"];
    const estadosRechazados = ["REJECTED"];

    // Filtro por estado de pago
    if (estadoPago && estadoPago !== "todos") {
      if (estadoPago === "CONFIRMED") {
        filtroInscripcion.status = { in: estadosConfirmados };
      } else if (estadoPago === "PENDING") {
        filtroInscripcion.status = { in: estadosPendientes };
      } else if (estadoPago === "REJECTED") {
        filtroInscripcion.status = { in: estadosRechazados };
      }
    }

    // Obtener total de inscripciones
    const totalInscripciones = await prisma.registration.count({
      where: {
        ...filtroInscripcion,
        event: filtroEvento,
      },
    });

    // Obtener inscripciones con pagos confirmados
    const pagosConfirmados = await prisma.registration.count({
      where: {
        status: { in: estadosConfirmados },
        event: filtroEvento,
      },
    });

    // Calcular ingresos totales
    const inscripcionesConIngresos = await prisma.registration.findMany({
      where: {
        status: { in: estadosConfirmados },
        event: filtroEvento,
      },
      select: {
        event: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalIngresos = inscripcionesConIngresos.reduce(
      (suma, ins) => suma + (ins.event.price || 0),
      0
    );

    // Calcular tasa de conversión
    const tasaConversion =
      totalInscripciones > 0 ? pagosConfirmados / totalInscripciones : 0;

    // Calcular ingreso promedio
    const ingresoPromedio =
      pagosConfirmados > 0 ? totalIngresos / pagosConfirmados : 0;

    return {
      totalIngresos,
      totalInscripciones,
      pagosConfirmados,
      tasaConversion,
      ingresoPromedio,
    };
  } catch (error) {
    console.error("Error en obtenerMetricasParaPDF:", error);
    return {
      totalIngresos: 0,
      totalInscripciones: 0,
      pagosConfirmados: 0,
      tasaConversion: 0,
      ingresoPromedio: 0,
    };
  }
}

async function obtenerIngresosPorTipoParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  try {
    // Construir filtros base
    const filtroEvento = {};
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Estados de pagos confirmados
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];

    // Obtener tipos de eventos únicos
    const tiposEventos = await prisma.event.findMany({
      where: filtroEvento,
      select: { type: true },
      distinct: ["type"],
    });

    const resultado = [];

    for (const tipo of tiposEventos) {
      const tipoEventoActual = tipo.type;

      // Filtro específico para este tipo
      const filtroTipo = { ...filtroEvento, type: tipoEventoActual };

      // Total de inscripciones para este tipo
      const totalInscripciones = await prisma.registration.count({
        where: { event: filtroTipo },
      });

      // Pagos confirmados para este tipo
      const pagosConfirmados = await prisma.registration.count({
        where: {
          status: { in: estadosConfirmados },
          event: filtroTipo,
        },
      });

      // Calcular ingresos totales
      const inscripcionesConIngresos = await prisma.registration.findMany({
        where: {
          status: { in: estadosConfirmados },
          event: filtroTipo,
        },
        select: {
          event: { select: { price: true } },
        },
      });

      const ingresosTotales = inscripcionesConIngresos.reduce(
        (suma, ins) => suma + (ins.event.price || 0),
        0
      );

      // Calcular métricas
      const tasaConversion =
        totalInscripciones > 0 ? pagosConfirmados / totalInscripciones : 0;

      const ingresoPromedio =
        pagosConfirmados > 0 ? ingresosTotales / pagosConfirmados : 0;

      resultado.push({
        tipoEvento: tipoEventoActual,
        totalInscripciones,
        pagosConfirmados,
        ingresosTotales,
        tasaConversion,
        ingresoPromedio,
      });
    }

    // Ordenar por ingresos totales descendente
    return resultado.sort((a, b) => b.ingresosTotales - a.ingresosTotales);
  } catch (error) {
    console.error("Error en obtenerIngresosPorTipoParaPDF:", error);
    return [];
  }
}

async function obtenerEventosRentablesParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  try {
    console.log(
      "🏆 [EVENTOS RENTABLES] Iniciando obtenerEventosRentablesParaPDF"
    );
    console.log("🏆 [EVENTOS RENTABLES] Parámetros:", {
      fechaDesde,
      fechaHasta,
      tipoEvento,
      estadoPago,
    });

    // Construir filtros base
    const filtroEvento = {};
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    console.log("🏆 [EVENTOS RENTABLES] Filtros aplicados:", filtroEvento);

    // Estados de pagos confirmados
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ]; // Obtener eventos con sus inscripciones
    const eventos = await prisma.event.findMany({
      where: filtroEvento,
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        startDate: true,
        registrations: {
          select: {
            status: true,
          },
        },
      },
    });

    console.log(
      "🏆 [EVENTOS RENTABLES] Total de eventos encontrados:",
      eventos.length
    );
    console.log(
      "🏆 [EVENTOS RENTABLES] Primeros 3 eventos:",
      eventos.slice(0, 3).map((e) => ({
        name: e.name,
        type: e.type,
        price: e.price,
        inscripciones_count: e.registrations.length,
      }))
    );

    const eventosRentables = [];
    for (const evento of eventos) {
      // Contar inscripciones
      const totalInscripciones = evento.registrations.length;
      const pagosConfirmados = evento.registrations.filter((ins) =>
        estadosConfirmados.includes(ins.status)
      ).length;

      // Calcular ingresos
      const valorEvento = evento.price || 0;
      const ingresosTotales = pagosConfirmados * valorEvento;

      // Calcular tasa de conversión
      const tasaConversion =
        totalInscripciones > 0 ? pagosConfirmados / totalInscripciones : 0; // Solo incluir eventos con ingresos
      if (ingresosTotales > 0) {
        eventosRentables.push({
          nombreEvento: evento.name,
          tipoEvento: evento.type,
          valorEvento,
          totalInscripciones,
          pagosConfirmados,
          ingresosTotales,
          tasaConversion,
        });
      }
    }

    console.log(
      "🏆 [EVENTOS RENTABLES] Eventos con ingresos:",
      eventosRentables.length
    );
    console.log(
      "🏆 [EVENTOS RENTABLES] Eventos rentables encontrados:",
      eventosRentables.slice(0, 3)
    );

    // Ordenar por ingresos totales descendente y tomar los top 10
    const resultado = eventosRentables
      .sort((a, b) => b.ingresosTotales - a.ingresosTotales)
      .slice(0, 10);

    console.log(
      "🏆 [EVENTOS RENTABLES] Resultado final:",
      resultado.length,
      "eventos"
    );
    return resultado;
  } catch (error) {
    console.error("Error en obtenerEventosRentablesParaPDF:", error);
    return [];
  }
}

async function obtenerTendenciasParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  try {
    // Construir filtros base
    const filtroEvento = {};
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Estados de pagos confirmados
    const estadosConfirmados = [
      "ACCEPTED",
      "APPROVED",
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];

    // Obtener inscripciones con fecha
    const inscripciones = await prisma.registration.findMany({
      where: {
        event: filtroEvento,
      },
      select: {
        registeredAt: true,
        status: true,
        event: {
          select: {
            price: true,
          },
        },
      },
      orderBy: {
        registeredAt: "asc",
      },
    });

    // Agrupar por mes
    const mesesData = {};
    const nombresM = [
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

    inscripciones.forEach((ins) => {
      const fecha = new Date(ins.registeredAt);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();
      const periodo = `${nombresM[mes]} ${año}`;

      if (!mesesData[periodo]) {
        mesesData[periodo] = {
          periodo,
          totalInscripciones: 0,
          pagosConfirmados: 0,
          ingresosTotales: 0,
          fechaOrden: new Date(año, mes, 1),
        };
      }

      mesesData[periodo].totalInscripciones++;

      if (estadosConfirmados.includes(ins.status)) {
        mesesData[periodo].pagosConfirmados++;
        mesesData[periodo].ingresosTotales += ins.event.price || 0;
      }
    });

    // Convertir a array y calcular métricas adicionales
    const resultado = Object.values(mesesData)
      .sort((a, b) => a.fechaOrden - b.fechaOrden)
      .map((mes, index, array) => {
        // Calcular tasa de conversión
        mes.tasaConversion =
          mes.totalInscripciones > 0
            ? mes.pagosConfirmados / mes.totalInscripciones
            : 0;

        // Calcular ingreso promedio
        mes.ingresoPromedio =
          mes.pagosConfirmados > 0
            ? mes.ingresosTotales / mes.pagosConfirmados
            : 0;

        // Calcular variaciones respecto al mes anterior
        if (index > 0) {
          const mesAnterior = array[index - 1];
          mes.variacionIngresos =
            mesAnterior.ingresosTotales > 0
              ? ((mes.ingresosTotales - mesAnterior.ingresosTotales) /
                  mesAnterior.ingresosTotales) *
                100
              : 0;
          mes.variacionConversion =
            mesAnterior.tasaConversion > 0
              ? ((mes.tasaConversion - mesAnterior.tasaConversion) /
                  mesAnterior.tasaConversion) *
                100
              : 0;
        } else {
          mes.variacionIngresos = 0;
          mes.variacionConversion = 0;
        }

        // Remover campo auxiliar
        delete mes.fechaOrden;
        return mes;
      });

    return resultado;
  } catch (error) {
    console.error("Error en obtenerTendenciasParaPDF:", error);
    return [];
  }
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

// Función auxiliar para obtener datos de comprobantes rechazados para PDF
async function obtenerComprobantesRechazadosParaPDF(
  fechaDesde,
  fechaHasta,
  tipoEvento,
  estadoPago
) {
  try {
    // Construir los filtros
    const filtroEvento = {};
    const filtroInscripcion = {};

    // Filtro por fecha
    if (fechaDesde && fechaHasta) {
      filtroEvento.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por tipo de evento
    if (tipoEvento && tipoEvento !== "todos") {
      filtroEvento.type = tipoEvento;
    }

    // Filtrar inscripciones rechazadas
    filtroInscripcion.status = "REJECTED";

    // Obtener inscripciones rechazadas agrupadas por evento
    const inscripcionesRechazadas = await prisma.registration.findMany({
      where: {
        ...filtroInscripcion,
        event: filtroEvento,
      },
      select: {
        id: true,
        event: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    // Agrupar por evento
    const eventosPorId = {};
    inscripcionesRechazadas.forEach((ins) => {
      const eventoId = ins.event.id;
      if (!eventosPorId[eventoId]) {
        eventosPorId[eventoId] = {
          nombreEvento: ins.event.name,
          valorEvento: ins.event.price || 0,
          comprobantesRechazados: 0,
          totalInscripciones: 0,
        };
      }
      eventosPorId[eventoId].comprobantesRechazados++;
    }); // Obtener total de inscripciones por evento para calcular porcentaje
    for (const eventoId in eventosPorId) {
      const totalInscripciones = await prisma.registration.count({
        where: {
          eventId: eventoId, // Mantener como String
          event: filtroEvento,
        },
      });
      eventosPorId[eventoId].totalInscripciones = totalInscripciones;
      eventosPorId[eventoId].porcentajeRechazo =
        totalInscripciones > 0
          ? eventosPorId[eventoId].comprobantesRechazados / totalInscripciones
          : 0;
    }

    // Convertir a array y ordenar por mayor cantidad de rechazos
    const resultado = Object.values(eventosPorId)
      .sort((a, b) => b.comprobantesRechazados - a.comprobantesRechazados)
      .slice(0, 10); // Máximo 10 eventos

    return resultado;
  } catch (error) {
    console.error("Error en obtenerComprobantesRechazadosParaPDF:", error);
    return [];
  }
}

module.exports = {
  getMetricasGenerales,
  getIngresosPorTipo,
  getEventosRentables,
  getTendenciasPeriodo,
  getComprobantesRechazados,
  generarReporteIngresosPDF,
};
