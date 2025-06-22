/**
 * Utilidades para la paginación en el backend
 */

/**
 * Extrae y normaliza parámetros de paginación de una solicitud HTTP
 * @param {Object} req - Objeto de solicitud de Express
 * @returns {Object} Objeto con parámetros de paginación normalizados
 */
const extractPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Construye una respuesta paginada con metadatos
 * @param {Array} data - Datos a paginar
 * @param {number} totalItems - Total de elementos
 * @param {Object} paginationParams - Parámetros de paginación (page, limit)
 * @returns {Object} Respuesta con datos y metadatos de paginación
 */
const buildPaginatedResponse = (data, totalItems, { page, limit }) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Procesa parámetros de ordenamiento de una solicitud HTTP
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} defaultOrder - Ordenamiento por defecto {field: 'createdAt', direction: 'desc'}
 * @param {Array} allowedFields - Campos permitidos para ordenar
 * @returns {Object} Objeto de ordenamiento para Prisma
 */
const extractSortParams = (
  req,
  defaultOrder = { field: "createdAt", direction: "desc" },
  allowedFields = []
) => {
  const { sortBy, sortOrder } = req.query;

  // Si no se proporciona campo o no está permitido, usar default
  const field =
    sortBy && allowedFields.includes(sortBy) ? sortBy : defaultOrder.field;

  // Validar dirección (asc/desc)
  const direction =
    sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : defaultOrder.direction;

  // Construir objeto de ordenamiento para Prisma
  return { [field]: direction };
};

module.exports = {
  extractPaginationParams,
  buildPaginatedResponse,
  extractSortParams,
};
