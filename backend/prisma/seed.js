const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("URL de conexión:", process.env.DATABASE_URL);

  try {
    // 1. Crear universidad
    const universidad = await prisma.universidad.upsert({
      where: {
        nom_uni: "Universidad Técnica De Ambato",
      },
      update: {
        acr_uni: "UTA",
        url_log_uni: "https://i.imgur.com/MgZ1TiM.png",
        url_web_uni: "https://uta.edu.ec/",
        dir_uni: "Av. Los Chasquis y Rio Payamino",
        tel_uni: "03-3700090",
        cor_uni: "utarectorado@uta.edu.ec",
        fec_fun_uni: new Date("1969-04-18"),
      },
      create: {
        nom_uni: "Universidad Técnica De Ambato",
        acr_uni: "UTA",
        url_log_uni: "https://i.imgur.com/MgZ1TiM.png",
        url_web_uni: "https://uta.edu.ec/",
        dir_uni: "Av. Los Chasquis y Rio Payamino",
        tel_uni: "03-3700090",
        cor_uni: "utarectorado@uta.edu.ec",
        fec_fun_uni: new Date("1969-04-18"),
      },
    });
    console.log("Universidad creada correctamente");

    // 2. Crear facultad
    const facultad = await prisma.facultad.upsert({
      where: {
        nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
      },
      update: {
        // Actualizamos los nuevos campos para registros existentes
        acr_fac: "FISEI",
        url_log_fac: "https://imgur.com/fch1iy6.png",
        id_uni_per: universidad.id_uni,
      },
      create: {
        nom_fac: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        acr_fac: "FISEI",
        url_log_fac: "https://imgur.com/fch1iy6.png",
        des_fac:
          "Formar profesionales íntegros y competentes, fomentar la investigación científica y tecnológica, y promover un ambiente de integración y colaboración que responda a las demandas del entorno nacional e internacional.",
        mis_fac:
          "Formar profesionales líderes competentes, con visión humanista y pensamiento crítico, a través de la Docencia, la Investigación y la Vinculación, que apliquen, promuevan y difundan el conocimiento respondiendo a las necesidades del país.",
        vis_fac:
          "La Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato, por sus niveles de excelencia, se constituirá como un centro de formación superior con liderazgo y proyección nacional e internacional.",
        id_uni_per: universidad.id_uni,
      },
    });
    console.log("Facultad creada correctamente");

    // 3. Crear autoridades de la facultad
    const autoridadesFacultad = [
      {
        id_fac_per: facultad.id_fac,
        tip_aut_fac: "DECANO",
        nom_aut_fac: "Franklin",
        ape_aut_fac: "Mayorga Mogollón",
        cor_aut_fac: "fmayorga@uta.edu.ec",
        url_img_aut_fac: "https://i.imgur.com/hYBsxIf.png",
        tit_aut_fac: "Dr.",
        fec_ini_aut_fac: new Date("2023-01-01"),
      },
      {
        id_fac_per: facultad.id_fac,
        tip_aut_fac: "SUBDECANO",
        nom_aut_fac: "Javier",
        ape_aut_fac: "Sánchez Torres",
        cor_aut_fac: "j.sanchez@uta.edu.ec",
        url_img_aut_fac: "https://i.imgur.com/JIQy6Fa.png",
        tit_aut_fac: "Dr.",
        fec_ini_aut_fac: new Date("2023-01-01"),
      },
      {
        id_fac_per: facultad.id_fac,
        tip_aut_fac: "COORDINADOR",
        nom_aut_fac: "Marco",
        ape_aut_fac: "Guachimboza",
        cor_aut_fac: "marcovguachimboza@uta.edu.ec",
        url_img_aut_fac: "https://i.imgur.com/XDFrTBI.png",
        tit_aut_fac: "Ing. Mg.",
        fec_ini_aut_fac: new Date("2023-01-01"),
      },
      {
        id_fac_per: facultad.id_fac,
        tip_aut_fac: "COORDINADOR",
        nom_aut_fac: "Freddy",
        ape_aut_fac: "Robalino",
        cor_aut_fac: "r.morales@uta.edu.ec",
        url_img_aut_fac: "https://i.imgur.com/daKWf7d.png",
        tit_aut_fac: "Ing. Mg.",
        fec_ini_aut_fac: new Date("2023-01-01"),
      },
      {
        id_fac_per: facultad.id_fac,
        tip_aut_fac: "COORDINADOR",
        nom_aut_fac: "César",
        ape_aut_fac: "Rosero",
        cor_aut_fac: "cesararosero@uta.edu.ec",
        url_img_aut_fac: "https://i.imgur.com/d4hRu17.png",
        tit_aut_fac: "Ing. Mg.",
        fec_ini_aut_fac: new Date("2023-01-01"),
      },
    ];

    // Creación de autoridades de facultad
    await Promise.all(
      autoridadesFacultad.map((autoridad, index) =>
        prisma.autoridad_facultad.upsert({
          where: {
            id_aut_fac: `${autoridad.id_fac_per}-${autoridad.tip_aut_fac}-${index}`,
          },
          update: autoridad,
          create: {
            ...autoridad,
            id_aut_fac: `${autoridad.id_fac_per}-${autoridad.tip_aut_fac}-${index}`,
          },
        })
      )
    );
    console.log("Autoridades de facultad creadas correctamente");

    // 4. Crear coordinadores
    const coordinadores = [
      {
        nom_coo: "Marco Guachimboza",
        ape_coo: "",
        cor_coo: "marcovguachimboza@uta.edu.ec",
        url_img_coo: "https://i.imgur.com/XDFrTBI.png",
        tit_coo: "Ing. Mg.",
      },
      {
        nom_coo: "Freddy Robalino",
        ape_coo: "",
        cor_coo: "r.morales@uta.edu.ec",
        url_img_coo: "https://i.imgur.com/daKWf7d.png",
        tit_coo: "Ing. Mg.",
      },
      {
        nom_coo: "César Rosero",
        ape_coo: "",
        cor_coo: "cesararosero@uta.edu.ec",
        url_img_coo: "https://i.imgur.com/d4hRu17.png",
        tit_coo: "Ing. Mg.",
      },
    ];

    const coordinadoresCreados = await Promise.all(
      coordinadores.map((coordinador) =>
        prisma.coordinador.upsert({
          where: { cor_coo: coordinador.cor_coo },
          update: coordinador,
          create: coordinador,
        })
      )
    );
    console.log("Coordinadores creados correctamente");

    // 5. Crear carreras
    const carreras = [
      {
        nom_car: "Tecnologías de la Información",
        des_car:
          "Carrera enfocada en el desarrollo de habilidades para gestionar tecnologías de información empresarial.",
        dur_sem_car: 9,
        mod_car: "PRESENCIAL",
        ico_car: "monitor",
        id_fac_per: facultad.id_fac,
        id_coo_per: coordinadoresCreados[0].id_coo, // Marco Guachimboza
      },
      {
        nom_car: "Telecomunicaciones",
        des_car:
          "Formación en redes y sistemas de comunicación con enfoque en infraestructura tecnológica.",
        dur_sem_car: 10,
        mod_car: "PRESENCIAL",
        ico_car: "zap",
        id_fac_per: facultad.id_fac,
        id_coo_per: coordinadoresCreados[1].id_coo, // Freddy Robalino
      },
      {
        nom_car: "Ingeniería Industrial",
        des_car:
          "Carrera que optimiza procesos de producción y sistemas organizacionales.",
        dur_sem_car: 10,
        mod_car: "PRESENCIAL",
        ico_car: "factory",
        id_fac_per: facultad.id_fac,
        id_coo_per: coordinadoresCreados[2].id_coo, // César Rosero
      },
      {
        nom_car: "Software",
        des_car:
          "Especialización en desarrollo de aplicaciones y sistemas informáticos modernos.",
        dur_sem_car: 8,
        mod_car: "SEMIPRESENCIAL",
        ico_car: "laptop",
        id_fac_per: facultad.id_fac,
        id_coo_per: coordinadoresCreados[0].id_coo, // Marco Guachimboza
      },
      {
        nom_car: "Automatización y Robótica",
        des_car:
          "Enfocada en sistemas automatizados, control industrial y robótica aplicada.",
        dur_sem_car: 9,
        mod_car: "PRESENCIAL",
        ico_car: "wrench",
        id_fac_per: facultad.id_fac,
        id_coo_per: coordinadoresCreados[1].id_coo, // Freddy Robalino
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
            id_coo_per: carrera.id_coo_per,
          },
          create: { ...carrera, est_car: true },
        })
      )
    );
    console.log("Carreras insertadas correctamente");

    // 6. Usuarios de prueba - Super Admin con correo verificado
    const superAdminCedula = process.env.SUPER_ADMIN_CEDULA || "9999999999";
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@uta.edu.ec";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin12345";

    // Hashear la contraseña si viene desde las variables de entorno
    let hashedPassword =
      "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW"; // Default hashed Admin12345
    if (superAdminPassword !== "Admin12345") {
      hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    }

    await prisma.usuario.upsert({
      where: { ced_usu: superAdminCedula },
      update: {},
      create: {
        ced_usu: superAdminCedula,
        nom_usu: "Super",
        ape_usu: "Administrador",
        cel_usu: "0999999999",
        fec_cre_usu: new Date(),
        cuentas: {
          create: [
            {
              cor_usu: superAdminEmail,
              con_usu: hashedPassword,
              rol_usu: "ADMIN_GLOBAL",
              est_ver_cor: true, // Correo verificado automáticamente
              fec_ver_cor: new Date(), // Fecha de verificación
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
                "$2b$10$K4pLrJPZVgSq1AUc4klUQujp6m/83oU6ucJuB16udNApjHpg899o2", // 123456
              rol_usu: "ESTUDIANTE",
              est_ver_cor: true,
              fec_ver_cor: new Date(),
            },
          ],
        },
      },
    });

    console.log("Usuarios de prueba insertados correctamente");

    // 7. Obtener cuenta admin
    const cuentaAdmin = await prisma.cuenta.findUnique({
      where: { cor_usu: "admin@uta.edu.ec" },
    });

    // 8. Insertar evento principal
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

    // 9. Eventos adicionales
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

    // 10. Evento de tipo CURSO
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
