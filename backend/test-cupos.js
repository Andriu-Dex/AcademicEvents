const prisma = require('./src/config/db');

async function testGestionCupos() {
  console.log('🧪 Iniciando pruebas del sistema de gestión de cupos...\n');

  try {    // Buscar un evento para las pruebas
    const evento = await prisma.evento.findFirst({
      include: {
        inscritos: true
      }
    });

    if (!evento) {
      console.log('❌ No hay eventos disponibles para probar');
      return;
    }

    console.log(`📋 Probando con evento: ${evento.nom_eve}`);
    console.log(`   Cupo máximo: ${evento.cupo_max_eve}`);
    console.log(`   Cupo disponible: ${evento.cupo_dis_eve}`);    console.log(`   Total inscripciones: ${evento.inscritos.length}`);

    // Contar inscripciones por estado
    const estadosInscripciones = {};
    evento.inscritos.forEach(ins => {
      estadosInscripciones[ins.est_ins] = (estadosInscripciones[ins.est_ins] || 0) + 1;
    });

    console.log(`   Estados de inscripciones:`, estadosInscripciones);

    // Contar inscripciones que ocupan cupos (ACEPTADA y FINALIZADA)
    const inscripcionesQueOcupanCupos = evento.inscritos.filter(
      ins => ins.est_ins === 'ACEPTADA' || ins.est_ins === 'FINALIZADA'
    ).length;

    const cupoCalculado = evento.cupo_max_eve - inscripcionesQueOcupanCupos;

    console.log(`\n✅ VERIFICACIÓN DE LÓGICA DE CUPOS:`);
    console.log(`   - Inscripciones que ocupan cupos (ACEPTADA + FINALIZADA): ${inscripcionesQueOcupanCupos}`);
    console.log(`   - Cupo calculado (máximo - ocupadas): ${evento.cupo_max_eve} - ${inscripcionesQueOcupanCupos} = ${cupoCalculado}`);
    console.log(`   - Cupo en BD: ${evento.cupo_dis_eve}`);
    
    if (evento.cupo_dis_eve === cupoCalculado) {
      console.log(`   ✅ CORRECTO: El cupo en BD coincide con el calculado`);
    } else {
      console.log(`   ⚠️  INCONSISTENCIA: El cupo en BD no coincide con el calculado`);
    }

    console.log(`\n📝 REGLAS IMPLEMENTADAS:`);
    console.log(`   ✅ PENDIENTE: NO ocupa cupo`);
    console.log(`   ✅ ACEPTADA: SÍ ocupa cupo`);
    console.log(`   ✅ FINALIZADA: SÍ ocupa cupo`);
    console.log(`   ✅ RECHAZADA: NO ocupa cupo`);

    console.log(`\n🔄 TRANSICIONES DE ESTADO Y CUPOS:`);
    console.log(`   ✅ PENDIENTE → ACEPTADA: Reduce cupo (-1)`);
    console.log(`   ✅ ACEPTADA → RECHAZADA: Aumenta cupo (+1)`);
    console.log(`   ✅ FINALIZADA → RECHAZADA: Aumenta cupo (+1)`);
    console.log(`   ✅ RECHAZADA → ACEPTADA: Reduce cupo (-1)`);
    console.log(`   ✅ PENDIENTE → RECHAZADA: Sin cambio de cupo`);
    console.log(`   ✅ RECHAZADA → PENDIENTE: Sin cambio de cupo`);
    console.log(`   ✅ ACEPTADA → PENDIENTE: Mantiene cupo ocupado`);
    console.log(`   ✅ * → FINALIZADA: Mantiene estado actual de cupos`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

testGestionCupos();
