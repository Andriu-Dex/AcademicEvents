/**
 * Métodos para paginación de eventos
 * Estos métodos se agregarán al controlador de eventos existente
 */

const { prisma } = require("../config/db");

const {
  extractPaginationParams,
  buildPaginatedResponse,
  extractSortParams,
} = require("../utils/paginationUtils");

require("dotenv").config();

/**
 * Función helper para logs condicionales del sistema de paginación de eventos
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} forceShow - Forzar mostrar el mensaje (para errores críticos)
 */
const conditionalPaginationLog = (message, forceShow = false) => {
  const logsEnabled = process.env.EVENT_PAGINATION_LOGS_ENABLED === "true";
  if (logsEnabled || forceShow) {
    console.log(message);
  }
};

/**
 * Obtiene eventos públicos con paginación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
async function obtenerEventosPublicosPaginados(req, res) {
  try {
    // Extraer parámetros de paginación
    const { page, limit, offset } = extractPaginationParams(req);

    // Extraer filtros
    const {
      software,
      industrial,
      publico,
      gratuito,
      pagado,
      modalidad,
      search,
    } = req.query; // Construir condición WHERE para filtros
    const whereCondition = {
      status: "ACTIVE", // Solo eventos activos según el enum status
    };

    // Construir filtros de carreras usando OR para combinar múltiples criterios
    const carreraFilters = [];

    // Filtros por tipo de carrera específica
    if (software === "true") {
      carreraFilters.push({
        eventCareers: {
          some: {
            career: {
              name: {
                contains: "Software",
                mode: "insensitive",
              },
            },
          },
        },
      });
    }

    if (industrial === "true") {
      carreraFilters.push({
        eventCareers: {
          some: {
            career: {
              name: {
                contains: "Industrial",
                mode: "insensitive",
              },
            },
          },
        },
      });
    }

    // Filtro por público - eventos sin carreras específicas asociadas
    if (publico === "true") {
      carreraFilters.push({
        eventCareers: {
          none: {}, // Sin carreras asociadas = público
        },
      });
    }

    // Si hay filtros de carrera, aplicarlos con OR
    if (carreraFilters.length > 0) {
      whereCondition.OR = carreraFilters;
    }

    // Filtros por precio
    if (gratuito === "true") {
      whereCondition.value = 0;
    } else if (pagado === "true") {
      whereCondition.value = {
        gt: 0,
      };
    } // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.modality = modalidad;
    }

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      // Si ya hay condiciones OR (filtros de carrera), combinarlas con AND
      if (whereCondition.OR) {
        whereCondition.AND = [
          { OR: whereCondition.OR }, // Filtros de carrera existentes
          {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }, // Filtro de búsqueda
        ];
        delete whereCondition.OR; // Limpiar el OR original
      } else {
        // Si no hay filtros de carrera previos, aplicar búsqueda directamente
        whereCondition.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
    } // Ordenamiento (por defecto por fecha de inicio ascendente - eventos más próximos primero)
    const orderBy = extractSortParams(
      req,
      { field: "startDate", direction: "asc" },
      ["startDate", "endDate", "title", "value"]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventCareers: {
            include: {
              career: true,
            },
          },
          createdBy: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.event.count({ where: whereCondition }),
    ]);

    // Construir respuesta paginada
    const response = buildPaginatedResponse(eventos, totalItems, {
      page,
      limit,
    });

    return res.json(response);
  } catch (error) {
    console.error("Error al obtener eventos públicos paginados:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
}

/**
 * Obtiene eventos para usuario autenticado con paginación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
async function obtenerEventosUsuarioPaginados(req, res) {
  try {
    // Extraer parámetros de paginación
    const { page, limit, offset } = extractPaginationParams(req); // Extraer filtros
    const {
      carrera,
      modalidad,
      estado,
      gratuito,
      pagado,
      search,
      completo, // Filtro para eventos sin cupos
      finalizado,
      cancelado,
      suspendido,
    } = req.query;

    // 🔍 OBTENER INFORMACIÓN DEL USUARIO AUTENTICADO
    const userId = req.usuario.id; // ID de la cuenta

    // Obtener información del usuario con su carrera
    const userAccount = await prisma.account.findUnique({
      where: { id: userId },
      include: {
        user: {
          include: {
            career: true,
          },
        },
      },
    });

    if (!userAccount) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Construir condición WHERE para filtros
    const whereCondition = {}; // 🎯 LÓGICA DE FILTRADO POR ROL Y CARRERA
    if (userAccount.role === "ESTUDIANTE") {
      if (userAccount.user.career) {
        // Estudiante con carrera asignada puede ver:
        // 1. Eventos específicos de su carrera
        // 2. Eventos públicos (sin carreras asociadas)
        const userCarreraId = userAccount.user.career.id;

        whereCondition.OR = [
          // Eventos específicos de su carrera
          {
            eventCareers: {
              some: {
                careerId: userCarreraId,
              },
            },
          },
          // Eventos públicos (sin carreras asociadas)
          {
            eventCareers: {
              none: {},
            },
          },
        ];
      } else {
        // Estudiante sin carrera asignada
        // Solo puede ver eventos públicos hasta que se le asigne carrera
        whereCondition.eventCareers = {
          none: {}, // Solo eventos sin carreras asociadas (públicos)
        };
      }
    } else if (userAccount.role === "GENERAL") {
      // Usuario GENERAL puede ver SOLO eventos públicos (sin carreras asociadas)
      whereCondition.eventCareers = {
        none: {}, // Solo eventos sin carreras asociadas
      };
    }
    // Para administradores (ADMIN_GLOBAL, ADMIN_GENERAL), no aplicar filtro automático    // Filtro adicional por carrera específica (si se proporciona en query)
    if (carrera && carrera !== "") {
      // Si ya hay condición OR (caso estudiante con carrera), modificar la condición OR existente
      if (whereCondition.OR) {
        // Para estudiantes con carrera: reemplazar la condición OR
        // para que solo muestre eventos de la carrera específica seleccionada + eventos públicos
        whereCondition.OR = [
          // Eventos específicos de la carrera seleccionada
          {
            eventCareers: {
              some: {
                careerId: carrera,
              },
            },
          },
          // Eventos públicos (sin carreras asociadas) - mantener acceso
          {
            eventCareers: {
              none: {},
            },
          },
        ];
      } else {
        // Si no hay condición OR previa, simplemente filtrar por carrera
        whereCondition.eventCareers = {
          some: {
            careerId: carrera,
          },
        };
      }
    } // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.modality = modalidad;
    } // Filtro por estado específico (más granular que el filtro general)
    if (estado && estado !== "") {
      whereCondition.status = estado;
    } else {
      // Filtros específicos por estado booleano
      const estadosSeleccionados = [];

      // Solo agregar estados específicos si están seleccionados
      if (finalizado === "true") {
        estadosSeleccionados.push("FINISHED");
      }
      if (cancelado === "true") {
        estadosSeleccionados.push("CANCELLED");
      }
      if (suspendido === "true") {
        estadosSeleccionados.push("SUSPENDED");
      }

      // Si NO hay filtros de estado específicos, mostrar solo ACTIVE por defecto
      if (estadosSeleccionados.length === 0) {
        whereCondition.status = "ACTIVE";
      } else if (estadosSeleccionados.length === 1) {
        // Solo un estado específico seleccionado
        whereCondition.status = estadosSeleccionados[0];
      } else {
        // Múltiples estados específicos seleccionados
        whereCondition.status = {
          in: estadosSeleccionados,
        };
      }
    } // Filtros por precio
    if (gratuito === "true") {
      whereCondition.value = 0;
    } else if (pagado === "true") {
      whereCondition.value = {
        gt: 0,
      };
    } // Filtro por cupos disponibles (solo aplicar si se solicita específicamente)
    if (completo === "true") {
      // Mostrar solo eventos con cupos agotados
      whereCondition.availableSpots = 0;
    }
    // NOTA: No aplicar filtro de cupos por defecto
    // Los eventos cancelados, finalizados, etc. pueden tener cupos = 0 y deben mostrarse

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      // Si ya hay condición OR, combinarla con AND
      if (whereCondition.OR) {
        whereCondition.AND = whereCondition.AND || [];
        whereCondition.AND.push({
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        });
      } else {
        whereCondition.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
    } // 🐛 DEBUG: Log de la condición WHERE construida
    conditionalPaginationLog(
      "📊 [EVENTOS USUARIO PAGINADOS] Información de usuario:"
    );
    conditionalPaginationLog(`  - Rol: ${userAccount.role}`);
    conditionalPaginationLog(
      `  - Tiene carrera: ${!!userAccount.user.career}`
    );
    if (userAccount.user.career) {
      conditionalPaginationLog(
        `  - Carrera: ${userAccount.user.career.name} (ID: ${userAccount.user.career.id})`
      );
    }
    conditionalPaginationLog(
      "📊 [EVENTOS USUARIO PAGINADOS] Filtros recibidos:"
    );
    conditionalPaginationLog(`  - search: "${search || "ninguno"}"`);
    conditionalPaginationLog(`  - gratuito: ${gratuito}`);
    conditionalPaginationLog(`  - pagado: ${pagado}`);
    conditionalPaginationLog(`  - completo: ${completo}`);
    conditionalPaginationLog(`  - modalidad: "${modalidad || "ninguna"}"`);
    conditionalPaginationLog(`  - finalizado: ${finalizado}`);
    conditionalPaginationLog(`  - cancelado: ${cancelado}`);
    conditionalPaginationLog(`  - suspendido: ${suspendido}`);
    conditionalPaginationLog(
      "📊 [EVENTOS USUARIO PAGINADOS] Reglas aplicadas:"
    );
    if (userAccount.role === "ESTUDIANTE") {
      if (userAccount.user.career) {
        conditionalPaginationLog(
          "  - ESTUDIANTE con carrera: Puede ver eventos de su carrera + eventos públicos (sin carreras)"
        );
      } else {
        conditionalPaginationLog(
          "  - ESTUDIANTE sin carrera: Solo eventos públicos (sin carreras) hasta asignación"
        );
      }
    } else if (userAccount.role === "GENERAL") {
      conditionalPaginationLog(
        "  - GENERAL: Solo puede ver eventos públicos (sin carreras asociadas)"
      );
    } else {
      conditionalPaginationLog("  - ADMIN: Puede ver todos los eventos");
    }
    conditionalPaginationLog("📊 [EVENTOS USUARIO PAGINADOS] Condición WHERE:");
    conditionalPaginationLog(JSON.stringify(whereCondition, null, 2)); // Ordenamiento (por defecto por fecha de inicio ascendente - eventos más próximos primero)
    const orderBy = extractSortParams(
      req,
      { field: "startDate", direction: "asc" },
      ["startDate", "endDate", "title", "value", "createdAt"]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventCareers: {
            include: {
              career: true,
            },
          },
          createdBy: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.event.count({ where: whereCondition }),
    ]);

    // Construir respuesta paginada
    const response = buildPaginatedResponse(eventos, totalItems, {
      page,
      limit,
    }); // 🐛 DEBUG: Log de los eventos devueltos
    conditionalPaginationLog(`📊 [EVENTOS USUARIO PAGINADOS] Resultados:`);
    conditionalPaginationLog(`  - Total eventos encontrados: ${totalItems}`);
    conditionalPaginationLog(`  - Eventos en esta página: ${eventos.length}`);
    if (eventos.length > 0) {
      conditionalPaginationLog(`  - Eventos devueltos:`);
      eventos.forEach((evento, index) => {
        const carreras = evento.eventCareers
          .map((ec) => ec.career.name)
          .join(", ");
        conditionalPaginationLog(
          `    ${index + 1}. ${evento.title} (Tipo: ${evento.type}) ${
            carreras ? `[${carreras}]` : "[Público - Sin carreras]"
          }`
        );
      });
    }

    return res.json(response);
  } catch (error) {
    console.error("Error al obtener eventos de usuario paginados:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
}

/**
 * Obtiene eventos para administradores con paginación
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
async function obtenerEventosAdminPaginados(req, res) {
  try {
    // Extraer parámetros de paginación
    const { page, limit, offset } = extractPaginationParams(req);

    // Extraer filtros
    const {
      search,
      estado,
      tipo,
      fechaDesde,
      fechaHasta,
      carrera,
      modalidad,
      capacidadMin,
      capacidadMax,
      valorMin,
      valorMax,
    } = req.query;

    // Construir condición WHERE para filtros
    const whereCondition = {};

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por estado
    if (estado && estado !== "") {
      whereCondition.status = estado;
    }

    // Filtro por tipo de evento
    if (tipo && tipo !== "") {
      whereCondition.type = tipo;
    }

    // Filtro por rango de fechas
    if (fechaDesde && fechaHasta) {
      whereCondition.startDate = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    } else if (fechaDesde) {
      whereCondition.startDate = {
        gte: new Date(fechaDesde),
      };
    } else if (fechaHasta) {
      whereCondition.startDate = {
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por carrera a través de eventCareers
    if (carrera && carrera !== "") {
      whereCondition.eventCareers = {
        some: {
          careerId: carrera,
        },
      };
    }

    // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.modality = modalidad;
    }

    // Filtro por capacidad (cupo máximo)
    if (capacidadMin || capacidadMax) {
      whereCondition.maxCapacity = {};

      if (capacidadMin) {
        whereCondition.maxCapacity.gte = parseInt(capacidadMin);
      }

      if (capacidadMax) {
        whereCondition.maxCapacity.lte = parseInt(capacidadMax);
      }
    }

    // Filtro por valor del evento
    if (valorMin || valorMax) {
      whereCondition.value = {};

      if (valorMin) {
        whereCondition.value.gte = parseFloat(valorMin);
      }

      if (valorMax) {
        whereCondition.value.lte = parseFloat(valorMax);
      }
    }

    // Ordenamiento (por defecto por fecha de creación descendente)
    const orderBy = extractSortParams(
      req,
      { field: "createdAt", direction: "desc" },
      [
        "createdAt",
        "startDate",
        "endDate",
        "title",
        "value",
        "maxCapacity",
      ]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventCareers: {
            include: {
              career: true,
            },
          },
          createdBy: {
            include: {
              user: true,
            },
          },
          registrations: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.event.count({ where: whereCondition }),
    ]);

    // Añadir conteo de inscripciones a cada evento
    const eventosConMetadata = eventos.map((evento) => ({
      ...evento,
      inscripcionesCount: evento.registrations.length,
      registrations: undefined, // Remover el array original para no duplicar datos
    }));

    // Construir respuesta paginada
    const response = buildPaginatedResponse(eventosConMetadata, totalItems, {
      page,
      limit,
    });

    return res.json(response);
  } catch (error) {
    console.error("Error al obtener eventos admin paginados:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    });
  }
}

module.exports = {
  obtenerEventosPublicosPaginados,
  obtenerEventosUsuarioPaginados,
  obtenerEventosAdminPaginados,
  conditionalPaginationLog,
};
