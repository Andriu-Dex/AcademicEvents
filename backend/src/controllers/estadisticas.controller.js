const prisma = require("../config/db");

/**
 * Controlador para manejar estadísticas de la aplicación
 * @class EstadisticasController
 */
class EstadisticasController {
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
      const totalCarreras = await prisma.carrera.count({
        where: {
          est_car: true,
        },
      });

      // 2. Número de eventos activos (con inscripciones abiertas)
      const fechaActual = new Date();
      const eventosActivos = await prisma.evento.count({
        where: {
          est_eve: "ACTIVO",
          fec_fin_eve: {
            gte: fechaActual,
          },
        },
      });

      // 3. Número total de usuarios registrados (solo ESTUDIANTE y GENERAL)
      const totalUsuarios = await prisma.cuenta.count({
        where: {
          rol_usu: {
            in: ["ESTUDIANTE", "GENERAL"],
          },
        },
      });

      // 4. Tasa de participación real
      const usuariosConInscripciones = await prisma.inscripcion.groupBy({
        by: ["id_cor_ins"],
        _count: {
          id_cor_ins: true,
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
      const eventosCancelados = await prisma.evento.count({
        where: {
          est_eve: "CANCELADO",
        },
      });

      // 6. Eventos finalizados
      const eventosFinalizados = await prisma.evento.count({
        where: {
          est_eve: "FINALIZADO",
        },
      });

      // 7. Certificados emitidos
      const certificadosEmitidos = await prisma.certificado.count();

      // 8. Inscripciones activas
      const inscripcionesActivas = await prisma.inscripcion.count({
        where: {
          est_ins: {
            in: ["ACEPTADA", "PENDIENTE"],
          },
          evento: {
            est_eve: "ACTIVO",
            fec_fin_eve: {
              gte: fechaActual,
            },
          },
        },
      });

      // 9. Cupos disponibles en eventos activos
      const eventosActivosData = await prisma.evento.findMany({
        where: {
          est_eve: "ACTIVO",
          fec_fin_eve: {
            gte: fechaActual,
          },
        },
        select: {
          cup_dis_eve: true,
        },
      });

      const cuposDisponibles = eventosActivosData.reduce(
        (acc, evento) => acc + evento.cup_dis_eve,
        0
      );

      // 10. Eventos presenciales activos
      const eventosPresenciales = await prisma.evento.count({
        where: {
          est_eve: "ACTIVO",
          mod_eve: "PRESENCIAL",
          fec_fin_eve: {
            gte: fechaActual,
          },
        },
      });

      // 11. Eventos virtuales activos
      const eventosVirtuales = await prisma.evento.count({
        where: {
          est_eve: "ACTIVO",
          mod_eve: "VIRTUAL",
          fec_fin_eve: {
            gte: fechaActual,
          },
        },
      });

      // 12. Eventos destacados
      const eventosDestacados = await prisma.evento.count({
        where: {
          eve_des: true,
          est_eve: "ACTIVO",
          fec_fin_eve: {
            gte: fechaActual,
          },
        },
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
