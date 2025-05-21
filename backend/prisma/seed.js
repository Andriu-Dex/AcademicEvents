const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  const carreras = [
    { nom_car: "Tecnologías de la Información" },
    { nom_car: "Telecomunicaciones" },
    { nom_car: "Ingeniería Industrial" },
    { nom_car: "Software" },
    { nom_car: "Automatización y Robótica" },
  ];

  try {
    // Utilizamos Promise.all() para insertar todas las carreras en paralelo
    await Promise.all(
      carreras.map((carrera) =>
        prisma.carrera.upsert({
          where: { nom_car: carrera.nom_car }, // Verifica si la carrera existe
          update: { est_car: true }, // Si existe, actualiza su estado
          create: { ...carrera, est_car: true }, // Si no existe, la crea con estado activo
        })
      )
    );

    console.log("Carreras insertadas correctamente");
  } catch (error) {
    console.error("Error al insertar carreras:", error); // Mensaje más específico en caso de error
    process.exit(1); // Finaliza el proceso con un código de error
  }
}

main().finally(() => {
  prisma.$disconnect(); // Asegura que la conexión a la base de datos se cierre correctamente
});
