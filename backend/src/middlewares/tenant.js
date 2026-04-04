const { prisma } = require("../config/db");
const jwt = require("jsonwebtoken");
const net = require("node:net");

const RESERVED_SUBDOMAINS = new Set(["localhost", "www", "api"]);

const normalizeSlug = (value) => {
  if (!value || typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return slug.length > 0 ? slug : null;
};

const resolveFromSubdomain = (hostname) => {
  if (!hostname || typeof hostname !== "string") return null;
  const host = hostname.split(":")[0].toLowerCase();

  // Si el host es una IP (p.ej. 192.168.x.x), no hay subdominio real.
  // Esto evita que se interprete "192" como tenantSlug y falle en LAN.
  if (net.isIP(host)) return null;

  const [subdomain] = host.split(".");
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
};

const resolveFromJwt = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return { tenantSlug: null, tenantId: null };
  }

  const [, token] = authorizationHeader.match(/^Bearer\s+(.+)$/i) || [];
  if (!token || !process.env.JWT_SECRET) {
    return { tenantSlug: null, tenantId: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      tenantSlug: normalizeSlug(decoded.tenantSlug),
      tenantId: decoded.tenantId || null,
    };
  } catch {
    return { tenantSlug: null, tenantId: null };
  }
};

/**
 * Middleware para extraer y validar el tenant ID de los headers de la request
 * En un sistema multi-tenant, cada request debe incluir el X-Tenant-ID header
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Estrategia 1: Header explicito (desarrollo/testing)
    const headerTenantSlug = normalizeSlug(req.headers["x-tenant-id"]);

    // Estrategia 2: Subdominio (produccion)
    const subdomainTenantSlug = resolveFromSubdomain(req.hostname);

    // Estrategia 3: JWT (cuando el token trae tenant)
    const { tenantSlug: jwtTenantSlug, tenantId: jwtTenantId } = resolveFromJwt(
      req.headers.authorization
    );

    // Estrategia 4: fallback de entorno para local
    const fallbackTenantSlug =
      process.env.DEFAULT_TENANT_SLUG ||
      (process.env.NODE_ENV !== "production" ? "uta" : null);

    const tenantSlug =
      headerTenantSlug || subdomainTenantSlug || jwtTenantSlug || fallbackTenantSlug;

    if (!tenantSlug && !jwtTenantId) {
      return res.status(400).json({
        error: "TENANT_HEADER_REQUIRED",
        msg: "X-Tenant-ID header es requerido",
      });
    }

    // Cargar tenant por slug (prioridad alta) o por id del token (fallback)
    const tenantLookup = {
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        primaryColor: true,
        logoUrl: true,
      },
    };

    const tenant = tenantSlug
      ? await prisma.tenant.findUnique({
          ...tenantLookup,
          where: { slug: tenantSlug },
        })
      : await prisma.tenant.findUnique({
          ...tenantLookup,
          where: { id: jwtTenantId },
        });

    if (!tenant) {
      return res.status(404).json({
        error: "TENANT_NOT_FOUND",
        msg: "Tenant no encontrado",
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        error: "TENANT_INACTIVE",
        msg: "Tenant inactivo",
      });
    }

    // Agregar tenant cargado al request
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    // Exponer tenant resuelto para trazabilidad en clientes/proxies
    res.setHeader("X-Tenant-Slug", tenant.slug);

    next();
  } catch (error) {
    console.error("❌ [TENANT_MIDDLEWARE] Error:", error);
    return res.status(500).json({
      msg: "Error al verificar tenant",
    });
  }
};

module.exports = { tenantMiddleware };
