const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corregirCuposInconsistentes() {
  console.log('🔧 Iniciando corrección de cupos inconsistentes...\n');

  try {
    // Obtener todos los eventos
    const eventos = await prisma.evento.findMany({
      select: {
        id_eve: true,
        nom_eve: true,
        cupo_max_eve: true,
        cupo_dis_eve: true
      }
    });

    console.log(`📊 Total de eventos encontrados: ${eventos.length}\n`);

    let eventosCorregidos = 0;
    let eventosConsistentes = 0;

    for (const evento of eventos) {
      // Contar inscripciones aceptadas para este evento
      const inscripcionesAceptadas = await prisma.inscripcion.count({
        where: {
          id_eve_ins: evento.id_eve,
          est_ins: 'ACEPTADA'
        }
      });

      const cupoMaximo = evento.cupo_max_eve;
      const cupoDisponibleActual = evento.cupo_dis_eve;
      const cupoDisponibleCorrecto = Math.max(0, cupoMaximo - inscripcionesAceptadas);

      // Verificar si hay inconsistencia
      if (cupoDisponibleActual !== cupoDisponibleCorrecto) {
        console.log(`🔍 INCONSISTENCIA DETECTADA en evento "${evento.nom_eve}" (ID: ${evento.id_eve}):`);
        console.log(`   - Cupo máximo: ${cupoMaximo}`);
        console.log(`   - Inscripciones aceptadas: ${inscripcionesAceptadas}`);
        console.log(`   - Cupo disponible actual (incorrecto): ${cupoDisponibleActual}`);
        console.log(`   - Cupo disponible correcto: ${cupoDisponibleCorrecto}`);

        // Corregir en la base de datos
        await prisma.evento.update({
          where: { id_eve: evento.id_eve },
          data: { cupo_dis_eve: cupoDisponibleCorrecto }
        });

        console.log(`   ✅ CORREGIDO: Actualizado de ${cupoDisponibleActual} a ${cupoDisponibleCorrecto}\n`);
        eventosCorregidos++;
      } else {
        eventosConsistentes++;
        console.log(`✅ Evento "${evento.nom_eve}" está correcto (${cupoDisponibleActual}/${cupoMaximo})`);
      }
    }

    console.log('\n📈 RESUMEN DE CORRECCIÓN:');
    console.log(`   - Eventos consistentes: ${eventosConsistentes}`);
    console.log(`   - Eventos corregidos: ${eventosCorregidos}`);
    console.log(`   - Total procesados: ${eventos.length}`);

    if (eventosCorregidos > 0) {
      console.log('\n🎉 ¡Corrección completada exitosamente!');
    } else {
      console.log('\n✨ Todos los eventos ya tenían cupos consistentes.');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  corregirCuposInconsistentes();
}

module.exports = { corregirCuposInconsistentes };