/**
 * @class EventoDestacado
 * @description Modelo para eventos destacados
 */
class EventoDestacado {
  static normalizeModality(modality) {
    if (!modality) return "";

    const map = {
      IN_PERSON: "PRESENCIAL",
      VIRTUAL: "VIRTUAL",
      HYBRID: "SEMIPRESENCIAL",
      PRESENCIAL: "PRESENCIAL",
      SEMIPRESENCIAL: "SEMIPRESENCIAL",
    };

    return map[modality] || modality;
  }

  static normalizeStatus(status) {
    if (!status) return "";

    const map = {
      ACTIVE: "ACTIVO",
      INACTIVE: "INACTIVO",
      FINISHED: "FINALIZADO",
      CANCELLED: "CANCELADO",
      SUSPENDED: "SUSPENDIDO",
      ACTIVO: "ACTIVO",
      INACTIVO: "INACTIVO",
      FINALIZADO: "FINALIZADO",
      CANCELADO: "CANCELADO",
      SUSPENDIDO: "SUSPENDIDO",
    };

    return map[status] || status;
  }

  static safeDate(value) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * @constructor
   * @param {Object} evento - Datos del evento
   */
  constructor(evento) {
    this.id = evento.id_eve ?? evento.id;
    this.titulo = evento.nom_eve ?? evento.name ?? evento.title ?? "Evento";
    this.descripcion = evento.des_eve ?? evento.description ?? "";
    this.fechaInicio = EventoDestacado.safeDate(
      evento.fec_ini_eve ?? evento.startDate
    );
    this.fechaFin = EventoDestacado.safeDate(
      evento.fec_fin_eve ?? evento.endDate
    );
    this.imagen =
      evento.img_por_eve ??
      evento.coverImageUrl ??
      evento.coverImage ??
      "https://i.imgur.com/f8adUbZ.png";
    this.esDestacado = Boolean(evento.eve_des ?? evento.isFeatured);
    this.modalidad = EventoDestacado.normalizeModality(
      evento.mod_eve ?? evento.modality
    );
    this.valor = Number(evento.val_eve ?? evento.price ?? 0);
    this.tipo = evento.tip_eve ?? evento.type ?? "";
    this.duracionHoras = Number(evento.dur_hor_eve ?? evento.durationHours ?? 0);
    this.cuposDisponibles = Number(
      evento.cup_dis_eve ?? evento.availableSpots ?? 0
    );
    this.cuposMaximos = Number(evento.cup_max_eve ?? evento.maxCapacity ?? 0);
    this.estado = EventoDestacado.normalizeStatus(
      evento.est_eve ?? evento.status
    );
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
    if (!this.fechaInicio) {
      return "Fecha por confirmar";
    }

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
    if (!this.fechaInicio || !this.fechaFin) {
      return "Por confirmar";
    }

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
