const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {

  console.log("URL de conexión:", process.env.DATABASE_URL);

  // 1. Crea una facultad
  const facultad = await prisma.facultad.upsert({
    where: { nom_fac: "Facultad de Ingeniería en Sistemas, Electronica e Industrial" },
    update: {},
    create: {
      nom_fac: "Facultad de Ingeniería en Sistemas, Electronica e Industrial",
      des_fac: "Facultad orientada a la tecnología y software.",
      mis_fac: "Formar profesionales líderes e innovadores.",
      vis_fac: "Ser referente nacional e internacional en formación tecnológica.",
    },
  });

  // 2. Define carreras
  const carreras = [
    { nom_car: "Tecnologías de la Información", id_fac_per: facultad.id_fac },
    { nom_car: "Telecomunicaciones", id_fac_per: facultad.id_fac },
    { nom_car: "Ingeniería Industrial", id_fac_per: facultad.id_fac },
    { nom_car: "Software", id_fac_per: facultad.id_fac },
    { nom_car: "Automatización y Robótica", id_fac_per: facultad.id_fac },
  ];

  try {
    // Utilizamos Promise.all() para insertar todas las carreras en paralelo
    await Promise.all(
      carreras.map((carrera) =>
        prisma.carrera.upsert({
          where: { nom_car: carrera.nom_car }, // Verifica si la carrera existe
          update: { est_car: true, id_fac_per: facultad.id_fac }, // Asegura que la FK se actualiza si ya existía
          create: { ...carrera, est_car: true }, // Si no existe, la crea con estado activo
        })
      )
    );
    console.log("Carreras insertadas correctamente");

    await prisma.usuario.upsert({
      where: { ced_usu: "9999999999" }, // cédula única para tu admin
      update: {},
      create: {
        ced_usu: "9999999999",
        nom_usu: "Admin",
        ape_usu: "Principal",
        cor_usu: "admin@uta.edu.ec",
        con_usu: "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW", // Contraseña encriptada (Admin12345)
        cel_usu: "0999999999",
        rol_usu: "ADMIN",
        fec_cre_usu: new Date(),
        // id_car_est: null, no pertenece a ninguna carrera
      },
    });
    console.log("Usuario admin creado");

    await prisma.usuario.upsert({
      where: { ced_usu: "1234567890" }, // cédula única para tu admin
      update: {},
      create: {
        ced_usu: "1234567890",
        nom_usu: "Gabriel",
        ape_usu: "Llerena",
        cor_usu: "gllerena1469@uta.edu.ec",
        con_usu: "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW", // Contraseña encriptada (Admin12345)
        cel_usu: "0987654321",
        rol_usu: "ESTUDIANTE",
        fec_cre_usu: new Date(),
        id_car_est: "ec4731a9-7e22-42af-96d7-9a12c14b4338",
      },
    });
    console.log("Usuario estudiante creado");
  } catch (error) {
    console.error("Error al insertar carreras:", error); // Mensaje más específico en caso de error
    process.exit(1); // Finaliza el proceso con un código de error
  }
}

main().finally(() => {
  prisma.$disconnect(); // Asegura que la conexión a la base de datos se cierre correctamente
});
