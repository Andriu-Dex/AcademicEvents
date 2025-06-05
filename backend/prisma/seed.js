const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  console.log("URL de conexión:", process.env.DATABASE_URL);
  // 1. Crea una facultad
  const facultad = await prisma.facultad.upsert({
    where: {
      nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
    },
    update: {},
    create: {
      nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
      des_fac: "Facultad orientada a la tecnología y software.",
      mis_fac: "Formar profesionales líderes e innovadores.",
      vis_fac:
        "Ser referente nacional e internacional en formación tecnológica.",
      nom_dec_fac: "Ing. Franklin",
      ape_dec_fac: "Mayorga Mogollón",
      cor_dec_fac: "fmayorga@uta.edu.ec",
      url_img_dec_fac: "https://i.imgur.com/hYBsxIf.png",
      nom_sub_dec_fac: "Dr. Javier",
      ape_sub_dec_fac: "Sánchez Torres",
      cor_sub_dec_fac: "j.sanchez@uta.edu.ec",
      url_img_sub_dec_fac: "https://i.imgur.com/JIQy6Fa.png",
    },
  });
  // 2. Define carreras con todos los campos requeridos
  const carreras = [
    {
      nom_car: "Tecnologías de la Información",
      des_car:
        "Carrera enfocada en el desarrollo de habilidades para gestionar tecnologías de información empresarial.",
      dur_sem_car: 9,
      mod_car: "PRESENCIAL",
      ico_car: "https://i.imgur.com/aqDLXJ5.png",
      id_fac_per: facultad.id_fac,
    },
    {
      nom_car: "Telecomunicaciones",
      des_car:
        "Formación en redes y sistemas de comunicación con enfoque en infraestructura tecnológica.",
      dur_sem_car: 10,
      mod_car: "PRESENCIAL",
      ico_car: "https://i.imgur.com/wCcBd1j.png",
      id_fac_per: facultad.id_fac,
    },
    {
      nom_car: "Ingeniería Industrial",
      des_car:
        "Carrera que optimiza procesos de producción y sistemas organizacionales.",
      dur_sem_car: 10,
      mod_car: "PRESENCIAL",
      ico_car: "https://i.imgur.com/FeH6kXA.png",
      id_fac_per: facultad.id_fac,
    },
    {
      nom_car: "Software",
      des_car:
        "Especialización en desarrollo de aplicaciones y sistemas informáticos modernos.",
      dur_sem_car: 8,
      mod_car: "SEMIPRESENCIAL",
      ico_car: "https://i.imgur.com/UdwSGn9.png",
      id_fac_per: facultad.id_fac,
    },
    {
      nom_car: "Automatización y Robótica",
      des_car:
        "Enfocada en sistemas automatizados, control industrial y robótica aplicada.",
      dur_sem_car: 9,
      mod_car: "PRESENCIAL",
      ico_car: "https://i.imgur.com/Z6w3jgc.png",
      id_fac_per: facultad.id_fac,
    },
  ];

  try {
    // Utilizamos Promise.all() para insertar todas las carreras en paralelo
    await Promise.all(
      carreras.map((carrera) =>
        prisma.carrera.upsert({
          where: { nom_car: carrera.nom_car }, // Verifica si la carrera existe
          update: {
            est_car: true,
            id_fac_per: facultad.id_fac,
            des_car: carrera.des_car,
            dur_sem_car: carrera.dur_sem_car,
            mod_car: carrera.mod_car,
            ico_car: carrera.ico_car,
          }, // Actualiza todos los campos
          create: { ...carrera, est_car: true }, // Si no existe, la crea con estado activo
        })
      )
    );
    console.log("Carreras insertadas correctamente");

    await prisma.usuario.upsert({
      where: { ced_usu: "9999999999" },
      update: {},
      create: {
        ced_usu: "9999999999",
        nom_usu: "Admin",
        ape_usu: "Principal",
        cel_usu: "0999999999",
        fec_cre_usu: new Date(),
        // No se asocia a ninguna carrera
        cuentas: {
          create: [
            {
              cor_usu: "admin@uta.edu.ec",
              con_usu:
                "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW", // Contraseña hash
              rol_usu: "ADMIN_GLOBAL",
            },
          ],
        },
      },
    });

    // Usuario ESTUDIANTE
    await prisma.usuario.upsert({
      where: { ced_usu: "1234567890" },
      update: {},
      create: {
        ced_usu: "1234567890",
        nom_usu: "Estudiante",
        ape_usu: "UTA",
        cel_usu: "0987654321",
        fec_cre_usu: new Date(),
        // No se asocia a ninguna carrera aquí. Agrega id_car_est si lo necesitas.
        cuentas: {
          create: [
            {
              cor_usu: "estudiante@uta.edu.ec",
              con_usu:
                "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW", // Contraseña hash
              rol_usu: "ESTUDIANTE",
            },
          ],
        },
      },
    });

    console.log("Usuarios de prueba insertados correctamente");

    // Obtener la cuenta admin (por correo)
    const cuentaAdmin = await prisma.cuenta.findUnique({
      where: { cor_usu: "admin@uta.edu.ec" },
    });

    // Crea un evento asociado a la cuenta admin
    await prisma.evento.upsert({
      where: { id_eve: "80ce8ece-c17a-4c82-9d0d-be303eb25e37" },
      update: {
        nom_eve: "Congreso Internacional de Tecnología",
        des_eve:
          "Congreso donde se discutirán los avances más recientes en el campo de la tecnología.",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-07-10T10:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-12T18:00:00.000Z"),
        dur_hor_eve: 20,
        val_eve: 20.0,
        est_eve: "ACTIVO",
        por_min_asi_eve: 80,
        img_por_eve: "https://i.imgur.com/f8adUbZ.png",
        id_cue_cre_eve: cuentaAdmin.id_cue, // IMPORTANTE: id de la cuenta creadora
      },
      create: {
        id_eve: "80ce8ece-c17a-4c82-9d0d-be303eb25e37",
        nom_eve: "Congreso Internacional de Tecnología",
        des_eve:
          "Congreso donde se discutirán los avances más recientes en el campo de la tecnología.",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-07-10T10:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-12T18:00:00.000Z"),
        dur_hor_eve: 20,
        val_eve: 200.0,
        est_eve: "ACTIVO",
        por_min_asi_eve: 70,
        img_por_eve: "https://i.imgur.com/f8adUbZ.png",
        id_cue_cre_eve: cuentaAdmin.id_cue, // IMPORTANTE: id de la cuenta creadora
      },
    });
    console.log("Evento insertado correctamente");
  } catch (error) {
    console.error("Error al insertar carreras:", error); // Mensaje más específico en caso de error
    process.exit(1); // Finaliza el proceso con un código de error
  }
}

main().finally(() => {
  prisma.$disconnect(); // Asegura que la conexión a la base de datos se cierre correctamente
});
