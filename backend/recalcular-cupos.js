const prisma = require("./src/config/db");

async function recalcularTodosLosCupos() {
  try {
    console.log("🔄 Iniciando recálculo de cupos para todos los eventos...");
    
    // Obtener todos los eventos
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        cupo_max_eve: true,
        cupo_dis_eve: true
      }
    });

    console.log(`📊 Encontrados ${eventos.length} eventos`);

    for (const evento of eventos) {
      console.log(`\n🎯 Procesando: ${evento.nom_eve}`);
      console.log(`   Cupos antes: ${evento.cupo_dis_eve}/${evento.cupo_max_eve}`);
      
      // Contar inscripciones que realmente ocupan cupos (ACEPTADAS y FINALIZADAS)
      const inscripcionesOcupadas = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          est_ins: {
            in: ["ACEPTADA", "FINALIZADA"]
          }
        }
      });

      // Contar todas las inscripciones para debug
      const todasInscripciones = await prisma.inscripcion.findMany({
        where: { id_eve_ins: evento.id_eve },
        select: { est_ins: true }
      });

      const conteoEstados = todasInscripciones.reduce((acc, ins) => {
        acc[ins.est_ins] = (acc[ins.est_ins] || 0) + 1;
        return acc;
      }, {});

      console.log(`   Estados inscripciones:`, conteoEstados);
      console.log(`   Inscripciones que ocupan cupo: ${inscripcionesOcupadas}`);

      // Calcular cupos disponibles
      const cuposDisponiblesCorrectos = evento.cupo_max_eve - inscripcionesOcupadas;

      console.log(`   Cupos disponibles correctos: ${cuposDisponiblesCorrectos}`);

      // Actualizar si es diferente
      if (evento.cupo_dis_eve !== cuposDisponiblesCorrectos) {
        await prisma.evento.update({
          where: { id_eve: evento.id_eve },
          data: { cupo_dis_eve: cuposDisponiblesCorrectos }
        });
        console.log(`   ✅ Actualizado: ${evento.cupo_dis_eve} → ${cuposDisponiblesCorrectos}`);
      } else {
        console.log(`   ✅ Ya estaba correcto`);
      }
    }

    console.log("\n🎉 Recálculo completado exitosamente");
  } catch (error) {
    console.error("❌ Error durante el recálculo:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Conexión a base de datos cerrada");
  }
}

// Ejecutar inmediatamente
recalcularTodosLosCupos()
  .then(() => {
    console.log("✨ Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
