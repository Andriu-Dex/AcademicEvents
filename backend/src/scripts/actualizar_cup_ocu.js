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
    // 1. Establecer cup_ocu = false para todas las inscripciones
    await prisma.inscripcion.updateMany({
      data: {
        cup_ocu: false,
      },
    });
    console.log(
      "✅ Campo cup_ocu establecido a FALSE en todas las inscripciones"
    ); // 2. Establecer cup_ocu = true para inscripciones en estado ACEPTADA y estados finales
    const resultado = await prisma.inscripcion.updateMany({
      where: {
        est_ins: {
          in: [
            "ACEPTADA",
            "APROBADO",
            "REPROBADO_NOTA",
            "REPROBADO_ASISTENCIA",
            "REPROBADO_TOTAL",
          ],
        },
      },
      data: {
        cup_ocu: true,
      },
    });
    console.log(
      `✅ Campo cup_ocu establecido a TRUE en ${resultado.count} inscripciones (ACEPTADA y estados finales)`
    );

    // 3. Recalcular los cupos disponibles para todos los eventos
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        cup_max_eve: true,
        cup_dis_eve: true,
      },
    });
    console.log(`📊 Recalculando cupos para ${eventos.length} eventos...`);

    // 4. Para cada evento, contar inscripciones con cup_ocu = true y actualizar cup_dis_eve
    for (const evento of eventos) {
      const inscripcionesOcupandoCupo = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          cup_ocu: true,
        },
      });

      const cuposDisponibles = Math.max(
        0,
        evento.cup_max_eve - inscripcionesOcupandoCupo
      );

      if (evento.cup_dis_eve !== cuposDisponibles) {
        await prisma.evento.update({
          where: { id_eve: evento.id_eve },
          data: { cup_dis_eve: cuposDisponibles },
        });
        console.log(
          `✅ Evento "${evento.nom_eve}": Cupos disponibles actualizados de ${evento.cup_dis_eve} a ${cuposDisponibles}`
        );
      } else {
        console.log(
          `✓ Evento "${evento.nom_eve}": Cupos disponibles ya correctos (${cuposDisponibles})`
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
