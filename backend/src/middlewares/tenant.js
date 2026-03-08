const { prisma } = require("../config/db");

/**
 * Middleware para extraer y validar el tenant ID de los headers de la request
 * En un sistema multi-tenant, cada request debe incluir el X-Tenant-ID header
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener tenant slug del header. En desarrollo, usar fallback para compatibilidad.
    const headerTenantSlug = req.headers["x-tenant-id"];
    const fallbackTenantSlug =
      process.env.DEFAULT_TENANT_SLUG ||
      (process.env.NODE_ENV !== "production" ? "uta" : null);
    const tenantSlug = headerTenantSlug || fallbackTenantSlug;

    if (!tenantSlug) {
      return res.status(400).json({
        msg: "X-Tenant-ID header es requerido",
      });
    }

    // Verificar que el tenant existe y está activo
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({
        msg: "Tenant no encontrado",
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        msg: "Tenant inactivo",
      });
    }

    // Agregar el tenant ID real (UUID) al request
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    next();
  } catch (error) {
    console.error("❌ [TENANT_MIDDLEWARE] Error:", error);
    return res.status(500).json({
      msg: "Error al verificar tenant",
    });
  }
};

module.exports = { tenantMiddleware };
