// Middleware para permitir acceso solo a usuarios con rol de administrador
const onlyAdmin = (req, res, next) => {
  // Verifica si el usuario está autenticado
  if (!req.usuario) {
    // Si no está autenticado, responde con un error 401 (No autorizado)
    return res.status(401).json({ msg: "No autenticado" });
  }

  // Verifica si el rol del usuario no es "ADMIN"
  if (req.usuario.rol_usu !== "ADMIN") {
    // Si el rol no es "ADMIN", responde con un error 403 (Prohibido)
    return res
      .status(403)
      .json({ msg: "Acceso denegado: solo administradores" });
  }

  // Si pasa las verificaciones, continúa con el siguiente middleware o controlador
  next();
};

// Exporta el middleware para que pueda ser utilizado en otras partes de la aplicación
module.exports = onlyAdmin;
