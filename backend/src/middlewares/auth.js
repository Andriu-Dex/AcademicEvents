const jwt = require("jsonwebtoken");

/**
 * Middleware que valida el token JWT en la cabecera Authorization
 */
const verificarToken = (req, res, next) => {
  console.log("🔍 Verificando token para ruta:", req.originalUrl);
  const authHeader = req.headers.authorization;

  // Validación básica del header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Token no proporcionado o formato incorrecto:", authHeader);
    return res.status(401).json({ msg: "⛔ Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 Token encontrado:", token.substring(0, 15) + "...");

  try {
    // Verificación del token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token válido para usuario:", decoded.id, decoded.rol_usu);

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
