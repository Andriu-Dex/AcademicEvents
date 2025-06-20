const prisma = require("../config/db");
// const { get } = require("../routes/reporte.routes");
const {
  generarReporteEventoPDF,
  generarReporteMensualPDF,
} = require("../utils/reporte.utils");
const { analizarValidaciones } = require("../utils/validacion.utils");
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

async function getEventosParaReportesPaginados(req, res) {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [eventos, totalCount] = await Promise.all([
      prisma.evento.findMany({
        select: {
          id_eve: true,
          nom_eve: true,
          img_por_eve: true,
        },
        orderBy: {
          fec_ini_eve: "desc", // En orden descendente por fecha de inicio
        },
        skip: offset,
        take: limit,
      }),
      prisma.evento.count(),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: eventos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error en paginación de eventos para reportes:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
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

// Controladores para reportes específicos

// Reporte por Carrera
async function getReporteCarrera(req, res) {
  try {
    const { id_car } = req.params;

    // Validar que id_car exista
    if (!id_car) {
      return res.status(400).json({
        msg: "El ID de carrera proporcionado no es válido",
      });
    }

    if (req.path.includes("/estadisticas/")) {
      // Obtener estadísticas específicas de una carrera
      const carrera = await prisma.carrera.findUnique({
        where: { id_car },
        select: {
          id_car: true,
          nom_car: true,
          des_car: true,
          usuario: {
            select: {
              id_usu: true,
              cuentas: {
                select: {
                  inscripciones: {
                    select: {
                      id_ins: true,
                      est_ins: true,
                      evento: {
                        select: {
                          id_eve: true,
                          nom_eve: true,
                          tip_eve: true,
                        },
                      },
                    },
                    where: {
                      est_ins: {
                        in: ["APROBADO", "ACEPTADA"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!carrera) {
        return res.status(404).json({ msg: "Carrera no encontrada" });
      }

      const totalEstudiantes = carrera.usuario.length;

      let inscripcionesTotales = 0;
      const eventosUnicos = new Set();

      carrera.usuario.forEach((estudiante) => {
        estudiante.cuentas.forEach((cuenta) => {
          cuenta.inscripciones.forEach((inscripcion) => {
            inscripcionesTotales++;
            eventosUnicos.add(inscripcion.evento.id_eve);
          });
        });
      });

      // Obtener estadísticas de otras carreras para comparar
      const otrasCarreras = await prisma.carrera.findMany({
        select: {
          id_car: true,
          nom_car: true,
          usuario: {
            select: {
              id_usu: true,
              cuentas: {
                select: {
                  inscripciones: {
                    select: {
                      id_ins: true,
                      evento: {
                        select: {
                          id_eve: true,
                        },
                      },
                    },
                    where: {
                      est_ins: {
                        in: ["APROBADO", "ACEPTADA"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          // Excluir la carrera actual de la comparativa
          NOT: {
            id_car: id_car,
          },
        },
        // Limitar a 3 carreras para la comparativa
        take: 3,
      });

      // Procesar los datos comparativos
      const comparativaCarreras = [
        // Incluir la carrera actual primero
        {
          id_car,
          nom_car: carrera.nom_car,
          totalEstudiantes,
          totalInscripciones: inscripcionesTotales,
          porcentajeParticipacion:
            totalEstudiantes > 0
              ? Math.round((inscripcionesTotales / totalEstudiantes) * 100)
              : 0,
        },
        // Añadir las otras carreras
        ...otrasCarreras.map((otraCarrera) => {
          const estudiantesCarrera = otraCarrera.usuario.length;

          let inscripcionesCarrera = 0;
          const eventosCarrera = new Set();

          otraCarrera.usuario.forEach((estudiante) => {
            estudiante.cuentas.forEach((cuenta) => {
              cuenta.inscripciones.forEach((inscripcion) => {
                inscripcionesCarrera++;
                eventosCarrera.add(inscripcion.evento.id_eve);
              });
            });
          });

          return {
            id_car: otraCarrera.id_car,
            nom_car: otraCarrera.nom_car,
            totalEstudiantes: estudiantesCarrera,
            totalInscripciones: inscripcionesCarrera,
            porcentajeParticipacion:
              estudiantesCarrera > 0
                ? Math.round((inscripcionesCarrera / estudiantesCarrera) * 100)
                : 0,
          };
        }),
      ];

      const estadisticas = {
        totalEstudiantes,
        totalInscripciones: inscripcionesTotales,
        eventosParticipados: eventosUnicos.size,
        porcentajeParticipacion:
          totalEstudiantes > 0
            ? Math.round((inscripcionesTotales / totalEstudiantes) * 100)
            : 0,
        comparativaCarreras,
      };

      return res.json(estadisticas);
    }

    if (req.path.includes("/eventos/")) {
      // Obtener eventos populares por carrera
      const eventosCarrera = await prisma.evento.findMany({
        select: {
          id_eve: true,
          nom_eve: true,
          tip_eve: true,
          fec_ini_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              por_asi_fin_usu: true,
              cuenta: {
                select: {
                  id_cue: true,
                  usuario: {
                    select: {
                      id_car_est: true,
                    },
                  },
                },
              },
            },
            where: {
              cuenta: {
                usuario: {
                  id_car_est: id_car,
                },
              },
              est_ins: {
                in: ["APROBADO", "ACEPTADA"],
              },
            },
          },
        },
        orderBy: {
          fec_ini_eve: "desc",
        },
      });

      const eventosPopulares = eventosCarrera
        .map((evento) => {
          // Contamos los inscritos de esta carrera
          const totalInscritos = evento.inscritos.length;

          // Contamos asistencias: aquellos con porcentaje de asistencia > 0
          const totalAsistieron = evento.inscritos.filter(
            (ins) => ins.por_asi_fin_usu && ins.por_asi_fin_usu > 0
          ).length;

          return {
            id_eve: evento.id_eve,
            nom_eve: evento.nom_eve,
            tip_eve: evento.tip_eve,
            fec_ini_eve: evento.fec_ini_eve,
            totalInscritos: totalInscritos,
            totalAsistieron: totalAsistieron,
            porcentajeAsistencia:
              totalInscritos > 0
                ? Math.round((totalAsistieron / totalInscritos) * 100)
                : 0,
          };
        })
        .filter((evento) => evento.totalInscritos > 0)
        .sort((a, b) => b.totalInscritos - a.totalInscritos);

      return res.json(eventosPopulares);
    }

    res.status(400).json({ msg: "Endpoint no válido" });
  } catch (error) {
    console.error("Error al obtener reporte por carrera:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte", error: error.message });
  }
}

async function descargarReporteCarreraPDF(req, res) {
  try {
    // Función temporal - PDF no implementado aún
    res.status(501).json({ msg: "Funcionalidad de PDF aún no implementada" });
  } catch (error) {
    console.error("Error al generar PDF de reporte por carrera:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Reporte de Inscripciones
async function getReporteInscripciones(req, res) {
  try {
    console.log("🔍 Ruta solicitada:", req.path);
    console.log("🔍 Método HTTP:", req.method);

    // Obtener parámetros dependiendo del método HTTP
    const { fechaInicio, fechaFin, estado } =
      req.method === "GET" ? req.query : req.body;

    console.log("🔍 Parámetros recibidos:", { fechaInicio, fechaFin, estado });

    // Construir filtros
    const filtro = {};
    if (fechaInicio && fechaFin) {
      filtro.fec_ins = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (estado && estado !== "todos") {
      filtro.est_ins = estado;
    }

    // Obtener inscripciones con filtros
    const inscripciones = await prisma.inscripcion.findMany({
      where: filtro,
      select: {
        id_ins: true,
        fec_ins: true,
        est_ins: true,
        fec_val_ins: true,
        id_adm_val_ins: true,
        cuenta: {
          select: {
            id_cue: true,
            usuario: {
              select: {
                id_usu: true,
                nom_usu: true,
                ape_usu: true,
                carrera: {
                  select: {
                    nom_car: true,
                  },
                },
              },
            },
          },
        },
        admin_validador: {
          select: {
            id_cue: true,
            rol_usu: true, // Agregamos el rol del usuario para poder mostrar información más detallada
            usuario: {
              select: {
                nom_usu: true,
                ape_usu: true,
              },
            },
          },
        },
        evento: {
          select: {
            id_eve: true,
            nom_eve: true,
            tip_eve: true,
          },
        },
      },
      orderBy: {
        fec_ins: "desc",
      },
    });

    console.log(`📊 Inscripciones recuperadas: ${inscripciones.length}`);
    if (inscripciones.length > 0) {
      console.log(
        "📋 Ejemplo de inscripción:",
        JSON.stringify(inscripciones[0], null, 2)
      );
    }

    // Transformar datos para compatibilidad con frontend
    const inscripcionesTransformadas = inscripciones.map((ins) => ({
      ...ins,
      // Crear campo "usuario" para compatibilidad con frontend
      usuario: ins.cuenta?.usuario || null,
    }));

    if (req.path.includes("/estadisticas")) {
      // Estadísticas generales con categorización detallada
      const estadosAceptados = ["ACEPTADA"];
      const estadosAprobados = ["APROBADO"];
      const estadosRechazados = ["RECHAZADA"];
      const estadosReprobados = [
        "REPROBADO_NOTA",
        "REPROBADO_ASISTENCIA",
        "REPROBADO_TOTAL",
      ];

      const estadisticas = {
        total: inscripcionesTransformadas.length,
        pendientes: inscripcionesTransformadas.filter(
          (ins) => ins.est_ins === "PENDIENTE"
        ).length,
        aceptadas: inscripcionesTransformadas.filter((ins) =>
          estadosAceptados.includes(ins.est_ins)
        ).length,
        aprobadas: inscripcionesTransformadas.filter((ins) =>
          estadosAprobados.includes(ins.est_ins)
        ).length,
        rechazadas: inscripcionesTransformadas.filter((ins) =>
          estadosRechazados.includes(ins.est_ins)
        ).length,
        reprobadas: inscripcionesTransformadas.filter((ins) =>
          estadosReprobados.includes(ins.est_ins)
        ).length,
        // Mantener compatibilidad con frontend actual
        // Sumar aceptadas + aprobadas para el campo "aprobadas" original del frontend
        aprobadasTotal: inscripcionesTransformadas.filter((ins) =>
          [...estadosAceptados, ...estadosAprobados].includes(ins.est_ins)
        ).length,
      };

      console.log("📊 Estadísticas detalladas:", estadisticas);
      console.log(
        "📋 Estados encontrados:",
        inscripcionesTransformadas.map((ins) => ins.est_ins)
      );

      return res.json(estadisticas);
    }

    if (req.path.includes("/tendencias")) {
      // Agrupar por mes para tendencias
      const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
      const fechaFinObj = fechaFin ? new Date(fechaFin) : null;

      // Calcular diferencia entre fechas en días
      let usarRangoCompleto = false;
      if (fechaInicioObj && fechaFinObj) {
        const diffTime = Math.abs(fechaFinObj - fechaInicioObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si el rango es mayor a 60 días o incluye más de 2 meses, usar el periodo completo
        usarRangoCompleto = diffDays > 60;

        // También verificar si las fechas cruzan diferentes años o están en meses no consecutivos
        const mesInicio = fechaInicioObj.getMonth();
        const mesFin = fechaFinObj.getMonth();
        const añoInicio = fechaInicioObj.getFullYear();
        const añoFin = fechaFinObj.getFullYear();

        if (añoInicio !== añoFin || Math.abs(mesFin - mesInicio) > 1) {
          usarRangoCompleto = true;
        }
      }

      const tendencias = agruparInscripcionesPorMes(
        inscripcionesTransformadas,
        usarRangoCompleto ? fechaInicio : null,
        usarRangoCompleto ? fechaFin : null
      );
      return res.json(tendencias);
    }

    if (req.path.includes("/validaciones")) {
      // Estadísticas de validaciones
      const validaciones = analizarValidaciones(inscripcionesTransformadas);
      return res.json(validaciones);
    }

    // Retornar listado completo si no hay path específico
    res.json(inscripcionesTransformadas);
  } catch (error) {
    console.error("Error al obtener reporte de inscripciones:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte", error: error.message });
  }
}

async function descargarReporteInscripcionesPDF(req, res) {
  try {
    // Función temporal - PDF no implementado aún
    res.status(501).json({ msg: "Funcionalidad de PDF aún no implementada" });
  } catch (error) {
    console.error("Error al generar PDF de reporte de inscripciones:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Funciones auxiliares para reporte de inscripciones
function agruparInscripcionesPorMes(inscripciones, fechaInicio, fechaFin) {
  // Si se proporciona un rango de fechas, usar ese periodo en lugar de agrupar por mes
  const usarRangoCompleto = fechaInicio && fechaFin;

  const meses = {};

  // Array con nombres de los meses
  const NOMBRES_MESES = [
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

  // Estados detallados para mejor categorización
  const estadosAceptados = ["ACEPTADA"]; // Inscripciones aceptadas para participar
  const estadosAprobados = ["APROBADO"]; // Usuarios que aprobaron el evento
  const estadosRechazados = ["RECHAZADA"]; // Inscripciones rechazadas
  const estadosReprobados = [
    "REPROBADO_NOTA",
    "REPROBADO_ASISTENCIA",
    "REPROBADO_TOTAL",
  ]; // Usuarios que reprobaron el evento

  // Formatear rango de fechas para mostrar si se usa el rango completo
  let periodoStr = "Rango Completo";
  if (usarRangoCompleto) {
    // Usar UTC para evitar problemas de zona horaria
    const fechaIni = new Date(fechaInicio + "T00:00:00.000Z");
    const fechaFn = new Date(fechaFin + "T23:59:59.999Z");

    // Extraer día, mes y año directamente para evitar desfases de zona horaria
    const [anioIni, mesIniNum, diaIniNum] = fechaInicio.split("-").map(Number);
    const [anioFin, mesFiniNum, diaFinNum] = fechaFin.split("-").map(Number);

    const diaIni = diaIniNum.toString().padStart(2, "0");
    const mesIni = NOMBRES_MESES[mesIniNum - 1]; // -1 porque los meses en array son 0-indexed
    const diaFin = diaFinNum.toString().padStart(2, "0");
    const mesFin = NOMBRES_MESES[mesFiniNum - 1];

    periodoStr = `${diaIni} ${mesIni} - ${diaFin} ${mesFin} ${anioFin}`;

    console.log(`🗓️ Periodo formateado: ${periodoStr}`);
    console.log(`📅 Fechas originales: ${fechaInicio} a ${fechaFin}`);

    // Crear una única entrada para todo el rango con categorías detalladas
    const rangoKey = "rango-completo";
    meses[rangoKey] = {
      periodo: periodoStr,
      total: 0,
      pendientes: 0,
      aceptadas: 0,
      aprobadas: 0,
      rechazadas: 0,
      reprobadas: 0,
      variacion: 0,
    };
  }

  inscripciones.forEach((ins) => {
    const fecha = new Date(ins.fec_ins);

    // Decidir qué clave usar según el modo (rango completo o por mes)
    let key;
    if (usarRangoCompleto) {
      key = "rango-completo";
    } else {
      key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
      const nombreMes = NOMBRES_MESES[fecha.getMonth()];

      if (!meses[key]) {
        meses[key] = {
          mes: fecha.getMonth() + 1,
          año: fecha.getFullYear(),
          periodo: `${nombreMes} ${fecha.getFullYear()}`,
          total: 0,
          pendientes: 0,
          aceptadas: 0,
          aprobadas: 0,
          rechazadas: 0,
          reprobadas: 0,
        };
      }
    }

    meses[key].total++;

    // Categorizar según el estado con más detalle
    if (ins.est_ins === "PENDIENTE") {
      meses[key].pendientes++;
    } else if (estadosAceptados.includes(ins.est_ins)) {
      meses[key].aceptadas++;
    } else if (estadosAprobados.includes(ins.est_ins)) {
      meses[key].aprobadas++;
    } else if (estadosRechazados.includes(ins.est_ins)) {
      meses[key].rechazadas++;
    } else if (estadosReprobados.includes(ins.est_ins)) {
      meses[key].reprobadas++;
    } else {
      // Si es un estado no reconocido, lo contamos como pendiente y registramos el estado
      console.log(`Estado no categorizado en tendencias: ${ins.est_ins}`, {
        id_ins: ins.id_ins,
        estado: ins.est_ins,
        fecha: ins.fec_ins,
      });
      meses[key].pendientes++;
    }
  });

  // Convertir a array y ordenar por fecha
  const resultado = Object.values(meses).sort((a, b) => {
    if (a.año !== b.año) return a.año - b.año;
    return a.mes - b.mes;
  });

  // Calcular variación respecto al mes anterior
  for (let i = 1; i < resultado.length; i++) {
    const mesActual = resultado[i];
    const mesAnterior = resultado[i - 1];

    if (mesAnterior.total > 0) {
      const variacion = Math.round(
        ((mesActual.total - mesAnterior.total) / mesAnterior.total) * 100
      );
      mesActual.variacion = variacion;
    } else {
      mesActual.variacion = mesActual.total > 0 ? 100 : 0;
    }
  }

  // Para el primer mes, la variación es 0 o 100 si hay inscripciones
  if (resultado.length > 0) {
    resultado[0].variacion = 0;
  }

  return resultado;
}

// Reporte de Asistencia
async function getReporteAsistencia(req, res) {
  try {
    const { id_evento } = req.params;
    const { tipoEvento, eventoSeleccionado } = req.body;

    if (req.path.includes("/evento/") && id_evento) {
      // Obtener datos de asistencia de un evento específico
      const evento = await prisma.evento.findUnique({
        where: { id_eve: parseInt(id_evento) },
        select: {
          id_eve: true,
          nom_eve: true,
          fec_ini_eve: true,
          fec_fin_eve: true,
          cup_max_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              est_ins: true,
              por_asi_fin_usu: true,
              usuario: {
                select: {
                  nom_usu: true,
                  ape_usu: true,
                },
              },
            },
            where: {
              est_ins: {
                in: ["APROBADO", "ACEPTADA"],
              },
            },
          },
        },
      });

      if (!evento) {
        return res.status(404).json({ msg: "Evento no encontrado" });
      }

      const totalInscripciones = evento.inscritos.length;
      const asistentes = evento.inscritos.filter(
        (ins) => ins.por_asi_fin_usu >= 80
      );
      const porcentajeAsistencia =
        totalInscripciones > 0
          ? (asistentes.length / totalInscripciones) * 100
          : 0;

      return res.json({
        evento: {
          id_eve: evento.id_eve,
          nom_eve: evento.nom_eve,
          fec_ini_eve: evento.fec_ini_eve,
          fec_fin_eve: evento.fec_fin_eve,
          capacidad: evento.cup_max_eve,
        },
        estadisticas: {
          totalInscripciones,
          totalAsistentes: asistentes.length,
          porcentajeAsistencia,
          noShows: totalInscripciones - asistentes.length,
        },
        detalles: evento.inscritos.map((ins) => ({
          usuario: `${ins.usuario.nom_usu} ${ins.usuario.ape_usu}`,
          porcentajeAsistencia: ins.por_asi_fin_usu,
          estado: ins.est_ins,
        })),
      });
    }

    if (req.path.includes("/comparativa")) {
      // Comparativa entre eventos
      const filtro = {};
      if (tipoEvento && tipoEvento !== "todos") {
        filtro.tip_eve = tipoEvento;
      }

      const eventos = await prisma.evento.findMany({
        where: filtro,
        select: {
          id_eve: true,
          nom_eve: true,
          tip_eve: true,
          fec_ini_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              por_asi_fin_usu: true,
            },
            where: {
              est_ins: {
                in: ["APROBADO", "ACEPTADA"],
              },
            },
          },
        },
        orderBy: {
          fec_ini_eve: "desc",
        },
      });

      const comparativa = eventos.map((evento) => {
        const totalInscritos = evento.inscritos.length;
        const asistentes = evento.inscritos.filter(
          (ins) => ins.por_asi_fin_usu >= 80
        ).length;
        const porcentajeAsistencia =
          totalInscritos > 0 ? asistentes / totalInscritos : 0;

        return {
          id_eve: evento.id_eve,
          nombreEvento: evento.nom_eve,
          tipoEvento: evento.tip_eve,
          fechaEvento: evento.fec_ini_eve,
          totalInscritos,
          totalAsistencias: asistentes,
          porcentajeAsistencia,
        };
      });

      return res.json(comparativa);
    }

    if (req.path.includes("/no-shows")) {
      // Análisis de no-shows por tipo de evento
      const tiposEventos = await prisma.evento.groupBy({
        by: ["tip_eve"],
        _count: {
          id_eve: true,
        },
      });

      const noShowsAnalisis = await Promise.all(
        tiposEventos.map(async (tipo) => {
          const eventos = await prisma.evento.findMany({
            where: { tip_eve: tipo.tip_eve },
            select: {
              inscritos: {
                select: {
                  por_asi_fin_usu: true,
                },
                where: {
                  est_ins: {
                    in: ["APROBADO", "ACEPTADA"],
                  },
                },
              },
            },
          });

          const totalInscritos = eventos.reduce(
            (sum, evento) => sum + evento.inscritos.length,
            0
          );
          const totalAsistentes = eventos.reduce(
            (sum, evento) =>
              sum +
              evento.inscritos.filter((ins) => ins.por_asi_fin_usu >= 80)
                .length,
            0
          );
          const totalNoShows = totalInscritos - totalAsistentes;
          const porcentajeNoShows =
            totalInscritos > 0 ? totalNoShows / totalInscritos : 0;

          return {
            tipoEvento: tipo.tip_eve,
            cantidadEventos: tipo._count.id_eve,
            totalInscritos,
            totalNoShows,
            porcentajeNoShows,
          };
        })
      );

      return res.json(noShowsAnalisis);
    }

    res.status(400).json({ msg: "Endpoint no válido" });
  } catch (error) {
    console.error("Error al obtener reporte de asistencia:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte", error: error.message });
  }
}

async function descargarReporteAsistenciaPDF(req, res) {
  try {
    // Función temporal - PDF no implementado aún
    res.status(501).json({ msg: "Funcionalidad de PDF aún no implementada" });
  } catch (error) {
    console.error("Error al generar PDF de reporte de asistencia:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Reporte de Certificados
async function getReporteCertificados(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.body;

    // Construir filtros
    const filtro = {
      est_ins: "ACEPTADA",
    };

    if (fechaInicio && fechaFin) {
      filtro.fec_ins = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (req.path.includes("/resumen")) {
      // Resumen general de certificados
      const certificados = await prisma.inscripcion.findMany({
        where: filtro,
        select: {
          id_ins: true,
          fec_ins: true,
          not_fin_usu: true,
          usuario: {
            select: {
              nom_usu: true,
              ape_usu: true,
            },
          },
          evento: {
            select: {
              nom_eve: true,
            },
          },
        },
      });

      const estadisticas = {
        totalCertificados: certificados.length,
        aprobados: certificados.filter((cert) => cert.not_fin_usu >= 7).length,
        reprobados: certificados.filter((cert) => cert.not_fin_usu < 7).length,
        promedioNotas:
          certificados.length > 0
            ? certificados.reduce(
                (sum, cert) => sum + (cert.not_fin_usu || 0),
                0
              ) / certificados.length
            : 0,
      };

      return res.json(estadisticas);
    }

    if (req.path.includes("/descargas")) {
      // Datos de descargas por período
      const certificados = await prisma.inscripcion.findMany({
        where: filtro,
        select: {
          id_ins: true,
          fec_ins: true,
          not_fin_usu: true,
          evento: {
            select: {
              nom_eve: true,
              tip_eve: true,
            },
          },
        },
      });

      // Agrupar por mes
      const descargasPorMes = {};
      certificados.forEach((cert) => {
        const fecha = new Date(cert.fec_ins);
        const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;

        if (!descargasPorMes[key]) {
          descargasPorMes[key] = {
            mes: fecha.getMonth() + 1,
            año: fecha.getFullYear(),
            total: 0,
            aprobados: 0,
          };
        }

        descargasPorMes[key].total++;
        if (cert.not_fin_usu >= 7) {
          descargasPorMes[key].aprobados++;
        }
      });

      return res.json(
        Object.values(descargasPorMes).sort((a, b) => {
          if (a.año !== b.año) return a.año - b.año;
          return a.mes - b.mes;
        })
      );
    }

    if (req.path.includes("/eventos")) {
      // Certificados por evento
      const eventos = await prisma.evento.findMany({
        select: {
          id_eve: true,
          nom_eve: true,
          tip_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              not_fin_usu: true,
            },
            where: filtro,
          },
        },
        where: {
          inscritos: {
            some: filtro,
          },
        },
      });

      const eventosCertificados = eventos.map((evento) => ({
        id_eve: evento.id_eve,
        nombreEvento: evento.nom_eve,
        tipoEvento: evento.tip_eve,
        totalCertificados: evento.inscritos.length,
        aprobados: evento.inscritos.filter((ins) => ins.not_fin_usu >= 7)
          .length,
        reprobados: evento.inscritos.filter((ins) => ins.not_fin_usu < 7)
          .length,
        promedioNota:
          evento.inscritos.length > 0
            ? evento.inscritos.reduce(
                (sum, ins) => sum + (ins.not_fin_usu || 0),
                0
              ) / evento.inscritos.length
            : 0,
      }));

      return res.json(eventosCertificados);
    }

    res.status(400).json({ msg: "Endpoint no válido" });
  } catch (error) {
    console.error("Error al obtener reporte de certificados:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte", error: error.message });
  }
}

async function descargarReporteCertificadosPDF(req, res) {
  try {
    // Función temporal - PDF no implementado aún
    res.status(501).json({ msg: "Funcionalidad de PDF aún no implementada" });
  } catch (error) {
    console.error("Error al generar PDF de reporte de certificados:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Reporte de Cupos
async function getReporteCupos(req, res) {
  try {
    const { id_evento } = req.params;
    const { tipoEvento, eventoSeleccionado } = req.body;

    if (req.path.includes("/ocupacion/") && id_evento) {
      // Análisis de ocupación de un evento específico
      const evento = await prisma.evento.findUnique({
        where: { id_eve: parseInt(id_evento) },
        select: {
          id_eve: true,
          nom_eve: true,
          cup_max_eve: true,
          cup_dis_eve: true,
          cup_ocu_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              est_ins: true,
              usuario: {
                select: {
                  carrera: {
                    select: {
                      nom_car: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!evento) {
        return res.status(404).json({ msg: "Evento no encontrado" });
      }

      const totalCupos = evento.cup_max_eve;
      const cuposOcupados = evento.cup_ocu_eve;
      const cuposDisponibles = evento.cup_dis_eve;
      const porcentajeOcupacion =
        totalCupos > 0 ? (cuposOcupados / totalCupos) * 100 : 0;

      // Distribución por carrera
      const distribucionCarrera = {};
      evento.inscritos.forEach((ins) => {
        const carrera = ins.usuario.carrera?.nom_car || "Sin carrera";
        distribucionCarrera[carrera] = (distribucionCarrera[carrera] || 0) + 1;
      });

      return res.json({
        evento: {
          id_eve: evento.id_eve,
          nom_eve: evento.nom_eve,
        },
        cupos: {
          total: totalCupos,
          ocupados: cuposOcupados,
          disponibles: cuposDisponibles,
          porcentajeOcupacion,
        },
        distribucionCarrera,
      });
    }

    if (req.path.includes("/demanda")) {
      // Eventos con mayor demanda
      const filtro = {};
      if (tipoEvento && tipoEvento !== "todos") {
        filtro.tip_eve = tipoEvento;
      }

      const eventos = await prisma.evento.findMany({
        where: filtro,
        select: {
          id_eve: true,
          nom_eve: true,
          tip_eve: true,
          cup_max_eve: true,
          inscritos: {
            select: {
              id_ins: true,
              est_ins: true,
            },
          },
        },
      });

      const eventosDemanda = eventos
        .map((evento) => {
          const totalInscripciones = evento.inscritos.length;
          const capacidadTotal = evento.cup_max_eve;
          const porcentajeDemanda =
            capacidadTotal > 0 ? totalInscripciones / capacidadTotal : 0;
          const listaEspera = Math.max(0, totalInscripciones - capacidadTotal);

          return {
            id_eve: evento.id_eve,
            nombreEvento: evento.nom_eve,
            tipoEvento: evento.tip_eve,
            capacidadTotal,
            totalInscripciones,
            porcentajeDemanda,
            listaEspera,
          };
        })
        .sort((a, b) => b.porcentajeDemanda - a.porcentajeDemanda);

      return res.json(eventosDemanda);
    }

    if (req.path.includes("/optimizacion")) {
      // Sugerencias de optimización
      const eventos = await prisma.evento.findMany({
        select: {
          id_eve: true,
          nom_eve: true,
          tip_eve: true,
          cup_max_eve: true,
          cup_ocu_eve: true,
          inscritos: {
            select: {
              id_ins: true,
            },
          },
        },
      });

      const optimizacion = eventos.map((evento) => {
        const capacidadTotal = evento.cup_max_eve;
        const cuposOcupados = evento.cup_ocu_eve;
        const totalInscripciones = evento.inscritos.length;
        const porcentajeOcupacion =
          capacidadTotal > 0 ? (cuposOcupados / capacidadTotal) * 100 : 0;

        let sugerencia = "";
        if (porcentajeOcupacion < 50) {
          sugerencia = "Reducir capacidad o mejorar promoción";
        } else if (porcentajeOcupacion > 100) {
          sugerencia = "Aumentar capacidad";
        } else if (porcentajeOcupacion >= 90) {
          sugerencia = "Capacidad óptima";
        } else {
          sugerencia = "Capacidad adecuada";
        }

        return {
          id_eve: evento.id_eve,
          nombreEvento: evento.nom_eve,
          tipoEvento: evento.tip_eve,
          capacidadActual: capacidadTotal,
          cuposOcupados,
          porcentajeOcupacion,
          sugerencia,
        };
      });

      return res.json(optimizacion);
    }

    res.status(400).json({ msg: "Endpoint no válido" });
  } catch (error) {
    console.error("Error al obtener reporte de cupos:", error);
    res
      .status(500)
      .json({ msg: "Error al generar reporte", error: error.message });
  }
}

async function descargarReporteCuposPDF(req, res) {
  try {
    // Función temporal - PDF no implementado aún
    res.status(501).json({ msg: "Funcionalidad de PDF aún no implementada" });
  } catch (error) {
    console.error("Error al generar PDF de reporte de cupos:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

module.exports = {
  getEventosParaReportes,
  getEventosParaReportesPaginados,
  getReporteEventoPorId,
  getEventosPorMes,
  descargarReporteEventoPDF,
  descargarReporteMensualPDF,
  getReporteCarrera,
  descargarReporteCarreraPDF,
  getReporteInscripciones,
  descargarReporteInscripcionesPDF,
  getReporteAsistencia,
  descargarReporteAsistenciaPDF,
  getReporteCertificados,
  descargarReporteCertificadosPDF,
  getReporteCupos,
  descargarReporteCuposPDF,
};
