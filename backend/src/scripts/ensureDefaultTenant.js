const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULTS = {
  tenantName: process.env.DEFAULT_TENANT_NAME || "Universidad Tecnica de Ambato",
  tenantSlug: (process.env.DEFAULT_TENANT_SLUG || "uta").trim().toLowerCase(),
  tenantSubdomain: (process.env.DEFAULT_TENANT_SUBDOMAIN || "uta")
    .trim()
    .toLowerCase(),
  universityAddress:
    process.env.DEFAULT_UNIVERSITY_ADDRESS || "Av. Los Chasquis y Rio Payamino",
  facultyName:
    process.env.DEFAULT_FACULTY_NAME ||
    "Facultad de Ingenieria en Sistemas, Electronica e Industrial",
  facultyAcronym: process.env.DEFAULT_FACULTY_ACRONYM || "FISEI",
  facultyDescription:
    process.env.DEFAULT_FACULTY_DESCRIPTION ||
    "Facultad principal creada automaticamente para el tenant por defecto.",
  facultyMission:
    process.env.DEFAULT_FACULTY_MISSION ||
    "Formar profesionales con excelencia academica y compromiso social.",
  facultyVision:
    process.env.DEFAULT_FACULTY_VISION ||
    "Ser referente nacional en formacion universitaria e innovacion.",
};

async function ensureTenant() {
  let tenant = await prisma.tenant.findUnique({
    where: { slug: DEFAULTS.tenantSlug },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: DEFAULTS.tenantName,
        slug: DEFAULTS.tenantSlug,
        subdomain: DEFAULTS.tenantSubdomain,
        isActive: true,
      },
    });

    console.log(`✅ [TENANT] Creado tenant por defecto: ${tenant.slug}`);
  } else {
    console.log(`ℹ️ [TENANT] Tenant por defecto existente: ${tenant.slug}`);
  }

  return tenant;
}

async function ensureUniversity(tenantId) {
  let university = await prisma.university.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });

  if (!university) {
    university = await prisma.university.create({
      data: {
        tenantId,
        name: DEFAULTS.tenantName,
        acronym: "UTA",
        address: DEFAULTS.universityAddress,
        isActive: true,
      },
    });

    console.log("✅ [TENANT] Universidad por defecto creada");
  } else {
    console.log("ℹ️ [TENANT] Universidad existente detectada");
  }

  return university;
}

async function ensureFaculty(tenantId, universityId) {
  const existingFaculty = await prisma.faculty.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });

  if (existingFaculty) {
    console.log("ℹ️ [TENANT] Facultad existente detectada");
    return existingFaculty;
  }

  const faculty = await prisma.faculty.create({
    data: {
      tenantId,
      universityId,
      name: DEFAULTS.facultyName,
      acronym: DEFAULTS.facultyAcronym,
      description: DEFAULTS.facultyDescription,
      mission: DEFAULTS.facultyMission,
      vision: DEFAULTS.facultyVision,
    },
  });

  console.log("✅ [TENANT] Facultad por defecto creada");
  return faculty;
}

async function main() {
  if (!DEFAULTS.tenantSlug) {
    throw new Error("DEFAULT_TENANT_SLUG no puede estar vacio");
  }

  const tenant = await ensureTenant();
  const university = await ensureUniversity(tenant.id);
  await ensureFaculty(tenant.id, university.id);
}

main()
  .catch((error) => {
    console.error("❌ [TENANT] Error inicializando tenant por defecto:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
