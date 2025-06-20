/**
 * Métodos para paginación de eventos
 * Estos métodos se agregarán al controlador de eventos existente
 */

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const {
  extractPaginationParams,
  buildPaginatedResponse,
  extractSortParams,
} = require("../utils/paginationUtils");

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
      est_eve: "ACTIVO", // Solo eventos activos según el enum estado_evento
    };

    // Construir filtros de carreras usando OR para combinar múltiples criterios
    const carreraFilters = [];

    // Filtros por tipo de carrera específica
    if (software === "true") {
      carreraFilters.push({
        eventos_carrera: {
          some: {
            carrera: {
              nom_car: {
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
        eventos_carrera: {
          some: {
            carrera: {
              nom_car: {
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
        eventos_carrera: {
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
      whereCondition.val_eve = 0;
    } else if (pagado === "true") {
      whereCondition.val_eve = {
        gt: 0,
      };
    } // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.mod_eve = modalidad;
    }

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      // Si ya hay condiciones OR (filtros de carrera), combinarlas con AND
      if (whereCondition.OR) {
        whereCondition.AND = [
          { OR: whereCondition.OR }, // Filtros de carrera existentes
          {
            OR: [
              { nom_eve: { contains: search, mode: "insensitive" } },
              { des_eve: { contains: search, mode: "insensitive" } },
            ],
          }, // Filtro de búsqueda
        ];
        delete whereCondition.OR; // Limpiar el OR original
      } else {
        // Si no hay filtros de carrera previos, aplicar búsqueda directamente
        whereCondition.OR = [
          { nom_eve: { contains: search, mode: "insensitive" } },
          { des_eve: { contains: search, mode: "insensitive" } },
        ];
      }
    } // Ordenamiento (por defecto por fecha de inicio ascendente - eventos más próximos primero)
    const orderBy = extractSortParams(
      req,
      { field: "fec_ini_eve", direction: "asc" },
      ["fec_ini_eve", "fec_fin_eve", "nom_eve", "val_eve"]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.evento.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventos_carrera: {
            include: {
              carrera: true,
            },
          },
          cuenta: {
            include: {
              usuario: true,
            },
          },
        },
      }),
      prisma.evento.count({ where: whereCondition }),
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
    const userAccount = await prisma.cuenta.findUnique({
      where: { id_cue: userId },
      include: {
        usuario: {
          include: {
            carrera: true,
          },
        },
      },
    });

    if (!userAccount) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Construir condición WHERE para filtros
    const whereCondition = {}; // 🎯 LÓGICA DE FILTRADO POR ROL Y CARRERA
    if (userAccount.rol_usu === "ESTUDIANTE") {
      if (userAccount.usuario.carrera) {
        // Estudiante con carrera asignada puede ver:
        // 1. Eventos específicos de su carrera
        // 2. Eventos públicos (sin carreras asociadas)
        const userCarreraId = userAccount.usuario.carrera.id_car;

        whereCondition.OR = [
          // Eventos específicos de su carrera
          {
            eventos_carrera: {
              some: {
                id_car_aso: userCarreraId,
              },
            },
          },
          // Eventos públicos (sin carreras asociadas)
          {
            eventos_carrera: {
              none: {},
            },
          },
        ];
      } else {
        // Estudiante sin carrera asignada
        // Solo puede ver eventos públicos hasta que se le asigne carrera
        whereCondition.eventos_carrera = {
          none: {}, // Solo eventos sin carreras asociadas (públicos)
        };
      }
    } else if (userAccount.rol_usu === "GENERAL") {
      // Usuario GENERAL puede ver SOLO eventos públicos (sin carreras asociadas)
      whereCondition.eventos_carrera = {
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
            eventos_carrera: {
              some: {
                id_car_aso: carrera,
              },
            },
          },
          // Eventos públicos (sin carreras asociadas) - mantener acceso
          {
            eventos_carrera: {
              none: {},
            },
          },
        ];
      } else {
        // Si no hay condición OR previa, simplemente filtrar por carrera
        whereCondition.eventos_carrera = {
          some: {
            id_car_aso: carrera,
          },
        };
      }
    } // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.mod_eve = modalidad;
    } // Filtro por estado específico (más granular que el filtro general)
    if (estado && estado !== "") {
      whereCondition.est_eve = estado;
    } else {
      // Filtros específicos por estado booleano
      const estadosSeleccionados = [];

      // Solo agregar estados específicos si están seleccionados
      if (finalizado === "true") {
        estadosSeleccionados.push("FINALIZADO");
      }
      if (cancelado === "true") {
        estadosSeleccionados.push("CANCELADO");
      }
      if (suspendido === "true") {
        estadosSeleccionados.push("SUSPENDIDO");
      }

      // Si NO hay filtros de estado específicos, mostrar solo ACTIVO por defecto
      if (estadosSeleccionados.length === 0) {
        whereCondition.est_eve = "ACTIVO";
      } else if (estadosSeleccionados.length === 1) {
        // Solo un estado específico seleccionado
        whereCondition.est_eve = estadosSeleccionados[0];
      } else {
        // Múltiples estados específicos seleccionados
        whereCondition.est_eve = {
          in: estadosSeleccionados,
        };
      }
    } // Filtros por precio
    if (gratuito === "true") {
      whereCondition.val_eve = 0;
    } else if (pagado === "true") {
      whereCondition.val_eve = {
        gt: 0,
      };
    } // Filtro por cupos disponibles (solo aplicar si se solicita específicamente)
    if (completo === "true") {
      // Mostrar solo eventos con cupos agotados
      whereCondition.cup_dis_eve = 0;
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
            { nom_eve: { contains: search, mode: "insensitive" } },
            { des_eve: { contains: search, mode: "insensitive" } },
          ],
        });
      } else {
        whereCondition.OR = [
          { nom_eve: { contains: search, mode: "insensitive" } },
          { des_eve: { contains: search, mode: "insensitive" } },
        ];
      }
    } // 🐛 DEBUG: Log de la condición WHERE construida
    console.log("📊 [EVENTOS USUARIO PAGINADOS] Información de usuario:");
    console.log(`  - Rol: ${userAccount.rol_usu}`);
    console.log(`  - Tiene carrera: ${!!userAccount.usuario.carrera}`);
    if (userAccount.usuario.carrera) {
      console.log(
        `  - Carrera: ${userAccount.usuario.carrera.nom_car} (ID: ${userAccount.usuario.carrera.id_car})`
      );
    }
    console.log("📊 [EVENTOS USUARIO PAGINADOS] Filtros recibidos:");
    console.log(`  - search: "${search || "ninguno"}"`);
    console.log(`  - gratuito: ${gratuito}`);
    console.log(`  - pagado: ${pagado}`);
    console.log(`  - completo: ${completo}`);
    console.log(`  - modalidad: "${modalidad || "ninguna"}"`);
    console.log(`  - finalizado: ${finalizado}`);
    console.log(`  - cancelado: ${cancelado}`);
    console.log(`  - suspendido: ${suspendido}`);
    console.log("📊 [EVENTOS USUARIO PAGINADOS] Reglas aplicadas:");
    if (userAccount.rol_usu === "ESTUDIANTE") {
      if (userAccount.usuario.carrera) {
        console.log(
          "  - ESTUDIANTE con carrera: Puede ver eventos de su carrera + eventos públicos (sin carreras)"
        );
      } else {
        console.log(
          "  - ESTUDIANTE sin carrera: Solo eventos públicos (sin carreras) hasta asignación"
        );
      }
    } else if (userAccount.rol_usu === "GENERAL") {
      console.log(
        "  - GENERAL: Solo puede ver eventos públicos (sin carreras asociadas)"
      );
    } else {
      console.log("  - ADMIN: Puede ver todos los eventos");
    }
    console.log("📊 [EVENTOS USUARIO PAGINADOS] Condición WHERE:");
    console.log(JSON.stringify(whereCondition, null, 2)); // Ordenamiento (por defecto por fecha de inicio ascendente - eventos más próximos primero)
    const orderBy = extractSortParams(
      req,
      { field: "fec_ini_eve", direction: "asc" },
      ["fec_ini_eve", "fec_fin_eve", "nom_eve", "val_eve", "fec_cre_eve"]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.evento.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventos_carrera: {
            include: {
              carrera: true,
            },
          },
          cuenta: {
            include: {
              usuario: true,
            },
          },
        },
      }),
      prisma.evento.count({ where: whereCondition }),
    ]);

    // Construir respuesta paginada
    const response = buildPaginatedResponse(eventos, totalItems, {
      page,
      limit,
    });

    // 🐛 DEBUG: Log de los eventos devueltos
    console.log(`📊 [EVENTOS USUARIO PAGINADOS] Resultados:`);
    console.log(`  - Total eventos encontrados: ${totalItems}`);
    console.log(`  - Eventos en esta página: ${eventos.length}`);
    if (eventos.length > 0) {
      console.log(`  - Eventos devueltos:`);
      eventos.forEach((evento, index) => {
        const carreras = evento.eventos_carrera
          .map((ec) => ec.carrera.nom_car)
          .join(", ");
        console.log(
          `    ${index + 1}. ${evento.nom_eve} (Tipo: ${evento.tip_eve}) ${
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
        { nom_eve: { contains: search, mode: "insensitive" } },
        { des_eve: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por estado
    if (estado && estado !== "") {
      whereCondition.est_eve = estado;
    }

    // Filtro por tipo de evento
    if (tipo && tipo !== "") {
      whereCondition.tip_eve = tipo;
    }

    // Filtro por rango de fechas
    if (fechaDesde && fechaHasta) {
      whereCondition.fec_ini_eve = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    } else if (fechaDesde) {
      whereCondition.fec_ini_eve = {
        gte: new Date(fechaDesde),
      };
    } else if (fechaHasta) {
      whereCondition.fec_ini_eve = {
        lte: new Date(fechaHasta),
      };
    }

    // Filtro por carrera a través de eventos_carrera
    if (carrera && carrera !== "") {
      whereCondition.eventos_carrera = {
        some: {
          id_car_aso: carrera,
        },
      };
    }

    // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.mod_eve = modalidad;
    }

    // Filtro por capacidad (cupo máximo)
    if (capacidadMin || capacidadMax) {
      whereCondition.cup_max_eve = {};

      if (capacidadMin) {
        whereCondition.cup_max_eve.gte = parseInt(capacidadMin);
      }

      if (capacidadMax) {
        whereCondition.cup_max_eve.lte = parseInt(capacidadMax);
      }
    }

    // Filtro por valor del evento
    if (valorMin || valorMax) {
      whereCondition.val_eve = {};

      if (valorMin) {
        whereCondition.val_eve.gte = parseFloat(valorMin);
      }

      if (valorMax) {
        whereCondition.val_eve.lte = parseFloat(valorMax);
      }
    }

    // Ordenamiento (por defecto por fecha de creación descendente)
    const orderBy = extractSortParams(
      req,
      { field: "fec_cre_eve", direction: "desc" },
      [
        "fec_cre_eve",
        "fec_ini_eve",
        "fec_fin_eve",
        "nom_eve",
        "val_eve",
        "cup_max_eve",
      ]
    );

    // Ejecutar consultas en paralelo para datos y conteo
    const [eventos, totalItems] = await Promise.all([
      prisma.evento.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          eventos_carrera: {
            include: {
              carrera: true,
            },
          },
          cuenta: {
            include: {
              usuario: true,
            },
          },
          inscritos: {
            select: {
              id_ins: true,
            },
          },
        },
      }),
      prisma.evento.count({ where: whereCondition }),
    ]);

    // Añadir conteo de inscripciones a cada evento
    const eventosConMetadata = eventos.map((evento) => ({
      ...evento,
      inscripcionesCount: evento.inscritos.length,
      inscritos: undefined, // Remover el array original para no duplicar datos
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
};
