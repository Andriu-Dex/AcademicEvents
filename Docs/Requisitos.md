# Proyecto Final - Entrega 23 de junio 2025

---

## Requisitos Generales

1. **Control de versiones y gestión de cambios**

   - Integrar Jira Service Manager con GitHub para la gestión de cambios.
   - Generar reportes que indiquen:

     - Cantidad de cambios asignados.
     - A qué compañero se asignaron.
     - Cantidad de cambios normales y emergentes.

     - Misión y visión (editable desde el panel administrativo, no estático en código).
     - Autoridades.

---

- El admin global puede crear usuarios y otros administradores.
- Administradores genéricos no pueden crear usuarios.
- Los administradores pueden modificar casi todo menos notas de cursos en que estén inscritos como estudiantes.

- Solo mostrar cursos abiertos para inscripción; cursos finalizados no se muestran.
- Si aprueba, puede descargar certificado; si no, no.
- El administrador valida y cambia el estado a "validado".
- El pago o comprobante debe entregarse antes del fin del curso.
- No hay fecha límite fija para pago, solo hasta que finalice el curso.

---

- Reportes de pago/validación de inscripción (curso, costo, usuario).
- Reportes de asistencia y notas (nombres, notas, asistencia).

---

- **Documentación**

  - Crear archivo README.md con explicación general del proyecto.
  - Crear archivo CONTRIBUTING.md con normas para contribuir al proyecto.

---

## Gestión de Cambios y Comité de Control

- La gestión de cambios debe ser aprobada por 4 personas del Comité de Control de Cambios (CCC).
- Debe incluir:

  - Observaciones sobre por qué se aprobó o rechazó.
  - Análisis de urgencia.
  - Evaluación del impacto: qué sistemas, módulos y niveles afecta.
  - Clasificación del cambio:

    - **Estándar**: Bajo impacto, requiere autorización y evaluación de riesgos solo la primera vez.
    - **Normal**: Documentación completa, planificación, detalles técnicos, plan de contingencia.
    - **Emergencia**: Alta prioridad, para problemas que causan caída o inactividad, aprobado por comité.

- Existen comités especializados:

  - CCC: Comité de Control de Cambios (en infraestructura, por ejemplo nuevas bases de datos).
  - CAF: Comité Asesor de Cambios de Emergencia.

- Se debe considerar plan B para cambios estándar y de emergencia.

---
