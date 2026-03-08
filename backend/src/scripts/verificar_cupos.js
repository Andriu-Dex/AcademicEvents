/**
 * Script para verificar la corrección de los cupos disponibles
 * Ejecutar con: node src/scripts/verificar_cupos.js
 */
const { prisma } = require("../config/db");

async function verificarCupos() {
  console.log("📊 Verificando cupos disponibles en todos los eventos...");

  try {
    // Obtener todos los eventos
    const eventos = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        maxCapacity: true,
        availableSpots: true,
      },
    });

    console.log(`\n🔍 Encontrados ${eventos.length} eventos para verificar\n`);

    let erroresEncontrados = 0;

    // Para cada evento, verificar si los cupos disponibles son correctos
    for (const evento of eventos) {
      // Contar inscripciones que deberían ocupar cupo (ACEPTADA y estados finales)
      const inscripcionesDeberianOcuparCupo = await prisma.registration.count({
        where: {
          eventId: evento.id,
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
      });

      const inscripcionesOcupandoCupo = await prisma.registration.count({
        where: {
          eventId: evento.id,
          occupiesSpot: true,
        },
      });

      // Calcular cupos disponibles correctos
      const cuposDisponiblesCalculados = Math.max(
        0,
        evento.maxCapacity - inscripcionesOcupandoCupo
      );
      console.log(`\n📌 Evento: "${evento.name}"`);
      console.log(`- Cupo máximo: ${evento.maxCapacity}`);
      console.log(`- Cupo disponible actual: ${evento.availableSpots}`);
      console.log(
        `- Inscripciones que deberían ocupar cupo: ${inscripcionesDeberianOcuparCupo}`
      );
      console.log(
        `- Inscripciones ocupando cupo: ${inscripcionesOcupandoCupo}`
      );
      console.log(`- Cupo disponible calculado: ${cuposDisponiblesCalculados}`);

      // Verificar si hay discrepancia
      if (evento.availableSpots !== cuposDisponiblesCalculados) {
        console.log(`❌ ERROR: Discrepancia en cupos disponibles!`);
        console.log(
          `   Actual: ${evento.availableSpots}, Correcto: ${cuposDisponiblesCalculados}`
        );
        erroresEncontrados++;
      } else {
        console.log(`✅ CORRECTO: Cupos disponibles coinciden con el cálculo`);
      }
    }

    console.log("\n🧮 RESULTADOS DE LA VERIFICACIÓN:");

    if (erroresEncontrados === 0) {
      console.log(
        "✅ TODOS LOS EVENTOS TIENEN CUPOS CORRECTOS! El problema ha sido resuelto."
      );
    } else {
      console.log(
        `❌ SE ENCONTRARON ${erroresEncontrados} EVENTOS CON DISCREPANCIAS EN CUPOS.`
      );
      console.log(
        "   Ejecuta 'node src/scripts/actualizar_cup_ocu.js' para corregirlos."
      );
    }
  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función principal
verificarCupos().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
