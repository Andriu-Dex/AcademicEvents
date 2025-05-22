const prisma = require("../config/db");

// Middleware para verificar si el usuario autenticado es el dueño del certificado
const verificarPropietarioCertificado = async (req, res, next) => {
  const idInscripcion = req.params.id;

  try {
    // Buscar la inscripción con el ID recibido en la URL
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: idInscripcion },
    });

    // Si no existe la inscripción, retornar error 404
    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Validar que el ID del usuario autenticado coincida con el de la inscripción
    if (req.usuario.id !== inscripcion.id_usu) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para acceder a este certificado" });
    }

    // Si pasa la verificación, continuar con la siguiente función
    next();
  } catch (error) {
    res.status(500).json({
      msg: "Error al verificar propiedad del certificado",
      error: error.message,
    });
  }
};

module.exports = verificarPropietarioCertificado;
