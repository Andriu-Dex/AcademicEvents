const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/auth");
const onlyAdmin = require("../middlewares/autorizacion/onlyAdmin");
const { upload } = require("../middlewares/upload");

const {
  crearEvento,
  obtenerEventos,
  actualizarEvento,
  eliminarEvento,
  obtenerEventoPorId,
  obtenerEventosPorTipo,
} = require("../controllers/evento.controller");

// ============================
// Rutas para gestión de eventos
// ============================

// Obtener todos los eventos (público)
router.get("/eventos", obtenerEventos);

// Obtener un evento por ID (público)
router.get("/eventos/:id", obtenerEventoPorId);

// Crear un nuevo evento (solo admin)
router.post(
  "/eventos",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  crearEvento
);

// Actualizar evento (solo admin)
router.put(
  "/eventos/:id",
  verificarToken,
  onlyAdmin,
  upload.single("img_por_eve"),
  actualizarEvento
);
// Eliminar evento (solo admin)
router.delete("/eventos/:id", verificarToken, onlyAdmin, eliminarEvento);

// Obtener eventos por tipo (público)
router.get("/eventos/tipo/:tipo", obtenerEventosPorTipo);

// Ruta de prueba para verificar cupos de eventos
router.get("/test-cupos", async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        cupo_max_eve: true,
        cupo_dis_eve: true,
        _count: {
          select: {
            inscripciones: {
              where: {
                est_ins: {
                  in: ["PENDIENTE", "ACEPTADA", "FINALIZADA"],
                },
              },
            },
          },
        },
      },
      take: 5, // Solo los primeros 5 eventos para prueba
    });

    const resumen = eventos.map((evento) => ({
      id: evento.id_eve,
      nombre: evento.nom_eve,
      cupo_maximo: evento.cupo_max_eve,
      cupo_disponible: evento.cupo_dis_eve,
      inscripciones_activas: evento._count.inscripciones,
      cupo_calculado: evento.cupo_max_eve - evento._count.inscripciones,
    }));

    res.json({
      msg: "✅ Sistema de cupos funcionando",
      eventos: resumen,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al verificar cupos",
      error: error.message,
    });
  }
});

module.exports = router;
