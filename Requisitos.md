# Proyecto Final - Entrega 23 de junio 2025

---

## Requisitos Generales

2. **Aplicación web**

   - Plataforma para gestión, inscripción y visualización de información sobre cursos y eventos académicos.
   - Eventos válidos: charla, webinar, congreso, concursos de programación (solo eventos académicos, no ofertas académicas).
   - Enfocado exclusivamente en la Facultad de Ingeniería en Sistemas Electrónicos e Informática (FISEI).
   - Permitir la creación y gestión dinámica de:

     - Misión y visión (editable desde el panel administrativo, no estático en código).
     - Autoridades.
     - Carreras (para asignar cursos a una carrera).
     - Cursos y eventos (CRUD completo).

   - El sistema debe ser completamente dinámico, todo editable desde la administración.

---

## Usuarios y Roles

1. **Roles**

   - Administrador global.
   - Administrador genérico.
   - Estudiante.

2. **Administradores**

   - El admin global puede crear usuarios y otros administradores.
   - Administradores genéricos no pueden crear usuarios.
   - Administradores tienen dos cuentas:

     - Una para administración.
     - Otra con rol de estudiante para inscribirse y participar en cursos (sin poder modificar notas propias).

   - Los administradores no usan correo institucional para credenciales.
   - Los administradores pueden modificar casi todo menos notas de cursos en que estén inscritos como estudiantes.

3. **Estudiantes**

   - Deben iniciar sesión con correo institucional (@uta.edu.ec).
   - Sólo pueden estar inscritos en una carrera.
   - Perfil debe contener: cédula, nombres, apellidos, correo institucional, carrera (editable), y documentos PDF (carrera (si es publico general no es necesario), cédula, papeleta de votación, certificado de estar matriculado (si es publico general no es necesario)).
   - Inscripción a cursos requiere aprobación del administrador que revise documentos PDF, aquel que contiene los dicumentos del estudiante y otro pdf con la carta de motivación.
   - Usuarios externos (no institucionales) sólo deben entregar cédula, sin carrera ni requisitos de matriculación.
     -Al inscribirse a algún evento el usuario debe redactar una carta de motivacion para ingresar al evento, cuando la redacte esta se transformará en PDF y se enviará a revisión para que el admin la valide junto con el PDF con los datos (cédula, nombres, apellidos, correo institucional, carrera (editable), y documentos PDF (carrera (si es publico general no es necesario), cédula, papeleta de votación, certificado de estar matriculado (si es publico general no es necesario)))

---

## Cursos y Eventos

1. **Información general**

   - Cada curso tiene: nombre, duración en horas, fecha inicio, fecha fin, si es pago o gratuito.
   - Solo mostrar cursos abiertos para inscripción; cursos finalizados no se muestran.
   - Eventos y cursos deben poder asignarse a carreras específicas o a todas las carreras.
   - Habrá un grid o tabla con todos los eventos y otro con los cursos.

2. **Evaluación y certificación**

   - Cursos tienen nota final, asistencia y certificado.
   - Para aprobar:

     - Nota final ≥ 8.
     - Asistencia ≥ 80%.

   - Solo se registra asistencia diaria (presente o ausente).
   - Si aprueba, puede descargar certificado; si no, no.
   - En cursos pagos, el certificado se entrega solo después de validar el pago.
   - Para eventos gratuitos, el certificado se entrega sin pago.
   - Los certificados se envían también por correo electrónico.
   - El certificado debe indicar claramente el motivo: aprobación, asistencia, etc.

3. **Pagos**

   - Solo depósito o transferencia.
   - El estudiante debe subir foto o comprobante de pago.
   - El administrador valida y cambia el estado a "validado".
   - El pago o comprobante debe entregarse antes del fin del curso.
   - No hay fecha límite fija para pago, solo hasta que finalice el curso.

---

## Funcionalidades adicionales

- **Autenticación**

  - Solo correos institucionales @uta.edu.ec pueden elegir carrera.
  - Público general (sin correo institucional) no necesita carrera para eventos abiertos.

- **Reportes**

  - Reportes de pago/validación de inscripción (curso, costo, usuario).
  - Reportes de asistencia y notas (nombres, notas, asistencia).

- **Interfaz del usuario**

  - Perfil con listado de cursos inscritos, estados (Finalizado, En espera, etc.).
  - Buscador avanzado para cursos y eventos.

- **Restricciones**

  - Solo una nota final por estudiante y curso.

- **Documentación**

  - Crear archivo README.md con explicación general del proyecto.
  - Crear archivo CONTRIBUTING.md con normas para contribuir al proyecto.

---
