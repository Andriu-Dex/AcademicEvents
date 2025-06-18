/**
 * @class EventoDestacado
 * @description Modelo para eventos destacados
 */
class EventoDestacado {
  /**
   * @constructor
   * @param {Object} evento - Datos del evento
   */
  constructor(evento) {
    this.id = evento.id_eve;
    this.titulo = evento.nom_eve;
    this.descripcion = evento.des_eve;
    this.fechaInicio = new Date(evento.fec_ini_eve);
    this.fechaFin = new Date(evento.fec_fin_eve);
    this.imagen = evento.img_por_eve;
    this.esDestacado = evento.eve_des;
    this.modalidad = evento.mod_eve;
    this.valor = evento.val_eve;
    this.tipo = evento.tip_eve;
    this.duracionHoras = evento.dur_hor_eve;
    this.cuposDisponibles = evento.cup_dis_eve;
    this.cuposMaximos = evento.cup_max_eve;
    this.estado = evento.est_eve;
  }

  /**
   * Alterna el estado destacado del evento
   * @returns {boolean} Nuevo estado destacado
   */
  toggleDestacado() {
    this.esDestacado = !this.esDestacado;
    return this.esDestacado;
  }

  /**
   * Formatea la fecha de inicio en formato local
   * @param {string} locale - Código de localización (default: 'es-ES')
   * @returns {string} Fecha formateada
   */
  formatearFechaInicio(locale = "es-ES") {
    return this.fechaInicio.toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Obtiene el estado de disponibilidad del evento
   * @returns {string} Estado de disponibilidad
   */
  obtenerEstadoDisponibilidad() {
    const hoy = new Date();

    if (this.fechaFin < hoy) {
      return "Finalizado";
    }

    if (this.fechaInicio > hoy) {
      return "Próximamente";
    }

    return "En curso";
  }

  /**
   * Obtiene el porcentaje de cupos ocupados
   * @returns {number} Porcentaje de ocupación
   */
  obtenerPorcentajeOcupacion() {
    if (this.cuposMaximos === 0) return 0;
    return Math.round(
      ((this.cuposMaximos - this.cuposDisponibles) / this.cuposMaximos) * 100
    );
  }
}

export default EventoDestacado;
