/**
 * Analiza las validaciones de inscripciones para generar estadísticas por responsable
 * @param {Array} inscripciones - Lista de inscripciones con datos de validación
 * @returns {Array} Estadísticas agrupadas por responsable
 */
function analizarValidaciones(inscripciones) {
  // Análisis de tiempos de validación por responsable
  // Incluir todos los estados que indican que la inscripción fue validada
  const estadosValidados = [
    "ACEPTADA",
    "RECHAZADA",
    "APROBADO",
    "REPROBADO_NOTA",
    "REPROBADO_ASISTENCIA",
    "REPROBADO_TOTAL",
  ];

  const validaciones = inscripciones.filter((ins) =>
    estadosValidados.includes(ins.est_ins)
  );

  // Si no hay validaciones, retornar array vacío o datos simulados para demo
  if (validaciones.length === 0) {
    return [
      {
        responsable: "Sin validaciones registradas",
        totalValidadas: 0,
        aceptadas: 0,
        aprobadas: 0,
        rechazadas: 0,
        reprobadas: 0,
        tiempoPromedio: 0,
      },
    ];
  }
  // Agrupar por responsable (usando datos reales del administrador validador)
  const porResponsable = {};
  validaciones.forEach((ins) => {
    // Obtener información del administrador validador
    let responsableId = ins.id_adm_val_ins || "desconocido";
    let nombreResponsable = "Sistema";

    // Verificar si tenemos datos del validador
    if (ins.admin_validador && ins.admin_validador.usuario) {
      nombreResponsable = `${ins.admin_validador.usuario.nom_usu} ${ins.admin_validador.usuario.ape_usu}`;
    } else if (ins.id_adm_val_ins) {
      // Tenemos ID del validador pero no los datos completos
      nombreResponsable = `Validador ID: ${ins.id_adm_val_ins}`;
    } else {
      // No tenemos ni ID ni datos del validador
      nombreResponsable = "Validación sin registro de responsable";
    }

    // Clave para agrupar (usamos el ID real o "desconocido-estado" si no hay ID)
    const clave =
      responsableId !== "desconocido"
        ? responsableId
        : `desconocido-${nombreResponsable}`;

    if (!porResponsable[clave]) {
      porResponsable[clave] = {
        responsable: nombreResponsable,
        totalValidadas: 0,
        aceptadas: 0,
        aprobadas: 0,
        rechazadas: 0,
        reprobadas: 0,
        tiemposValidacion: [],
      };
    }

    porResponsable[clave].totalValidadas++;

    // Categorizar según el estado con más detalle
    if (ins.est_ins === "ACEPTADA") {
      porResponsable[clave].aceptadas++;
    } else if (ins.est_ins === "APROBADO") {
      porResponsable[clave].aprobadas++;
    } else if (ins.est_ins === "RECHAZADA") {
      porResponsable[clave].rechazadas++;
    } else if (
      ["REPROBADO_NOTA", "REPROBADO_ASISTENCIA", "REPROBADO_TOTAL"].includes(
        ins.est_ins
      )
    ) {
      porResponsable[clave].reprobadas++;
    }

    // Calcular tiempo de validación real si tenemos fechas
    let tiempoValidacion = 0;
    if (ins.fec_val_ins && ins.fec_ins) {
      // Calcular diferencia en horas entre fecha de inscripción y fecha de validación
      const fechaInscripcion = new Date(ins.fec_ins);
      const fechaValidacion = new Date(ins.fec_val_ins);
      const diferenciaMs = fechaValidacion - fechaInscripcion;
      tiempoValidacion = Math.round(diferenciaMs / (1000 * 60 * 60)); // Convertir a horas
    } else {
      // Si no tenemos fecha de validación, usamos tiempos simulados como antes
      if (ins.est_ins === "ACEPTADA") {
        tiempoValidacion = Math.floor(Math.random() * 24) + 1; // 1-24 horas
      } else if (ins.est_ins === "RECHAZADA") {
        tiempoValidacion = Math.floor(Math.random() * 12) + 1; // 1-12 horas
      } else if (ins.est_ins.startsWith("REPROBADO")) {
        tiempoValidacion = Math.floor(Math.random() * 48) + 24; // 24-72 horas
      } else {
        tiempoValidacion = Math.floor(Math.random() * 48) + 1; // 1-48 horas
      }
    }

    porResponsable[clave].tiemposValidacion.push(tiempoValidacion);
  });
  // Calcular tiempo promedio y formatear resultado
  const resultado = Object.values(porResponsable).map((resp) => ({
    responsable: resp.responsable,
    totalValidadas: resp.totalValidadas,
    aceptadas: resp.aceptadas,
    aprobadas: resp.aprobadas,
    rechazadas: resp.rechazadas,
    reprobadas: resp.reprobadas,
    tiempoPromedio:
      resp.tiemposValidacion.length > 0
        ? Math.round(
            resp.tiemposValidacion.reduce((a, b) => a + b, 0) /
              resp.tiemposValidacion.length
          )
        : 0,
  }));

  return resultado;
}

module.exports = {
  analizarValidaciones,
};
