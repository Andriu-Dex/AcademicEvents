const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  console.log("URL de conexión:", process.env.DATABASE_URL);

  try {
    // 1. Crear facultad
    const facultad = await prisma.facultad.upsert({
      where: {
        nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
      },
      update: {
        // Actualizamos los nuevos campos para registros existentes
        acr_fac: "FISEI",
        url_log_fac: "https://imgur.com/fch1iy6.png",
      },
      create: {
        nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        acr_fac: "FISEI",
        url_log_fac: "https://imgur.com/fch1iy6.png",
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

    // 2. Crear carreras
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

    await Promise.all(
      carreras.map((carrera) =>
        prisma.carrera.upsert({
          where: { nom_car: carrera.nom_car },
          update: {
            est_car: true,
            id_fac_per: facultad.id_fac,
            des_car: carrera.des_car,
            dur_sem_car: carrera.dur_sem_car,
            mod_car: carrera.mod_car,
            ico_car: carrera.ico_car,
          },
          create: { ...carrera, est_car: true },
        })
      )
    );
    console.log("Carreras insertadas correctamente");

    // 3. Usuarios de prueba
    await prisma.usuario.upsert({
      where: { ced_usu: "9999999999" },
      update: {},
      create: {
        ced_usu: "9999999999",
        nom_usu: "Admin",
        ape_usu: "Principal",
        cel_usu: "0999999999",
        fec_cre_usu: new Date(),
        cuentas: {
          create: [
            {
              cor_usu: "admin@uta.edu.ec",
              con_usu:
                "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW",
              rol_usu: "ADMIN_GLOBAL",
            },
          ],
        },
      },
    });

    await prisma.usuario.upsert({
      where: { ced_usu: "1234567890" },
      update: {},
      create: {
        ced_usu: "1234567890",
        nom_usu: "Estudiante",
        ape_usu: "UTA",
        cel_usu: "0987654321",
        fec_cre_usu: new Date(),
        cuentas: {
          create: [
            {
              cor_usu: "estudiante@uta.edu.ec",
              con_usu:
                "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW",
              rol_usu: "ESTUDIANTE",
            },
          ],
        },
      },
    });

    console.log("Usuarios de prueba insertados correctamente");

    // 4. Obtener cuenta admin
    const cuentaAdmin = await prisma.cuenta.findUnique({
      where: { cor_usu: "admin@uta.edu.ec" },
    });

    // 5. Insertar evento principal
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
        cup_max_eve: 50,
        cup_dis_eve: 50,
        id_cue_cre_eve: cuentaAdmin.id_cue,
        mod_eve: "PRESENCIAL",
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
        cup_max_eve: 50,
        cup_dis_eve: 50,
        id_cue_cre_eve: cuentaAdmin.id_cue,
        mod_eve: "PRESENCIAL",
      },
    });
    console.log("Evento principal insertado correctamente");

    // 6. Eventos adicionales
    const eventos = [
      {
        id_eve: "73c28d62-e7e4-45df-81c8-654e9fb2d36c",
        nom_eve: "Anime Comic",
        des_eve: "Evento de actividades anime para otakus",
        tip_eve: "SOCIALIZACION",
        fec_ini_eve: new Date("2025-06-12T00:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-03T00:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "PRESENCIAL",
        val_eve: 6.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/sTyFrJw.jpeg",
        por_min_asi_eve: 88,
        cup_max_eve: 100,
        cup_dis_eve: 100,
      },
      {
        id_eve: "02e1df41-a185-4a01-9e3b-156d579f523d",
        nom_eve: "Los Mejores Lenguajes De Programación",
        des_eve:
          "Congreso que trata los mejores lenguajes de programación en 2025",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-06-07T00:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-09T00:00:00.000Z"),
        dur_hor_eve: 8,
        mod_eve: "PRESENCIAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/FVyOB4J.jpeg",
        por_min_asi_eve: 89,
        cup_max_eve: 200,
        cup_dis_eve: 200,
      },
      {
        id_eve: "bf0213d7-3cf5-44bd-9468-41ab9c01441a",
        nom_eve: "La Inteligencia Artificial En La Educación",
        des_eve:
          "Seminario web que aborda los temas más recientes sobre la IA en la educación y que repercute en la actualidad",
        tip_eve: "WEBINAR",
        fec_ini_eve: new Date("2025-06-11T00:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-19T00:00:00.000Z"),
        dur_hor_eve: 7,
        mod_eve: "VIRTUAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/hhxnaqA.png",
        por_min_asi_eve: 100,
        cup_max_eve: 100,
        cup_dis_eve: 100,
      },
      {
        id_eve: "92b8ce78-248e-4ff4-9bab-0cf3127b5f51",
        nom_eve: "La Depresión En Los Estudiantes",
        des_eve:
          "Charla informativa que busca concienciar sobre la depresión en estudiantes, sus causas, síntomas y estrategias para afrontarla.",
        tip_eve: "CHARLA",
        fec_ini_eve: new Date("2025-06-21T00:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-25T00:00:00.000Z"),
        dur_hor_eve: 10,
        mod_eve: "SEMIPRESENCIAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/aNU3PX2.jpeg",
        por_min_asi_eve: 88,
        cup_max_eve: 50,
        cup_dis_eve: 50,
      },
    ];

    await Promise.all(
      eventos.map((evento) =>
        prisma.evento.upsert({
          where: { id_eve: evento.id_eve },
          update: { ...evento, id_cue_cre_eve: cuentaAdmin.id_cue },
          create: { ...evento, id_cue_cre_eve: cuentaAdmin.id_cue },
        })
      )
    );
    console.log("Eventos adicionales insertados correctamente");

    // 7. Evento de tipo CURSO
    const eventoCursoBase = {
      id_eve: "30854a1f-06c7-4c7c-979f-62545b54c9aa", // ID del evento CURSO
      nom_eve: "Curso De Python",
      des_eve: "Curso para aprender Python desde 0",
      tip_eve: "CURSO",
      fec_ini_eve: new Date("2025-06-07T00:00:00.000Z"),
      fec_fin_eve: new Date("2025-06-08T00:00:00.000Z"),
      dur_hor_eve: 5,
      mod_eve: "VIRTUAL",
      val_eve: 15.0,
      est_eve: "ACTIVO",
      img_por_eve: "https://i.imgur.com/uVj7k7q.jpeg",
      por_min_asi_eve: 88,
      cup_max_eve: 80,
      cup_dis_eve: 80,
    };

    // Primero creamos o actualizamos el evento básico
    const eventoCreado = await prisma.evento.upsert({
      where: { id_eve: eventoCursoBase.id_eve },
      update: { ...eventoCursoBase, id_cue_cre_eve: cuentaAdmin.id_cue },
      create: { ...eventoCursoBase, id_cue_cre_eve: cuentaAdmin.id_cue },
    });

    // Luego upsert en evento_curso
    await prisma.evento_curso.upsert({
      where: { id_eve_cur: eventoCreado.id_eve },
      update: { not_min_cur: 8.0 },
      create: {
        id_eve_cur: eventoCreado.id_eve,
        not_min_cur: 8.0,
      },
    });

    console.log("Evento CURSO insertado correctamente");
  } catch (error) {
    console.error("Error durante el seeding:", error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
