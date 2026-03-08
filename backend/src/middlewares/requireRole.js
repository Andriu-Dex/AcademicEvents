/**
 * Middleware para verificar roles de usuario
 * @module middlewares/requireRole
 */

/**
 * Verifica si el usuario tiene uno de los roles especificados
 * @param {Array} roles - Array de roles permitidos
 * @returns {Function} Middleware de Express
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.usuario.rol_usu)) {
      return res.status(403).json({
        error: "No autorizado",
        mensaje:
          "No tienes los permisos necesarios para acceder a este recurso",
      });
    }

    // Si todo está bien, continuar
    next();
  };
};

module.exports = requireRole;
