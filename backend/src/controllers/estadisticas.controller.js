// Importamos la instancia de Prisma desde el archivo de configuración de la base de datos
const prisma = require("../config/db");

// ============================
// Obtener estadísticas para el Home
// ============================
const obtenerEstadisticasHome = async (req, res) => {
  try {
    console.log("📊 Calculando estadísticas del home...");

    // 1. Número total de carreras activas (est_car es Boolean, no String)
    const totalCarreras = await prisma.carrera.count({
      where: {
        est_car: true, // Boolean true en lugar de "ACTIVO"
      },
    });
    console.log("🎓 Carreras activas:", totalCarreras);

    // 2. Número de eventos activos (con inscripciones abiertas)
    const fechaActual = new Date();
    console.log("📅 Fecha actual:", fechaActual);
    const eventosActivos = await prisma.evento.count({
      where: {
        est_eve: "ACTIVO",
        fec_fin_eve: {
          gte: fechaActual,
        },
      },
    });
    console.log("📅 Eventos activos:", eventosActivos);

    // 3. Número total de usuarios registrados (solo ESTUDIANTE y GENERAL)
    // Los roles están en la tabla cuenta, no en usuario
    const totalUsuarios = await prisma.cuenta.count({
      where: {
        rol_usu: {
          in: ["ESTUDIANTE", "GENERAL"],
        },
      },
    });
    console.log("👥 Usuarios ESTUDIANTE/GENERAL:", totalUsuarios);

    // 4. Tasa de participación (inscripciones / eventos totales * 100)
    const totalEventos = await prisma.evento.count({
      where: {
        est_eve: "ACTIVO",
      },
    });

    const totalInscripciones = await prisma.inscripcion.count();
    console.log("📊 Total eventos:", totalEventos);
    console.log("📊 Total inscripciones:", totalInscripciones);

    // Calcular tasa de participación
    let tasaParticipacion = 0;
    if (totalEventos > 0) {
      tasaParticipacion = Math.round((totalInscripciones / totalEventos) * 100);
    } // Formatear los números para mostrarlos más atractivos
    const estadisticas = {
      carreras: totalCarreras,
      eventosActivos: eventosActivos,
      usuariosRegistrados: totalUsuarios,
      tasaParticipacion: `${tasaParticipacion}%`,
    };

    res.status(200).json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas del home:", error);
    res.status(500).json({
      msg: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerEstadisticasHome,
};
