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
    } = req.query;

    // Construir condición WHERE para filtros
    const whereCondition = {
      est_eve: "ACTIVO", // Solo eventos activos según el enum estado_evento
    };

    // Filtros por tipo de carrera a través de eventos_carrera
    if (software === "true") {
      whereCondition.eventos_carrera = {
        some: {
          carrera: {
            nom_car: {
              contains: "Software",
              mode: "insensitive",
            },
          },
        },
      };
    } else if (industrial === "true") {
      whereCondition.eventos_carrera = {
        some: {
          carrera: {
            nom_car: {
              contains: "Industrial",
              mode: "insensitive",
            },
          },
        },
      };
    }

    // Filtro por público - usando tip_eve PUBLICO
    if (publico === "true") {
      whereCondition.tip_eve = "PUBLICO";
    }

    // Filtros por precio
    if (gratuito === "true") {
      whereCondition.val_eve = 0;
    } else if (pagado === "true") {
      whereCondition.val_eve = {
        gt: 0,
      };
    }

    // Filtro por modalidad
    if (modalidad && modalidad !== "") {
      whereCondition.mod_eve = modalidad;
    }

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      whereCondition.OR = [
        { nom_eve: { contains: search, mode: "insensitive" } },
        { des_eve: { contains: search, mode: "insensitive" } },
      ];
    }

    // Ordenamiento (por defecto por fecha de inicio descendente)
    const orderBy = extractSortParams(
      req,
      { field: "fec_ini_eve", direction: "desc" },
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
    const { page, limit, offset } = extractPaginationParams(req);

    // Extraer filtros
    const { carrera, modalidad, estado, gratuito, pagado, search } = req.query;

    // Construir condición WHERE para filtros
    const whereCondition = {};

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

    // Filtro por estado
    if (estado && estado !== "") {
      whereCondition.est_eve = estado;
    }

    // Filtros por precio
    if (gratuito === "true") {
      whereCondition.val_eve = 0;
    } else if (pagado === "true") {
      whereCondition.val_eve = {
        gt: 0,
      };
    }

    // Búsqueda por nombre o descripción
    if (search && search.trim() !== "") {
      whereCondition.OR = [
        { nom_eve: { contains: search, mode: "insensitive" } },
        { des_eve: { contains: search, mode: "insensitive" } },
      ];
    }

    // Ordenamiento (por defecto por fecha de inicio descendente)
    const orderBy = extractSortParams(
      req,
      { field: "fec_ini_eve", direction: "desc" },
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
