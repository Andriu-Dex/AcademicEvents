# Estandarización de Base de Datos — Español → Inglés

## 1. ¿Por qué se realizó esta estandarización?

### 1.1 Problema original

El esquema de la base de datos utilizaba **nombres abreviados en español** para tablas, columnas y enums:

```
universidad, facultad, carrera, evento, inscripcion, certificado, cuenta, usuario...
id_eve, nom_eve, des_eve, tip_eve, fec_ini_eve, est_ins, por_asi_fin_usu...
PENDIENTE, ACEPTADA, RECHAZADA, CONGRESO, PRESENCIAL, ESTUDIANTE...
```

Esto generaba los siguientes problemas:

| Problema | Descripción |
|----------|-------------|
| **Legibilidad** | Abreviaturas como `por_min_asi_eve` (porcentaje mínimo de asistencia del evento) eran crípticas incluso para desarrolladores hispanohablantes |
| **Curva de aprendizaje** | Cualquier nuevo desarrollador debía memorizar un sistema de abreviaturas no documentado |
| **Inconsistencia** | Mezcla de convenciones: algunos campos usaban 3 letras (`nom`), otros 4 (`fec_ini`), sin patrón predecible |
| **Incompatibilidad con estándares** | La industria del software usa inglés como lingua franca en código fuente. Librerías, ORMs y herramientas de IA esperan nombres en inglés |
| **Dificultad de mantenimiento** | Los IDE no pueden ofrecer autocompletado intuitivo con nombres abreviados en español |
| **Colaboración internacional** | Imposibilita contribuciones de desarrolladores no hispanohablantes |

### 1.2 Convenciones adoptadas

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Modelos Prisma | **PascalCase** en inglés | `EventCareer`, `RegistrationCourse` |
| Campos | **camelCase** en inglés | `firstName`, `startDate`, `coverImageUrl` |
| Enums (tipo) | **PascalCase** | `UserRole`, `EventStatus`, `RegistrationStatus` |
| Enum (valores) | **UPPER_SNAKE_CASE** en inglés | `GLOBAL_ADMIN`, `IN_PERSON`, `FAILED_GRADE` |
| Relaciones | **camelCase** descriptivo | `eventCareers`, `validatorAdmin`, `registrationCourse` |
| IDs foráneos | `{relación}Id` | `facultyId`, `accountId`, `createdByAccountId` |

### 1.3 Decisión: Career vs Program

Se eligió **Career** (en vez de Program) porque:
- El modelo original se llamaba `carrera`, que en el contexto universitario latinoamericano se traduce mejor como "career" (carrera universitaria)
- "Program" es más genérico y podría confundirse con programas de software o programas académicos cortos

---

## 2. Modelos — Mapeo completo

### 2.1 Nombres de modelos (tablas)

| Modelo original (español) | Modelo nuevo (inglés) | Descripción |
|--------------------------|----------------------|-------------|
| `universidad` | `University` | Institución universitaria |
| `autoridad_universidad` | `UniversityAuthority` | Autoridades de la universidad (rector, vicerrectores) |
| `facultad` | `Faculty` | Facultad dentro de la universidad |
| `autoridad_facultad` | `FacultyAuthority` | Autoridades de la facultad (decano, subdecano) |
| `carrera` | `Career` | Carrera universitaria |
| `coordinador` | `Coordinator` | Coordinador de carrera |
| `usuario` | `User` | Datos personales del usuario |
| `cuenta` | `Account` | Cuenta de acceso (email, contraseña, rol) |
| `evento` | `Event` | Evento académico |
| `evento_curso` | `EventCourse` | Extensión de evento tipo curso (nota mínima) |
| `evento_carrera` | `EventCareer` | Relación N:N entre eventos y carreras |
| `inscripcion` | `Registration` | Inscripción de un usuario a un evento |
| `inscripcion_curso` | `RegistrationCourse` | Extensión de inscripción en curso (nota final) |
| `comprobante_pago` | `PaymentReceipt` | Comprobante de pago subido |
| `carta_motivacion` | `MotivationLetter` | Carta de motivación subida |
| `observacion_inscripcion` | `RegistrationObservation` | Observación administrativa sobre inscripción |
| `certificado` | `Certificate` | Certificado generado |
| `token_cuenta` | `AccountToken` | Token de verificación/recuperación |
| `invalidacion_token` | `TokenInvalidation` | Registro de invalidación de un token |
| `uso_token` | `TokenUsage` | Registro de uso de un token |
| `metadata_token` | `TokenMetadata` | Metadatos asociados a un token |

---

## 3. Campos — Mapeo completo por modelo

### 3.1 University (antes: `universidad`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_uni` | `id` | String (UUID) | Identificador único |
| `nom_uni` | `name` | String | Nombre de la universidad |
| `acr_uni` | `acronym` | String? | Acrónimo (ej: UTA) |
| `url_log_uni` | `logoUrl` | String? | URL del logo |
| `url_web_uni` | `websiteUrl` | String? | URL del sitio web |
| `dir_uni` | `address` | String | Dirección física |
| `tel_uni` | `phone` | String? | Teléfono |
| `cor_uni` | `email` | String? | Correo electrónico |
| `fec_fun_uni` | `foundedAt` | DateTime? | Fecha de fundación |
| `fec_cre_uni` | `createdAt` | DateTime | Fecha de creación del registro |
| `est_uni` | `isActive` | Boolean | Estado activo/inactivo |

### 3.2 UniversityAuthority (antes: `autoridad_universidad`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_aut_uni` | `id` | String (UUID) | Identificador único |
| `id_uni_per` | `universityId` | String | FK a University |
| `tip_aut_uni` | `type` | UniversityAuthorityType | Tipo de autoridad |
| `nom_aut_uni` | `firstName` | String | Nombre |
| `ape_aut_uni` | `lastName` | String | Apellido |
| `cor_aut_uni` | `email` | String? | Correo |
| `tel_aut_uni` | `phone` | String? | Teléfono |
| `url_img_aut_uni` | `imageUrl` | String? | URL de imagen |
| `tit_aut_uni` | `academicTitle` | String? | Título académico |
| `fec_ini_aut_uni` | `startDate` | DateTime | Fecha de inicio en el cargo |
| `fec_fin_aut_uni` | `endDate` | DateTime? | Fecha de fin en el cargo |
| `est_aut_uni` | `isActive` | Boolean | Estado activo |
| `fec_cre_aut_uni` | `createdAt` | DateTime | Fecha de creación |

### 3.3 Faculty (antes: `facultad`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_fac` | `id` | String (UUID) | Identificador único |
| `nom_fac` | `name` | String | Nombre de la facultad |
| `acr_fac` | `acronym` | String? | Acrónimo |
| `url_log_fac` | `logoUrl` | String? | URL del logo |
| `des_fac` | `description` | String | Descripción |
| `mis_fac` | `mission` | String | Misión |
| `vis_fac` | `vision` | String | Visión |
| `fec_cre_fac` | `createdAt` | DateTime | Fecha de creación |
| `id_uni_per` | `universityId` | String | FK a University |

### 3.4 FacultyAuthority (antes: `autoridad_facultad`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_aut_fac` | `id` | String (UUID) | Identificador único |
| `id_fac_per` | `facultyId` | String | FK a Faculty |
| `tip_aut_fac` | `type` | FacultyAuthorityType | Tipo de autoridad |
| `nom_aut_fac` | `firstName` | String | Nombre |
| `ape_aut_fac` | `lastName` | String | Apellido |
| `cor_aut_fac` | `email` | String? | Correo |
| `tel_aut_fac` | `phone` | String? | Teléfono |
| `url_img_aut_fac` | `imageUrl` | String? | URL de imagen |
| `tit_aut_fac` | `academicTitle` | String? | Título académico |
| `fec_ini_aut_fac` | `startDate` | DateTime | Fecha de inicio |
| `fec_fin_aut_fac` | `endDate` | DateTime? | Fecha de fin |
| `est_aut_fac` | `isActive` | Boolean | Estado activo |
| `fec_cre_aut_fac` | `createdAt` | DateTime | Fecha de creación |

### 3.5 Career (antes: `carrera`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_car` | `id` | String (UUID) | Identificador único |
| `nom_car` | `name` | String | Nombre de la carrera |
| `des_car` | `description` | String | Descripción |
| `dur_sem_car` | `durationSemesters` | Int | Duración en semestres |
| `mod_car` | `modality` | String | Modalidad |
| `ico_car` | `iconUrl` | String | URL del ícono |
| `est_car` | `isActive` | Boolean | Estado activo |
| `fec_cre_car` | `createdAt` | DateTime | Fecha de creación |
| `id_fac_per` | `facultyId` | String | FK a Faculty |
| `id_coo_per` | `coordinatorId` | String? | FK a Coordinator |

### 3.6 Coordinator (antes: `coordinador`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_coo` | `id` | String (UUID) | Identificador único |
| `nom_coo` | `firstName` | String | Nombre |
| `ape_coo` | `lastName` | String | Apellido |
| `cor_coo` | `email` | String | Correo electrónico (único) |
| `url_img_coo` | `imageUrl` | String | URL de imagen |
| `tit_coo` | `title` | String | Título profesional |

### 3.7 User (antes: `usuario`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_usu` | `id` | String (UUID) | Identificador único |
| `ced_usu` | `idNumber` | String | Cédula de identidad (único) |
| `nom_usu` | `firstName` | String | Nombre |
| `ape_usu` | `lastName` | String | Apellido |
| `cel_usu` | `phone` | String | Celular (10 dígitos) |
| `fec_cre_usu` | `createdAt` | DateTime | Fecha de creación |
| `com_usu` | `documentUrl` | String? | URL de documento/comprobante |
| `id_car_est` | `careerId` | String? | FK a Career |
| `img_per_usu` | `profileImageUrl` | String? | URL de imagen de perfil |

### 3.8 Account (antes: `cuenta`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_cue` | `id` | String (UUID) | Identificador único |
| `id_usu_per` | `userId` | String | FK a User |
| `cor_usu` | `email` | String | Correo electrónico (único) |
| `con_usu` | `password` | String | Contraseña hasheada |
| `fec_cre_cue` | `createdAt` | DateTime | Fecha de creación |
| `rol_usu` | `role` | UserRole | Rol del usuario |
| `est_ver_cor` | `isEmailVerified` | Boolean | Email verificado |
| `fec_ver_cor` | `emailVerifiedAt` | DateTime? | Fecha de verificación |

### 3.9 Event (antes: `evento`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_eve` | `id` | String (UUID) | Identificador único |
| `nom_eve` | `name` | String | Nombre del evento |
| `des_eve` | `description` | String? | Descripción |
| `tip_eve` | `type` | EventType | Tipo de evento |
| `fec_ini_eve` | `startDate` | DateTime | Fecha de inicio |
| `fec_cre_eve` | `createdAt` | DateTime | Fecha de creación |
| `fec_fin_eve` | `endDate` | DateTime | Fecha de fin |
| `dur_hor_eve` | `durationHours` | Int | Duración en horas |
| `mod_eve` | `modality` | EventModality | Modalidad |
| `val_eve` | `price` | Float | Valor/precio |
| `est_eve` | `status` | EventStatus | Estado del evento |
| `img_por_eve` | `coverImageUrl` | String | URL de imagen de portada |
| `por_min_asi_eve` | `minAttendancePercent` | Float | Porcentaje mínimo de asistencia |
| `cup_max_eve` | `maxCapacity` | Int | Cupo máximo |
| `cup_dis_eve` | `availableSpots` | Int | Cupos disponibles |
| `eve_des` | `isFeatured` | Boolean | Evento destacado |
| `id_cue_cre_eve` | `createdByAccountId` | String | FK a Account (creador) |

### 3.10 EventCourse (antes: `evento_curso`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_eve_cur` | `eventId` | String | FK/PK a Event |
| `not_min_cur` | `minPassingGrade` | Float | Nota mínima para aprobar |

### 3.11 EventCareer (antes: `evento_carrera`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_eve_car` | `id` | String (UUID) | Identificador único |
| `id_car_aso` | `careerId` | String | FK a Career |
| `id_eve_aso` | `eventId` | String | FK a Event |
| `fec_aso` | `associatedAt` | DateTime | Fecha de asociación |

### 3.12 Registration (antes: `inscripcion`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_ins` | `id` | String (UUID) | Identificador único |
| `id_cor_ins` | `accountId` | String | FK a Account |
| `id_eve_ins` | `eventId` | String | FK a Event |
| `est_ins` | `status` | RegistrationStatus | Estado de inscripción |
| `fec_ins` | `registeredAt` | DateTime | Fecha de inscripción |
| `usu_apr_cer` | `userApprovedCertificate` | Boolean | Usuario aprobó certificado |
| `id_adm_val_ins` | `validatedByAdminId` | String? | FK a Account (admin validador) |
| `fec_val_ins` | `validatedAt` | DateTime? | Fecha de validación |
| `por_asi_fin_usu` | `finalAttendancePercent` | Float? | Porcentaje final de asistencia |
| `cup_ocu` | `occupiesSpot` | Boolean | Ocupa cupo |

### 3.13 RegistrationCourse (antes: `inscripcion_curso`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_ins_cur` | `registrationId` | String | FK/PK a Registration |
| `not_fin_usu` | `finalGrade` | Float? | Nota final del usuario |

### 3.14 PaymentReceipt (antes: `comprobante_pago`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_com_pag` | `id` | String (UUID) | Identificador único |
| `id_ins_per` | `registrationId` | String | FK a Registration |
| `url_com_pag` | `documentUrl` | String | URL del documento |
| `est_com_pag` | `status` | ValidationStatus | Estado de validación |
| `fec_sub_com_pag` | `uploadedAt` | DateTime | Fecha de subida |
| `fec_val_com_pag` | `validatedAt` | DateTime? | Fecha de validación |
| `id_adm_val_com_pag` | `validatedByAdminId` | String? | FK a Account (admin) |
| `fec_pag` | `paymentDate` | DateTime? | Fecha de pago |

### 3.15 MotivationLetter (antes: `carta_motivacion`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_car_mot` | `id` | String (UUID) | Identificador único |
| `id_ins_per` | `registrationId` | String | FK a Registration |
| `con_car_mot` | `content` | String | Contenido de la carta |
| `est_car_mot` | `status` | ValidationStatus | Estado de validación |
| `fec_sub_car_mot` | `uploadedAt` | DateTime | Fecha de subida |
| `fec_val_car_mot` | `validatedAt` | DateTime? | Fecha de validación |
| `id_adm_val_car_mot` | `validatedByAdminId` | String? | FK a Account (admin) |

### 3.16 RegistrationObservation (antes: `observacion_inscripcion`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_obs_ins` | `id` | String (UUID) | Identificador único |
| `id_ins_per` | `registrationId` | String | FK a Registration (único) |
| `obs_ins` | `observation` | String | Texto de la observación |
| `fec_cre_obs` | `createdAt` | DateTime | Fecha de creación |
| `id_adm_cre_obs` | `createdByAdminId` | String? | FK a Account (admin) |

### 3.17 Certificate (antes: `certificado`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_cer` | `id` | String (UUID) | Identificador único |
| `id_ins_per` | `registrationId` | String | FK a Registration (único) |
| `url_cer` | `fileUrl` | String | URL del archivo PDF |
| `tip_cer` | `type` | CertificateType | Tipo de certificado |
| `fec_gen_cer` | `generatedAt` | DateTime | Fecha de generación |
| `cod_val_cer` | `validationCode` | String | Código de validación (único) |

### 3.18 AccountToken (antes: `token_cuenta`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_tok` | `id` | String (UUID) | Identificador único |
| `id_cue_per` | `accountId` | String | FK a Account |
| `tok_val` | `value` | String | Valor del token (único) |
| `tip_tok` | `type` | TokenType | Tipo de token |
| `fec_exp_tok` | `expiresAt` | DateTime | Fecha de expiración |
| `est_tok` | `status` | TokenStatus | Estado del token |
| `fec_cre_tok` | `createdAt` | DateTime | Fecha de creación |
| `ip_sol` | `requestIp` | String? | IP de solicitud |
| `id_tok_ree` | `replacedTokenId` | String? | FK a token reemplazado |

### 3.19 TokenInvalidation (antes: `invalidacion_token`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_inv_tok` | `id` | String (UUID) | Identificador único |
| `id_tok_per` | `tokenId` | String | FK a AccountToken (único) |
| `raz_inv` | `reason` | InvalidationReason | Razón de invalidación |
| `des_inv` | `description` | String? | Descripción adicional |
| `fec_inv` | `invalidatedAt` | DateTime | Fecha de invalidación |
| `ip_inv` | `ip` | String? | IP desde donde se invalidó |
| `id_adm_inv` | `adminId` | String? | FK a Account (admin) |

### 3.20 TokenUsage (antes: `uso_token`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_uso_tok` | `id` | String (UUID) | Identificador único |
| `id_tok_per` | `tokenId` | String | FK a AccountToken (único) |
| `fec_uso` | `usedAt` | DateTime | Fecha de uso |
| `ip_uso` | `ip` | String | IP de uso |
| `exi_uso` | `successful` | Boolean | Uso exitoso |
| `obs_uso` | `observations` | String? | Observaciones |

### 3.21 TokenMetadata (antes: `metadata_token`)

| Campo original | Campo nuevo | Tipo | Descripción |
|---------------|-------------|------|-------------|
| `id_met` | `id` | String (UUID) | Identificador único |
| `id_tok_per` | `tokenId` | String | FK a AccountToken |
| `cla_met` | `key` | MetadataKey | Clave del metadato |
| `val_met` | `value` | String | Valor del metadato |
| `fec_cre_met` | `createdAt` | DateTime | Fecha de creación |

---

## 4. Enums — Mapeo completo

### 4.1 UserRole (antes: `rol_usuario`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `ADMIN_GLOBAL` | `GLOBAL_ADMIN` | Administrador global del sistema |
| `ADMIN_GENERAL` | `GENERAL_ADMIN` | Administrador general |
| `ESTUDIANTE` | `STUDENT` | Estudiante |
| `GENERAL` | `GENERAL` | Usuario general (sin cambio) |

### 4.2 EventType (antes: `tipo_evento`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `CURSO` | `COURSE` | Curso |
| `CONGRESO` | `CONGRESS` | Congreso |
| `WEBINAR` | `WEBINAR` | Webinar (sin cambio) |
| `CHARLA` | `TALK` | Charla |
| `SOCIALIZACION` | `SOCIALIZATION` | Socialización |

### 4.3 EventStatus (antes: `estado_evento`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `ACTIVO` | `ACTIVE` | Evento activo |
| `INACTIVO` | `INACTIVE` | Evento inactivo |
| `FINALIZADO` | `FINISHED` | Evento finalizado |
| `CANCELADO` | `CANCELLED` | Evento cancelado |
| `SUSPENDIDO` | `SUSPENDED` | Evento suspendido |

### 4.4 EventModality (antes: `modalidad_evento`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `PRESENCIAL` | `IN_PERSON` | Presencial |
| `VIRTUAL` | `VIRTUAL` | Virtual (sin cambio) |
| `SEMIPRESENCIAL` | `HYBRID` | Semipresencial / Híbrido |

### 4.5 RegistrationStatus (antes: `estado_inscripcion`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `PENDIENTE` | `PENDING` | Pendiente de revisión |
| `ACEPTADA` | `ACCEPTED` | Inscripción aceptada |
| `RECHAZADA` | `REJECTED` | Inscripción rechazada |
| `APROBADO` | `APPROVED` | Curso aprobado |
| `REPROBADO_NOTA` | `FAILED_GRADE` | Reprobado por nota |
| `REPROBADO_ASISTENCIA` | `FAILED_ATTENDANCE` | Reprobado por asistencia |
| `REPROBADO_TOTAL` | `FAILED_TOTAL` | Reprobado por nota y asistencia |

### 4.6 ValidationStatus (antes: `estado_validacion`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `PENDIENTE` | `PENDING` | Pendiente |
| `ACEPTADA` | `ACCEPTED` | Aceptado |
| `RECHAZADA` | `REJECTED` | Rechazado |

### 4.7 CertificateType (antes: `tipo_certificado`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `PARTICIPACION` | `PARTICIPATION` | Certificado de participación |
| `APROBACION` | `APPROVAL` | Certificado de aprobación |

### 4.8 TokenType (antes: `tipo_token`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `VERIFICAR_CORREO` | `VERIFY_EMAIL` | Verificar correo electrónico |
| `RECUPERAR_CONTRASENA` | `RECOVER_PASSWORD` | Recuperar contraseña |
| `CAMBIAR_CORREO` | `CHANGE_EMAIL` | Cambiar correo |
| `ELIMINAR_CUENTA` | `DELETE_ACCOUNT` | Eliminar cuenta |

### 4.9 TokenStatus (antes: `estado_token`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `ACTIVO` | `ACTIVE` | Activo |
| `USADO` | `USED` | Usado |
| `EXPIRADO` | `EXPIRED` | Expirado |
| `INVALIDADO` | `INVALIDATED` | Invalidado |
| `REEMPLAZADO` | `REPLACED` | Reemplazado |

### 4.10 InvalidationReason (antes: `razon_invalidacion`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `CORREO_INCORRECTO` | `INCORRECT_EMAIL` | Correo incorrecto |
| `SOLICITUD_USUARIO` | `USER_REQUEST` | Solicitud del usuario |
| `SEGURIDAD` | `SECURITY` | Motivo de seguridad |
| `ADMIN_MANUAL` | `ADMIN_MANUAL` | Invalidación manual por admin (sin cambio) |
| `REEMPLAZO` | `REPLACEMENT` | Reemplazado por nuevo token |
| `ERROR_SISTEMA` | `SYSTEM_ERROR` | Error del sistema |

### 4.11 MetadataKey (antes: `clave_metadata`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `CORREO_ORIGINAL` | `ORIGINAL_EMAIL` | Correo original |
| `NUEVO_CORREO` | `NEW_EMAIL` | Nuevo correo |
| `INTENTOS_FALLIDOS` | `FAILED_ATTEMPTS` | Intentos fallidos |
| `DISPOSITIVO` | `DEVICE` | Dispositivo |
| `NAVEGADOR` | `BROWSER` | Navegador |
| `REFERENCIA_SOPORTE` | `SUPPORT_REFERENCE` | Referencia de soporte |

### 4.12 UniversityAuthorityType (antes: `tipo_autoridad_universidad`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `RECTOR` | `RECTOR` | Rector (sin cambio) |
| `VICERRECTOR_ACADEMICO` | `ACADEMIC_VICE_RECTOR` | Vicerrector académico |
| `VICERRECTOR_INVESTIGACION` | `RESEARCH_VICE_RECTOR` | Vicerrector de investigación |
| `VICERRECTOR_ADMINISTRATIVO` | `ADMINISTRATIVE_VICE_RECTOR` | Vicerrector administrativo |
| `VICERRECTOR_VINCULACION` | `OUTREACH_VICE_RECTOR` | Vicerrector de vinculación |
| `SECRETARIO_GENERAL` | `GENERAL_SECRETARY` | Secretario general |
| `PROCURADOR` | `ATTORNEY` | Procurador |
| `DIRECTOR_FINANCIERO` | `FINANCIAL_DIRECTOR` | Director financiero |

### 4.13 FacultyAuthorityType (antes: `tipo_autoridad_facultad`)

| Valor original | Valor nuevo | Significado |
|---------------|-------------|-------------|
| `DECANO` | `DEAN` | Decano |
| `SUBDECANO` | `VICE_DEAN` | Subdecano |
| `SECRETARIO` | `SECRETARY` | Secretario |
| `COORDINADOR_CARRERA` | `COORDINATOR` | Coordinador de carrera |

---

## 5. Relaciones — Mapeo completo

| Relación original | Relación nueva | Modelo | Descripción |
|-------------------|---------------|--------|-------------|
| `universidad` | `university` | Faculty, UniversityAuthority | Relación hacia University |
| `facultad` | `faculty` | Career, FacultyAuthority | Relación hacia Faculty |
| `facultades` | `faculties` | University | Carreras de la universidad |
| `autoridades` | `authorities` | University, Faculty | Autoridades |
| `carreras` | `careers` | Faculty | Carreras de la facultad |
| `coordinador` | `coordinator` | Career | Coordinador de la carrera |
| `usuarios` | `users` | Career | Usuarios inscriptos en la carrera |
| `carrera` | `career` | User | Carrera del usuario |
| `cuentas` | `accounts` | User | Cuentas del usuario |
| `usuario` | `user` | Account | Usuario dueño de la cuenta |
| `cuenta` | `account` | Registration | Cuenta que realizó inscripción |
| `inscripciones` | `registrations` | Account, Event | Inscripciones |
| `eventos` | `events` | Account | Eventos creados por la cuenta |
| `evento` | `event` | Registration, EventCareer, EventCourse | Relación al evento |
| `eventos_carrera` | `eventCareers` | Career, Event | Relación N:N eventos-carreras |
| `evento_curso` | `eventCourse` | Event | Extensión de curso del evento |
| `inscripcion_curso` | `registrationCourse` | Registration | Extensión de curso |
| `comprobantes_pago` | `paymentReceipts` | Registration, Account | Comprobantes de pago |
| `cartas_motivacion` | `motivationLetters` | Registration, Account | Cartas de motivación |
| `observacion` | `observation` | Registration | Observación de inscripción |
| `observaciones_creadas` | `createdObservations` | Account | Observaciones creadas por admin |
| `certificado` | `certificate` | Registration | Certificado generado |
| `admin_validador` | `validatorAdmin` | Registration | Admin que validó |
| `inscripciones_validadas` | `validatedRegistrations` | Account | Inscripciones validadas por admin |
| `tokens` | `tokens` | Account | Tokens de la cuenta |
| `invalidaciones_token` | `tokenInvalidations` | Account | Invalidaciones hechas por admin |
| `invalidacion` | `invalidation` | AccountToken | Registro de invalidación |
| `uso` | `usage` | AccountToken | Registro de uso |
| `metadata` | `metadata` | AccountToken | Metadatos del token |
| `token` | `token` | TokenInvalidation, TokenUsage, TokenMetadata | Relación al token |
| `token_reemplazado` | `replacedToken` | AccountToken | Token que fue reemplazado |
| `tokens_reemplazantes` | `replacingTokens` | AccountToken | Tokens que reemplazan |

---

## 6. Cambios en el backend — Archivos modificados

### 6.1 Resumen cuantitativo

| Fase | Archivos afectados | Cambios realizados | Descripción |
|------|-------------------|-------------------|-------------|
| Schema Prisma | 1 | Reescritura total (454 líneas) | 21 modelos + 13 enums en inglés |
| Seed | 1 | Reescritura total (987 líneas) | Datos de prueba con nuevos nombres |
| Auth controller | 1 | Reescritura manual | Login y registro |
| Pass 1 — Bulk | 72 archivos | 2,505 reemplazos | Modelos, enums y campos |
| Pass 2 — Relaciones | 72 archivos | 2,255 reemplazos | Relaciones en include/select |
| Pass 3 — Rutas | 15 archivos | 84 correcciones | Restaurar URLs y require() rotos |
| Fixes manuales | 11 archivos | ~50 correcciones | req.body, require(), sintaxis |
| **Total** | **~72 archivos** | **~4,900 cambios** | — |

### 6.2 Controladores modificados

| Archivo | Cambios principales |
|---------|--------------------|
| `auth.controller.js` | Reescritura manual. JWT payload: `{id, role}`. Login/registro con mapeo español→inglés |
| `evento.controller.js` | Destructuring con alias: `{ nom_eve: name, des_eve: description, ... } = req.body`. Objeto de mapeo para actualización |
| `inscripcion.controller.js` | Alias: `{ id_eve: eventId, carta_motivacion: motivationLetter } = req.body`. Corrección de colisión de variable `id` → `eventId`/`userId` |
| `carrera.controller.js` | Alias: `{ nom_car: name, des_car: description, dur_sem_car: durationSemesters, ... } = req.body` |
| `facultad.controller.js` | Alias: `{ nom_fac: name, acr_fac: acronym, des_fac: description, url_log_fac: logoUrl } = req.body` |
| `universidad.controller.js` | Alias: `{ nom_uni: name, acr_uni: acronym, url_log_uni: logoUrl, ... } = req.body` |
| `coordinador.controller.js` | Alias: `{ nom_coo: firstName, ape_coo: lastName, cor_coo: email, ... } = req.body` |
| `mva.controller.js` | Alias: `{ mision, vision, autoridades: authorities } = req.body`. Campos de FacultyAuthority actualizados. Enum values actualizados |
| `certificado.controller.js` | Corrección de require path: `certificate.utils` → `certificado.utils` |
| `perfil.controller.js` | Campos de Prisma actualizados por script bulk |
| `estadisticas.controller.js` | Campos de Prisma actualizados por script bulk |
| `reporte.controller.js` | Campos de Prisma actualizados por script bulk |
| `reporte-ingresos.controller.js` | Campos de Prisma actualizados por script bulk |
| `admin.controller.js` | Sin cambio en req.body (usa nombres custom: `cedula`, `nombres`, `apellidos`) |
| `evento.paginacion.controller.js` | Campos de Prisma actualizados por script bulk |
| `email-correction.controller.js` | Campos de Prisma actualizados por script bulk |
| `imagen-perfil.controller.js` | Campos de Prisma actualizados por script bulk |
| `password-recovery.controller.js` | Campos de Prisma actualizados por script bulk |
| `upload-mva.controller.js` | Campos de Prisma actualizados por script bulk |
| `verification.controller.js` | Campos de Prisma actualizados por script bulk |

### 6.3 Servicios modificados

| Archivo | Cambios principales |
|---------|--------------------|
| `EmailTemplateService.js` | Corrección require: `university.service` → `universidad.service` |
| `EmailVerificationService.js` | Campos Prisma: `prisma.account`, `isEmailVerified`, `emailVerifiedAt` |
| `TokenService.js` | Campos Prisma: `prisma.accountToken`, `value`, `expiresAt`, `status` |
| `PasswordRecoveryService.js` | Campos Prisma: `prisma.account`, `password` |
| `eventStatusService.js` | Campos Prisma: `prisma.event`, `status`, `endDate`, `startDate` |
| `socket.service.js` | Campos de Prisma actualizados |
| `universidad.service.js` | Campos Prisma: `prisma.university` |
| `cleanupService.js` | Sin cambios relevantes |
| `mailer.js` | Sin cambios (no usa Prisma) |

### 6.4 Middlewares modificados

| Archivo | Cambios principales |
|---------|--------------------|
| `auth.js` | `req.user = decoded` (antes: `req.usuario`) |
| `requireRole.js` | `req.user.role` (antes: `req.usuario.rol_usu`) |
| `autorizacion/onlyAdmin.js` | `req.user.role`, valores `"GLOBAL_ADMIN"` y `"GENERAL_ADMIN"` |
| `verificarCuentaActivada.js` | `prisma.account`, `isEmailVerified`. Corrección require path: `../../config/db` → `../config/db` |
| `verificarPropietarioCertificado.js` | `prisma.registration`, `req.user.role`, `req.user.id` |

### 6.5 Utilidades modificadas

| Archivo | Cambios principales |
|---------|--------------------|
| `certificado.utils.js` | Campos Prisma actualizados |
| `cupo.utils.js` | Campos Prisma actualizados |
| `eventStatus.utils.js` | Enum: `ACTIVE`, `FINISHED`; campos: `status`, `startDate`, `endDate` |
| `reporte.utils.js` | Campos Prisma actualizados |
| `validacion.utils.js` | `startsWith("REPROBADO")` → `startsWith("FAILED")` |

---

## 7. Estrategia de compatibilidad frontend

El frontend **no fue modificado** en esta fase. Sigue enviando campos en español en sus solicitudes HTTP. La compatibilidad se mantiene mediante **destructuring con aliases** en cada controlador:

```javascript
// El frontend envía: { nom_eve: "Mi Evento", des_eve: "Descripción", tip_eve: "COURSE", ... }
// El backend mapea a nombres ingleses:
const {
  nom_eve: name,
  des_eve: description,
  tip_eve: type,
  fec_ini_eve: startDate,
  fec_fin_eve: endDate,
  val_eve: price,
  mod_eve: modality,
  dur_hor_eve: durationHours,
  por_min_asi_eve: minAttendancePercent,
  cup_max_eve: maxCapacity,
  not_min_cur: minPassingGrade,
} = req.body;
```

### Patrón aplicado en cada controlador

| Controlador | Campos del frontend (español) | Variables internas (inglés) |
|-------------|------------------------------|---------------------------|
| `evento` | `nom_eve`, `des_eve`, `tip_eve`, `fec_ini_eve`, `fec_fin_eve`, `val_eve`, `mod_eve`, `dur_hor_eve`, `por_min_asi_eve`, `cup_max_eve`, `not_min_cur`, `eve_des` | `name`, `description`, `type`, `startDate`, `endDate`, `price`, `modality`, `durationHours`, `minAttendancePercent`, `maxCapacity`, `minPassingGrade`, `isFeatured` |
| `inscripcion` | `id_eve`, `carta_motivacion`, `est_ins`, `por_asi_fin_usu`, `not_fin_usu` | `eventId`, `motivationLetter`, `status`, `asistencia`, `nota_final` |
| `carrera` | `nom_car`, `des_car`, `dur_sem_car`, `mod_car`, `ico_car`, `id_fac_per`, `id_coo_per` | `name`, `description`, `durationSemesters`, `modality`, `iconUrl`, `facultyId`, `coordinatorId` |
| `facultad` | `nom_fac`, `acr_fac`, `des_fac`, `url_log_fac`, `mis_fac`, `vis_fac` | `name`, `acronym`, `description`, `logoUrl`, `mission`, `vision` |
| `universidad` | `nom_uni`, `acr_uni`, `url_log_uni`, `url_web_uni`, `dir_uni`, `tel_uni`, `cor_uni` | `name`, `acronym`, `logoUrl`, `websiteUrl`, `address`, `phone`, `email` |
| `coordinador` | `nom_coo`, `ape_coo`, `cor_coo`, `url_img_coo`, `tit_coo` | `firstName`, `lastName`, `email`, `imageUrl`, `title` |
| `mva` | `mision`, `vision`, `autoridades` | `mision`, `vision`, `authorities` |
| `auth (login)` | `correo`, `contrasena` | `correo`, `contrasena` (custom, no Prisma) |
| `auth (registro)` | `ced_usu`, `nom_usu`, `ape_usu`, `cor_usu`, `con_usu`, `cel_usu`, `id_car_est` | Mapeo directo a campos Prisma |

### JWT Payload

| Campo original | Campo nuevo | Uso |
|---------------|-------------|-----|
| `id` (era `id_cue`) | `id` | `req.user.id` — ID de la cuenta |
| `rol_usu` | `role` | `req.user.role` — Rol del usuario |

---

## 8. Rutas API — Sin cambios

Las rutas HTTP **no fueron modificadas**. Todas conservan sus paths originales en español para no romper el frontend:

```
/api/eventos
/api/inscripciones
/api/certificados
/api/carreras
/api/facultades
/api/universidad-principal
/api/coordinadores
/api/auth/login
/api/auth/register
/api/mva
/api/estadisticas
/api/reportes
/api/admin
/api/perfil
/api/verificar-cuenta
...
```

Los archivos de rutas tampoco fueron renombrados (siguen siendo `evento.routes.js`, `inscripcion.routes.js`, etc.).

---

## 9. Base de datos — Reset completo

### Procedimiento ejecutado

```bash
# 1. Eliminar migraciones antiguas (columnas en español)
rm -rf prisma/migrations/20260225133115_first_migration/
rm -rf prisma/migrations/20260227233208_/

# 2. Resetear la base de datos (drop completo)
npx prisma migrate reset --force

# 3. Crear nueva migración con columnas en inglés
npx prisma migrate dev --name init

# 4. Generar el cliente Prisma
npx prisma generate

# 5. Ejecutar seed
node prisma/seed.js
```

### Resultado

- Migración creada: `20260228092343_init`
- Todas las tablas con columnas en inglés
- Base de datos limpia con datos de prueba
- Cliente Prisma generado correctamente
- Servidor arranca sin errores

---

## 10. Problemas encontrados y resueltos

### 10.1 Require paths rotos

Los scripts de refactoring global reemplazaron palabras dentro de strings de `require()` y URLs:

| Archivo | Path roto | Path corregido | Causa |
|---------|----------|---------------|-------|
| `EmailTemplateService.js` | `./university.service` | `./universidad.service` | `universidad` → `university` en string |
| `evento.controller.js` | `../services/eventoStatusService` | `../services/eventStatusService` | `evento` → `event` en string parcial |
| `certificado.controller.js` | `../utils/certificate.utils` | `../utils/certificado.utils` | `certificado` → `certificate` en string |
| `verificarCuentaActivada.js` | `../../config/db` | `../config/db` | Bug preexistente (doble `../`) |

### 10.2 Colisión de variables

En `inscripcion.controller.js`, el script cambió tanto `id_eve` como `id_cor_ins` a `id`, causando:
```javascript
const id = req.body.id;      // ← id del evento
const id = req.user.id;      // ← ERROR: redeclaración
```
**Solución:** Renombrar a `eventId` y `userId` respectivamente.

### 10.3 Sintaxis rota en mva.controller.js

El reemplazo parcial de `determinarTipoAutoridad()` eliminó un `} else` conector, dejando:
```javascript
return "VICE_DEAN";
if (...)  // ← faltaba "} else"
```
**Solución:** Restaurar `} else if (...)` manualmente.

### 10.4 Enum values en strings de lógica

En `validacion.utils.js`, la comparación `ins.status.startsWith("REPROBADO")` no fue capturada por el script de enums (que solo buscaba valores exactos entre comillas).  
**Solución:** Cambiar manualmente a `startsWith("FAILED")`.

---

## 11. Archivos NO modificados

| Categoría | Razón |
|-----------|-------|
| **Frontend completo** (`frontend/src/**`) | El frontend sigue enviando campos en español. Se mantiene compatibilidad via aliases en el backend |
| **Archivos de rutas** (nombres de archivo) | Los archivos mantienen nombres como `evento.routes.js`. Solo se cambiaron los internals |
| **Rutas HTTP** (paths en `app.use()`) | Se conservan `/api/eventos`, `/api/inscripciones`, etc. |
| **`admin.controller.js` req.body** | Ya usaba nombres custom (`cedula`, `nombres`, `apellidos`) no vinculados al schema |
| **`prisma/seed.js`** | Fue reescrito completamente, no refactorizado |
| **`backend/src/generated/`** | Se regenera automáticamente con `prisma generate` |
| **Docker, CI/CD, configs** | No afectados por el cambio de schema |

---

## 12. Verificación final

| Check | Estado | Detalle |
|-------|--------|---------|
| `npx prisma generate` | ✅ | Cliente generado sin errores |
| `npx prisma migrate dev --name init` | ✅ | Migración creada y aplicada |
| `node prisma/seed.js` | ✅ | Seed ejecutado: universidad, facultad, autoridades, coordinadores, carreras, usuarios de prueba, 35+ eventos |
| `node src/app.js` | ✅ | Servidor arranca en puerto 3000 sin errores |
| `GET /api/eventos` | ✅ | Responde con campos en inglés (`name`, `description`, `type`, `status`...) |
| Require paths | ✅ | 141 require() verificados, 0 rotos |
| Prisma model refs | ✅ | 0 referencias a modelos en español (`prisma.evento`, `prisma.cuenta`, etc.) |
| Enum values | ✅ | 0 valores de enum en español en código fuente |
