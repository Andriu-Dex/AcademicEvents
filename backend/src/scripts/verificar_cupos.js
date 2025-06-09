/**
 * Script para verificar la corrección de los cupos disponibles
 * Ejecutar con: node src/scripts/verificar_cupos.js
 */
const prisma = require("../config/db");

async function verificarCupos() {
  console.log("📊 Verificando cupos disponibles en todos los eventos...");

  try {
    // Obtener todos los eventos
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        cup_max_eve: true,
        cup_dis_eve: true,
      },
    });

    console.log(`\n🔍 Encontrados ${eventos.length} eventos para verificar\n`);

    let erroresEncontrados = 0;

    // Para cada evento, verificar si los cupos disponibles son correctos
    for (const evento of eventos) {
      // Contar inscripciones que deberían ocupar cupo (ACEPTADA y estados finales)
      const inscripcionesDeberianOcuparCupo = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
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
      });

      const inscripcionesOcupandoCupo = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          cup_ocu: true,
        },
      });

      // Calcular cupos disponibles correctos
      const cuposDisponiblesCalculados = Math.max(
        0,
        evento.cup_max_eve - inscripcionesOcupandoCupo
      );
      console.log(`\n📌 Evento: "${evento.nom_eve}"`);
      console.log(`- Cupo máximo: ${evento.cup_max_eve}`);
      console.log(`- Cupo disponible actual: ${evento.cup_dis_eve}`);
      console.log(
        `- Inscripciones que deberían ocupar cupo: ${inscripcionesDeberianOcuparCupo}`
      );
      console.log(
        `- Inscripciones ocupando cupo: ${inscripcionesOcupandoCupo}`
      );
      console.log(`- Cupo disponible calculado: ${cuposDisponiblesCalculados}`);

      // Verificar si hay discrepancia
      if (evento.cup_dis_eve !== cuposDisponiblesCalculados) {
        console.log(`❌ ERROR: Discrepancia en cupos disponibles!`);
        console.log(
          `   Actual: ${evento.cup_dis_eve}, Correcto: ${cuposDisponiblesCalculados}`
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
