const prisma = require("../config/db");

// Middleware para verificar si el usuario autenticado es el dueño del certificado
const verificarPropietarioCertificado = async (req, res, next) => {
  const idInscripcion = req.params.id;
  try {
    console.log("🔍 Verificando certificado para inscripción:", idInscripcion);
    console.log("👤 Usuario autenticado:", req.usuario);

    // Buscar la inscripción con el ID recibido en la URL y sus relaciones
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id_ins: idInscripcion },
      include: {
        cuenta: true,
      },
    });

    console.log("📝 Inscripción encontrada:", inscripcion);

    // Si no existe la inscripción, retornar error 404
    if (!inscripcion) {
      console.log("❌ Inscripción no encontrada");
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }
    console.log("🔄 Comparando IDs:");
    console.log("ID Usuario Auth:", req.usuario.id);
    console.log("ID Cuenta Inscripción:", inscripcion.id_cor_ins);
    console.log("Rol Usuario:", req.usuario.rol_usu);

    // Validar que el ID del usuario autenticado coincida con el id_cor_ins de la inscripción
    const esAdmin =
      req.usuario.rol_usu === "ADMIN_GLOBAL" ||
      req.usuario.rol_usu === "ADMIN_GENERAL";
    const esPropietario = req.usuario.id === inscripcion.id_cor_ins;

    console.log("¿Es admin?", esAdmin);
    console.log("¿Es propietario?", esPropietario);

    if (!esPropietario && !esAdmin) {
      console.log("❌ Acceso denegado: No es propietario ni administrador");
      return res
        .status(403)
        .json({ msg: "No tienes permiso para acceder a este certificado" });
    }

    // Si pasa la verificación, continuar con la siguiente función
    next();
  } catch (error) {
    console.error("Error al verificar propiedad del certificado:", error);
    res.status(500).json({
      msg: "Error al verificar propiedad del certificado",
      error: error.message,
    });
  }
};

module.exports = verificarPropietarioCertificado;
