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
        val_eve: 200.0,
        est_eve: "ACTIVO",
        por_min_asi_eve: 70,
        img_por_eve: "https://i.imgur.com/f8adUbZ.png",
        cup_max_eve: 50,
        cup_dis_eve: 49,
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
        cup_dis_eve: 49,
        id_cue_cre_eve: cuentaAdmin.id_cue,
        mod_eve: "PRESENCIAL",
      },
    });
    console.log("Evento principal insertado correctamente");

    // 9. Eventos adicionales
    const eventos = [
      {
        id_eve: "41745eee-6a8f-4c92-8943-5382f1868bc2",
        nom_eve: "Bienvenida Estudiantil 2025",
        des_eve:
          "Espacio de integración para nuevos estudiantes con actividades recreativas, presentaciones institucionales y orientación académica.",
        tip_eve: "SOCIALIZACION",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-22T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "PRESENCIAL",
        val_eve: 5.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/0XoQJdZ.jpeg",
        por_min_asi_eve: 75,
        cup_max_eve: 5,
        cup_dis_eve: 5,
      },
      {
        id_eve: "a7133aa5-4891-49a1-b495-12aec5ab53c8",
        nom_eve: "Inteligencia Artificial en la Educación",
        des_eve:
          "Charla sobre el impacto y las oportunidades de la inteligencia artificial en los procesos de enseñanza y aprendizaje.",
        tip_eve: "CHARLA",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-22T05:00:00.000Z"),
        dur_hor_eve: 4,
        mod_eve: "PRESENCIAL",
        val_eve: 45.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/07qfHfh.jpeg",
        por_min_asi_eve: 45,
        cup_max_eve: 5,
        cup_dis_eve: 5,
      },
      {
        id_eve: "ddbf0681-fad5-487e-845c-8aff2792e0f6",
        nom_eve: "JavaScript",
        des_eve: "asdsad",
        tip_eve: "WEBINAR",
        fec_ini_eve: new Date("2025-06-19T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-27T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "PRESENCIAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/eewuw7g.jpeg",
        por_min_asi_eve: 52,
        cup_max_eve: 5,
        cup_dis_eve: 5,
      },
      {
        id_eve: "8c1c5837-e282-4dac-be35-5f7fa7e12b86",
        nom_eve: "Ruby",
        des_eve: "",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-27T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "VIRTUAL",
        val_eve: 2.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/8KjhFf1.jpeg",
        por_min_asi_eve: 55,
        cup_max_eve: 5,
        cup_dis_eve: 5,
      },
      {
        id_eve: "d468c0b5-e059-4e00-a93a-f64e24e582c0",
        nom_eve: "PHP",
        des_eve: "",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-20T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-29T05:00:00.000Z"),
        dur_hor_eve: 4,
        mod_eve: "PRESENCIAL",
        val_eve: 45.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/Gxe7GEN.jpeg",
        por_min_asi_eve: 45,
        cup_max_eve: 5,
        cup_dis_eve: 5,
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
        est_eve: "FINALIZADO",
        img_por_eve: "https://i.imgur.com/FVyOB4J.jpeg",
        por_min_asi_eve: 89,
        cup_max_eve: 200,
        cup_dis_eve: 199,
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
        est_eve: "FINALIZADO",
        img_por_eve: "https://i.imgur.com/hhxnaqA.png",
        por_min_asi_eve: 100,
        cup_max_eve: 100,
        cup_dis_eve: 99,
      },
      {
        id_eve: "92b8ce78-248e-4ff4-9bab-0cf3127b5f51",
        nom_eve: "La Depresión En Los Estudiantes",
        des_eve:
          "Charla informativa que busca concienciar sobre la depresión en estudiantes, sus causas, síntomas y estrategias para afrontarla.",
        tip_eve: "CHARLA",
        fec_ini_eve: new Date("2025-06-18T23:30:00.000Z"),
        fec_fin_eve: new Date("2025-06-19T02:00:00.000Z"),
        dur_hor_eve: 10,
        mod_eve: "SEMIPRESENCIAL",
        val_eve: 0.0,
        est_eve: "SUSPENDIDO",
        img_por_eve: "https://i.imgur.com/aNU3PX2.jpeg",
        por_min_asi_eve: 88,
        cup_max_eve: 50,
        cup_dis_eve: 50,
      },
      {
        id_eve: "73c28d62-e7e4-45df-81c8-654e9fb2d36c",
        nom_eve: "Anime Comic",
        des_eve: "Evento de actividades anime para otakus",
        tip_eve: "SOCIALIZACION",
        fec_ini_eve: new Date("2025-06-20T13:45:00.000Z"),
        fec_fin_eve: new Date("2025-06-22T04:30:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "PRESENCIAL",
        val_eve: 6.0,
        est_eve: "CANCELADO",
        img_por_eve: "https://i.imgur.com/sTyFrJw.jpeg",
        por_min_asi_eve: 88,
        cup_max_eve: 100,
        cup_dis_eve: 99,
      },
      {
        id_eve: "e75c9cb8-4c76-4a15-ac47-c4bc946e992d",
        nom_eve: "Comunicación Efectiva en Equipos de Trabajo",
        des_eve:
          "Taller interactivo para mejorar habilidades de comunicación y colaboración en entornos académicos y laborales.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-22T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-03T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "SEMIPRESENCIAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/od61mVk.jpeg",
        por_min_asi_eve: 55,
        cup_max_eve: 57,
        cup_dis_eve: 57,
      },
      {
        id_eve: "0c4e9719-6e5b-4bf4-9637-e642a953e9d7",
        nom_eve: "Anime X",
        des_eve:
          "Congreso académico y cultural que explora el anime desde perspectivas artísticas, sociales y educativas.",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-06-24T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-01T06:15:00.000Z"),
        dur_hor_eve: 2,
        mod_eve: "PRESENCIAL",
        val_eve: 10.0,
        est_eve: "FINALIZADO",
        img_por_eve: "https://i.imgur.com/ucG8QIl.png",
        por_min_asi_eve: 25,
        cup_max_eve: 10,
        cup_dis_eve: 10,
      },
      {
        id_eve: "cdd86459-0ada-4e4a-a1ff-4578d277db96",
        nom_eve: "Fundamentos de HTML y CSS",
        des_eve:
          "Curso práctico para aprender a crear y diseñar páginas web con HTML y CSS desde cero.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-22T05:00:00.000Z"),
        dur_hor_eve: 6,
        mod_eve: "SEMIPRESENCIAL",
        val_eve: 15.0,
        est_eve: "FINALIZADO",
        img_por_eve: "https://i.imgur.com/hZbXyp6.png",
        por_min_asi_eve: 66,
        cup_max_eve: 6,
        cup_dis_eve: 6,
      },
      {
        id_eve: "08137feb-da7d-4fd5-b600-e2f6fb4334dc",
        nom_eve: "Gestión del Estrés y Bienestar Laboral",
        des_eve:
          "Webinar para aprender técnicas prácticas que ayuden a manejar el estrés y mejorar el bienestar en el entorno laboral.",
        tip_eve: "WEBINAR",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-28T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "VIRTUAL",
        val_eve: 5.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/nMKcG7Q.jpeg",
        por_min_asi_eve: 54,
        cup_max_eve: 54,
        cup_dis_eve: 54,
      },
      {
        id_eve: "f8abc120-32a7-4fbe-aae6-6ed66f3c595f",
        nom_eve: "Innovación y Emprendimiento Social",
        des_eve:
          "Congreso para promover proyectos innovadores que generen impacto social positivo en la comunidad.",
        tip_eve: "CONGRESO",
        fec_ini_eve: new Date("2025-06-22T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-29T05:00:00.000Z"),
        dur_hor_eve: 9,
        mod_eve: "VIRTUAL",
        val_eve: 9.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/6zpP0N3.jpeg",
        por_min_asi_eve: 99,
        cup_max_eve: 99,
        cup_dis_eve: 99,
      },
      {
        id_eve: "f2575503-6234-4a03-bee7-0dd17e04b917",
        nom_eve: "Desarrollo Ágil de Software",
        des_eve:
          "Webinar sobre metodologías ágiles para optimizar procesos de desarrollo y entrega de software.",
        tip_eve: "WEBINAR",
        fec_ini_eve: new Date("2025-06-22T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-04T05:00:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "VIRTUAL",
        val_eve: 10.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/OkQKScU.jpeg",
        por_min_asi_eve: 75,
        cup_max_eve: 5,
        cup_dis_eve: 5,
      },
      {
        id_eve: "83dd0d01-a0c9-4d4b-aafe-af4600694306",
        nom_eve: "Programación en Java desde Cero",
        des_eve:
          "Curso introductorio para aprender los fundamentos de programación orientada a objetos con Java.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-22T08:45:00.000Z"),
        dur_hor_eve: 5,
        mod_eve: "PRESENCIAL",
        val_eve: 0.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/lEgZ9gI.png",
        por_min_asi_eve: 55,
        cup_max_eve: 8,
        cup_dis_eve: 8,
      },
      {
        id_eve: "fdcf18eb-91e9-44e7-9e2e-cea89d6280f2",
        nom_eve: "Introducción a la Programación en C++",
        des_eve:
          "Curso básico para aprender a programar con C++ y comprender los principios de la programación estructurada y orientada a objetos.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-24T05:00:00.000Z"),
        dur_hor_eve: 6,
        mod_eve: "PRESENCIAL",
        val_eve: 88.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/APQXht7.png",
        por_min_asi_eve: 66,
        cup_max_eve: 6,
        cup_dis_eve: 6,
      },
      {
        id_eve: "4f44a39f-4891-42a4-995b-191fddfa6fc3",
        nom_eve: "Desarrollo de Aplicaciones con .NET 9",
        des_eve:
          "Curso práctico para aprender a crear aplicaciones modernas con la nueva versión de .NET 9.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-21T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-06-27T05:00:00.000Z"),
        dur_hor_eve: 55,
        mod_eve: "VIRTUAL",
        val_eve: 2.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/4PoqgV7.png",
        por_min_asi_eve: 55,
        cup_max_eve: 58,
        cup_dis_eve: 58,
      },
      {
        id_eve: "da1e167e-56fa-4f3f-af5e-c3c1539461c3",
        nom_eve: "Seguridad en Aplicaciones Web",
        des_eve:
          "Charla sobre buenas prácticas y herramientas para proteger aplicaciones web frente a vulnerabilidades comunes.",
        tip_eve: "CHARLA",
        fec_ini_eve: new Date("2025-06-26T05:00:00.000Z"),
        fec_fin_eve: new Date("2025-07-05T05:00:00.000Z"),
        dur_hor_eve: 6,
        mod_eve: "PRESENCIAL",
        val_eve: 6.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/RSz8dqJ.png",
        por_min_asi_eve: 66,
        cup_max_eve: 6,
        cup_dis_eve: 6,
      },
      {
        id_eve: "cc55aacd-c38f-4c27-8ec1-76edc8d42427",
        nom_eve: "Programación en Java desde Cero",
        des_eve:
          "Curso introductorio para aprender los fundamentos de programación orientada a objetos con Java.",
        tip_eve: "CURSO",
        fec_ini_eve: new Date("2025-06-20T09:45:00.000Z"),
        fec_fin_eve: new Date("2025-06-28T05:00:00.000Z"),
        dur_hor_eve: 8,
        mod_eve: "PRESENCIAL",
        val_eve: 7.0,
        est_eve: "ACTIVO",
        img_por_eve: "https://i.imgur.com/f8adUbZ.png",
        por_min_asi_eve: 77,
        cup_max_eve: 77,
        cup_dis_eve: 76,
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

    // 10. Evento de tipo CURSO - Curso De Python
    const eventoCursoBase = {
      id_eve: "30854a1f-06c7-4c7c-979f-62545b54c9aa", // ID del evento CURSO
      nom_eve: "Curso De Python",
      des_eve: "Curso para aprender Python desde 0",
      tip_eve: "CURSO",
      fec_ini_eve: new Date("2025-06-18T08:00:00.000Z"),
      fec_fin_eve: new Date("2025-06-18T08:15:00.000Z"),
      dur_hor_eve: 5,
      mod_eve: "VIRTUAL",
      val_eve: 15.0,
      est_eve: "FINALIZADO",
      img_por_eve: "https://i.imgur.com/uVj7k7q.jpeg",
      por_min_asi_eve: 88,
      cup_max_eve: 80,
      cup_dis_eve: 78,
    };

    // Primero creamos o actualizamos el evento básico
    const eventoCreado = await prisma.evento.upsert({
      where: { id_eve: eventoCursoBase.id_eve },
      update: { ...eventoCursoBase, id_cue_cre_eve: cuentaAdmin.id_cue },
      create: { ...eventoCursoBase, id_cue_cre_eve: cuentaAdmin.id_cue },
    });

    // Luego upsert en evento_curso para todos los eventos de tipo CURSO
    const eventosCurso = [
      { id_eve: "30854a1f-06c7-4c7c-979f-62545b54c9aa", not_min_cur: 8.0 }, // Curso De Python
      { id_eve: "8c1c5837-e282-4dac-be35-5f7fa7e12b86", not_min_cur: 8.0 }, // Ruby
      { id_eve: "d468c0b5-e059-4e00-a93a-f64e24e582c0", not_min_cur: 8.0 }, // PHP
      { id_eve: "e75c9cb8-4c76-4a15-ac47-c4bc946e992d", not_min_cur: 8.0 }, // Comunicación Efectiva en Equipos de Trabajo
      { id_eve: "cdd86459-0ada-4e4a-a1ff-4578d277db96", not_min_cur: 8.0 }, // Fundamentos de HTML y CSS
      { id_eve: "83dd0d01-a0c9-4d4b-aafe-af4600694306", not_min_cur: 8.0 }, // Programación en Java desde Cero
      { id_eve: "fdcf18eb-91e9-44e7-9e2e-cea89d6280f2", not_min_cur: 8.0 }, // Introducción a la Programación en C++
      { id_eve: "4f44a39f-4891-42a4-995b-191fddfa6fc3", not_min_cur: 8.0 }, // Desarrollo de Aplicaciones con .NET 9
      { id_eve: "cc55aacd-c38f-4c27-8ec1-76edc8d42427", not_min_cur: 8.0 }, // Programación en Java desde Cero (segundo)
    ];

    await Promise.all(
      eventosCurso.map((curso) =>
        prisma.evento_curso.upsert({
          where: { id_eve_cur: curso.id_eve },
          update: { not_min_cur: curso.not_min_cur },
          create: {
            id_eve_cur: curso.id_eve,
            not_min_cur: curso.not_min_cur,
          },
        })
      )
    );

    console.log("Eventos CURSO insertados correctamente");
  } catch (error) {
    console.error("Error durante el seeding:", error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
