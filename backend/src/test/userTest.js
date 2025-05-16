const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function verificar() {
  try {
    const usuarios = await prisma.usuario.findMany();
    console.log('✅ Tabla usuario encontrada. Registros actuales:', usuarios.length);
    console.log(usuarios);
  } catch (error) {
    console.error('❌ Error al acceder a la tabla usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
