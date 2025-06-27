const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  // log: ["query"],
  log: ["warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?timezone=America/Guayaquil",
    },
  },
});

// Función para probar la conexión (útil para health checks)
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("❌ [DB] Error de conexión:", error);
    throw error;
  }
}

// Función para cerrar la conexión de forma segura
async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log("✅ [DB] Conexión cerrada correctamente");
  } catch (error) {
    console.error("❌ [DB] Error al cerrar conexión:", error);
  }
}

module.exports = {
  prisma,
  testConnection,
  disconnect,
  // Exportar prisma como default para compatibilidad
  default: prisma,
};
