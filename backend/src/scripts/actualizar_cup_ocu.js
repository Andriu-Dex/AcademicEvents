/**
 * Script para actualizar el campo cup_ocu en todas las inscripciones existentes
 * Ejecutar con: node src/scripts/actualizar_cup_ocu.js
 */
const { prisma } = require("../config/db");

async function actualizarOcupaCupo() {
  console.log(
    "📊 Iniciando actualización de campo cup_ocu en inscripciones existentes..."
  );

  try {
    // 1. Establecer occupiesSpot = false para todas las inscripciones
    await prisma.registration.updateMany({
      data: {
        occupiesSpot: false,
      },
    });
    console.log(
      "✅ Campo occupiesSpot establecido a FALSE en todas las inscripciones"
    ); // 2. Establecer occupiesSpot = true para inscripciones en estado ACCEPTED y estados finales
    const resultado = await prisma.registration.updateMany({
      where: {
        status: {
          in: [
            "ACCEPTED",
            "APROBADO",
            "REPROBADO_NOTA",
            "REPROBADO_ASISTENCIA",
            "REPROBADO_TOTAL",
          ],
        },
      },
      data: {
        occupiesSpot: true,
      },
    });
    console.log(
      `✅ Campo occupiesSpot establecido a TRUE en ${resultado.count} inscripciones (ACCEPTED y estados finales)`
    );

    // 3. Recalcular los cupos disponibles para todos los eventos
    const eventos = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        maxCapacity: true,
        availableSpots: true,
      },
    });
    console.log(`📊 Recalculando cupos para ${eventos.length} eventos...`);

    // 4. Para cada evento, contar inscripciones con occupiesSpot = true y actualizar availableSpots
    for (const evento of eventos) {
      const inscripcionesOcupandoCupo = await prisma.registration.count({
        where: {
          eventId: evento.id,
          occupiesSpot: true,
        },
      });

      const cuposDisponibles = Math.max(
        0,
        evento.maxCapacity - inscripcionesOcupandoCupo
      );

      if (evento.availableSpots !== cuposDisponibles) {
        await prisma.event.update({
          where: { id: evento.id },
          data: { availableSpots: cuposDisponibles },
        });
        console.log(
          `✅ Evento "${evento.name}": Cupos disponibles actualizados de ${evento.availableSpots} a ${cuposDisponibles}`
        );
      } else {
        console.log(
          `✓ Evento "${evento.name}": Cupos disponibles ya correctos (${cuposDisponibles})`
        );
      }
    }

    console.log("🎉 Actualización completada con éxito!");
    console.log(
      "📝 Los cupos disponibles ahora reflejan correctamente el número de inscripciones ACEPTADAS"
    );
  } catch (error) {
    console.error("❌ Error durante la actualización:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función principal
actualizarOcupaCupo().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
