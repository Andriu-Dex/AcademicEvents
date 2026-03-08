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
  (req, res, next) => {
    // Verificar que el usuario sea ADMIN_GLOBAL
    if (!["ADMIN_GLOBAL", "GLOBAL_ADMIN"].includes(req.usuario.rol_usu)) {
      return res.status(403).json({
        error: "No autorizado",
        mensaje:
          "Solo los Super Administradores pueden crear otros administradores",
      });
    }
    next();
  },
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
  (req, res, next) => {
    // Verificar que el usuario sea ADMIN_GLOBAL
    if (!["ADMIN_GLOBAL", "GLOBAL_ADMIN"].includes(req.usuario.rol_usu)) {
      return res.status(403).json({
        error: "No autorizado",
        mensaje:
          "Solo los Super Administradores pueden ver la lista de administradores",
      });
    }
    next();
  },
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
  (req, res, next) => {
    // Verificar que el usuario sea ADMIN_GLOBAL
    if (!["ADMIN_GLOBAL", "GLOBAL_ADMIN"].includes(req.usuario.rol_usu)) {
      return res.status(403).json({
        error: "No autorizado",
        mensaje:
          "Solo los Super Administradores pueden ver la lista de administradores",
      });
    }
    next();
  },
  adminController.listarAdminsPaginados
);

module.exports = router;
