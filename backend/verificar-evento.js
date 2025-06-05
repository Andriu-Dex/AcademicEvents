const prisma = require("./src/config/db");

async function verificarEventoEspecifico() {
  try {
    console.log("🔍 Iniciando verificación de eventos...");
      // Buscar todos los eventos
    const eventos = await prisma.evento.findMany({
      include: {
        inscritos: {
          select: {
            id_ins: true,
            est_ins: true,
            fec_ins: true,
            cuenta: {
              select: {
                cor_usu: true,
                usuario: {
                  select: {
                    nom_usu: true,
                    ape_usu: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fec_cre_eve: 'desc' }
    });

    console.log(`📊 Total eventos encontrados: ${eventos.length}`);

    for (const evento of eventos) {
      console.log(`\n📋 Evento: ${evento.nom_eve}`);
      console.log(`   ID: ${evento.id_eve}`);
      console.log(`   Cupos: ${evento.cupo_dis_eve}/${evento.cupo_max_eve}`);
      console.log(`   Total inscripciones: ${evento.inscritos.length}`);
      
      if (evento.inscritos.length > 0) {
        const conteoEstados = evento.inscritos.reduce((acc, ins) => {
          acc[ins.est_ins] = (acc[ins.est_ins] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`   Estados:`, conteoEstados);
        
        // Mostrar detalle de cada inscripción
        evento.inscritos.forEach(ins => {
          const usuario = ins.cuenta.usuario;
          console.log(`   - ${usuario.nom_usu} ${usuario.ape_usu}: ${ins.est_ins}`);
        });
        
        // Calcular cupos correctos
        const inscripcionesQueOcupanCupo = evento.inscritos.filter(
          ins => ins.est_ins === "ACEPTADA" || ins.est_ins === "FINALIZADA"
        ).length;
        
        const cuposCorretos = evento.cupo_max_eve - inscripcionesQueOcupanCupo;
        
        console.log(`   Inscripciones que ocupan cupo: ${inscripcionesQueOcupanCupo}`);
        console.log(`   Cupos disponibles correctos: ${cuposCorretos}`);
        
        if (evento.cupo_dis_eve !== cuposCorretos) {
          console.log(`   ❌ INCONSISTENCIA: BD dice ${evento.cupo_dis_eve}, debería ser ${cuposCorretos}`);
          
          // Corregir automáticamente
          await prisma.evento.update({
            where: { id_eve: evento.id_eve },
            data: { cupo_dis_eve: cuposCorretos }
          });
          
          console.log(`   ✅ CORREGIDO: ${evento.cupo_dis_eve} → ${cuposCorretos}`);
        } else {
          console.log(`   ✅ CORRECTO`);
        }
      } else {
        console.log(`   ✅ Sin inscripciones - cupos correctos`);
      }
    }
    
    console.log("\n🎉 Verificación completada");
    
  } catch (error) {
    console.error("❌ Error durante verificación:", error);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Conexión cerrada");
  }
}

console.log("Iniciando script...");
verificarEventoEspecifico()
  .then(() => {
    console.log("Script completado");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
