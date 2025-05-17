const jwt = require("jsonwebtoken");

/**
 * Middleware que valida el token JWT en la cabecera Authorization
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validación básica del header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "⛔ Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificación del token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se guarda el payload en el request para uso posterior
    req.usuario = decoded;
    next();
  } catch (error) {
    // Token inválido o expirado
    return res.status(401).json({ msg: "⛔ Token inválido" });
  }
};

module.exports = verificarToken;
