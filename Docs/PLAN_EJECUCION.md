# Plan de Ejecución - Refactorización Multi-Tenant

Este documento contiene las instrucciones paso a paso para la refactorización completa del proyecto a inglés con soporte multi-tenant.

---

## Preparación Inicial

### Backup y Creación de Rama

```bash
# Backup de base de datos (si tiene datos importantes)
pg_dump -U postgres academic_events > backup_$(date +%Y%m%d_%H%M%S).sql

# Crear rama de trabajo
git checkout -b refactor/multi-tenant-english

# Backup del schema actual
cp backend/prisma/schema.prisma backend/prisma/schema.prisma.backup
```

### Configuración de Entorno

```bash
# Variables de entorno necesarias (.env)
# Agregar:
DEFAULT_TENANT_NAME="Universidad Técnica de Ambato"
DEFAULT_TENANT_SLUG="uta"
DEFAULT_TENANT_SUBDOMAIN="uta"
```

---

## FASE 1: Schema Prisma + Migración + Seed

### 1.1 Crear Nuevo Schema en Inglés con Multi-Tenant

Reemplazar completamente `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// MULTI-TENANT
// ============================================

model Tenant {
  id            String   @id @default(uuid())
  name          String   @unique
  slug          String   @unique
  subdomain     String?  @unique
  customDomain  String?  @unique
  primaryColor  String   @default("#1e40af")
  logoUrl       String?
  faviconUrl    String?
  settings      Json     @default("{}")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  universities          University[]
  universityAuthorities UniversityAuthority[]
  faculties             Faculty[]
  facultyAuthorities    FacultyAuthority[]
  careers               Career[]
  coordinators          Coordinator[]
  users                 User[]
  accounts              Account[]
  events                Event[]
  eventCareers          EventCareer[]
  registrations         Registration[]
  paymentReceipts       PaymentReceipt[]
  motivationLetters     MotivationLetter[]
  registrationObservations RegistrationObservation[]
  certificates          Certificate[]
  accountTokens         AccountToken[]
  tokenInvalidations    TokenInvalidation[]
  tokenUsages           TokenUsage[]
  tokenMetadata         TokenMetadata[]
  
  @@index([slug])
  @@index([subdomain])
}

// ============================================
// UNIVERSITY & HIERARCHY
// ============================================

model University {
  id          String    @id @default(uuid())
  tenantId    String
  name        String
  acronym     String?
  logoUrl     String?
  websiteUrl  String?
  address     String
  phone       String?
  email       String?
  foundedAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  
  tenant      Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  faculties   Faculty[]
  authorities UniversityAuthority[]
  
  @@unique([tenantId, name])
  @@index([tenantId])
}

model UniversityAuthority {
  id            String                   @id @default(uuid())
  tenantId      String
  universityId  String
  type          UniversityAuthorityType
  firstName     String
  lastName      String
  email         String?
  phone         String?
  imageUrl      String?
  academicTitle String?
  startDate     DateTime
  endDate       DateTime?
  isActive      Boolean                  @default(true)
  createdAt     DateTime                 @default(now())
  
  tenant     Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([universityId, type])
  @@index([universityId, isActive])
}

model Faculty {
  id           String    @id @default(uuid())
  tenantId     String
  universityId String
  name         String
  acronym      String?
  logoUrl      String?
  description  String
  mission      String
  vision       String
  createdAt    DateTime  @default(now())
  
  tenant      Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  university  University         @relation(fields: [universityId], references: [id], onDelete: Cascade)
  careers     Career[]
  authorities FacultyAuthority[]
  
  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([universityId])
}

model FacultyAuthority {
  id            String                @id @default(uuid())
  tenantId      String
  facultyId     String
  type          FacultyAuthorityType
  firstName     String
  lastName      String
  email         String?
  phone         String?
  imageUrl      String?
  academicTitle String?
  startDate     DateTime
  endDate       DateTime?
  isActive      Boolean               @default(true)
  createdAt     DateTime              @default(now())
  
  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  faculty Faculty @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([facultyId, type])
  @@index([facultyId, isActive])
}

model Career {
  id                String    @id @default(uuid())
  tenantId          String
  facultyId         String
  coordinatorId     String?
  name              String
  description       String
  durationSemesters Int
  modality          String
  iconUrl           String
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  
  tenant       Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  faculty      Faculty       @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  coordinator  Coordinator?  @relation(fields: [coordinatorId], references: [id])
  users        User[]
  eventCareers EventCareer[]
  
  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([facultyId])
}

model Coordinator {
  id       String   @id @default(uuid())
  tenantId String
  firstName String
  lastName  String
  email     String
  imageUrl  String
  title     String
  
  tenant  Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  careers Career[]
  
  @@unique([tenantId, email])
  @@index([tenantId])
}

// ============================================
// USERS & ACCOUNTS
// ============================================

model User {
  id              String    @id @default(uuid())
  tenantId        String
  careerId        String?
  idNumber        String
  firstName       String
  lastName        String
  phone           String    @db.Char(10)
  documentUrl     String?
  profileImageUrl String?
  createdAt       DateTime  @default(now())
  
  tenant   Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  career   Career?   @relation(fields: [careerId], references: [id])
  accounts Account[]
  
  @@unique([tenantId, idNumber])
  @@index([tenantId])
  @@index([careerId])
}

model Account {
  id              String    @id @default(uuid())
  tenantId        String
  userId          String
  email           String
  password        String
  role            UserRole
  isEmailVerified Boolean   @default(false)
  emailVerifiedAt DateTime?
  createdAt       DateTime  @default(now())
  
  tenant                   Tenant                     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user                     User                       @relation(fields: [userId], references: [id], onDelete: Cascade)
  registrations            Registration[]
  createdEvents            Event[]
  validatedRegistrations   Registration[]             @relation("ValidatorAdmin")
  validatedPaymentReceipts PaymentReceipt[]
  validatedMotivationLetters MotivationLetter[]
  createdObservations      RegistrationObservation[]
  tokens                   AccountToken[]
  tokenInvalidations       TokenInvalidation[]
  
  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([userId])
}

// ============================================
// EVENTS
// ============================================

model Event {
  id                   String        @id @default(uuid())
  tenantId             String
  createdByAccountId   String
  name                 String
  description          String?
  type                 EventType
  modality             EventModality
  status               EventStatus   @default(ACTIVE)
  startDate            DateTime
  endDate              DateTime
  durationHours        Int
  price                Float
  coverImageUrl        String
  minAttendancePercent Float
  maxCapacity          Int
  availableSpots       Int
  isFeatured           Boolean       @default(false)
  createdAt            DateTime      @default(now())
  
  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdBy     Account         @relation(fields: [createdByAccountId], references: [id])
  registrations Registration[]
  eventCareers  EventCareer[]
  eventCourse   EventCourse?
  
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, isFeatured])
  @@index([createdByAccountId])
}

model EventCourse {
  eventId         String @id
  minPassingGrade Float
  
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

model EventCareer {
  id           String   @id @default(uuid())
  tenantId     String
  careerId     String
  eventId      String
  associatedAt DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  career Career @relation(fields: [careerId], references: [id], onDelete: Cascade)
  event  Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([careerId, eventId])
  @@index([tenantId])
  @@index([eventId])
}

// ============================================
// REGISTRATIONS
// ============================================

model Registration {
  id                     String             @id @default(uuid())
  tenantId               String
  accountId              String
  eventId                String
  status                 RegistrationStatus @default(PENDING)
  registeredAt           DateTime           @default(now())
  validatedByAdminId     String?
  validatedAt            DateTime?
  finalAttendancePercent Float?
  occupiesSpot           Boolean            @default(true)
  userApprovedCertificate Boolean           @default(false)
  
  tenant             Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  account            Account                 @relation(fields: [accountId], references: [id], onDelete: Cascade)
  event              Event                   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  validatorAdmin     Account?                @relation("ValidatorAdmin", fields: [validatedByAdminId], references: [id])
  registrationCourse RegistrationCourse?
  paymentReceipts    PaymentReceipt[]
  motivationLetters  MotivationLetter[]
  observation        RegistrationObservation?
  certificate        Certificate?
  
  @@unique([tenantId, accountId, eventId])
  @@index([tenantId])
  @@index([accountId])
  @@index([eventId])
  @@index([status])
}

model RegistrationCourse {
  registrationId String @id
  finalGrade     Float?
  
  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
}

model PaymentReceipt {
  id                String           @id @default(uuid())
  tenantId          String
  registrationId    String
  documentUrl       String
  status            ValidationStatus @default(PENDING)
  uploadedAt        DateTime         @default(now())
  validatedAt       DateTime?
  validatedByAdminId String?
  paymentDate       DateTime?
  
  tenant         Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  registration   Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  validatorAdmin Account?     @relation(fields: [validatedByAdminId], references: [id])
  
  @@index([tenantId])
  @@index([registrationId])
}

model MotivationLetter {
  id                 String           @id @default(uuid())
  tenantId           String
  registrationId     String
  content            String
  status             ValidationStatus @default(PENDING)
  uploadedAt         DateTime         @default(now())
  validatedAt        DateTime?
  validatedByAdminId String?
  
  tenant         Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  registration   Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  validatorAdmin Account?     @relation(fields: [validatedByAdminId], references: [id])
  
  @@index([tenantId])
  @@index([registrationId])
}

model RegistrationObservation {
  id               String   @id @default(uuid())
  tenantId         String
  registrationId   String   @unique
  observation      String
  createdAt        DateTime @default(now())
  createdByAdminId String?
  
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  createdBy    Account?     @relation(fields: [createdByAdminId], references: [id])
  
  @@index([tenantId])
}

// ============================================
// CERTIFICATES
// ============================================

model Certificate {
  id             String          @id @default(uuid())
  tenantId       String
  registrationId String          @unique
  type           CertificateType
  fileUrl        String
  validationCode String          @unique
  generatedAt    DateTime        @default(now())
  
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  registration Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([validationCode])
}

// ============================================
// TOKENS
// ============================================

model AccountToken {
  id              String    @id @default(uuid())
  tenantId        String
  accountId       String
  value           String    @unique
  type            TokenType
  status          TokenStatus @default(ACTIVE)
  expiresAt       DateTime
  createdAt       DateTime  @default(now())
  requestIp       String?
  replacedTokenId String?
  
  tenant          Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  account         Account            @relation(fields: [accountId], references: [id], onDelete: Cascade)
  replacedToken   AccountToken?      @relation("TokenReplacement", fields: [replacedTokenId], references: [id])
  replacingTokens AccountToken[]     @relation("TokenReplacement")
  invalidation    TokenInvalidation?
  usage           TokenUsage?
  metadata        TokenMetadata[]
  
  @@index([tenantId])
  @@index([accountId])
  @@index([value])
}

model TokenInvalidation {
  id          String              @id @default(uuid())
  tenantId    String
  tokenId     String              @unique
  reason      InvalidationReason
  description String?
  invalidatedAt DateTime          @default(now())
  ip          String?
  adminId     String?
  
  tenant Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  token  AccountToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  admin  Account?     @relation(fields: [adminId], references: [id])
  
  @@index([tenantId])
}

model TokenUsage {
  id           String       @id @default(uuid())
  tenantId     String
  tokenId      String       @unique
  usedAt       DateTime     @default(now())
  ip           String
  successful   Boolean
  observations String?
  
  tenant Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  token  AccountToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
}

model TokenMetadata {
  id        String      @id @default(uuid())
  tenantId  String
  tokenId   String
  key       MetadataKey
  value     String
  createdAt DateTime    @default(now())
  
  tenant Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  token  AccountToken @relation(fields: [tokenId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([tokenId])
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  GLOBAL_ADMIN
  GENERAL_ADMIN
  STUDENT
  GENERAL
}

enum EventType {
  COURSE
  CONGRESS
  WEBINAR
  TALK
  SOCIALIZATION
}

enum EventStatus {
  ACTIVE
  INACTIVE
  FINISHED
  CANCELLED
  SUSPENDED
}

enum EventModality {
  IN_PERSON
  VIRTUAL
  HYBRID
}

enum RegistrationStatus {
  PENDING
  ACCEPTED
  REJECTED
  APPROVED
  FAILED_GRADE
  FAILED_ATTENDANCE
  FAILED_TOTAL
}

enum ValidationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum CertificateType {
  PARTICIPATION
  APPROVAL
}

enum TokenType {
  VERIFY_EMAIL
  RECOVER_PASSWORD
  CHANGE_EMAIL
  DELETE_ACCOUNT
}

enum TokenStatus {
  ACTIVE
  USED
  EXPIRED
  INVALIDATED
  REPLACED
}

enum InvalidationReason {
  INCORRECT_EMAIL
  USER_REQUEST
  SECURITY
  ADMIN_MANUAL
  REPLACEMENT
  SYSTEM_ERROR
}

enum MetadataKey {
  ORIGINAL_EMAIL
  NEW_EMAIL
  FAILED_ATTEMPTS
  DEVICE
  BROWSER
  SUPPORT_REFERENCE
}

enum UniversityAuthorityType {
  RECTOR
  ACADEMIC_VICE_RECTOR
  RESEARCH_VICE_RECTOR
  ADMINISTRATIVE_VICE_RECTOR
  OUTREACH_VICE_RECTOR
  GENERAL_SECRETARY
  ATTORNEY
  FINANCIAL_DIRECTOR
}

enum FacultyAuthorityType {
  DEAN
  VICE_DEAN
  SECRETARY
  COORDINATOR
}
```

### 1.2 Crear Migración

```bash
cd backend

# Eliminar migraciones antiguas
rm -rf prisma/migrations

# Crear nueva migración inicial
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

### 1.3 Actualizar Seed con Datos Semilla Realistas

Crear `backend/prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ============================================
  // 1. TENANT
  // ============================================
  
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'uta' },
    update: {},
    create: {
      id: 'uta-tenant-id',
      name: 'Universidad Técnica de Ambato',
      slug: 'uta',
      subdomain: 'uta',
      primaryColor: '#0066cc',
      logoUrl: 'https://i.imgur.com/logo-uta.png',
      isActive: true,
      settings: {
        maxEventsPerMonth: 50,
        allowPublicRegistrations: true,
        requireEmailVerification: true
      }
    }
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // ============================================
  // 2. UNIVERSITY
  // ============================================
  
  const university = await prisma.university.create({
    data: {
      tenantId: tenant.id,
      name: 'Universidad Técnica de Ambato',
      acronym: 'UTA',
      address: 'Av. Los Chasquis y Av. Río Payamino',
      phone: '032521081',
      email: 'info@uta.edu.ec',
      websiteUrl: 'https://www.uta.edu.ec',
      foundedAt: new Date('1969-04-18'),
      isActive: true
    }
  });
  console.log(`✅ University: ${university.name}`);

  // ============================================
  // 3. UNIVERSITY AUTHORITIES
  // ============================================
  
  const authorities = await Promise.all([
    prisma.universityAuthority.create({
      data: {
        tenantId: tenant.id,
        universityId: university.id,
        type: 'RECTOR',
        firstName: 'Galo',
        lastName: 'Naranjo',
        academicTitle: 'PhD.',
        startDate: new Date('2022-01-01'),
        isActive: true
      }
    }),
    prisma.universityAuthority.create({
      data: {
        tenantId: tenant.id,
        universityId: university.id,
        type: 'ACADEMIC_VICE_RECTOR',
        firstName: 'Elsa',
        lastName: 'Hernández',
        academicTitle: 'PhD.',
        startDate: new Date('2022-01-01'),
        isActive: true
      }
    })
  ]);
  console.log(`✅ University Authorities: ${authorities.length}`);

  // ============================================
  // 4. FACULTY OF SYSTEMS
  // ============================================
  
  const facultySystems = await prisma.faculty.create({
    data: {
      tenantId: tenant.id,
      universityId: university.id,
      name: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
      acronym: 'FISEI',
      description: 'Formación de profesionales en ingeniería',
      mission: 'Formar profesionales competentes en el área de sistemas',
      vision: 'Ser referente nacional en educación tecnológica',
      logoUrl: 'https://i.imgur.com/fisei-logo.png'
    }
  });
  console.log(`✅ Faculty: ${facultySystems.name}`);

  // ============================================
  // 5. FACULTY AUTHORITIES
  // ============================================
  
  await prisma.facultyAuthority.create({
    data: {
      tenantId: tenant.id,
      facultyId: facultySystems.id,
      type: 'DEAN',
      firstName: 'Francisco',
      lastName: 'Morales',
      academicTitle: 'Ing. Mg.',
      startDate: new Date('2023-01-01'),
      isActive: true
    }
  });
  console.log(`✅ Faculty Authorities created`);

  // ============================================
  // 6. COORDINATORS
  // ============================================
  
  const coordinator = await prisma.coordinator.create({
    data: {
      tenantId: tenant.id,
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@uta.edu.ec',
      title: 'Ing. Mg. en Sistemas',
      imageUrl: 'https://i.imgur.com/avatar-default.png'
    }
  });
  console.log(`✅ Coordinator: ${coordinator.firstName} ${coordinator.lastName}`);

  // ============================================
  // 7. CAREERS
  // ============================================
  
  const careers = await Promise.all([
    prisma.career.create({
      data: {
        tenantId: tenant.id,
        facultyId: facultySystems.id,
        coordinatorId: coordinator.id,
        name: 'Ingeniería en Software',
        description: 'Carrera enfocada en el desarrollo de software',
        durationSemesters: 9,
        modality: 'Presencial',
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2620/2620617.png',
        isActive: true
      }
    }),
    prisma.career.create({
      data: {
        tenantId: tenant.id,
        facultyId: facultySystems.id,
        name: 'Ingeniería en Sistemas de Información',
        description: 'Carrera enfocada en sistemas de información',
        durationSemesters: 9,
        modality: 'Presencial',
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2920/2920277.png',
        isActive: true
      }
    }),
    prisma.career.create({
      data: {
        tenantId: tenant.id,
        facultyId: facultySystems.id,
        name: 'Ingeniería Industrial',
        description: 'Carrera enfocada en procesos industriales',
        durationSemesters: 9,
        modality: 'Presencial',
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2910/2910791.png',
        isActive: true
      }
    })
  ]);
  console.log(`✅ Careers: ${careers.length}`);

  // ============================================
  // 8. SUPER ADMIN USER
  // ============================================
  
  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin123!', 10);
  
  const superAdminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      idNumber: '9999999999',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '0999999999'
    }
  });

  const superAdminAccount = await prisma.account.create({
    data: {
      tenantId: tenant.id,
      userId: superAdminUser.id,
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@uta.edu.ec',
      password: hashedPassword,
      role: 'GLOBAL_ADMIN',
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    }
  });
  console.log(`✅ Super Admin: ${superAdminAccount.email}`);

  // ============================================
  // 9. TEST STUDENTS
  // ============================================
  
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        careerId: careers[i % careers.length].id,
        idNumber: `180${String(i).padStart(7, '0')}`,
        firstName: `Estudiante${i}`,
        lastName: `Apellido${i}`,
        phone: `099${String(i).padStart(7, '0')}`
      }
    });

    const account = await prisma.account.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        email: `estudiante${i}@uta.edu.ec`,
        password: await bcrypt.hash('Student123!', 10),
        role: 'STUDENT',
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    students.push({ user, account });
  }
  console.log(`✅ Students: ${students.length}`);

  // ============================================
  // 10. EVENTS
  // ============================================
  
  const now = new Date();
  const futureEvents = [];

  // Event 1: React Workshop
  const event1 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      createdByAccountId: superAdminAccount.id,
      name: 'Workshop de React Avanzado',
      description: 'Aprende los conceptos avanzados de React incluyendo hooks, context API y performance optimization',
      type: 'COURSE',
      modality: 'HYBRID',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 days
      durationHours: 40,
      price: 50.0,
      coverImageUrl: 'https://i.imgur.com/react-workshop.jpg',
      minAttendancePercent: 80.0,
      maxCapacity: 30,
      availableSpots: 30,
      isFeatured: true
    }
  });

  await prisma.eventCourse.create({
    data: {
      eventId: event1.id,
      minPassingGrade: 7.0
    }
  });

  await prisma.eventCareer.create({
    data: {
      tenantId: tenant.id,
      eventId: event1.id,
      careerId: careers[0].id
    }
  });

  futureEvents.push(event1);

  // Event 2: AI Congress
  const event2 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      createdByAccountId: superAdminAccount.id,
      name: 'Congreso Internacional de Inteligencia Artificial',
      description: 'Congreso sobre las últimas tendencias en IA, Machine Learning y Deep Learning',
      type: 'CONGRESS',
      modality: 'VIRTUAL',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
      endDate: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000), // +32 days
      durationHours: 20,
      price: 0.0,
      coverImageUrl: 'https://i.imgur.com/ai-congress.jpg',
      minAttendancePercent: 70.0,
      maxCapacity: 100,
      availableSpots: 100,
      isFeatured: true
    }
  });

  careers.forEach(async (career) => {
    await prisma.eventCareer.create({
      data: {
        tenantId: tenant.id,
        eventId: event2.id,
        careerId: career.id
      }
    });
  });

  futureEvents.push(event2);

  // Event 3: Python Webinar
  const event3 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      createdByAccountId: superAdminAccount.id,
      name: 'Webinar: Python para Data Science',
      description: 'Introducción a Python aplicado a ciencia de datos',
      type: 'WEBINAR',
      modality: 'VIRTUAL',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
      durationHours: 2,
      price: 0.0,
      coverImageUrl: 'https://i.imgur.com/python-webinar.jpg',
      minAttendancePercent: 80.0,
      maxCapacity: 50,
      availableSpots: 50,
      isFeatured: false
    }
  });

  futureEvents.push(event3);

  // Event 4: DevOps Talk
  const event4 = await prisma.event.create({
    data: {
      tenantId: tenant.id,
      createdByAccountId: superAdminAccount.id,
      name: 'Charla: Introducción a DevOps',
      description: 'Conceptos básicos de DevOps y CI/CD',
      type: 'TALK',
      modality: 'IN_PERSON',
      status: 'ACTIVE',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
      durationHours: 3,
      price: 0.0,
      coverImageUrl: 'https://i.imgur.com/devops-talk.jpg',
      minAttendancePercent: 90.0,
      maxCapacity: 40,
      availableSpots: 40,
      isFeatured: false
    }
  });

  futureEvents.push(event4);

  console.log(`✅ Events: ${futureEvents.length}`);

  // ============================================
  // 11. SAMPLE REGISTRATIONS
  // ============================================
  
  // Inscribir primeros 3 estudiantes al evento 1
  for (let i = 0; i < 3; i++) {
    await prisma.registration.create({
      data: {
        tenantId: tenant.id,
        accountId: students[i].account.id,
        eventId: event1.id,
        status: 'ACCEPTED',
        validatedByAdminId: superAdminAccount.id,
        validatedAt: new Date()
      }
    });
  }

  // Actualizar cupos disponibles
  await prisma.event.update({
    where: { id: event1.id },
    data: { availableSpots: 27 }
  });

  console.log(`✅ Sample registrations created`);

  console.log('\n✨ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 1.4 Ejecutar Seed

```bash
# Ejecutar seed
npx prisma db seed

# O directamente con node
node prisma/seed.js
```

### 1.5 Configurar package.json para seed

Agregar en `backend/package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### 1.6 Verificar que todo funciona

```bash
# Intentar arrancar el servidor
npm run dev

# Debería fallar con errores de Prisma models no encontrados
# Esto es ESPERADO - continuamos con Fase 2
```

---

## FASE 2: Middleware de Tenant Resolution

### 2.1 Crear Middleware de Tenant

Crear `backend/src/middlewares/tenantResolver.middleware.js`:

```javascript
const { prisma } = require('../config/db');

/**
 * Middleware para identificar y cargar el tenant de la request
 * Estrategias:
 * 1. Header X-Tenant-ID (para desarrollo/testing)
 * 2. Subdominio (producción)
 * 3. JWT payload (si usuario autenticado)
 */
const tenantResolver = async (req, res, next) => {
  try {
    let tenantSlug = null;

    // Estrategia 1: Header X-Tenant-ID (desarrollo)
    if (req.headers['x-tenant-id']) {
      tenantSlug = req.headers['x-tenant-id'];
    }
    // Estrategia 2: Subdominio (producción)
    else if (req.hostname) {
      const subdomain = req.hostname.split('.')[0];
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && subdomain !== 'api') {
        tenantSlug = subdomain;
      } else {
        // Por defecto usar 'uta' en desarrollo local
        tenantSlug = 'uta';
      }
    }
    // Estrategia 3: Default para desarrollo
    else {
      tenantSlug = 'uta';
    }

    // Cargar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { 
        id: true, 
        name: true, 
        slug: true,
        isActive: true,
        primaryColor: true,
        logoUrl: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'TENANT_NOT_FOUND',
        message: 'Institución no encontrada'
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        error: 'TENANT_INACTIVE',
        message: 'Esta institución no está activa actualmente'
      });
    }

    // Adjuntar tenant al request
    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    console.error('Error en tenant resolution:', error);
    return res.status(500).json({
      success: false,
      error: 'TENANT_RESOLUTION_ERROR',
      message: 'Error al identificar la institución'
    });
  }
};

module.exports = tenantResolver;
```

### 2.2 Crear Helpers de Tenant Scoping

Crear `backend/src/utils/tenantScope.js`:

```javascript
const { prisma } = require('../config/db');

/**
 * Agrega automáticamente tenantId a las queries de Prisma
 */
const withTenantScope = (tenantId, params = {}) => {
  return {
    ...params,
    where: {
      tenantId,
      ...(params.where || {})
    }
  };
};

/**
 * Helpers para operaciones comunes con tenant scoping
 */
const createScopedPrismaClient = (req) => {
  const tenantId = req.tenantId;
  
  if (!tenantId) {
    throw new Error('tenantId no disponible en request');
  }

  return {
    // Wrapper para findMany con tenant scope
    findMany: (model, params = {}) => {
      return prisma[model].findMany(withTenantScope(tenantId, params));
    },

    // Wrapper para findUnique con tenant scope
    findUnique: (model, params = {}) => {
      return prisma[model].findUnique(withTenantScope(tenantId, params));
    },

    // Wrapper para findFirst con tenant scope
    findFirst: (model, params = {}) => {
      return prisma[model].findFirst(withTenantScope(tenantId, params));
    },

    // Wrapper para create con tenant scope
    create: (model, params = {}) => {
      return prisma[model].create({
        ...params,
        data: {
          ...params.data,
          tenantId
        }
      });
    },

    // Wrapper para update con tenant scope
    update: (model, params = {}) => {
      return prisma[model].update(withTenantScope(tenantId, params));
    },

    // Wrapper para delete con tenant scope
    delete: (model, params = {}) => {
      return prisma[model].delete(withTenantScope(tenantId, params));
    },

    // Wrapper para count con tenant scope
    count: (model, params = {}) => {
      return prisma[model].count(withTenantScope(tenantId, params));
    }
  };
};

module.exports = {
  withTenantScope,
  createScopedPrismaClient
};
```

### 2.3 Aplicar Middleware en app.js

Editar `backend/src/app.js`:

```javascript
// Después de parsers, ANTES de rutas
const tenantResolver = require('./middlewares/tenantResolver.middleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar tenant resolver (excepto health check)
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  return tenantResolver(req, res, next);
});

// Resto de middlewares y rutas...
```

### 2.4 Probar Tenant Resolution

```bash
# Crear archivo de test simple
# backend/test-tenant.js
const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('Health check:', response.data);
    
    const tenantTest = await axios.get('http://localhost:3000/api/test', {
      headers: { 'X-Tenant-ID': 'uta' }
    });
    console.log('Tenant test:', tenantTest.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
```

---

## FASE 3: Middleware de Autenticación Actualizado

### 3.1 Actualizar Middleware de Autenticación

Editar `backend/src/middlewares/auth.middleware.js` (o auth.js):

```javascript
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN',
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el token pertenezca al mismo tenant
    if (decoded.tenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        error: 'TENANT_MISMATCH',
        message: 'Token no válido para esta institución'
      });
    }

    // Cargar información del usuario
    const account = await prisma.account.findUnique({
      where: { id: decoded.id },
      include: { user: true }
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado'
      });
    }

    // Adjuntar información al request
    req.user = {
      id: account.id,
      userId: account.userId,
      email: account.email,
      role: account.role,
      tenantId: account.tenantId,
      firstName: account.user.firstName,
      lastName: account.user.lastName
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token expirado'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Error en autenticación'
    });
  }
};

module.exports = { authenticate };
```

### 3.2 Actualizar Middleware de Roles

Editar `backend/src/middlewares/requireRole.middleware.js`:

```javascript
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'No autenticado'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'No tiene permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Helper para admin
const requireAdmin = requireRole(['GLOBAL_ADMIN', 'GENERAL_ADMIN']);

// Helper para estudiante o superior
const requireStudent = requireRole(['GLOBAL_ADMIN', 'GENERAL_ADMIN', 'STUDENT']);

module.exports = {
  requireRole,
  requireAdmin,
  requireStudent
};
```

---

## FASE 4: Controlador de Autenticación

### 4.1 Refactorizar auth.controller.js

Crear/reemplazar `backend/src/controllers/auth.controller.js`:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar cuenta en el tenant actual
    const account = await prisma.account.findUnique({
      where: {
        tenantId_email: {
          tenantId: req.tenantId,
          email: email
        }
      },
      include: { user: true }
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, account.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar email verificado
    if (!account.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Debes verificar tu correo antes de iniciar sesión',
        requireVerification: true,
        email: account.email
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: account.id,
        tenantId: account.tenantId,
        role: account.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: account.id,
          email: account.email,
          role: account.role,
          firstName: account.user.firstName,
          lastName: account.user.lastName,
          profileImageUrl: account.user.profileImageUrl
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Registro de nuevo usuario
 */
const register = async (req, res) => {
  try {
    const {
      idNumber,
      firstName,
      lastName,
      email,
      password,
      phone,
      careerId
    } = req.body;

    // Validaciones
    if (!idNumber || !firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar formato de cédula (10 dígitos)
    if (!/^\d{10}$/.test(idNumber)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID_NUMBER',
        message: 'La cédula debe tener 10 dígitos'
      });
    }

    // Validar formato de teléfono (10 dígitos)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PHONE',
        message: 'El teléfono debe tener 10 dígitos'
      });
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe en este tenant
    const existingEmail = await prisma.account.findUnique({
      where: {
        tenantId_email: {
          tenantId: req.tenantId,
          email: email
        }
      }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Ya existe una cuenta con este correo electrónico'
      });
    }

    // Verificar si la cédula ya existe en este tenant
    const existingIdNumber = await prisma.user.findUnique({
      where: {
        tenantId_idNumber: {
          tenantId: req.tenantId,
          idNumber: idNumber
        }
      }
    });

    if (existingIdNumber) {
      return res.status(400).json({
        success: false,
        error: 'ID_NUMBER_EXISTS',
        message: 'Ya existe un usuario con esta cédula'
      });
    }

    // Determinar rol según el email
    const isInstitutionalEmail = email.endsWith('@uta.edu.ec');
    const role = isInstitutionalEmail ? 'STUDENT' : 'GENERAL';

    // Si es email institucional, carrera es obligatoria
    if (isInstitutionalEmail && !careerId) {
      return res.status(400).json({
        success: false,
        error: 'CAREER_REQUIRED',
        message: 'Debe seleccionar una carrera'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y cuenta en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          tenantId: req.tenantId,
          idNumber,
          firstName,
          lastName,
          phone,
          careerId: careerId || null
        }
      });

      // Crear cuenta
      const account = await tx.account.create({
        data: {
          tenantId: req.tenantId,
          userId: user.id,
          email,
          password: hashedPassword,
          role,
          isEmailVerified: false
        }
      });

      return { user, account };
    });

    // TODO: Enviar email de verificación

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
      data: {
        userId: result.user.id,
        email: result.account.email,
        requireVerification: true
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  login,
  register
};
```

### 4.2 Actualizar Rutas de Auth

Crear/actualizar `backend/src/routes/auth.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register', register);

module.exports = router;
```

### 4.3 Probar Login/Register

```bash
# Iniciar servidor
cd backend
npm run dev

# En otro terminal, probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: uta" \
  -d '{"email":"admin@uta.edu.ec","password":"Admin123!"}'

# Deberías recibir un token
```

---

## FASE 5: Controladores Principales (Eventos, Inscripciones, etc.)

### 5.1 Patrón de Respuesta Estandarizado

Crear `backend/src/utils/responseHandler.js`:

```javascript
/**
 * Respuesta exitosa estandarizada
 */
const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Respuesta de error estandarizada
 */
const errorResponse = (res, error, message, statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message,
    ...(details && { details })
  });
};

module.exports = {
  successResponse,
  errorResponse
};
```

### 5.2 Controlador de Eventos

Crear `backend/src/controllers/event.controller.js`:

```javascript
const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { createScopedPrismaClient } = require('../utils/tenantScope');

/**
 * Listar eventos del tenant
 */
const listEvents = async (req, res) => {
  try {
    const { status, type, isFeatured, search } = req.query;
    
    const where = {
      tenantId: req.tenantId
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        eventCareers: {
          include: {
            career: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        eventCourse: true,
        createdBy: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { startDate: 'asc' }
      ]
    });

    return successResponse(res, events, 'Eventos obtenidos exitosamente');
  } catch (error) {
    console.error('Error al listar eventos:', error);
    return errorResponse(res, 'LIST_EVENTS_ERROR', 'Error al obtener eventos');
  }
};

/**
 * Obtener evento por ID
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      },
      include: {
        eventCareers: {
          include: {
            career: true
          }
        },
        eventCourse: true,
        createdBy: {
          include: {
            user: true
          }
        }
      }
    });

    if (!event) {
      return errorResponse(res, 'EVENT_NOT_FOUND', 'Evento no encontrado', 404);
    }

    return successResponse(res, event, 'Evento obtenido exitosamente');
  } catch (error) {
    console.error('Error al obtener evento:', error);
    return errorResponse(res, 'GET_EVENT_ERROR', 'Error al obtener evento');
  }
};

/**
 * Crear evento
 */
const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      modality,
      startDate,
      endDate,
      durationHours,
      price,
      coverImageUrl,
      minAttendancePercent,
      maxCapacity,
      isFeatured,
      careerIds,
      minPassingGrade // Para eventos tipo COURSE
    } = req.body;

    // Validaciones
    if (!name || !type || !modality || !startDate || !endDate) {
      return errorResponse(res, 'MISSING_FIELDS', 'Campos requeridos faltantes', 400);
    }

    // Crear evento con relaciones
    const event = await prisma.$transaction(async (tx) => {
      // Crear evento
      const newEvent = await tx.event.create({
        data: {
          tenantId: req.tenantId,
          createdByAccountId: req.user.id,
          name,
          description,
          type,
          modality,
          status: 'ACTIVE',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          durationHours: parseInt(durationHours),
          price: parseFloat(price),
          coverImageUrl,
          minAttendancePercent: parseFloat(minAttendancePercent),
          maxCapacity: parseInt(maxCapacity),
          availableSpots: parseInt(maxCapacity),
          isFeatured: isFeatured === true || isFeatured === 'true'
        }
      });

      // Si es curso, agregar información de curso
      if (type === 'COURSE' && minPassingGrade) {
        await tx.eventCourse.create({
          data: {
            eventId: newEvent.id,
            minPassingGrade: parseFloat(minPassingGrade)
          }
        });
      }

      // Asociar carreras
      if (careerIds && Array.isArray(careerIds) && careerIds.length > 0) {
        await Promise.all(
          careerIds.map(careerId =>
            tx.eventCareer.create({
              data: {
                tenantId: req.tenantId,
                eventId: newEvent.id,
                careerId
              }
            })
          )
        );
      }

      return newEvent;
    });

    return successResponse(res, event, 'Evento creado exitosamente', 201);
  } catch (error) {
    console.error('Error al crear evento:', error);
    return errorResponse(res, 'CREATE_EVENT_ERROR', 'Error al crear evento');
  }
};

/**
 * Actualizar evento
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verificar que el evento existe y pertenece al tenant
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!existingEvent) {
      return errorResponse(res, 'EVENT_NOT_FOUND', 'Evento no encontrado', 404);
    }

    // Actualizar evento
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updates,
        // Asegurar que fechas se conviertan correctamente
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) })
      }
    });

    return successResponse(res, updatedEvent, 'Evento actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return errorResponse(res, 'UPDATE_EVENT_ERROR', 'Error al actualizar evento');
  }
};

/**
 * Eliminar evento
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el evento existe y pertenece al tenant
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!existingEvent) {
      return errorResponse(res, 'EVENT_NOT_FOUND', 'Evento no encontrado', 404);
    }

    // Eliminar evento (cascade eliminará relaciones)
    await prisma.event.delete({
      where: { id }
    });

    return successResponse(res, null, 'Evento eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return errorResponse(res, 'DELETE_EVENT_ERROR', 'Error al eliminar evento');
  }
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
```

### 5.3 Rutas de Eventos

Crear `backend/src/routes/event.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/requireRole.middleware');
const {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/event.controller');

// Rutas públicas (solo lectura)
router.get('/eventos', listEvents);
router.get('/eventos/:id', getEventById);

// Rutas protegidas (solo admins)
router.post('/eventos', authenticate, requireAdmin, createEvent);
router.put('/eventos/:id', authenticate, requireAdmin, updateEvent);
router.delete('/eventos/:id', authenticate, requireAdmin, deleteEvent);

module.exports = router;
```

### 5.4 Actualizar app.js con Nuevas Rutas

En `backend/src/app.js`:

```javascript
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes); // Mantener /api para backward compatibility
```

### 5.5 Probar Endpoints de Eventos

```bash
# Obtener token de admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: uta" \
  -d '{"email":"admin@uta.edu.ec","password":"Admin123!"}' | jq -r '.data.token')

# Listar eventos
curl -X GET http://localhost:3000/api/eventos \
  -H "X-Tenant-ID: uta"

# Crear evento
curl -X POST http://localhost:3000/api/eventos \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: uta" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Event",
    "type": "WEBINAR",
    "modality": "VIRTUAL",
    "startDate": "2026-04-01T10:00:00Z",
    "endDate": "2026-04-01T12:00:00Z",
    "durationHours": 2,
    "price": 0,
    "coverImageUrl": "https://example.com/image.jpg",
    "minAttendancePercent": 80,
    "maxCapacity": 50
  }'
```

---

## FASE 6: Refactorizar Controladores Restantes

### 6.1 Lista de Controladores a Refactorizar

Para cada controlador:
1. Renombrar archivo a inglés (ej: `inscripcion.controller.js` → `registration.controller.js`)
2. Aplicar tenant scoping a TODAS las queries
3. Usar helpers de `responseHandler.js`
4. Eliminar aliases de `req.body` (frontend enviará en inglés en fase posterior)
5. Actualizar nombres de modelos Prisma
6. Actualizar enums a inglés

Controladores prioritarios:
- ✅ `auth.controller.js` (completado)
- ✅ `event.controller.js` (completado)
- 📝 `registration.controller.js` (inscripcion)
- 📝 `certificate.controller.js` (certificado)
- 📝 `career.controller.js` (carrera)
- 📝 `faculty.controller.js` (facultad)
- 📝 `university.controller.js` (universidad)
- 📝 `profile.controller.js` (perfil)
- 📝 `admin.controller.js` (admin)

### 6.2 Template para Refactorización

```javascript
// Estructura estándar para cada controlador:

const { prisma } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Listar recursos
 */
const list = async (req, res) => {
  try {
    const resources = await prisma.MODEL.findMany({
      where: { tenantId: req.tenantId },
      // ... opciones
    });

    return successResponse(res, resources, 'Recursos obtenidos');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(res, 'ERROR_CODE', 'Mensaje en español');
  }
};

/**
 * Obtener por ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.MODEL.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!resource) {
      return errorResponse(res, 'NOT_FOUND', 'Recurso no encontrado', 404);
    }

    return successResponse(res, resource, 'Recurso obtenido');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(res, 'ERROR_CODE', 'Mensaje en español');
  }
};

/**
 * Crear
 */
const create = async (req, res) => {
  try {
    const data = req.body;
    
    const resource = await prisma.MODEL.create({
      data: {
        ...data,
        tenantId: req.tenantId
      }
    });

    return successResponse(res, resource, 'Recurso creado', 201);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(res, 'ERROR_CODE', 'Mensaje en español');
  }
};

// ... update, delete, etc.

module.exports = { list, getById, create /* ... */ };
```

### 6.3 Orden de Refactorización

**Día 1-2:**
- registration.controller.js
- certificate.controller.js

**Día 3-4:**
- career.controller.js
- faculty.controller.js
- university.controller.js

**Día 5:**
- profile.controller.js
- admin.controller.js
- Controladores secundarios

---

## FASE 7: Servicios y Utilidades

### 7.1 Actualizar Servicios

Servicios a actualizar:
- `EmailService.js` (renombrar de mailer.js)
- `EmailTemplateService.js` (actualizar modelos)
- `EmailVerificationService.js` (actualizar modelos)
- `TokenService.js` (actualizar modelos)
- `EventStatusService.js` (actualizar modelos)

### 7.2 Actualizar Utilidades

```bash
# Renombrar archivos
mv backend/src/utils/certificado.utils.js backend/src/utils/certificate.utils.js
mv backend/src/utils/cupo.utils.js backend/src/utils/capacity.utils.js
mv backend/src/utils/validacion.utils.js backend/src/utils/validation.utils.js
```

Actualizar contenido:
- Modelos Prisma a inglés
- Campos a inglés
- Enums a inglés
- Agregar tenant scoping donde aplique

### 7.3 Patrón de Actualización de Servicios

```javascript
// ANTES
class ServiceName {
  async method() {
    const result = await prisma.modelo.findMany({
      where: { campo_esp: valor }
    });
  }
}

// DESPUÉS
class ServiceName {
  constructor(tenantId = null) {
    this.tenantId = tenantId;
  }

  async method() {
    const where = { fieldName: value };
    
    if (this.tenantId) {
      where.tenantId = this.tenantId;
    }

    const result = await prisma.model.findMany({ where });
    return result;
  }
}

// Uso:
const service = new ServiceName(req.tenantId);
await service.method();
```

---

## FASE 8: Frontend - Preparación

### 8.1 Instalar i18n

```bash
cd frontend
npm install react-i18next i18next i18next-http-backend i18next-browser-languagedetector
```

### 8.2 Estructura de i18n

Crear estructura:

```bash
mkdir -p src/i18n/locales/es
```

Crear `src/i18n/config.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import common from './locales/es/common.json';
import auth from './locales/es/auth.json';
import events from './locales/es/events.json';
import errors from './locales/es/errors.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common,
        auth,
        events,
        errors
      }
    },
    lng: 'es',
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 8.3 Archivos de Traducción Iniciales

`src/i18n/locales/es/common.json`:

```json
{
  "app": {
    "name": "Eventos Académicos",
    "title": "Sistema de Gestión de Eventos"
  },
  "actions": {
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "search": "Buscar",
    "filter": "Filtrar",
    "view": "Ver",
    "download": "Descargar"
  },
  "navigation": {
    "home": "Inicio",
    "events": "Eventos",
    "myRegistrations": "Mis Inscripciones",
    "profile": "Perfil",
    "admin": "Administración",
    "logout": "Cerrar Sesión"
  }
}
```

`src/i18n/locales/es/auth.json`:

```json
{
  "login": {
    "title": "Iniciar Sesión",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "submit": "Ingresar",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "noAccount": "¿No tienes cuenta?",
    "register": "Regístrate aquí"
  },
  "register": {
    "title": "Registro de Usuario",
    "idNumber": "Cédula",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "phone": "Teléfono",
    "career": "Carrera",
    "submit": "Registrarse",
    "hasAccount": "¿Ya tienes cuenta?",
    "login": "Inicia sesión aquí"
  }
}
```

`src/i18n/locales/es/events.json`:

```json
{
  "list": {
    "title": "Eventos Disponibles",
    "featured": "Destacados",
    "all": "Todos los Eventos",
    "noEvents": "No hay eventos disponibles"
  },
  "details": {
    "description": "Descripción",
    "date": "Fecha",
    "duration": "Duración",
    "modality": "Modalidad",
    "price": "Precio",
    "availableSpots": "Cupos Disponibles",
    "register": "Inscribirme"
  },
  "create": {
    "title": "Crear Evento",
    "name": "Nombre del Evento",
    "type": "Tipo de Evento",
    "modality": "Modalidad",
    "startDate": "Fecha de Inicio",
    "endDate": "Fecha de Fin"
  }
}
```

`src/i18n/locales/es/errors.json`:

```json
{
  "MISSING_FIELDS": "Faltan campos requeridos",
  "INVALID_CREDENTIALS": "Credenciales inválidas",
  "EMAIL_EXISTS": "El correo ya está registrado",
  "ID_NUMBER_EXISTS": "La cédula ya está registrada",
  "EVENT_NOT_FOUND": "Evento no encontrado",
  "TENANT_NOT_FOUND": "Institución no encontrada",
  "SERVER_ERROR": "Error del servidor",
  "UNAUTHORIZED": "No autorizado",
  "FORBIDDEN": "Sin permisos"
}
```

### 8.4 Inicializar i18n en App

En `src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/config'; // Importar configuración de i18n

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## FASE 9: Frontend - API Services

### 9.1 Configurar Axios

Crear `src/services/api/axiosConfig.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'uta';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_SLUG
  }
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 9.2 Servicio de Autenticación

Crear `src/services/api/authService.js`:

```javascript
import apiClient from './axiosConfig';

/**
 * Login de usuario
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password
  });
  return response.data;
};

/**
 * Registro de usuario
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', {
    idNumber: userData.idNumber,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    careerId: userData.careerId
  });
  return response.data;
};

/**
 * Logout (solo limpiar localStorage)
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

### 9.3 Servicio de Eventos

Crear `src/services/api/eventService.js`:

```javascript
import apiClient from './axiosConfig';

/**
 * Obtener todos los eventos
 */
export const getEvents = async (filters = {}) => {
  const response = await apiClient.get('/eventos', { params: filters });
  return response.data;
};

/**
 * Obtener evento por ID
 */
export const getEventById = async (id) => {
  const response = await apiClient.get(`/eventos/${id}`);
  return response.data;
};

/**
 * Crear evento
 */
export const createEvent = async (eventData) => {
  const response = await apiClient.post('/eventos', eventData);
  return response.data;
};

/**
 * Actualizar evento
 */
export const updateEvent = async (id, eventData) => {
  const response = await apiClient.put(`/eventos/${id}`, eventData);
  return response.data;
};

/**
 * Eliminar evento
 */
export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/eventos/${id}`);
  return response.data;
};
```

### 9.4 Variables de Entorno Frontend

Crear `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_TENANT_SLUG=uta
```

---

## FASE 10: Frontend - Refactorización de Componentes

### 10.1 Patrón de Refactorización

Para cada componente:
1. Renombrar archivo a inglés
2. Renombrar variables/funciones a inglés
3. Usar `useTranslation()` para textos
4. Actualizar API calls para usar servicios refactorizados
5. Manejar estados con nombres en inglés

### 10.2 Ejemplo: LoginForm

```jsx
// ANTES (Login.jsx)
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('/api/auth/login', {
      correo,
      contrasena
    });
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={correo} onChange={(e) => setCorreo(e.target.value)} />
      <input value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
      <button>Ingresar</button>
    </form>
  );
}

// DESPUÉS (LoginPage.jsx)
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api/authService';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      
      // Guardar token y usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirigir
      navigate('/');
    } catch (err) {
      const errorCode = err.response?.data?.error || 'SERVER_ERROR';
      setError(t(`errors:${errorCode}`, { defaultValue: 'Error al iniciar sesión' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>{t('login.title')}</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>{t('login.email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>

        <div>
          <label>{t('login.password')}</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? '...' : t('login.submit')}
        </button>
      </form>
    </div>
  );
}
```

### 10.3 Orden de Refactorización Frontend

**Semana 1:**
- Componentes de autenticación
- Servicios API
- Configuración de i18n

**Semana 2:**
- Componentes de eventos
- Componentes de inscripciones

**Semana 3:**
- Componentes admin
- Componentes de perfil
- Componentes comunes

---

## FASE 11: Testing

### 11.1 Testing Backend

```bash
cd backend

# Instalar dependencias de testing
npm install --save-dev jest supertest @types/jest

# Crear archivo de configuración
```

Crear `backend/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/generated/**',
    '!src/test/**'
  ]
};
```

Ejemplo de test:

```javascript
// backend/src/__tests__/auth.test.js
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');

describe('Auth API', () => {
  beforeAll(async () => {
    // Setup de BD de test
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /api/auth/login - success', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('X-Tenant-ID', 'uta')
      .send({
        email: 'admin@uta.edu.ec',
        password: 'Admin123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('X-Tenant-ID', 'uta')
      .send({
        email: 'admin@uta.edu.ec',
        password: 'wrong'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

### 11.2 Testing Frontend

```bash
cd frontend

# Las dependencias de testing ya deberían estar con Vite
```

Ejemplo de test:

```javascript
// frontend/src/__tests__/LoginPage.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../views/LoginPage';
import * as authService from '../services/api/authService';

jest.mock('../services/api/authService');

test('renders login form', () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

  expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
});

test('submits login form', async () => {
  authService.login.mockResolvedValue({
    data: { token: 'fake-token', user: {} }
  });

  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByLabelText(/correo/i), {
    target: { value: 'test@test.com' }
  });
  fireEvent.change(screen.getByLabelText(/contraseña/i), {
    target: { value: 'password123' }
  });

  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

  await waitFor(() => {
    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
  });
});
```

---

## FASE 12: Validación Final y Deployment

### 12.1 Checklist Pre-Deployment

**Backend:**
- [ ] Todas las queries tienen tenant scoping
- [ ] Todas las respuestas usan formato estandarizado
- [ ] Todos los modelos Prisma en inglés
- [ ] Todos los controladores refactorizados
- [ ] Middleware de autenticación validando tenantId
- [ ] Variables de entorno configuradas
- [ ] Seed actualizado y funcional
- [ ] Tests pasando (>70% cobertura)

**Frontend:**
- [ ] i18n configurado y funcionando
- [ ] Todos los componentes refactorizados
- [ ] API calls usando servicios actualizados
- [ ] Textos UI en español (via i18n)
- [ ] Variables de entorno configuradas
- [ ] Tests pasando

**Base de Datos:**
- [ ] Migración aplicada correctamente
- [ ] Seed ejecutado sin errores
- [ ] Índices creados
- [ ] Datos de prueba Válidos

### 12.2 Testing de Integración

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test

# E2E (si se implementó)
npm run test:e2e
```

### 12.3 Build de Producción

```bash
# Backend
cd backend
npm run build # Si existe script de build

# Frontend
cd frontend
npm run build

# Verificar que el build funciona
npm run preview
```

### 12.4 Deployment

```bash
# Con Docker Compose
docker-compose build
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Ejecutar migración en producción (solo primera vez)
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

---

## Notas Importantes

### Buenas Prácticas Aplicadas

- **Código en inglés:** Todos los nombres de variables, funciones, modelos, campos
- **UI en español:** Todos los textos mostrados al usuario via i18n
- **Tenant scoping:** Todas las queries incluyen filtro por tenantId
- **Validación consistente:** Validaciones tanto en frontend como backend
- **Manejo de errores:** Respuestas estandarizadas con códigos de error
- **Seguridad:** JWT con validación de tenant, middleware de autenticación
- **Escalabilidad:** Arquitectura multi-tenant con Row-Level Security
- **Mantenibilidad:** Código organizado, helpers reutilizables, patrones consistentes

### Verificación entre Fases

Después de cada fase, verificar:

```bash
# 1. No hay errores de Prisma
npx prisma validate

# 2. Backend arranca sin errores
npm run dev

# 3. Endpoint de prueba funciona
curl http://localhost:3000/health

# 4. Logs no muestran errores
# Revisar consola del servidor
```

### Rollback si algo falla

```bash
# Si algo sale mal en una fase:
git stash  # Guardar cambios
git checkout <commit-anterior>  # Volver al estado previo

# O restaurar desde backup de BD
psql -U postgres academic_events < backup_file.sql
```

### Commits Incrementales

```bash
# Hacer commit después de cada fase
git add .
git commit -m "feat: Fase X - [descripción]"

# Ejemplos:
# git commit -m "feat: Fase 1 - Schema Prisma en inglés + multi-tenant"
# git commit -m "feat: Fase 2 - Middleware de tenant resolution"
# git commit -m "feat: Fase 3 - Auth middleware actualizado"
```

---

## Fin del Plan

Este documento contiene todas las instrucciones necesarias para la refactorización completa. Seguir las fases en orden garantiza una migración exitosa sin romper el sistema.
