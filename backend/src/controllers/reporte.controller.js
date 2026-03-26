const { prisma } = require("../config/db");
// const { get } = require("../routes/reporte.routes");
const {
  generarReporteEventoPDF,
  generarReporteMensualPDF,
  generarReporteCarreraPDF,
  generarReporteInscripcionesPDF,
  generarReporteAsistenciaPDF,
  generarReporteCertificadosPDF,
} = require("../utils/reporte.utils");
const { analizarValidaciones } = require("../utils/validacion.utils");
const { withTenantWhere } = require("../utils/tenantScope");
const path = require("path");
const fs = require("fs");

async function descargarReporteEventoPDF(req, res) {
  const id = req.params.id || req.params.id_eve;

  const datos = await obtenerDatosReporteEventoPorId(req, id);

  if (!datos) {
    return res.status(404).json({ msg: "Evento no encontrado" });
  }

  // Asegúrate que la carpeta de reportes existe
  const reportesDir = path.join(process.cwd(), "uploads", "reportes");
  if (!fs.existsSync(reportesDir)) {
    fs.mkdirSync(reportesDir, { recursive: true });
  }

  // Define el path donde guardar temporalmente el PDF
  const filePath = path.join(reportesDir, `reporte_evento_${id}.pdf`);
  await generarReporteEventoPDF(datos, filePath);

  // Lee el PDF como buffer
  const pdfBuffer = fs.readFileSync(filePath);

  // Elimina el archivo temporal después de leer
  fs.unlink(filePath, () => {});

  // Devuelve el PDF como base64 junto con el nombre del evento
  res.json({
    name: datos.cab_eve.name,
    nom_eve: datos.cab_eve.name,
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
  const datosReporte = await obtenerDatosReportePorMes(req, anio, mes);

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
    const eventos = await prisma.event.findMany({
      where: withTenantWhere(req.tenantId),
      select: {
        id: true,
        name: true,
        coverImageUrl: true,
      },
      orderBy: {
        startDate: "desc", // En orden descendente por fecha de inicio
      },
    });

    const eve = eventos.map((evento) => ({
      id: evento.id,
      name: evento.name,
      coverImage: evento.coverImageUrl,
    }));

    res.json({ eve });
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
      prisma.event.findMany({
        where: withTenantWhere(req.tenantId),
        select: {
          id: true,
          name: true,
          coverImageUrl: true,
        },
        orderBy: {
          startDate: "desc", // En orden descendente por fecha de inicio
        },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where: withTenantWhere(req.tenantId) }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / limit);

    return res.json({
      data: eventos.map((evento) => ({
        id: evento.id,
        name: evento.name,
        coverImage: evento.coverImageUrl,
      })),
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
  const id = req.params.id || req.params.id_eve;

  try {
    const datos = await obtenerDatosReporteEventoPorId(req, id);
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

async function obtenerDatosReporteEventoPorId(req, id) {
  // 1. Buscar el evento con sus datos básicos y el creador
  const evento = await prisma.event.findFirst({
    where: withTenantWhere(req.tenantId, { id }),
    select: {
      id: true,
      name: true,
      durationHours: true,
      startDate: true,
      endDate: true,
      coverImageUrl: true,
      type: true,
      createdBy: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!evento) return null;

  // Preparar select para inscripciones (condicional si es curso)
  let inscripcionSelect = {
    id: true,
    finalAttendancePercent: true,
    status: true,
    account: {
      select: {
        user: {
          select: {
            idNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  };

  if (evento.type === "COURSE") {
    inscripcionSelect.registrationCourse = { select: { finalGrade: true } };
  }

  // Buscar las inscripciones
  const inscripciones = await prisma.registration.findMany({
    where: withTenantWhere(req.tenantId, {
      eventId: id,
      status: {
        in: [
          "APPROVED",
          "FAILED_GRADE",
          "FAILED_ATTENDANCE",
          "FAILED_TOTAL",
        ],
      },
    }),
    select: inscripcionSelect,
  });

  // Formatear detalle
  const det_ins = inscripciones.map((ins) => {
    let detalleBase = {
      idNumber: ins.account.user.idNumber,
      firstName: ins.account.user.firstName,
      lastName: ins.account.user.lastName,
      finalAttendancePercent: ins.finalAttendancePercent,
      status: ins.status,
      // Alias legacy para compatibilidad temporal
      ced_usu: ins.account.user.idNumber,
      nom_usu: ins.account.user.firstName,
      ape_usu: ins.account.user.lastName,
      por_asi_fin_usu: ins.finalAttendancePercent,
      est_ins: ins.status,
    };
    if (evento.type === "COURSE") {
      detalleBase.finalGrade = ins.registrationCourse?.finalGrade ?? null;
      detalleBase.not_fin_usu = ins.registrationCourse?.finalGrade ?? null;
    }
    return detalleBase;
  });

  // Armar respuesta
  return {
    cab_eve: {
      id: evento.id,
      id_eve: evento.id,
      name: evento.name,
      durationHours: evento.durationHours,
      dur_hor_eve: evento.durationHours,
      startDate: evento.startDate,
      fec_ini_eve: evento.startDate,
      endDate: evento.endDate,
      fec_fin_eve: evento.endDate,
      coverImageUrl: evento.coverImageUrl,
      img_por_eve: evento.coverImageUrl,
      type: evento.type,
      tip_eve: evento.type,
      createdBy: {
        firstName: evento.createdBy.user.firstName,
        lastName: evento.createdBy.user.lastName,
      },
      cre_eve: {
        nom_usu: evento.createdBy.user.firstName,
        ape_usu: evento.createdBy.user.lastName,
      },
    },
    det_ins: det_ins,
  };
}

async function obtenerDatosReportePorMes(req, anio, mes) {
  // Formatea el inicio y fin del mes
  const fechaInicio = new Date(
    `${anio}-${mes.toString().padStart(2, "0")}-01T00:00:00.000Z`
  );
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + 1);
  let totalEventos = 0;

  // Trae todos los eventos cuya fecha de inicio esté dentro del mes y año
  const eventos = await prisma.event.findMany({
    where: withTenantWhere(req.tenantId, {
      startDate: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    }),
    select: {
      id: true,
      name: true,
      price: true,
      type: true,
      endDate: true,
      createdBy: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Para cada evento, cuenta las inscripciones válidas y calcula total
  const resultados = await Promise.all(
    eventos.map(async (evento) => {
      const can_ins = await prisma.registration.count({
        where: withTenantWhere(req.tenantId, {
          eventId: evento.id,
          status: {
            in: [
              "ACCEPTED",
              "APPROVED",
              "FAILED_GRADE",
              "FAILED_ATTENDANCE",
              "FAILED_TOTAL",
            ],
          },
        }),
      });
      const nom_cre = evento.createdBy?.user?.firstName || "";
      const ape_cre = evento.createdBy?.user?.lastName || "";
      const tot_eve = can_ins * (evento.price || 0);
      totalEventos += tot_eve;

      return {
        name: evento.name,
        nom_eve: evento.name,
        price: evento.price,
        val_eve: evento.price,
        type: evento.type,
        tip_eve: evento.type,
        endDate: evento.endDate,
        fec_fin_eve: evento.endDate,
        registrationCount: can_ins,
        can_ins: can_ins,
        creatorFirstName: nom_cre,
        nom_cre,
        creatorLastName: ape_cre,
        ape_cre,
        totalRevenue: tot_eve,
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
    const datos = await obtenerDatosReportePorMes(req, anio, mes);
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
    const id = req.params.id || req.params.id_car;

    // Validar que id exista
    if (!id) {
      return res.status(400).json({
        msg: "El ID de carrera proporcionado no es válido",
      });
    }

    if (
      req.path.includes("/estadisticas/") ||
      req.path.includes("/statistics/")
    ) {
      // Obtener estadísticas específicas de una carrera
      const carrera = await prisma.career.findFirst({
        where: withTenantWhere(req.tenantId, { id }),
        select: {
          id: true,
          name: true,
          description: true,
          users: {
            select: {
              id: true,
              accounts: {
                select: {
                  registrations: {
                    select: {
                      id: true,
                      status: true,
                      event: {
                        select: {
                          id: true,
                          name: true,
                          type: true,
                        },
                      },
                    },
                    where: {
                      status: {
                        in: ["APPROVED", "ACCEPTED"],
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

      const totalEstudiantes = carrera.users.length;

      let inscripcionesTotales = 0;
      const eventosUnicos = new Set();

      carrera.users.forEach((estudiante) => {
        estudiante.accounts.forEach((cuenta) => {
          cuenta.registrations.forEach((inscripcion) => {
            inscripcionesTotales++;
            eventosUnicos.add(inscripcion.event.id);
          });
        });
      });

      // Obtener estadísticas de otras carreras para comparar
      const otrasCarreras = await prisma.career.findMany({
        select: {
          id: true,
          name: true,
          users: {
            select: {
              id: true,
              accounts: {
                select: {
                  registrations: {
                    select: {
                      id: true,
                      event: {
                        select: {
                          id: true,
                        },
                      },
                    },
                    where: {
                      status: {
                        in: ["APPROVED", "ACCEPTED"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          tenantId: req.tenantId,
          // Excluir la carrera actual de la comparativa
          NOT: {
            id: id,
          },
        },
        // Limitar a 3 carreras para la comparativa
        take: 3,
      });

      // Procesar los datos comparativos
      const comparativaCarreras = [
        // Incluir la carrera actual primero
        {
          id_car: id,
          nom_car: carrera.name,
          totalEstudiantes,
          totalInscripciones: inscripcionesTotales,
          porcentajeParticipacion:
            totalEstudiantes > 0
              ? Math.round((inscripcionesTotales / totalEstudiantes) * 100)
              : 0,
        },
        // Añadir las otras carreras
        ...otrasCarreras.map((otraCarrera) => {
          const estudiantesCarrera = otraCarrera.users.length;

          let inscripcionesCarrera = 0;
          const eventosCarrera = new Set();

          otraCarrera.users.forEach((estudiante) => {
            estudiante.accounts.forEach((cuenta) => {
              cuenta.registrations.forEach((inscripcion) => {
                inscripcionesCarrera++;
                eventosCarrera.add(inscripcion.event.id);
              });
            });
          });

          return {
            id_car: otraCarrera.id,
            nom_car: otraCarrera.name,
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

    if (req.path.includes("/eventos/") || req.path.includes("/events/")) {
      // Obtener eventos populares por carrera
      const eventosCarrera = await prisma.event.findMany({
        where: withTenantWhere(req.tenantId),
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          registrations: {
            select: {
              id: true,
              finalAttendancePercent: true,
              account: {
                select: {
                  id: true,
                  user: {
                    select: {
                      careerId: true,
                    },
                  },
                },
              },
            },
            where: {
              account: {
                user: {
                  careerId: id,
                },
              },
              status: {
                in: ["APPROVED", "ACCEPTED"],
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });

      const eventosPopulares = eventosCarrera
        .map((evento) => {
          // Contamos los inscritos de esta carrera
          const totalInscritos = evento.registrations.length;

          // Contamos asistencias: aquellos con porcentaje de asistencia > 0
          const totalAsistieron = evento.registrations.filter(
            (ins) => ins.finalAttendancePercent && ins.finalAttendancePercent > 0
          ).length;

          return {
            id_eve: evento.id,
            nom_eve: evento.name,
            tip_eve: evento.type,
            fec_ini_eve: evento.startDate,
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
    const id = req.params.id || req.params.id_car;

    // Validar que id exista
    if (!id) {
      return res.status(400).json({
        msg: "El ID de carrera proporcionado no es válido",
      });
    }

    // Obtener datos completos de la carrera
    const carrera = await prisma.career.findFirst({
      where: withTenantWhere(req.tenantId, { id }),
      select: {
        id: true,
        name: true,
        description: true,
        faculty: {
          select: {
            name: true,
            university: {
              select: {
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            accounts: {
              select: {
                registrations: {
                  select: {
                    id: true,
                    status: true,
                    event: {
                      select: {
                        id: true,
                        name: true,
                        type: true,
                        startDate: true,
                      },
                    },
                  },
                  where: {
                    status: {
                      in: ["APPROVED", "ACCEPTED"],
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

    // Calcular estadísticas
    const totalEstudiantes = carrera.users.length;
    let inscripcionesTotales = 0;
    const eventosUnicos = new Set();
    const eventoStats = {};
    const estudiantesConParticipacion = new Set();

    carrera.users.forEach((estudiante) => {
      let tieneInscripciones = false;
      estudiante.accounts.forEach((cuenta) => {
        cuenta.registrations.forEach((inscripcion) => {
          inscripcionesTotales++;
          eventosUnicos.add(inscripcion.event.id);
          tieneInscripciones = true;

          // Contar estadísticas por evento
          const eventoId = inscripcion.event.id;
          if (!eventoStats[eventoId]) {
            eventoStats[eventoId] = {
              ...inscripcion.event,
              totalInscritos: 0,
              totalAsistieron: 0,
            };
          }
          eventoStats[eventoId].totalInscritos++;
          if (inscripcion.status === "APPROVED") {
            eventoStats[eventoId].totalAsistieron++;
          }
        });
      });
      // Agregar estudiante al set si tiene al menos una inscripción
      if (tieneInscripciones) {
        estudiantesConParticipacion.add(estudiante.id);
      }
    });

    // Convertir a array y calcular porcentajes
    const eventosPorCarrera = Object.values(eventoStats)
      .map((evento) => ({
        ...evento,
        porcentajeAsistencia:
          evento.totalInscritos > 0
            ? Math.round((evento.totalAsistieron / evento.totalInscritos) * 100)
            : 0,
      }))
      .slice(0, 10); // Top 10 eventos

    const porcentajeParticipacion =
      totalEstudiantes > 0
        ? Math.round(
            (estudiantesConParticipacion.size / totalEstudiantes) * 100
          )
        : 0;

    // Obtener comparativa con otras carreras
    const todasLasCarreras = await prisma.career.findMany({
      where: withTenantWhere(req.tenantId),
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
            accounts: {
              select: {
                registrations: {
                  select: {
                    status: true,
                    event: {
                      select: {
                        id: true,
                      },
                    },
                  },
                  where: {
                    status: {
                      in: ["APPROVED", "ACCEPTED"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const comparativaCarreras = todasLasCarreras.map((carr) => {
      const totalEst = carr.users.length;
      let inscTotal = 0;
      const eventosUnic = new Set();
      const estudiantesParticipantes = new Set();

      carr.users.forEach((est) => {
        let tieneInscripciones = false;
        est.accounts.forEach((cta) => {
          cta.registrations.forEach((ins) => {
            inscTotal++;
            eventosUnic.add(ins.event.id);
            tieneInscripciones = true;
          });
        });
        if (tieneInscripciones) {
          estudiantesParticipantes.add(est.id);
        }
      });

      return {
        id_car: carr.id,
        nom_car: carr.name,
        totalEstudiantes: totalEst,
        totalInscripciones: inscTotal,
        eventosParticipados: eventosUnic.size,
        porcentajeParticipacion:
          totalEst > 0
            ? Math.round((estudiantesParticipantes.size / totalEst) * 100)
            : 0,
      };
    });

    const estadisticas = {
      totalEstudiantes,
      totalInscripciones: inscripcionesTotales,
      eventosParticipados: eventosUnicos.size,
      porcentajeParticipacion,
      comparativaCarreras,
    };

    // Preparar datos para el PDF
    const datosReporte = {
      carrera,
      estadisticas,
      eventosPorCarrera,
    };

    // Asegurar que existe el directorio de reportes
    const reportesDir = path.join(process.cwd(), "uploads", "reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }

    // Generar nombre del archivo
    const nombreArchivo = `Reporte_${carrera.name.replace(/\s+/g, "_")}.pdf`;
    const filePath = path.join(reportesDir, nombreArchivo);

    // Generar el PDF
    await generarReporteCarreraPDF(datosReporte, filePath);

    // Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // Enviar el PDF como respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nombreArchivo}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error al generar PDF de reporte por carrera:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Reporte de Inscripciones
const REPORT_REG_STATUS_TO_DB = {
  PENDIENTE: "PENDING",
  ACEPTADA: "ACCEPTED",
  RECHAZADA: "REJECTED",
  APROBADO: "APPROVED",
  REPROBADO_NOTA: "FAILED_GRADE",
  REPROBADO_ASISTENCIA: "FAILED_ATTENDANCE",
  REPROBADO_TOTAL: "FAILED_TOTAL",
};

const normalizeReportRegistrationStatus = (status) =>
  REPORT_REG_STATUS_TO_DB[status] || status;

async function getReporteInscripciones(req, res) {
  try {
    console.log("🔍 Ruta solicitada:", req.path);
    console.log("🔍 Método HTTP:", req.method);

    // Obtener parámetros dependiendo del método HTTP
    const { fechaInicio, fechaFin, estado } =
      req.method === "GET" ? req.query : req.body;

    console.log("🔍 Parámetros recibidos:", { fechaInicio, fechaFin, estado });

    // Construir filtros
    const filtro = withTenantWhere(req.tenantId);
    if (fechaInicio && fechaFin) {
      filtro.registeredAt = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (estado && estado !== "todos") {
      filtro.status = normalizeReportRegistrationStatus(estado);
    }

    // Obtener inscripciones con filtros
    const inscripciones = await prisma.registration.findMany({
      where: filtro,
      select: {
        id: true,
        registeredAt: true,
        status: true,
        validatedAt: true,
        validatedByAdminId: true,
        account: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                career: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        validatorAdmin: {
          select: {
            id: true,
            role: true, // Agregamos el rol del usuario para poder mostrar información más detallada
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        registeredAt: "desc",
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
      usuario: ins.account?.user || null,
    }));

    if (req.path.includes("/estadisticas") || req.path.includes("/statistics")) {
      // Estadísticas generales con categorización detallada
      const estadosAceptados = ["ACCEPTED"];
      const estadosAprobados = ["APPROVED"];
      const estadosRechazados = ["REJECTED"];
      const estadosReprobados = [
        "FAILED_GRADE",
        "FAILED_ATTENDANCE",
        "FAILED_TOTAL",
      ];

      const estadisticas = {
        total: inscripcionesTransformadas.length,
        pendientes: inscripcionesTransformadas.filter(
          (ins) => ins.status === "PENDING"
        ).length,
        aceptadas: inscripcionesTransformadas.filter((ins) =>
          estadosAceptados.includes(ins.status)
        ).length,
        aprobadas: inscripcionesTransformadas.filter((ins) =>
          estadosAprobados.includes(ins.status)
        ).length,
        rechazadas: inscripcionesTransformadas.filter((ins) =>
          estadosRechazados.includes(ins.status)
        ).length,
        reprobadas: inscripcionesTransformadas.filter((ins) =>
          estadosReprobados.includes(ins.status)
        ).length,
        // Mantener compatibilidad con frontend actual
        // Sumar aceptadas + aprobadas para el campo "aprobadas" original del frontend
        aprobadasTotal: inscripcionesTransformadas.filter((ins) =>
          [...estadosAceptados, ...estadosAprobados].includes(ins.status)
        ).length,
      };

      console.log("📊 Estadísticas detalladas:", estadisticas);
      console.log(
        "📋 Estados encontrados:",
        inscripcionesTransformadas.map((ins) => ins.status)
      );

      return res.json(estadisticas);
    }

    if (req.path.includes("/tendencias") || req.path.includes("/trends")) {
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

    if (req.path.includes("/validaciones") || req.path.includes("/validations")) {
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
    const { fechaInicio, fechaFin, estado } = req.body;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        msg: "Debe proporcionar fechas de inicio y fin.",
      });
    }

    console.log("📊 [PDF INSCRIPCIONES] Iniciando generación de PDF");
    console.log("📊 [PDF INSCRIPCIONES] Parámetros:", {
      fechaInicio,
      fechaFin,
      estado,
    });

    // 1. Obtener datos del reporte de inscripciones
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Ajustar las fechas para que incluyan el día completo
    fechaInicioDate.setHours(0, 0, 0, 0);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Obtener estadísticas generales
    const estadisticas = await obtenerEstadisticasInscripciones(
      fechaInicioDate,
      fechaFinDate,
      estado,
      req.tenantId
    );

    // Obtener tendencias por período
    const tendencias = await obtenerTendenciasInscripciones(
      fechaInicioDate,
      fechaFinDate,
      req.tenantId
    );

    // Obtener análisis de validaciones
    const validaciones = await obtenerAnalisisValidaciones(
      fechaInicioDate,
      fechaFinDate,
      req.tenantId
    );

    // 2. Preparar datos para el PDF
    const datosReporte = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      estado: estado,
      estadisticas,
      tendencias,
      validaciones,
      fechaGeneracion: new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    // 3. Preparar carpeta y path temporal
    const reportesDir = path.join(process.cwd(), "uploads", "reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }

    const nombreArchivo = `Reporte_Inscripciones_${fechaInicio}_al_${fechaFin}.pdf`;
    const filePath = path.join(reportesDir, nombreArchivo);

    // 4. Generar el PDF
    await generarReporteInscripcionesPDF(datosReporte, filePath);

    // 5. Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // 6. Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // 7. Enviar el PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nombreArchivo}"`);
    res.send(pdfBuffer);

    console.log("✅ [PDF INSCRIPCIONES] PDF generado y enviado exitosamente");
  } catch (error) {
    console.error("❌ [PDF INSCRIPCIONES] Error al generar PDF:", error);
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
  const estadosAceptados = ["ACCEPTED"]; // Inscripciones aceptadas para participar
  const estadosAprobados = ["APPROVED"]; // Usuarios que aprobaron el evento
  const estadosRechazados = ["REJECTED"]; // Inscripciones rechazadas
  const estadosReprobados = [
    "FAILED_GRADE",
    "FAILED_ATTENDANCE",
    "FAILED_TOTAL",
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
    const fecha = new Date(ins.registeredAt);

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
    if (ins.status === "PENDING") {
      meses[key].pendientes++;
    } else if (estadosAceptados.includes(ins.status)) {
      meses[key].aceptadas++;
    } else if (estadosAprobados.includes(ins.status)) {
      meses[key].aprobadas++;
    } else if (estadosRechazados.includes(ins.status)) {
      meses[key].rechazadas++;
    } else if (estadosReprobados.includes(ins.status)) {
      meses[key].reprobadas++;
    } else {
      // Si es un estado no reconocido, lo contamos como pendiente y registramos el estado
      console.log(`Estado no categorizado en tendencias: ${ins.status}`, {
        id_ins: ins.id,
        estado: ins.status,
        fecha: ins.registeredAt,
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
    const { tipo } = req.query;

    if (
      (req.path.includes("/evento/") || req.path.includes("/event/")) &&
      id_evento
    ) {
      // Obtener datos de asistencia de un evento específico
      const evento = await prisma.event.findFirst({
        where: withTenantWhere(req.tenantId, { id: id_evento }),
        select: {
          id: true,
          name: true,
          type: true, // Añadimos el tipo de evento a la consulta
          startDate: true,
          endDate: true,
          maxCapacity: true,
          minAttendancePercent: true,
          registrations: {
            select: {
              id: true,
              status: true,
              finalAttendancePercent: true,
              account: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            where: {
              status: {
                in: [
                  "APPROVED",
                  "ACCEPTED",
                  "FAILED_GRADE",
                  "FAILED_ATTENDANCE",
                  "FAILED_TOTAL",
                ],
              },
            },
          },
        },
      });

      if (!evento) {
        return res.status(404).json({ msg: "Evento no encontrado" });
      }

      const totalInscritos = evento.registrations.length;
      const porcentajeMinimoAsistencia = evento.minAttendancePercent || 80; // Usar el mínimo del evento o 80% por defecto
      const asistentes = evento.registrations.filter(
        (ins) =>
          ins.finalAttendancePercent &&
          ins.finalAttendancePercent >= porcentajeMinimoAsistencia
      );
      const totalAsistencias = asistentes.length;
      const totalNoAsistieron = totalInscritos - totalAsistencias;
      const porcentajeAsistencia =
        totalInscritos > 0 ? totalAsistencias / totalInscritos : 0;

      return res.json({
        nombreEvento: evento.name,
        fechaEvento: evento.startDate,
        tipoEvento: evento.type, // Añadimos el tipo de evento a la respuesta
        totalInscritos,
        totalAsistencias,
        totalNoAsistieron,
        porcentajeAsistencia,
        detalles: evento.registrations.map((ins) => ({
          usuario: `${ins.account.user.firstName} ${ins.account.user.lastName}`,
          porcentajeAsistencia: ins.finalAttendancePercent || 0,
          estado: ins.status,
        })),
      });
    }

    if (req.path.includes("/comparativa") || req.path.includes("/comparative")) {
      // Comparativa entre eventos
      const filtro = withTenantWhere(req.tenantId);
      if (tipo && tipo !== "todos") {
        filtro.type = tipo;
      }

      const eventos = await prisma.event.findMany({
        where: filtro,
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          minAttendancePercent: true,
          registrations: {
            select: {
              id: true,
              finalAttendancePercent: true,
            },
            where: {
              status: {
                in: [
                  "APPROVED",
                  "ACCEPTED",
                  "FAILED_GRADE",
                  "FAILED_ATTENDANCE",
                  "FAILED_TOTAL",
                ],
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });

      const comparativa = eventos.map((evento) => {
        const totalInscritos = evento.registrations.length;
        const porcentajeMinimoAsistencia = evento.minAttendancePercent || 80; // Usar el mínimo del evento o 80% por defecto
        const asistentes = evento.registrations.filter(
          (ins) =>
            ins.finalAttendancePercent &&
            ins.finalAttendancePercent >= porcentajeMinimoAsistencia
        ).length;
        const porcentajeAsistencia =
          totalInscritos > 0 ? asistentes / totalInscritos : 0;

        return {
          id_eve: evento.id,
          nombreEvento: evento.name,
          tipoEvento: evento.type,
          fechaEvento: evento.startDate,
          totalInscritos,
          totalAsistencias: asistentes,
          porcentajeAsistencia,
        };
      });

      return res.json(comparativa);
    }

    if (req.path.includes("/no-shows")) {
      // Análisis de no-shows por tipo de evento
      const filtroTipo = withTenantWhere(req.tenantId);
      if (tipo && tipo !== "todos") {
        filtroTipo.type = tipo;
      }

      const tiposEventos = await prisma.event.groupBy({
        by: ["type"],
        where: filtroTipo,
        _count: {
          id: true,
        },
      });

      const noShowsAnalisis = await Promise.all(
        tiposEventos.map(async (tipoGrupo) => {
          const eventos = await prisma.event.findMany({
            where: withTenantWhere(req.tenantId, { type: tipoGrupo.type }),
            select: {
              minAttendancePercent: true,
              registrations: {
                select: {
                  finalAttendancePercent: true,
                },
                where: {
                  status: {
                    in: [
                      "APPROVED",
                      "ACCEPTED",
                      "FAILED_GRADE",
                      "FAILED_ATTENDANCE",
                      "FAILED_TOTAL",
                    ],
                  },
                },
              },
            },
          });

          const totalInscritos = eventos.reduce(
            (sum, evento) => sum + evento.registrations.length,
            0
          );
          const totalAsistentes = eventos.reduce((sum, evento) => {
            const porcentajeMinimoAsistencia = evento.minAttendancePercent || 80; // Usar el mínimo del evento o 80% por defecto
            return (
              sum +
              evento.registrations.filter(
                (ins) =>
                  ins.finalAttendancePercent &&
                  ins.finalAttendancePercent >= porcentajeMinimoAsistencia
              ).length
            );
          }, 0);
          const totalNoShows = totalInscritos - totalAsistentes;
          const porcentajeNoShows =
            totalInscritos > 0 ? totalNoShows / totalInscritos : 0;

          return {
            tipoEvento: tipoGrupo.type,
            cantidadEventos: tipoGrupo._count.id,
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
    const { evento, tipo } = req.body;

    console.log("📊 [PDF ASISTENCIA] Iniciando generación de PDF");
    console.log("📊 [PDF ASISTENCIA] Parámetros:", { evento, tipo });

    let datosReporte = {};

    if (evento) {
      // Reporte para un evento específico
      const eventoData = await prisma.event.findFirst({
        where: withTenantWhere(req.tenantId, { id: evento }),
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          endDate: true,
          maxCapacity: true,
          minAttendancePercent: true,
          registrations: {
            select: {
              id: true,
              status: true,
              finalAttendancePercent: true,
              account: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            where: {
              status: {
                in: [
                  "APPROVED",
                  "ACCEPTED",
                  "FAILED_GRADE",
                  "FAILED_ATTENDANCE",
                  "FAILED_TOTAL",
                ],
              },
            },
          },
        },
      });

      if (!eventoData) {
        return res.status(404).json({ msg: "Evento no encontrado" });
      }

      const totalInscritos = eventoData.registrations.length;
      const porcentajeMinimoAsistencia = eventoData.minAttendancePercent || 80;
      const asistentes = eventoData.registrations.filter(
        (ins) =>
          ins.finalAttendancePercent &&
          ins.finalAttendancePercent >= porcentajeMinimoAsistencia
      );
      const totalAsistencias = asistentes.length;
      const totalNoAsistieron = totalInscritos - totalAsistencias;
      const porcentajeAsistencia =
        totalInscritos > 0 ? totalAsistencias / totalInscritos : 0;

      datosReporte = {
        tipoReporte: "evento",
        nombreEvento: eventoData.name,
        fechaEvento: eventoData.startDate,
        tipoEvento: eventoData.type,
        totalInscritos,
        totalAsistencias,
        totalNoAsistieron,
        porcentajeAsistencia,
        detalles: eventoData.registrations.map((ins) => ({
          usuario: `${ins.account.user.firstName} ${ins.account.user.lastName}`,
          porcentajeAsistencia: ins.finalAttendancePercent || 0,
          estado: ins.status,
        })),
      };
    } else {
      // Reporte comparativo por tipo de evento
      const filtro = withTenantWhere(req.tenantId);
      if (tipo && tipo !== "todos") {
        filtro.type = tipo;
      }

      // Obtener comparativa entre eventos
      const eventos = await prisma.event.findMany({
        where: filtro,
        select: {
          id: true,
          name: true,
          type: true,
          startDate: true,
          minAttendancePercent: true,
          registrations: {
            select: {
              id: true,
              finalAttendancePercent: true,
            },
            where: {
              status: {
                in: [
                  "APPROVED",
                  "ACCEPTED",
                  "FAILED_GRADE",
                  "FAILED_ATTENDANCE",
                  "FAILED_TOTAL",
                ],
              },
            },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      });

      const comparativa = eventos.map((evento) => {
        const totalInscritos = evento.registrations.length;
        const porcentajeMinimoAsistencia = evento.minAttendancePercent || 80;
        const asistentes = evento.registrations.filter(
          (ins) =>
            ins.finalAttendancePercent &&
            ins.finalAttendancePercent >= porcentajeMinimoAsistencia
        ).length;
        const porcentajeAsistencia =
          totalInscritos > 0 ? asistentes / totalInscritos : 0;

        return {
          id_eve: evento.id,
          nombreEvento: evento.name,
          tipoEvento: evento.type,
          fechaEvento: evento.startDate,
          totalInscritos,
          totalAsistencias: asistentes,
          porcentajeAsistencia,
        };
      });

      // Obtener análisis de no-shows
      const tiposEventos = await prisma.event.groupBy({
        by: ["type"],
        where: filtro,
        _count: {
          id: true,
        },
      });

      const noShowsAnalisis = await Promise.all(
        tiposEventos.map(async (tipoGrupo) => {
          const eventosGrupo = await prisma.event.findMany({
            where: withTenantWhere(req.tenantId, { type: tipoGrupo.type }),
            select: {
              minAttendancePercent: true,
              registrations: {
                select: {
                  finalAttendancePercent: true,
                },
                where: {
                  status: {
                    in: [
                      "APPROVED",
                      "ACCEPTED",
                      "FAILED_GRADE",
                      "FAILED_ATTENDANCE",
                      "FAILED_TOTAL",
                    ],
                  },
                },
              },
            },
          });

          const totalInscritos = eventosGrupo.reduce(
            (sum, evento) => sum + evento.registrations.length,
            0
          );
          const totalAsistentes = eventosGrupo.reduce((sum, evento) => {
            const porcentajeMinimoAsistencia = evento.minAttendancePercent || 80;
            return (
              sum +
              evento.registrations.filter(
                (ins) =>
                  ins.finalAttendancePercent &&
                  ins.finalAttendancePercent >= porcentajeMinimoAsistencia
              ).length
            );
          }, 0);
          const totalNoShows = totalInscritos - totalAsistentes;
          const porcentajeNoShows =
            totalInscritos > 0 ? totalNoShows / totalInscritos : 0;

          return {
            tipoEvento: tipoGrupo.type,
            cantidadEventos: tipoGrupo._count.id,
            totalInscritos,
            totalNoShows,
            porcentajeNoShows,
          };
        })
      );

      datosReporte = {
        tipoReporte: "comparativo",
        tipoFiltro: tipo || "todos",
        comparativa,
        noShowsAnalisis,
      };
    }

    // Agregar fecha de generación
    datosReporte.fechaGeneracion = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Preparar carpeta y path temporal
    const reportesDir = path.join(process.cwd(), "uploads", "reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }

    const nombreArchivo = evento
      ? `Reporte_Asistencia_Evento_${evento}.pdf`
      : `Reporte_Asistencia_${tipo !== "todos" ? tipo : "General"}.pdf`;
    const filePath = path.join(reportesDir, nombreArchivo);

    // Generar el PDF
    await generarReporteAsistenciaPDF(datosReporte, filePath);

    // Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // Enviar el PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nombreArchivo}"`);
    res.send(pdfBuffer);

    console.log("✅ [PDF ASISTENCIA] PDF generado y enviado exitosamente");
  } catch (error) {
    console.error("❌ [PDF ASISTENCIA] Error al generar PDF:", error);
    res
      .status(500)
      .json({ msg: "Error al generar el PDF", error: error.message });
  }
}

// Reporte de Certificados
async function getReporteCertificados(req, res) {
  try {
    // Obtener parámetros dependiendo del método HTTP
    const { fechaInicio, fechaFin } =
      req.method === "GET" ? req.query : req.body;

    console.log("🔍 Reporte Certificados - Parámetros:", {
      fechaInicio,
      fechaFin,
    });

    // Construir filtros
    const filtro = withTenantWhere(req.tenantId);

    if (fechaInicio && fechaFin) {
      filtro.registeredAt = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (req.path.includes("/resumen") || req.path.includes("/summary")) {
      // Resumen general de certificados
      // Consultar certificados emitidos directamente
      const certificados = await prisma.certificate.findMany({
        where: {
          registration: filtro,
        },
        include: {
          registration: {
            select: {
              id: true,
              event: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Obtener eventos únicos con certificados
      const eventosUnicos = new Set();
      certificados.forEach((cert) => {
        eventosUnicos.add(cert.registration.event.id);
      });

      // Contar cuántos certificados han sido descargados al menos una vez
      const certificadosDescargados = certificados.length; // Asumimos que todos han sido descargados

      const estadisticas = {
        totalCertificados: certificados.length,
        certificadosDescargados: certificadosDescargados,
        eventosConCertificados: eventosUnicos.size,
        promedioCertificadosPorEvento:
          eventosUnicos.size > 0 ? certificados.length / eventosUnicos.size : 0,
      };

      return res.json(estadisticas);
    }

    if (req.path.includes("/descargas") || req.path.includes("/downloads")) {
      // Datos de descargas por período (trimestres)
      const certificados = await prisma.certificate.findMany({
        where: {
          registration: filtro,
        },
        include: {
          registration: {
            select: {
              registeredAt: true,
              event: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      // Agrupar por trimestre
      const descargasPorPeriodo = [];
      const periodos = ["Ene-Mar", "Abr-Jun", "Jul-Sep", "Oct-Dic"];

      // Crear un mapa para agrupar por trimestre
      const agrupadoPorPeriodo = {};

      certificados.forEach((cert) => {
        const fecha = new Date(cert.generatedAt);
        const año = fecha.getFullYear();
        const trimestre = Math.floor(fecha.getMonth() / 3); // 0-3 para trimestres

        const key = `${año}-${trimestre}`;
        const nombrePeriodo = `${periodos[trimestre]} ${año}`;

        if (!agrupadoPorPeriodo[key]) {
          agrupadoPorPeriodo[key] = {
            periodo: nombrePeriodo,
            certificadosEmitidos: 0,
            certificadosDescargados: 0,
            porcentajeDescarga: 0,
          };
        }

        agrupadoPorPeriodo[key].certificadosEmitidos++;
        // Asumimos que todos los certificados generados han sido descargados al menos una vez
        // En una implementación real, se debería verificar si el certificado fue descargado
        agrupadoPorPeriodo[key].certificadosDescargados++;
      });

      // Calcular porcentajes y convertir a array
      Object.keys(agrupadoPorPeriodo).forEach((key) => {
        const periodo = agrupadoPorPeriodo[key];
        periodo.porcentajeDescarga =
          periodo.certificadosEmitidos > 0
            ? periodo.certificadosDescargados / periodo.certificadosEmitidos
            : 0;
        descargasPorPeriodo.push(periodo);
      });

      // Ordenar por año y trimestre (implícito en la clave)
      descargasPorPeriodo.sort((a, b) => a.periodo.localeCompare(b.periodo));

      return res.json(descargasPorPeriodo);
    }

    if (req.path.includes("/eventos") || req.path.includes("/events")) {
      // Eventos con mayor emisión de certificados
      const eventos = await prisma.event.findMany({
        where: {
          registrations: {
            some: {
              ...filtro,
              certificate: { isNot: null },
            },
          },
        },
        include: {
          registrations: {
            where: {
              ...filtro,
              certificate: { isNot: null },
            },
            select: {
              id: true,
              certificate: {
                select: {
                  id: true,
                  generatedAt: true,
                },
              },
            },
          },
          _count: {
            select: {
              registrations: {
                where: {
                  ...filtro,
                  certificate: { isNot: null },
                },
              },
            },
          },
        },
      });

      // Ordenar manualmente por cantidad de certificados y tomar los 10 primeros
      const eventosOrdenados = eventos
        .map((evento) => ({
          id_eve: evento.id,
          nombreEvento: evento.name,
          tipoEvento: evento.type,
          fechaEvento: evento.startDate,
          certificadosEmitidos: evento.registrations.length,
          certificadosDescargados: evento.registrations.length, // Asumimos que todos han sido descargados
        }))
        .sort((a, b) => b.certificadosEmitidos - a.certificadosEmitidos)
        .slice(0, 10);

      return res.json(eventosOrdenados);
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
    const { fechaInicio, fechaFin } = req.body;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        msg: "Debe proporcionar fechas de inicio y fin.",
      });
    }

    console.log("📊 [PDF CERTIFICADOS] Iniciando generación de PDF");
    console.log("📊 [PDF CERTIFICADOS] Parámetros:", {
      fechaInicio,
      fechaFin,
    });

    // 1. Obtener datos del reporte de certificados
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Ajustar las fechas para que incluyan el día completo
    fechaInicioDate.setHours(0, 0, 0, 0);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Construir filtros
    const filtro = withTenantWhere(req.tenantId, {
      registeredAt: {
        gte: fechaInicioDate,
        lte: fechaFinDate,
      },
    });

    // Obtener resumen general de certificados
    const certificados = await prisma.certificate.findMany({
      where: {
        registration: filtro,
      },
      include: {
        registration: {
          select: {
            registeredAt: true,
            event: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    // Obtener eventos únicos con certificados
    const eventosUnicos = new Set();
    certificados.forEach((cert) => {
      eventosUnicos.add(cert.registration.event.name);
    });

    // Contar cuántos certificados han sido descargados al menos una vez
    const certificadosDescargados = certificados.length; // Asumimos que todos han sido descargados

    const resumen = {
      totalCertificados: certificados.length,
      certificadosDescargados: certificadosDescargados,
      eventosConCertificados: eventosUnicos.size,
      promedioCertificadosPorEvento:
        eventosUnicos.size > 0 ? certificados.length / eventosUnicos.size : 0,
    };

    // Obtener datos de descargas por período (trimestres)
    const descargasPorPeriodo = [];
    const periodos = ["Ene-Mar", "Abr-Jun", "Jul-Sep", "Oct-Dic"];

    // Crear un mapa para agrupar por trimestre
    const agrupadoPorPeriodo = {};

    certificados.forEach((cert) => {
        const fecha = new Date(cert.generatedAt);
      const trimestre = Math.floor(fecha.getMonth() / 3); // 0-3 para trimestres

      const key = `${año}-${trimestre}`;
      const nombrePeriodo = `${periodos[trimestre]} ${año}`;

      if (!agrupadoPorPeriodo[key]) {
        agrupadoPorPeriodo[key] = {
          periodo: nombrePeriodo,
          certificadosEmitidos: 0,
          certificadosDescargados: 0,
          porcentajeDescarga: 0,
        };
      }

      agrupadoPorPeriodo[key].certificadosEmitidos++;
      // Asumimos que todos los certificados generados han sido descargados al menos una vez
      agrupadoPorPeriodo[key].certificadosDescargados++;
    });

    // Calcular porcentajes y convertir a array
    Object.keys(agrupadoPorPeriodo).forEach((key) => {
      const periodo = agrupadoPorPeriodo[key];
      periodo.porcentajeDescarga =
        periodo.certificadosEmitidos > 0
          ? periodo.certificadosDescargados / periodo.certificadosEmitidos
          : 0;
      descargasPorPeriodo.push(periodo);
    });

    // Ordenar por año y trimestre
    descargasPorPeriodo.sort((a, b) => a.periodo.localeCompare(b.periodo));

    // Obtener eventos con mayor emisión de certificados
    const eventos = await prisma.event.findMany({
      where: {
        registrations: {
          some: {
            ...filtro,
            certificate: { isNot: null },
          },
        },
      },
      include: {
        registrations: {
          where: {
            ...filtro,
            certificate: { isNot: null },
          },
          select: {
            id: true,
            certificate: {
              select: {
                id: true,
                generatedAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                ...filtro,
                certificate: { isNot: null },
              },
            },
          },
        },
      },
    });

    // Ordenar manualmente por cantidad de certificados y tomar los 10 primeros
    const eventosCertificados = eventos
      .map((evento) => ({
        id_eve: evento.id,
        nombreEvento: evento.name,
        tipoEvento: evento.type,
        fechaEvento: evento.startDate,
        certificadosEmitidos: evento.registrations.length,
        certificadosDescargados: evento.registrations.length, // Asumimos que todos han sido descargados
      }))
      .sort((a, b) => b.certificadosEmitidos - a.certificadosEmitidos)
      .slice(0, 10);

    // 2. Preparar datos para el PDF
    const datosReporte = {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      resumen,
      descargasPorPeriodo,
      eventosCertificados,
      fechaGeneracion: new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    // 3. Preparar carpeta y path temporal
    const reportesDir = path.join(process.cwd(), "uploads", "reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }

    const nombreArchivo = `Reporte_Certificados_${fechaInicio}_al_${fechaFin}.pdf`;
    const filePath = path.join(reportesDir, nombreArchivo);

    // 4. Generar el PDF
    await generarReporteCertificadosPDF(datosReporte, filePath);

    // 5. Leer el PDF como buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // 6. Eliminar el archivo temporal
    fs.unlink(filePath, () => {});

    // 7. Enviar el PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nombreArchivo}"`);
    res.send(pdfBuffer);

    console.log("✅ [PDF CERTIFICADOS] PDF generado y enviado exitosamente");
  } catch (error) {
    console.error("❌ [PDF CERTIFICADOS] Error al generar PDF:", error);
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

    if (
      (req.path.includes("/ocupacion/") || req.path.includes("/occupancy/")) &&
      id_evento
    ) {
      // Análisis de ocupación de un evento específico
      const evento = await prisma.event.findFirst({
        where: withTenantWhere(req.tenantId, { id: id_evento }),
        select: {
          id: true,
          name: true,
          maxCapacity: true,
          availableSpots: true,
          registrations: {
            select: {
              id: true,
              status: true,
              account: {
                select: {
                  user: {
                    select: {
                      career: {
                        select: {
                          name: true,
                        },
                      },
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

      const totalCupos = evento.maxCapacity;
      const cuposOcupados = totalCupos - evento.availableSpots;
      const cuposDisponibles = evento.availableSpots;
      const porcentajeOcupacion =
        totalCupos > 0 ? (cuposOcupados / totalCupos) * 100 : 0;

      // Distribución por carrera
      const distribucionCarrera = {};
      evento.registrations.forEach((ins) => {
        const carrera = ins.account.user.career?.name || "Sin carrera";
        distribucionCarrera[carrera] = (distribucionCarrera[carrera] || 0) + 1;
      });

      return res.json({
        evento: {
          id_eve: evento.id,
          nom_eve: evento.name,
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

    if (req.path.includes("/demanda") || req.path.includes("/demand")) {
      // Eventos con mayor demanda
      const filtro = withTenantWhere(req.tenantId);
      if (tipoEvento && tipoEvento !== "todos") {
        filtro.type = tipoEvento;
      }

      const eventos = await prisma.event.findMany({
        where: filtro,
        select: {
          id: true,
          name: true,
          type: true,
          maxCapacity: true,
          registrations: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      const eventosDemanda = eventos
        .map((evento) => {
          const totalInscripciones = evento.registrations.length;
          const capacidadTotal = evento.maxCapacity;
          const porcentajeDemanda =
            capacidadTotal > 0 ? totalInscripciones / capacidadTotal : 0;
          const listaEspera = Math.max(0, totalInscripciones - capacidadTotal);

          return {
            id_eve: evento.id,
            nombreEvento: evento.name,
            tipoEvento: evento.type,
            capacidadTotal,
            totalInscripciones,
            porcentajeDemanda,
            listaEspera,
          };
        })
        .sort((a, b) => b.porcentajeDemanda - a.porcentajeDemanda);

      return res.json(eventosDemanda);
    }

    if (req.path.includes("/optimizacion") || req.path.includes("/optimization")) {
      // Sugerencias de optimización
      const eventos = await prisma.event.findMany({
        where: withTenantWhere(req.tenantId),
        select: {
          id: true,
          name: true,
          type: true,
          maxCapacity: true,
          availableSpots: true,
          registrations: {
            select: {
              id: true,
            },
          },
        },
      });

      const optimizacion = eventos.map((evento) => {
        const capacidadTotal = evento.maxCapacity;
        const cuposOcupados = capacidadTotal - evento.availableSpots;
        const totalInscripciones = evento.registrations.length;
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
          id_eve: evento.id,
          nombreEvento: evento.name,
          tipoEvento: evento.type,
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

// Funciones auxiliares para reporte de inscripciones PDF
async function obtenerEstadisticasInscripciones(
  fechaInicio,
  fechaFin,
  estado,
  tenantId
) {
  const filtro = withTenantWhere(tenantId);

  if (fechaInicio && fechaFin) {
    filtro.registeredAt = {
      gte: fechaInicio,
      lte: fechaFin,
    };
  }

  if (estado && estado !== "todos") {
    filtro.status = normalizeReportRegistrationStatus(estado);
  }

  const inscripciones = await prisma.registration.findMany({
    where: filtro,
    select: {
      status: true,
    },
  });

  // Estados detallados para categorización
  const estadosAceptados = ["ACCEPTED"];
  const estadosAprobados = ["APPROVED"];
  const estadosRechazados = ["REJECTED"];
  const estadosReprobados = [
    "FAILED_GRADE",
    "FAILED_ATTENDANCE",
    "FAILED_TOTAL",
  ];

  return {
    total: inscripciones.length,
    pendientes: inscripciones.filter((ins) => ins.status === "PENDING")
      .length,
    aceptadas: inscripciones.filter((ins) =>
      estadosAceptados.includes(ins.status)
    ).length,
    aprobadas: inscripciones.filter((ins) =>
      estadosAprobados.includes(ins.status)
    ).length,
    rechazadas: inscripciones.filter((ins) =>
      estadosRechazados.includes(ins.status)
    ).length,
    reprobadas: inscripciones.filter((ins) =>
      estadosReprobados.includes(ins.status)
    ).length,
  };
}

async function obtenerTendenciasInscripciones(fechaInicio, fechaFin, tenantId) {
  const filtro = withTenantWhere(tenantId);

  if (fechaInicio && fechaFin) {
    filtro.registeredAt = {
      gte: fechaInicio,
      lte: fechaFin,
    };
  }

  const inscripciones = await prisma.registration.findMany({
    where: filtro,
    select: {
      registeredAt: true,
      status: true,
    },
    orderBy: {
      registeredAt: "asc",
    },
  });

  // Agrupar por período (usar rango completo si es menos de 60 días)
  const diffTime = Math.abs(fechaFin - fechaInicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const usarRangoCompleto = diffDays <= 60;

  if (usarRangoCompleto) {
    // Mostrar el período completo como una sola entrada
    const fechaInicioStr = fechaInicio.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    const fechaFinStr = fechaFin.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const estadosAceptados = ["ACCEPTED"];
    const estadosAprobados = ["APPROVED"];
    const estadosRechazados = ["REJECTED"];
    const estadosReprobados = [
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];

    return [
      {
        periodo: `${fechaInicioStr} - ${fechaFinStr}`,
        total: inscripciones.length,
        pendientes: inscripciones.filter((ins) => ins.status === "PENDING")
          .length,
        aceptadas: inscripciones.filter((ins) =>
          estadosAceptados.includes(ins.status)
        ).length,
        aprobadas: inscripciones.filter((ins) =>
          estadosAprobados.includes(ins.status)
        ).length,
        rechazadas: inscripciones.filter((ins) =>
          estadosRechazados.includes(ins.status)
        ).length,
        reprobadas: inscripciones.filter((ins) =>
          estadosReprobados.includes(ins.status)
        ).length,
        variacion: 0, // No hay variación cuando solo hay un período
      },
    ];
  } else {
    // Agrupar por mes
    return agruparInscripcionesPorMes(inscripciones, fechaInicio, fechaFin);
  }
}

async function obtenerAnalisisValidaciones(fechaInicio, fechaFin, tenantId) {
  const filtro = withTenantWhere(tenantId);

  if (fechaInicio && fechaFin) {
    filtro.registeredAt = {
      gte: fechaInicio,
      lte: fechaFin,
    };
  }

  // Solo incluir inscripciones que han sido validadas
  filtro.validatedByAdminId = {
    not: null,
  };

  const inscripciones = await prisma.registration.findMany({
    where: filtro,
    select: {
      status: true,
      registeredAt: true,
      validatedAt: true,
      validatorAdmin: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Agrupar por validador
  const validadoresPorAdmin = {};

  inscripciones.forEach((ins) => {
    if (!ins.validatorAdmin) return;

    const nombreCompleto = `${ins.validatorAdmin.user.firstName} ${ins.validatorAdmin.user.lastName}`;

    if (!validadoresPorAdmin[nombreCompleto]) {
      validadoresPorAdmin[nombreCompleto] = {
        responsable: nombreCompleto,
        totalValidadas: 0,
        aceptadas: 0,
        aprobadas: 0,
        rechazadas: 0,
        reprobadas: 0,
        tiemposValidacion: [],
      };
    }

    const validador = validadoresPorAdmin[nombreCompleto];
    validador.totalValidadas++;

    // Categorizar por estado
    const estadosAceptados = ["ACCEPTED"];
    const estadosAprobados = ["APPROVED"];
    const estadosRechazados = ["REJECTED"];
    const estadosReprobados = [
      "FAILED_GRADE",
      "FAILED_ATTENDANCE",
      "FAILED_TOTAL",
    ];

    if (estadosAceptados.includes(ins.status)) {
      validador.aceptadas++;
    } else if (estadosAprobados.includes(ins.status)) {
      validador.aprobadas++;
    } else if (estadosRechazados.includes(ins.status)) {
      validador.rechazadas++;
    } else if (estadosReprobados.includes(ins.status)) {
      validador.reprobadas++;
    }

    // Calcular tiempo de validación
    if (ins.registeredAt && ins.validatedAt) {
      const tiempoValidacion = Math.abs(
        new Date(ins.validatedAt) - new Date(ins.registeredAt)
      );
      const horasValidacion = tiempoValidacion / (1000 * 60 * 60);
      validador.tiemposValidacion.push(horasValidacion);
    }
  });

  // Calcular tiempo promedio y formatear resultados
  return Object.values(validadoresPorAdmin).map((validador) => ({
    ...validador,
    tiempoPromedio:
      validador.tiemposValidacion.length > 0
        ? Math.round(
            validador.tiemposValidacion.reduce((a, b) => a + b, 0) /
              validador.tiemposValidacion.length
          )
        : 0,
    tiemposValidacion: undefined, // Eliminar el array temporal
  }));
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
