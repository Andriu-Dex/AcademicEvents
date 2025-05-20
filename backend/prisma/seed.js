const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const carreras = [
    { nom_car: "Tecnologías de la Información" },
    { nom_car: "Telecomunicaciones" },
    { nom_car: "Ingeniería Industrial" },
    { nom_car: "Software" },
    { nom_car: "Automatización y Robótica" },
  ];

  for (const carrera of carreras) {
    await prisma.carrera.upsert({
      where: { nom_car: carrera.nom_car },
      update: {},
      create: carrera,
    });
  }

  console.log("Carreras insertadas correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
