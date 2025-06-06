const prisma = require('./src/config/db');
const { reducirCupoEvento, aumentarCupoEvento } = require('./src/controllers/evento.controller');

async function testCambioEstado() {
  console.log('🧪 Probando cambio de estado de inscripción...\n');

  try {
    // Buscar una inscripción en estado ACEPTADA
    const inscripcion = await prisma.inscripcion.findFirst({
      where: { est_ins: 'ACEPTADA' },
      include: { evento: true }
    });

    if (!inscripcion) {
      console.log('❌ No hay inscripciones en estado ACEPTADA para probar');
      return;
    }

    console.log(`📋 Inscripción encontrada:`);
    console.log(`   ID: ${inscripcion.id_ins}`);
    console.log(`   Estado actual: ${inscripcion.est_ins}`);
    console.log(`   Evento: ${inscripcion.evento.nom_eve}`);
    console.log(`   Cupo disponible actual: ${inscripcion.evento.cupo_dis_eve}`);

    // Simular cambio a RECHAZADA para probar si aumenta cupo
    console.log('\n🔄 Simulando cambio ACEPTADA → RECHAZADA...');
    
    // Simular el cambio
    const estadoAnterior = "ACEPTADA";
    const estadoNuevo = "RECHAZADA";
    
    console.log(`Transición de estado: ${estadoAnterior} → ${estadoNuevo} para evento ${inscripcion.id_eve_ins}`);
    
    if (estadoAnterior === "ACEPTADA" && estadoNuevo === "RECHAZADA") {
      console.log("Intentando aumentar cupo: ACEPTADA → RECHAZADA");
      try {
        const resultado = await aumentarCupoEvento(inscripcion.id_eve_ins);
        console.log('✅ Cupo aumentado exitosamente:', resultado.cupo_dis_eve);
      } catch (error) {
        console.log('❌ Error al aumentar cupo:', error.message);
      }
    }

    // Verificar evento después del cambio
    const eventoActualizado = await prisma.evento.findUnique({
      where: { id_eve: inscripcion.id_eve_ins },
      select: { cupo_dis_eve: true, cupo_max_eve: true }
    });

    console.log(`\n📊 Estado del evento después del cambio:`);
    console.log(`   Cupo disponible: ${eventoActualizado.cupo_dis_eve}`);
    console.log(`   Cupo máximo: ${eventoActualizado.cupo_max_eve}`);

    // Ahora simular cambio de vuelta a ACEPTADA
    console.log('\n🔄 Simulando cambio RECHAZADA → ACEPTADA...');
    
    const estadoAnterior2 = "RECHAZADA";
    const estadoNuevo2 = "ACEPTADA";
    
    console.log(`Transición de estado: ${estadoAnterior2} → ${estadoNuevo2} para evento ${inscripcion.id_eve_ins}`);
    
    if (estadoAnterior2 === "RECHAZADA" && estadoNuevo2 === "ACEPTADA") {
      console.log("Intentando reducir cupo: RECHAZADA → ACEPTADA");
      try {
        const resultado = await reducirCupoEvento(inscripcion.id_eve_ins);
        console.log('✅ Cupo reducido exitosamente:', resultado.cupo_dis_eve);
      } catch (error) {
        console.log('❌ Error al reducir cupo:', error.message);
      }
    }

    // Verificar evento final
    const eventoFinal = await prisma.evento.findUnique({
      where: { id_eve: inscripcion.id_eve_ins },
      select: { cupo_dis_eve: true, cupo_max_eve: true }
    });

    console.log(`\n📊 Estado final del evento:`);
    console.log(`   Cupo disponible: ${eventoFinal.cupo_dis_eve}`);
    console.log(`   Cupo máximo: ${eventoFinal.cupo_max_eve}`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

testCambioEstado();
