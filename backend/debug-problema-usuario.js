const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para diagnosticar el problema específico reportado por el usuario:
 * "Esta en aceptada y no reduce"
 */

async function diagnosticarProblemaUsuario() {
  console.log('🔍 DIAGNÓSTICO: Problema usuario - "Esta en aceptada y no reduce"\n');

  try {
    // 1. Buscar todas las inscripciones ACEPTADAS
    const inscripcionesAceptadas = await prisma.inscripcion.findMany({
      where: { est_ins: "ACEPTADA" },
      include: {
        evento: {
          select: {
            id_eve: true,
            nom_eve: true,
            cupo_max_eve: true,
            cupo_dis_eve: true
          }
        },
        cuenta: {
          include: {
            usuario: {
              select: {
                nom_usu: true,
                ape_usu: true
              }
            }
          }
        }
      },
      orderBy: { fec_ins: 'desc' }
    });

    console.log(`📋 Inscripciones en estado ACEPTADA encontradas: ${inscripcionesAceptadas.length}\n`);

    // 2. Verificar cada evento con inscripciones aceptadas
    const eventosConAceptadas = {};

    inscripcionesAceptadas.forEach(ins => {
      const eventoId = ins.evento.id_eve;
      if (!eventosConAceptadas[eventoId]) {
        eventosConAceptadas[eventoId] = {
          evento: ins.evento,
          inscripciones: []
        };
      }
      eventosConAceptadas[eventoId].inscripciones.push({
        id_ins: ins.id_ins,
        usuario: `${ins.cuenta.usuario.nom_usu} ${ins.cuenta.usuario.ape_usu}`,
        estado: ins.est_ins,
        fecha: ins.fec_ins
      });
    });

    // 3. Analizar cada evento
    for (const [eventoId, data] of Object.entries(eventosConAceptadas)) {
      console.log(`\n🎯 EVENTO: ${data.evento.nom_eve} (ID: ${eventoId})`);
      console.log(`   📊 Cupos: ${data.evento.cupo_dis_eve}/${data.evento.cupo_max_eve}`);
      console.log(`   ✅ Inscripciones ACEPTADAS: ${data.inscripciones.length}`);

      // Contar todas las inscripciones por estado en este evento
      const todasInscripciones = await prisma.inscripcion.findMany({
        where: { id_eve_ins: eventoId },
        select: { est_ins: true }
      });

      const conteoEstados = {};
      todasInscripciones.forEach(ins => {
        conteoEstados[ins.est_ins] = (conteoEstados[ins.est_ins] || 0) + 1;
      });

      console.log(`   📈 Distribución de estados:`, conteoEstados);

      // Calcular cupo correcto según nuestras reglas
      const aceptadas = conteoEstados.ACEPTADA || 0;
      const finalizadas = conteoEstados.FINALIZADA || 0;
      const queOcupanCupo = aceptadas + finalizadas;
      const cupoCorrectoCalculado = data.evento.cupo_max_eve - queOcupanCupo;

      console.log(`   🧮 CÁLCULO DE CUPOS:`);
      console.log(`      • Inscripciones que ocupan cupo (ACEPTADA + FINALIZADA): ${queOcupanCupo}`);
      console.log(`      • Cupo disponible calculado: ${data.evento.cupo_max_eve} - ${queOcupanCupo} = ${cupoCorrectoCalculado}`);
      console.log(`      • Cupo disponible en BD: ${data.evento.cupo_dis_eve}`);

      if (data.evento.cupo_dis_eve === cupoCorrectoCalculado) {
        console.log(`   ✅ CORRECTO: Los cupos están bien calculados`);
      } else {
        console.log(`   ❌ PROBLEMA DETECTADO: Inconsistencia en cupos`);
        console.log(`      Diferencia: ${data.evento.cupo_dis_eve - cupoCorrectoCalculado}`);
        
        // Mostrar detalles de las inscripciones aceptadas
        console.log(`   👥 Inscripciones ACEPTADAS en detalle:`);
        data.inscripciones.forEach((ins, index) => {
          console.log(`      ${index + 1}. ${ins.usuario} - Estado: ${ins.estado} - Fecha: ${ins.fecha.toISOString()}`);
        });
      }
    }

    // 4. Buscar el evento más reciente con inscripciones aceptadas para hacer una prueba
    if (inscripcionesAceptadas.length > 0) {
      const inscripcionReciente = inscripcionesAceptadas[0];
      console.log(`\n🔬 PRUEBA CON INSCRIPCIÓN MÁS RECIENTE:`);
      console.log(`   ID Inscripción: ${inscripcionReciente.id_ins}`);
      console.log(`   Usuario: ${inscripcionReciente.cuenta.usuario.nom_usu} ${inscripcionReciente.cuenta.usuario.ape_usu}`);
      console.log(`   Evento: ${inscripcionReciente.evento.nom_eve}`);
      console.log(`   Estado actual: ${inscripcionReciente.est_ins}`);
      
      // Verificar si hay algún problema específico con esta inscripción
      const detalleInscripcion = await prisma.inscripcion.findUnique({
        where: { id_ins: inscripcionReciente.id_ins },
        include: {
          evento: true,
          comprobantes_pago: true,
          observacion: true
        }
      });

      console.log(`   📄 Detalles adicionales:`);
      console.log(`      • Fecha inscripción: ${detalleInscripcion.fec_ins}`);
      console.log(`      • Comprobantes: ${detalleInscripcion.comprobantes_pago.length}`);
      console.log(`      • Observaciones: ${detalleInscripcion.observacion ? 'Sí' : 'No'}`);
    }

    console.log(`\n📝 RESUMEN DEL DIAGNÓSTICO:`);
    console.log(`   • Total inscripciones ACEPTADAS: ${inscripcionesAceptadas.length}`);
    console.log(`   • Eventos afectados: ${Object.keys(eventosConAceptadas).length}`);
    console.log(`   • Estado del sistema: ${inscripcionesAceptadas.length > 0 ? 'FUNCIONANDO' : 'SIN INSCRIPCIONES ACEPTADAS'}`);

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado');
  }
}

// Ejecutar diagnóstico
diagnosticarProblemaUsuario().catch(console.error);
