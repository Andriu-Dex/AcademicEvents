const prisma = require('./src/config/db');

async function simularCambioEstadoReal() {
  console.log('🧪 Simulando cambio de estado real...\n');

  try {
    // Buscar la inscripción actual
    const inscripcion = await prisma.inscripcion.findFirst({
      where: { est_ins: 'ACEPTADA' },
      include: { evento: true }
    });

    if (!inscripcion) {
      console.log('❌ No hay inscripciones ACEPTADAS para probar');
      
      // Buscar cualquier inscripción y cambiarla a PENDIENTE primero
      const cualquierInscripcion = await prisma.inscripcion.findFirst({
        include: { evento: true }
      });
      
      if (cualquierInscripcion) {
        console.log('📝 Cambiando inscripción a PENDIENTE para probar...');
        await prisma.inscripcion.update({
          where: { id_ins: cualquierInscripcion.id_ins },
          data: { est_ins: 'PENDIENTE' }
        });
        
        // Buscar la inscripción actualizada
        const inscripcionPendiente = await prisma.inscripcion.findUnique({
          where: { id_ins: cualquierInscripcion.id_ins },
          include: { evento: true }
        });
        
        console.log(`✅ Inscripción ${inscripcionPendiente.id_ins} ahora está en PENDIENTE`);
        console.log(`   Evento: ${inscripcionPendiente.evento.nom_eve}`);
        console.log(`   Cupo disponible actual: ${inscripcionPendiente.evento.cupo_dis_eve}`);
        
        return inscripcionPendiente;
      }
      return null;
    }

    console.log(`📋 Inscripción encontrada:`);
    console.log(`   ID: ${inscripcion.id_ins}`);
    console.log(`   Estado: ${inscripcion.est_ins}`);
    console.log(`   Evento: ${inscripcion.evento.nom_eve}`);
    console.log(`   Cupo disponible: ${inscripcion.evento.cupo_dis_eve}`);
    
    return inscripcion;

  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function probarTransicion() {
  try {
    const inscripcion = await simularCambioEstadoReal();
    
    if (!inscripcion) {
      console.log('❌ No se pudo obtener una inscripción para probar');
      return;
    }

    // Importar las funciones después de obtener la inscripción
    const { reducirCupoEvento, aumentarCupoEvento } = require('./src/controllers/evento.controller');
    
    console.log('\n🔄 Probando función reducirCupoEvento directamente...');
    
    // Obtener estado inicial del evento
    const eventoInicial = await prisma.evento.findUnique({
      where: { id_eve: inscripcion.id_eve_ins },
      select: { cupo_dis_eve: true, cupo_max_eve: true }
    });
    
    console.log(`📊 Estado inicial del evento:`);
    console.log(`   Cupo disponible: ${eventoInicial.cupo_dis_eve}`);
    console.log(`   Cupo máximo: ${eventoInicial.cupo_max_eve}`);
    
    // Probar reducir cupo
    if (eventoInicial.cupo_dis_eve > 0) {
      console.log('\n⬇️ Reduciendo cupo...');
      try {
        const resultado = await reducirCupoEvento(inscripcion.id_eve_ins);
        console.log(`✅ Cupo reducido. Nuevo valor: ${resultado.cupo_dis_eve}`);
      } catch (error) {
        console.log(`❌ Error al reducir cupo: ${error.message}`);
      }
    } else {
      console.log('\n⬆️ Aumentando cupo primero...');
      try {
        const resultado = await aumentarCupoEvento(inscripcion.id_eve_ins);
        console.log(`✅ Cupo aumentado. Nuevo valor: ${resultado.cupo_dis_eve}`);
        
        // Ahora intentar reducir
        console.log('\n⬇️ Ahora reduciendo cupo...');
        const resultadoReducir = await reducirCupoEvento(inscripcion.id_eve_ins);
        console.log(`✅ Cupo reducido. Nuevo valor: ${resultadoReducir.cupo_dis_eve}`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado');
  }
}

probarTransicion();
