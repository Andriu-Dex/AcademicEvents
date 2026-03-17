// Middleware para permitir acceso solo a usuarios con rol de administrador
const onlyAdmin = (req, res, next) => {
  // Verifica si el usuario está autenticado
  if (!req.usuario) {
    // Si no está autenticado, responde con un error 401 (No autorizado)
    return res.status(401).json({ msg: "No autenticado" });
  }

  const role = req.usuario.role || req.usuario.rol_usu;

  // Verifica si el rol del usuario no es administrador
  if (
    ![
      "ADMIN_GLOBAL",
      "ADMIN_GENERAL",
      "GLOBAL_ADMIN",
      "GENERAL_ADMIN",
    ].includes(role)
  ) {
    // Si el rol no es administrador, responde con un error 403 (Prohibido)
    return res
      .status(403)
      .json({ msg: "Acceso denegado: solo administradores" });
  }

  // Si pasa las verificaciones, continúa con el siguiente middleware o controlador
  next();
};

// Exporta el middleware para que pueda ser utilizado en otras partes de la aplicación
module.exports = onlyAdmin;
