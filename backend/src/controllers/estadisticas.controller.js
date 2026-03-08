// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const { prisma } = require("../config/db");

/**
 * Controlador para manejar estadísticas de la aplicación
 * @class EstadisticasController
 */
class EstadisticasController {
  static tenantWhere(req, extra = {}) {
    if (req.tenantId) {
      return { tenantId: req.tenantId, ...extra };
    }
    return extra;
  }

  /**
   * Obtiene estadísticas para el Home
   * @static
   * @async
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Estadísticas formateadas para mostrar en el Home
   */
  static async obtenerEstadisticasHome(req, res) {
    try {
      // 1. Número total de carreras activas
      const totalCarreras = await prisma.career.count({
        where: EstadisticasController.tenantWhere(req, { isActive: true }),
      });

      // 2. Número de eventos activos (con inscripciones abiertas)
      const fechaActual = new Date();
      const eventosActivos = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          status: "ACTIVE",
          endDate: {
            gte: fechaActual,
          },
        }),
      });

      // 3. Número total de usuarios registrados (solo ESTUDIANTE y GENERAL)
      const totalUsuarios = await prisma.account.count({
        where: EstadisticasController.tenantWhere(req, {
          role: {
            in: ["STUDENT", "GENERAL"],
          },
        }),
      });

      // 4. Tasa de participación real
      const usuariosConInscripciones = await prisma.registration.groupBy({
        by: ["accountId"],
        where: EstadisticasController.tenantWhere(req),
        _count: {
          accountId: true,
        },
      });

      const totalUsuariosParticipantes = usuariosConInscripciones.length;
      let tasaParticipacion = 0;
      if (totalUsuarios > 0) {
        tasaParticipacion = Math.round(
          (totalUsuariosParticipantes / totalUsuarios) * 100
        );
      }

      // 5. Eventos cancelados
      const eventosCancelados = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          status: "CANCELLED",
        }),
      });

      // 6. Eventos finalizados
      const eventosFinalizados = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          status: "FINISHED",
        }),
      });

      // 7. Certificados emitidos
      const certificadosEmitidos = await prisma.certificate.count({
        where: EstadisticasController.tenantWhere(req),
      });

      // 8. Inscripciones activas
      const inscripcionesActivas = await prisma.registration.count({
        where: EstadisticasController.tenantWhere(req, {
          status: {
            in: ["ACCEPTED", "PENDING"],
          },
          event: {
            status: "ACTIVE",
            endDate: {
              gte: fechaActual,
            },
          },
        }),
      });

      // 9. Cupos disponibles en eventos activos
      const eventosActivosData = await prisma.event.findMany({
        where: EstadisticasController.tenantWhere(req, {
          status: "ACTIVE",
          endDate: {
            gte: fechaActual,
          },
        }),
        select: {
          availableSpots: true,
        },
      });

      const cuposDisponibles = eventosActivosData.reduce(
        (acc, evento) => acc + evento.availableSpots,
        0
      );

      // 10. Eventos presenciales activos
      const eventosPresenciales = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          status: "ACTIVE",
          modality: "IN_PERSON",
          endDate: {
            gte: fechaActual,
          },
        }),
      });

      // 11. Eventos virtuales activos
      const eventosVirtuales = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          status: "ACTIVE",
          modality: "VIRTUAL",
          endDate: {
            gte: fechaActual,
          },
        }),
      });

      // 12. Eventos destacados
      const eventosDestacados = await prisma.event.count({
        where: EstadisticasController.tenantWhere(req, {
          isFeatured: true,
          status: "ACTIVE",
          endDate: {
            gte: fechaActual,
          },
        }),
      });

      // Objeto con todas las estadísticas disponibles
      const todasEstadisticas = {
        // Estadísticas originales
        carreras: totalCarreras,
        eventosActivos: eventosActivos,
        usuariosRegistrados: totalUsuarios,
        tasaParticipacion: `${tasaParticipacion}%`,

        // Nuevas estadísticas
        eventosCancelados: eventosCancelados,
        eventosFinalizados: eventosFinalizados,
        certificadosEmitidos: certificadosEmitidos,
        inscripcionesActivas: inscripcionesActivas,
        cuposDisponibles: cuposDisponibles,
        eventosPresenciales: eventosPresenciales,
        eventosVirtuales: eventosVirtuales,
        eventosDestacados: eventosDestacados,
      };

      // Obtener la configuración de estadísticas activas
      // Por ahora, devolvemos todas las estadísticas
      // Cuando implementemos la tabla de configuración, filtraremos según las seleccionadas

      res.status(200).json(todasEstadisticas);
    } catch (error) {
      console.error("Error al obtener estadísticas del home:", error);
      res.status(500).json({
        msg: "Error al obtener estadísticas",
        error: error.message,
      });
    }
  }
}

module.exports = {
  obtenerEstadisticasHome: EstadisticasController.obtenerEstadisticasHome,
};
