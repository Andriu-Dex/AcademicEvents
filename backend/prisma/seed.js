const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// ============================================
// MAPEOS DE ENUMS DEL SEED VIEJO -> SCHEMA NUEVO
// ============================================

const FACULTY_AUTHORITY_TYPE_MAP = {
  DECANO: "DEAN",
  SUBDECANO: "VICE_DEAN",
  COORDINADOR: "COORDINATOR",
  SECRETARIO: "SECRETARY",
};

const EVENT_TYPE_MAP = {
  CURSO: "COURSE",
  CONGRESO: "CONGRESS",
  WEBINAR: "WEBINAR",
  CHARLA: "TALK",
  SOCIALIZACION: "SOCIALIZATION",
};

const EVENT_MODALITY_MAP = {
  PRESENCIAL: "IN_PERSON",
  VIRTUAL: "VIRTUAL",
  SEMIPRESENCIAL: "HYBRID",
};

const EVENT_STATUS_MAP = {
  ACTIVO: "ACTIVE",
  INACTIVO: "INACTIVE",
  FINALIZADO: "FINISHED",
  CANCELADO: "CANCELLED",
  SUSPENDIDO: "SUSPENDED",
};

// ============================================
// SOLO ESTOS EVENTOS CAMBIAN DE FECHA
// PARA QUE ESTÉN VIGENTES EL 07-03-2026
// ============================================

const ACTIVE_EVENT_OVERRIDES = {
  "80ce8ece-c17a-4c82-9d0d-be303eb25e37": {
    startDate: "2026-03-06T14:00:00.000Z",
    endDate: "2026-03-08T23:00:00.000Z",
    status: "ACTIVO",
    isFeatured: true,
  },
  "b1a2c3d4-e5f6-4789-8012-345678901234": {
    startDate: "2026-03-03T14:00:00.000Z",
    endDate: "2026-03-10T22:00:00.000Z",
    status: "ACTIVO",
    isFeatured: true,
  },
  "c2b3a4d5-f6e7-4890-9123-456789012345": {
    startDate: "2026-03-07T13:00:00.000Z",
    endDate: "2026-03-09T22:00:00.000Z",
    status: "ACTIVO",
    isFeatured: true,
  },
  "d3c4b5a6-e7f8-4901-0234-567890123456": {
    startDate: "2026-03-07T15:00:00.000Z",
    endDate: "2026-03-07T18:00:00.000Z",
    status: "ACTIVO",
    isFeatured: false,
  },
  "c8b9a0f1-f2e3-4456-5789-012345678901": {
    startDate: "2026-03-05T15:00:00.000Z",
    endDate: "2026-03-12T22:00:00.000Z",
    status: "ACTIVO",
    isFeatured: true,
  },
  "da1e167e-56fa-4f3f-af5e-c3c1539461c3": {
    startDate: "2026-03-06T14:00:00.000Z",
    endDate: "2026-03-09T19:00:00.000Z",
    status: "ACTIVO",
    isFeatured: false,
  },
  "f2575503-6234-4a03-bee7-0dd17e04b917": {
    startDate: "2026-03-04T14:00:00.000Z",
    endDate: "2026-03-11T22:00:00.000Z",
    status: "ACTIVO",
    isFeatured: false,
  },
  "30854a1f-06c7-4c7c-979f-62545b54c9aa": {
    startDate: "2026-03-01T13:00:00.000Z",
    endDate: "2026-03-14T22:00:00.000Z",
    status: "ACTIVO",
    isFeatured: true,
  },
};

// ============================================
// DATA BASE
// ============================================

const universityAuthorities = [
  {
    id: "uta-rector",
    type: "RECTOR",
    firstName: "Galo",
    lastName: "Naranjo",
    email: "rector@uta.edu.ec",
    academicTitle: "PhD.",
    startDate: new Date("2022-01-01"),
    isActive: true,
  },
  {
    id: "uta-academic-vr",
    type: "ACADEMIC_VICE_RECTOR",
    firstName: "Elsa",
    lastName: "Hernández",
    email: "vicerrectorado.academico@uta.edu.ec",
    academicTitle: "PhD.",
    startDate: new Date("2022-01-01"),
    isActive: true,
  },
];

const facultyAuthorities = [
  {
    id: "fisei-dean",
    type: "DECANO",
    firstName: "Franklin",
    lastName: "Mayorga Mogollón",
    email: "fmayorga@uta.edu.ec",
    imageUrl: "https://i.imgur.com/hYBsxIf.png",
    academicTitle: "Dr.",
    startDate: new Date("2023-01-01"),
  },
  {
    id: "fisei-vice-dean",
    type: "SUBDECANO",
    firstName: "Javier",
    lastName: "Sánchez Torres",
    email: "j.sanchez@uta.edu.ec",
    imageUrl: "https://i.imgur.com/JIQy6Fa.png",
    academicTitle: "Dr.",
    startDate: new Date("2023-01-01"),
  },
  {
    id: "fisei-coord-marco",
    type: "COORDINADOR",
    firstName: "Marco",
    lastName: "Guachimboza",
    email: "marcovguachimboza@uta.edu.ec",
    imageUrl: "https://i.imgur.com/XDFrTBI.png",
    academicTitle: "Ing. Mg.",
    startDate: new Date("2023-01-01"),
  },
  {
    id: "fisei-coord-freddy",
    type: "COORDINADOR",
    firstName: "Freddy",
    lastName: "Robalino",
    email: "r.morales@uta.edu.ec",
    imageUrl: "https://i.imgur.com/daKWf7d.png",
    academicTitle: "Ing. Mg.",
    startDate: new Date("2023-01-01"),
  },
  {
    id: "fisei-coord-cesar",
    type: "COORDINADOR",
    firstName: "César",
    lastName: "Rosero",
    email: "cesararosero@uta.edu.ec",
    imageUrl: "https://i.imgur.com/d4hRu17.png",
    academicTitle: "Ing. Mg.",
    startDate: new Date("2023-01-01"),
  },
];

const coordinators = [
  {
    firstName: "Marco",
    lastName: "Guachimboza",
    email: "marcovguachimboza@uta.edu.ec",
    imageUrl: "https://i.imgur.com/XDFrTBI.png",
    title: "Ing. Mg.",
  },
  {
    firstName: "Freddy",
    lastName: "Robalino",
    email: "r.morales@uta.edu.ec",
    imageUrl: "https://i.imgur.com/daKWf7d.png",
    title: "Ing. Mg.",
  },
  {
    firstName: "César",
    lastName: "Rosero",
    email: "cesararosero@uta.edu.ec",
    imageUrl: "https://i.imgur.com/d4hRu17.png",
    title: "Ing. Mg.",
  },
];

const careers = [
  {
    name: "Tecnologías de la Información",
    description:
      "Carrera enfocada en el desarrollo de habilidades para gestionar tecnologías de información empresarial.",
    durationSemesters: 9,
    modality: "IN_PERSON",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2620/2620617.png",
    coordinatorEmail: "marcovguachimboza@uta.edu.ec",
  },
  {
    name: "Telecomunicaciones",
    description:
      "Formación en redes y sistemas de comunicación con enfoque en infraestructura tecnológica.",
    durationSemesters: 10,
    modality: "IN_PERSON",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
    coordinatorEmail: "r.morales@uta.edu.ec",
  },
  {
    name: "Ingeniería Industrial",
    description:
      "Carrera que optimiza procesos de producción y sistemas organizacionales.",
    durationSemesters: 10,
    modality: "IN_PERSON",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
    coordinatorEmail: "cesararosero@uta.edu.ec",
  },
  {
    name: "Software",
    description:
      "Especialización en desarrollo de aplicaciones y sistemas informáticos modernos.",
    durationSemesters: 8,
    modality: "HYBRID",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2620/2620617.png",
    coordinatorEmail: "marcovguachimboza@uta.edu.ec",
  },
  {
    name: "Automatización y Robótica",
    description:
      "Enfocada en sistemas automatizados, control industrial y robótica aplicada.",
    durationSemesters: 9,
    modality: "IN_PERSON",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
    coordinatorEmail: "r.morales@uta.edu.ec",
  },
];

const rawEvents = [
  {
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
    mod_eve: "PRESENCIAL",
  },
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
    des_eve: "Congreso que trata los mejores lenguajes de programación en 2025",
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
  {
    id_eve: "b1a2c3d4-e5f6-4789-8012-345678901234",
    nom_eve: "Machine Learning con Python",
    des_eve:
      "Taller intensivo para aprender fundamentos de aprendizaje automático utilizando bibliotecas como scikit-learn y pandas.",
    tip_eve: "CURSO",
    fec_ini_eve: new Date("2025-06-25T09:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-02T17:00:00.000Z"),
    dur_hor_eve: 40,
    mod_eve: "SEMIPRESENCIAL",
    val_eve: 120.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/uVj7k7q.jpeg",
    por_min_asi_eve: 80,
    cup_max_eve: 25,
    cup_dis_eve: 22,
  },
  {
    id_eve: "c2b3a4d5-f6e7-4890-9123-456789012345",
    nom_eve: "Ciberseguridad en el Mundo Digital",
    des_eve:
      "Conferencia sobre amenazas digitales actuales y estrategias de protección para empresas y usuarios.",
    tip_eve: "CONGRESO",
    fec_ini_eve: new Date("2025-06-28T08:00:00.000Z"),
    fec_fin_eve: new Date("2025-06-30T18:00:00.000Z"),
    dur_hor_eve: 24,
    mod_eve: "PRESENCIAL",
    val_eve: 80.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/RSz8dqJ.png",
    por_min_asi_eve: 70,
    cup_max_eve: 100,
    cup_dis_eve: 95,
  },
  {
    id_eve: "d3c4b5a6-e7f8-4901-0234-567890123456",
    nom_eve: "Diseño UX/UI para Aplicaciones Móviles",
    des_eve:
      "Webinar sobre principios de diseño centrado en el usuario para crear interfaces intuitivas y atractivas.",
    tip_eve: "WEBINAR",
    fec_ini_eve: new Date("2025-07-01T15:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-01T18:00:00.000Z"),
    dur_hor_eve: 3,
    mod_eve: "VIRTUAL",
    val_eve: 25.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/OkQKScU.jpeg",
    por_min_asi_eve: 60,
    cup_max_eve: 150,
    cup_dis_eve: 148,
  },
  {
    id_eve: "e4d5c6b7-f8e9-4012-1345-678901234567",
    nom_eve: "Blockchain y Criptomonedas: Presente y Futuro",
    des_eve:
      "Charla informativa sobre tecnología blockchain, su impacto en las finanzas y aplicaciones futuras.",
    tip_eve: "CHARLA",
    fec_ini_eve: new Date("2025-07-05T10:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-05T12:00:00.000Z"),
    dur_hor_eve: 2,
    mod_eve: "VIRTUAL",
    val_eve: 0.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/f8adUbZ.png",
    por_min_asi_eve: 50,
    cup_max_eve: 200,
    cup_dis_eve: 180,
  },
  {
    id_eve: "f5e6d7c8-e9f0-4123-2456-789012345678",
    nom_eve: "Desarrollo de Videojuegos con Unity",
    des_eve:
      "Curso práctico para crear juegos 2D y 3D utilizando el motor Unity y programación en C#.",
    tip_eve: "CURSO",
    fec_ini_eve: new Date("2025-07-07T09:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-14T17:00:00.000Z"),
    dur_hor_eve: 35,
    mod_eve: "PRESENCIAL",
    val_eve: 150.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/lEgZ9gI.png",
    por_min_asi_eve: 75,
    cup_max_eve: 20,
    cup_dis_eve: 18,
  },
  {
    id_eve: "a6f7e8d9-f0e1-4234-3567-890123456789",
    nom_eve: "Marketing Digital y Redes Sociales",
    des_eve:
      "Seminario sobre estrategias de marketing digital, gestión de redes sociales y análisis de métricas.",
    tip_eve: "WEBINAR",
    fec_ini_eve: new Date("2025-07-10T14:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-10T17:00:00.000Z"),
    dur_hor_eve: 3,
    mod_eve: "VIRTUAL",
    val_eve: 30.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/6zpP0N3.jpeg",
    por_min_asi_eve: 65,
    cup_max_eve: 80,
    cup_dis_eve: 75,
  },
  {
    id_eve: "b7a8f9e0-e1f2-4345-4678-901234567890",
    nom_eve: "Festival de Robótica Estudiantil",
    des_eve:
      "Evento de socialización donde estudiantes presentan proyectos de robótica y automatización.",
    tip_eve: "SOCIALIZACION",
    fec_ini_eve: new Date("2025-07-12T08:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-13T18:00:00.000Z"),
    dur_hor_eve: 16,
    mod_eve: "PRESENCIAL",
    val_eve: 10.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/0XoQJdZ.jpeg",
    por_min_asi_eve: 40,
    cup_max_eve: 300,
    cup_dis_eve: 285,
  },
  {
    id_eve: "c8b9a0f1-f2e3-4456-5789-012345678901",
    nom_eve: "Cloud Computing con AWS",
    des_eve:
      "Curso de introducción a servicios en la nube de Amazon Web Services para desarrolladores.",
    tip_eve: "CURSO",
    fec_ini_eve: new Date("2025-07-15T10:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-22T16:00:00.000Z"),
    dur_hor_eve: 30,
    mod_eve: "VIRTUAL",
    val_eve: 100.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/4PoqgV7.png",
    por_min_asi_eve: 70,
    cup_max_eve: 40,
    cup_dis_eve: 35,
  },
  {
    id_eve: "d9c0b1a2-e3f4-4567-6890-123456789012",
    nom_eve: "Liderazgo y Gestión de Equipos",
    des_eve:
      "Taller sobre habilidades de liderazgo, comunicación efectiva y gestión de equipos multidisciplinarios.",
    tip_eve: "CHARLA",
    fec_ini_eve: new Date("2025-07-18T09:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-18T13:00:00.000Z"),
    dur_hor_eve: 4,
    mod_eve: "SEMIPRESENCIAL",
    val_eve: 20.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/nMKcG7Q.jpeg",
    por_min_asi_eve: 55,
    cup_max_eve: 60,
    cup_dis_eve: 58,
  },
  {
    id_eve: "e0d1c2b3-f4e5-4678-7901-234567890123",
    nom_eve: "Internet de las Cosas (IoT)",
    des_eve:
      "Congreso sobre dispositivos conectados, sensores inteligentes y el futuro del IoT en la industria.",
    tip_eve: "CONGRESO",
    fec_ini_eve: new Date("2025-07-20T08:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-22T17:00:00.000Z"),
    dur_hor_eve: 18,
    mod_eve: "PRESENCIAL",
    val_eve: 75.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/07qfHfh.jpeg",
    por_min_asi_eve: 65,
    cup_max_eve: 120,
    cup_dis_eve: 115,
  },
  {
    id_eve: "f1e2d3c4-e5f6-4789-8012-345678901234",
    nom_eve: "Programación Competitiva",
    des_eve:
      "Webinar sobre técnicas y estrategias para competencias de programación como ACM-ICPC y Codeforces.",
    tip_eve: "WEBINAR",
    fec_ini_eve: new Date("2025-07-25T16:00:00.000Z"),
    fec_fin_eve: new Date("2025-07-25T19:00:00.000Z"),
    dur_hor_eve: 3,
    mod_eve: "VIRTUAL",
    val_eve: 15.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/eewuw7g.jpeg",
    por_min_asi_eve: 85,
    cup_max_eve: 50,
    cup_dis_eve: 45,
  },
  {
    id_eve: "a2f3e4d5-f6e7-4890-9123-456789012345",
    nom_eve: "Realidad Virtual y Aumentada",
    des_eve:
      "Curso sobre desarrollo de aplicaciones de VR/AR utilizando Unity y herramientas especializadas.",
    tip_eve: "CURSO",
    fec_ini_eve: new Date("2025-07-28T09:00:00.000Z"),
    fec_fin_eve: new Date("2025-08-04T17:00:00.000Z"),
    dur_hor_eve: 32,
    mod_eve: "PRESENCIAL",
    val_eve: 180.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/APQXht7.png",
    por_min_asi_eve: 80,
    cup_max_eve: 15,
    cup_dis_eve: 12,
  },
  {
    id_eve: "b3a4f5e6-e7f8-4901-0234-567890123456",
    nom_eve: "Hackathon Universitario 2025",
    des_eve:
      "Competencia de programación de 48 horas donde equipos desarrollan soluciones innovadoras a problemas reales.",
    tip_eve: "SOCIALIZACION",
    fec_ini_eve: new Date("2025-08-01T18:00:00.000Z"),
    fec_fin_eve: new Date("2025-08-03T18:00:00.000Z"),
    dur_hor_eve: 48,
    mod_eve: "PRESENCIAL",
    val_eve: 25.0,
    est_eve: "ACTIVO",
    img_por_eve: "https://i.imgur.com/sTyFrJw.jpeg",
    por_min_asi_eve: 90,
    cup_max_eve: 100,
    cup_dis_eve: 88,
  },
  {
    id_eve: "30854a1f-06c7-4c7c-979f-62545b54c9aa",
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
  },
];

const courseEventMinPassingGrades = [
  { id_eve: "30854a1f-06c7-4c7c-979f-62545b54c9aa", minPassingGrade: 8.0 },
  { id_eve: "8c1c5837-e282-4dac-be35-5f7fa7e12b86", minPassingGrade: 8.0 },
  { id_eve: "d468c0b5-e059-4e00-a93a-f64e24e582c0", minPassingGrade: 8.0 },
  { id_eve: "e75c9cb8-4c76-4a15-ac47-c4bc946e992d", minPassingGrade: 8.0 },
  { id_eve: "cdd86459-0ada-4e4a-a1ff-4578d277db96", minPassingGrade: 8.0 },
  { id_eve: "83dd0d01-a0c9-4d4b-aafe-af4600694306", minPassingGrade: 8.0 },
  { id_eve: "fdcf18eb-91e9-44e7-9e2e-cea89d6280f2", minPassingGrade: 8.0 },
  { id_eve: "4f44a39f-4891-42a4-995b-191fddfa6fc3", minPassingGrade: 8.0 },
  { id_eve: "cc55aacd-c38f-4c27-8ec1-76edc8d42427", minPassingGrade: 8.0 },
  { id_eve: "b1a2c3d4-e5f6-4789-8012-345678901234", minPassingGrade: 8.0 },
  { id_eve: "f5e6d7c8-e9f0-4123-2456-789012345678", minPassingGrade: 8.0 },
  { id_eve: "c8b9a0f1-f2e3-4456-5789-012345678901", minPassingGrade: 8.0 },
  { id_eve: "a2f3e4d5-f6e7-4890-9123-456789012345", minPassingGrade: 8.0 },
];

// ============================================
// HELPERS
// ============================================

function normalizeEvent(raw) {
  const override = ACTIVE_EVENT_OVERRIDES[raw.id_eve] || {};

  const startDate = override.startDate
    ? new Date(override.startDate)
    : raw.fec_ini_eve;

  const endDate = override.endDate
    ? new Date(override.endDate)
    : raw.fec_fin_eve;

  return {
    id: raw.id_eve,
    name: raw.nom_eve,
    description: raw.des_eve && raw.des_eve.trim() !== "" ? raw.des_eve : null,
    type: EVENT_TYPE_MAP[raw.tip_eve],
    modality: EVENT_MODALITY_MAP[raw.mod_eve],
    status: EVENT_STATUS_MAP[override.status || raw.est_eve],
    startDate,
    endDate,
    durationHours: raw.dur_hor_eve,
    price: raw.val_eve,
    coverImageUrl: raw.img_por_eve,
    minAttendancePercent: raw.por_min_asi_eve,
    maxCapacity: raw.cup_max_eve,
    availableSpots: raw.cup_dis_eve,
    isFeatured: override.isFeatured ?? false,
  };
}

async function main() {
  console.log("URL de conexión:", process.env.DATABASE_URL);
  console.log("🌱 Iniciando seed adaptado al schema nuevo...\n");

  try {
    // ============================================
    // 1. TENANT
    // ============================================
    const tenant = await prisma.tenant.upsert({
      where: { slug: "uta" },
      update: {
        name: "Universidad Técnica de Ambato",
        subdomain: "uta",
        primaryColor: "#0066cc",
        logoUrl: "https://i.imgur.com/MgZ1TiM.png",
        isActive: true,
        settings: {
          maxEventsPerMonth: 100,
          allowPublicRegistrations: true,
          requireEmailVerification: true,
        },
      },
      create: {
        id: "uta-tenant-id",
        name: "Universidad Técnica de Ambato",
        slug: "uta",
        subdomain: "uta",
        primaryColor: "#0066cc",
        logoUrl: "https://i.imgur.com/MgZ1TiM.png",
        isActive: true,
        settings: {
          maxEventsPerMonth: 100,
          allowPublicRegistrations: true,
          requireEmailVerification: true,
        },
      },
    });
    console.log("✅ Tenant creado/actualizado");

    // ============================================
    // 2. UNIVERSITY
    // ============================================
    const university = await prisma.university.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Universidad Técnica de Ambato",
        },
      },
      update: {
        acronym: "UTA",
        logoUrl: "https://i.imgur.com/MgZ1TiM.png",
        websiteUrl: "https://uta.edu.ec/",
        address: "Av. Los Chasquis y Rio Payamino",
        phone: "03-3700090",
        email: "utarectorado@uta.edu.ec",
        foundedAt: new Date("1969-04-18"),
        isActive: true,
      },
      create: {
        id: "uta-university-id",
        tenantId: tenant.id,
        name: "Universidad Técnica de Ambato",
        acronym: "UTA",
        logoUrl: "https://i.imgur.com/MgZ1TiM.png",
        websiteUrl: "https://uta.edu.ec/",
        address: "Av. Los Chasquis y Rio Payamino",
        phone: "03-3700090",
        email: "utarectorado@uta.edu.ec",
        foundedAt: new Date("1969-04-18"),
        isActive: true,
      },
    });
    console.log("✅ Universidad creada/actualizada");

    // ============================================
    // 3. UNIVERSITY AUTHORITIES
    // ============================================
    await Promise.all(
      universityAuthorities.map((authority) =>
        prisma.universityAuthority.upsert({
          where: { id: authority.id },
          update: {
            tenantId: tenant.id,
            universityId: university.id,
            type: authority.type,
            firstName: authority.firstName,
            lastName: authority.lastName,
            email: authority.email,
            academicTitle: authority.academicTitle,
            startDate: authority.startDate,
            isActive: authority.isActive,
          },
          create: {
            id: authority.id,
            tenantId: tenant.id,
            universityId: university.id,
            type: authority.type,
            firstName: authority.firstName,
            lastName: authority.lastName,
            email: authority.email,
            academicTitle: authority.academicTitle,
            startDate: authority.startDate,
            isActive: authority.isActive,
          },
        })
      )
    );
    console.log("✅ Autoridades de universidad creadas/actualizadas");

    // ============================================
    // 4. FACULTY
    // ============================================
    const faculty = await prisma.faculty.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        },
      },
      update: {
        universityId: university.id,
        acronym: "FISEI",
        logoUrl: "https://imgur.com/fch1iy6.png",
        description:
          "Formar profesionales íntegros y competentes, fomentar la investigación científica y tecnológica, y promover un ambiente de integración y colaboración que responda a las demandas del entorno nacional e internacional.",
        mission:
          "Formar profesionales líderes competentes, con visión humanista y pensamiento crítico, a través de la Docencia, la Investigación y la Vinculación, que apliquen, promuevan y difundan el conocimiento respondiendo a las necesidades del país.",
        vision:
          "La Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato, por sus niveles de excelencia, se constituirá como un centro de formación superior con liderazgo y proyección nacional e internacional.",
      },
      create: {
        id: "uta-fisei-id",
        tenantId: tenant.id,
        universityId: university.id,
        name: "Facultad de Ingeniería en Sistemas, Electrónica e Industrial",
        acronym: "FISEI",
        logoUrl: "https://imgur.com/fch1iy6.png",
        description:
          "Formar profesionales íntegros y competentes, fomentar la investigación científica y tecnológica, y promover un ambiente de integración y colaboración que responda a las demandas del entorno nacional e internacional.",
        mission:
          "Formar profesionales líderes competentes, con visión humanista y pensamiento crítico, a través de la Docencia, la Investigación y la Vinculación, que apliquen, promuevan y difundan el conocimiento respondiendo a las necesidades del país.",
        vision:
          "La Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato, por sus niveles de excelencia, se constituirá como un centro de formación superior con liderazgo y proyección nacional e internacional.",
      },
    });
    console.log("✅ Facultad creada/actualizada");

    // ============================================
    // 5. FACULTY AUTHORITIES
    // ============================================
    await Promise.all(
      facultyAuthorities.map((authority) =>
        prisma.facultyAuthority.upsert({
          where: { id: authority.id },
          update: {
            tenantId: tenant.id,
            facultyId: faculty.id,
            type: FACULTY_AUTHORITY_TYPE_MAP[authority.type],
            firstName: authority.firstName,
            lastName: authority.lastName,
            email: authority.email,
            imageUrl: authority.imageUrl,
            academicTitle: authority.academicTitle,
            startDate: authority.startDate,
            isActive: true,
          },
          create: {
            id: authority.id,
            tenantId: tenant.id,
            facultyId: faculty.id,
            type: FACULTY_AUTHORITY_TYPE_MAP[authority.type],
            firstName: authority.firstName,
            lastName: authority.lastName,
            email: authority.email,
            imageUrl: authority.imageUrl,
            academicTitle: authority.academicTitle,
            startDate: authority.startDate,
            isActive: true,
          },
        })
      )
    );
    console.log("✅ Autoridades de facultad creadas/actualizadas");

    // ============================================
    // 6. COORDINATORS
    // ============================================
    const createdCoordinators = await Promise.all(
      coordinators.map((coordinator) =>
        prisma.coordinator.upsert({
          where: {
            tenantId_email: {
              tenantId: tenant.id,
              email: coordinator.email,
            },
          },
          update: {
            firstName: coordinator.firstName,
            lastName: coordinator.lastName,
            imageUrl: coordinator.imageUrl,
            title: coordinator.title,
          },
          create: {
            tenantId: tenant.id,
            firstName: coordinator.firstName,
            lastName: coordinator.lastName,
            email: coordinator.email,
            imageUrl: coordinator.imageUrl,
            title: coordinator.title,
          },
        })
      )
    );
    console.log("✅ Coordinadores creados/actualizados");

    const coordinatorByEmail = Object.fromEntries(
      createdCoordinators.map((c) => [c.email, c])
    );

    // ============================================
    // 7. CAREERS
    // ============================================
    const createdCareers = await Promise.all(
      careers.map((career) =>
        prisma.career.upsert({
          where: {
            tenantId_name: {
              tenantId: tenant.id,
              name: career.name,
            },
          },
          update: {
            facultyId: faculty.id,
            coordinatorId: coordinatorByEmail[career.coordinatorEmail]?.id || null,
            description: career.description,
            durationSemesters: career.durationSemesters,
            modality: career.modality,
            iconUrl: career.iconUrl,
            isActive: true,
          },
          create: {
            tenantId: tenant.id,
            facultyId: faculty.id,
            coordinatorId: coordinatorByEmail[career.coordinatorEmail]?.id || null,
            name: career.name,
            description: career.description,
            durationSemesters: career.durationSemesters,
            modality: career.modality,
            iconUrl: career.iconUrl,
            isActive: true,
          },
        })
      )
    );
    console.log("✅ Carreras creadas/actualizadas");

    // ============================================
    // 8. USERS & ACCOUNTS
    // ============================================
    const superAdminIdNumber = process.env.SUPER_ADMIN_CEDULA || "9999999999";
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@uta.edu.ec";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin12345";

    const adminPasswordHash =
      superAdminPassword === "Admin12345"
        ? "$2b$10$9rzmh2NncdUMRaZDpRDcpOiv59fwxuafQOvmeYxa4sGwqHhx6KvnW"
        : await bcrypt.hash(superAdminPassword, 10);

    const superAdminUser = await prisma.user.upsert({
      where: {
        tenantId_idNumber: {
          tenantId: tenant.id,
          idNumber: superAdminIdNumber,
        },
      },
      update: {
        firstName: "Super",
        lastName: "Administrador",
        phone: "0999999999",
      },
      create: {
        tenantId: tenant.id,
        idNumber: superAdminIdNumber,
        firstName: "Super",
        lastName: "Administrador",
        phone: "0999999999",
      },
    });

    const superAdminAccount = await prisma.account.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: superAdminEmail,
        },
      },
      update: {
        userId: superAdminUser.id,
        password: adminPasswordHash,
        role: "GLOBAL_ADMIN",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        userId: superAdminUser.id,
        email: superAdminEmail,
        password: adminPasswordHash,
        role: "GLOBAL_ADMIN",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    const studentPasswordHash = await bcrypt.hash("Student123!", 10);

    const studentSeeds = Array.from({ length: 5 }).map((_, index) => ({
      idNumber: `180${String(index + 1).padStart(7, "0")}`,
      firstName: `Estudiante${index + 1}`,
      lastName: `Apellido${index + 1}`,
      phone: `099${String(index + 1).padStart(7, "0")}`,
      email: `estudiante${index + 1}@uta.edu.ec`,
      careerId: createdCareers[index % createdCareers.length].id,
    }));

    const createdStudents = [];
    for (const student of studentSeeds) {
      const user = await prisma.user.upsert({
        where: {
          tenantId_idNumber: {
            tenantId: tenant.id,
            idNumber: student.idNumber,
          },
        },
        update: {
          careerId: student.careerId,
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
        },
        create: {
          tenantId: tenant.id,
          careerId: student.careerId,
          idNumber: student.idNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
        },
      });

      const account = await prisma.account.upsert({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: student.email,
          },
        },
        update: {
          userId: user.id,
          password: studentPasswordHash,
          role: "STUDENT",
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
        create: {
          tenantId: tenant.id,
          userId: user.id,
          email: student.email,
          password: studentPasswordHash,
          role: "STUDENT",
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      createdStudents.push({ user, account });
    }
    console.log("✅ Usuarios y cuentas creados/actualizados");

    // ============================================
    // 9. EVENTS
    // ============================================
    const normalizedEvents = rawEvents.map(normalizeEvent);

    const createdEvents = await Promise.all(
      normalizedEvents.map((event) =>
        prisma.event.upsert({
          where: { id: event.id },
          update: {
            tenantId: tenant.id,
            createdByAccountId: superAdminAccount.id,
            name: event.name,
            description: event.description,
            type: event.type,
            modality: event.modality,
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            durationHours: event.durationHours,
            price: event.price,
            coverImageUrl: event.coverImageUrl,
            minAttendancePercent: event.minAttendancePercent,
            maxCapacity: event.maxCapacity,
            availableSpots: event.availableSpots,
            isFeatured: event.isFeatured,
          },
          create: {
            id: event.id,
            tenantId: tenant.id,
            createdByAccountId: superAdminAccount.id,
            name: event.name,
            description: event.description,
            type: event.type,
            modality: event.modality,
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            durationHours: event.durationHours,
            price: event.price,
            coverImageUrl: event.coverImageUrl,
            minAttendancePercent: event.minAttendancePercent,
            maxCapacity: event.maxCapacity,
            availableSpots: event.availableSpots,
            isFeatured: event.isFeatured,
          },
        })
      )
    );
    console.log(`✅ Eventos creados/actualizados: ${createdEvents.length}`);

    // ============================================
    // 10. EVENT COURSES
    // ============================================
    await Promise.all(
      courseEventMinPassingGrades.map((course) =>
        prisma.eventCourse.upsert({
          where: { eventId: course.id_eve },
          update: { minPassingGrade: course.minPassingGrade },
          create: {
            eventId: course.id_eve,
            minPassingGrade: course.minPassingGrade,
          },
        })
      )
    );
    console.log("✅ EventCourse creados/actualizados");

    // ============================================
    // 11. EVENT CAREERS
    // Asociamos todos los eventos a todas las carreras
    // para que el seed quede bien poblado.
    // ============================================
    const eventCareerRows = createdEvents.flatMap((event) =>
      createdCareers.map((career) => ({
        tenantId: tenant.id,
        eventId: event.id,
        careerId: career.id,
      }))
    );

    await prisma.eventCareer.createMany({
      data: eventCareerRows,
      skipDuplicates: true,
    });
    console.log("✅ EventCareer creados");

    // ============================================
    // 12. REGISTRATIONS DE MUESTRA
    // ============================================
    const registrationSeeds = [
      {
        accountId: createdStudents[0].account.id,
        eventId: "b1a2c3d4-e5f6-4789-8012-345678901234",
        status: "ACCEPTED",
      },
      {
        accountId: createdStudents[1].account.id,
        eventId: "b1a2c3d4-e5f6-4789-8012-345678901234",
        status: "ACCEPTED",
      },
      {
        accountId: createdStudents[2].account.id,
        eventId: "b1a2c3d4-e5f6-4789-8012-345678901234",
        status: "ACCEPTED",
      },
      {
        accountId: createdStudents[3].account.id,
        eventId: "80ce8ece-c17a-4c82-9d0d-be303eb25e37",
        status: "ACCEPTED",
      },
    ];

    const createdRegistrations = [];
    for (const reg of registrationSeeds) {
      const registration = await prisma.registration.upsert({
        where: {
          tenantId_accountId_eventId: {
            tenantId: tenant.id,
            accountId: reg.accountId,
            eventId: reg.eventId,
          },
        },
        update: {
          status: reg.status,
          validatedByAdminId: superAdminAccount.id,
          validatedAt: new Date(),
          occupiesSpot: true,
        },
        create: {
          tenantId: tenant.id,
          accountId: reg.accountId,
          eventId: reg.eventId,
          status: reg.status,
          validatedByAdminId: superAdminAccount.id,
          validatedAt: new Date(),
          occupiesSpot: true,
        },
      });

      createdRegistrations.push(registration);
    }

    // Para cursos, dejamos fila en RegistrationCourse aunque todavía no haya nota final
    const courseRegistrations = createdRegistrations.filter(
      (reg) => reg.eventId === "b1a2c3d4-e5f6-4789-8012-345678901234"
    );

    await Promise.all(
      courseRegistrations.map((reg) =>
        prisma.registrationCourse.upsert({
          where: { registrationId: reg.id },
          update: { finalGrade: null },
          create: {
            registrationId: reg.id,
            finalGrade: null,
          },
        })
      )
    );

    console.log("✅ Inscripciones de muestra creadas/actualizadas");

    console.log("\n✨ Seed completado correctamente.\n");
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();