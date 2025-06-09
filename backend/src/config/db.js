const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient({
  log: ["query"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?timezone=America/Guayaquil",
    },
  },
});

module.exports = prisma;
