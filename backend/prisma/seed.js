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
        rol_usu: "GENERAL",
        fec_cre_usu: new Date(),
        id_car_est: null,
      },
    });
    console.log("Usuario estudiante creado");

    // Insertar eventos (incluyendo un evento de tipo CURSO)
    const eventos = [
      {
        id_eve: "80ce8ece-c17a-4c82-9d0d-be303eb25e37",
        nom_eve: "Congreso Internacional de Tecnología",
        des_eve: "Congreso donde se discutirán los avances más recientes en el campo de la tecnología.",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-07-10T10:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-12T18:00:00.000Z"),
        dur_hor_eve: 20,
        val_eve: 200.00,
        est_eve: "ACTIVO",
        por_min_asi_eve: 70,
        img_por_eve: "https://i.imgur.com/f8adUbZ.png",
        eventos_curso: undefined,
      },
    ];

    // Insertar los eventos
    await Promise.all(
      eventos.map((evento) =>
        prisma.evento.upsert({
          where: { id_eve: evento.id_eve },
          update: {
            nom_eve: evento.nom_eve,
            des_eve: evento.des_eve,
            tip_eve: evento.tip_eve,
            fec_ini_eve: evento.fec_ini_eve,
            fec_fin_eve: evento.fec_fin_eve,
            dur_hor_eve: evento.dur_hor_eve,
            val_eve: evento.val_eve,
            est_eve: evento.est_eve,
            por_min_asi_eve: evento.por_min_asi_eve,
            img_por_eve: evento.img_por_eve,
          },
          create: {
            nom_eve: evento.nom_eve,
            des_eve: evento.des_eve,
            tip_eve: evento.tip_eve,
            fec_ini_eve: evento.fec_ini_eve,
            fec_fin_eve: evento.fec_fin_eve,
            dur_hor_eve: evento.dur_hor_eve,
            val_eve: evento.val_eve,
            est_eve: evento.est_eve,
            por_min_asi_eve: evento.por_min_asi_eve,
            img_por_eve: evento.img_por_eve,
            eventos_curso: evento.tip_eve === "CURSO" ? evento.eventos_curso : undefined, // Solo se incluye eventos_curso si el evento es de tipo CURSO
          },
        })
      )
    );
    console.log("Eventos insertados correctamente");
  } catch (error) {
    console.error("Error al insertar carreras:", error); // Mensaje más específico en caso de error
    process.exit(1); // Finaliza el proceso con un código de error
  }
}

main().finally(() => {
  prisma.$disconnect(); // Asegura que la conexión a la base de datos se cierre correctamente
});
