/**
 * Fuerza tenantId en filtros Prisma para evitar cruces entre tenants.
 */
const withTenantWhere = (tenantId, where = {}) => ({
  ...where,
  tenantId,
});

/**
 * Aplica tenantId al bloque where de cualquier parametro Prisma.
 */
const withTenantScope = (tenantId, params = {}) => ({
  ...params,
  where: withTenantWhere(tenantId, params.where),
});

const normalizeOrderBy = (orderBy) => {
  if (!orderBy || Array.isArray(orderBy) || typeof orderBy !== "object") {
    return orderBy;
  }

  const entries = Object.entries(orderBy);
  if (entries.length <= 1) {
    return orderBy;
  }

  return entries.map(([field, direction]) => ({ [field]: direction }));
};

/**
 * Aplica tenantId al bloque data de operaciones de escritura.
 */
const withTenantData = (tenantId, data = {}) => ({
  ...data,
  tenantId,
});

/**
 * Crea helpers scoped para operaciones seguras por tenant.
 * Nota: findUnique/update/delete por llave unica deben validarse caso a caso.
 */
const createTenantScoped = (prismaClient, tenantId) => ({
  findMany: (model, params = {}) =>
    prismaClient[model].findMany({
      ...withTenantScope(tenantId, params),
      orderBy: normalizeOrderBy(params.orderBy),
    }),
  findFirst: (model, params = {}) =>
    prismaClient[model].findFirst({
      ...withTenantScope(tenantId, params),
      orderBy: normalizeOrderBy(params.orderBy),
    }),
  count: (model, params = {}) =>
    prismaClient[model].count(withTenantScope(tenantId, params)),
  create: (model, params = {}) =>
    prismaClient[model].create({
      ...params,
      data: withTenantData(tenantId, params.data),
    }),
  createMany: (model, params = {}) => {
    const rows = Array.isArray(params.data)
      ? params.data.map((row) => withTenantData(tenantId, row))
      : [];
    return prismaClient[model].createMany({
      ...params,
      data: rows,
    });
  },
  updateMany: (model, params = {}) =>
    prismaClient[model].updateMany({
      ...params,
      where: withTenantWhere(tenantId, params.where),
    }),
  deleteMany: (model, params = {}) =>
    prismaClient[model].deleteMany({
      ...params,
      where: withTenantWhere(tenantId, params.where),
    }),
});

module.exports = {
  withTenantWhere,
  withTenantScope,
  withTenantData,
  createTenantScoped,
};
