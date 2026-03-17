const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");

const {
  obtenerInscripcionesPorEvento,
  validarInscripcion,
  obtenerTodasLasInscripciones,
  obtenerInscripcionesPaginadas,
  obtenerInscripcionesPorEventoPaginadas,
} = require("../controllers/inscripcion.controller");

const { obtenerCarreras } = require("../controllers/carrera.controller");
const adminController = require("../controllers/admin.controller");

function requireGlobalAdmin(req, res, next) {
  if (!["ADMIN_GLOBAL", "GLOBAL_ADMIN"].includes(req.usuario.rol_usu)) {
    return res.status(403).json({
      error: "No autorizado",
      mensaje:
        "Solo los Super Administradores pueden ejecutar esta operación",
    });
  }

  next();
}

// Ruta para obtener todas las carreras (necesaria para reportes)
router.get("/carreras", verificarToken, onlyAdmin, obtenerCarreras);

// Ruta para obtener todas las inscripciones
router.get(
  "/inscripciones",
  verificarToken,
  onlyAdmin,
  obtenerTodasLasInscripciones
);

// Ruta para obtener inscripciones paginadas
router.get(
  "/inscripciones-paginadas",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPaginadas
);

router.get(
  "/inscripciones/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEvento
);

// Ruta para obtener inscripciones por evento paginadas
router.get(
  "/inscripciones-paginadas/evento/:id",
  verificarToken,
  onlyAdmin,
  obtenerInscripcionesPorEventoPaginadas
);

router.put(
  "/inscripciones/validar/:id",
  verificarToken,
  onlyAdmin,
  validarInscripcion
);

// Nuevas rutas para gestión de administradores
// Solo usuarios con rol ADMIN_GLOBAL pueden acceder

/**
 * @route POST /api/admin/create-admin
 * @desc Crea un nuevo administrador con correo verificado
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.post(
  "/create-admin",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.crearAdmin
);

/**
 * @route GET /api/admin/list-admins
 * @desc Obtiene la lista de todos los administradores
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.get(
  "/list-admins",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.listarAdmins
);

/**
 * @route GET /api/admin/list-admins-paginados
 * @desc Obtiene la lista de administradores con paginación
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.get(
  "/list-admins-paginados",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.listarAdminsPaginados
);

/**
 * @route GET /api/admin/list-users-paginados
 * @desc Obtiene la lista de usuarios no administrativos con paginación
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.get(
  "/list-users-paginados",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.listarUsuariosPaginados
);

/**
 * @route PUT /api/admin/accounts/:id
 * @desc Actualiza una cuenta existente de usuario o administrador
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.put(
  "/accounts/:id",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.actualizarCuenta
);

/**
 * @route PATCH /api/admin/accounts/:id/block
 * @desc Bloquea una cuenta con motivo obligatorio
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.patch(
  "/accounts/:id/block",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.bloquearCuenta
);

/**
 * @route PATCH /api/admin/accounts/:id/unblock
 * @desc Desbloquea una cuenta con motivo obligatorio
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.patch(
  "/accounts/:id/unblock",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.desbloquearCuenta
);

/**
 * @route DELETE /api/admin/accounts/:id
 * @desc Elimina una cuenta existente de usuario o administrador
 * @access Privado - Solo ADMIN_GLOBAL
 */
router.delete(
  "/accounts/:id",
  verificarToken,
  onlyAdmin,
  requireGlobalAdmin,
  adminController.eliminarCuenta
);

module.exports = router;
