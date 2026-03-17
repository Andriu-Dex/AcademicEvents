const jwt = require("jsonwebtoken");

/**
 * Middleware que valida el token JWT en la cabecera Authorization
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validación básica del header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Token no proporcionado o formato incorrecto:", authHeader);
    return res.status(401).json({ msg: "⛔ Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificación del token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si el token ya trae tenant, validar que coincide con el tenant resuelto.
    // Tokens legacy sin tenantId se permiten temporalmente por compatibilidad.
    if (req.tenantId && decoded.tenantId && decoded.tenantId !== req.tenantId) {
      return res.status(403).json({ msg: "⛔ Token no válido para este tenant" });
    }

    if (
      req.tenantSlug &&
      decoded.tenantSlug &&
      decoded.tenantSlug !== req.tenantSlug
    ) {
      return res.status(403).json({ msg: "⛔ Token no válido para este tenant" });
    }

    // Se guarda el payload en el request para uso posterior
    req.usuario = decoded;
    next();
  } catch (error) {
    // Token inválido o expirado
    console.log("❌ Error verificando token:", error.message);
    return res.status(401).json({ msg: "⛔ Token inválido" });
  }
};

module.exports = verificarToken;
