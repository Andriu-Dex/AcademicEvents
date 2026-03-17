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
    this.id = evento.id ?? evento.id_eve;
    this.titulo = evento.name ?? evento.nom_eve ?? evento.title ?? "Evento";
    this.descripcion = evento.description ?? evento.des_eve ?? "";
    this.fechaInicio = EventoDestacado.safeDate(
      evento.startDate ?? evento.fec_ini_eve
    );
    this.fechaFin = EventoDestacado.safeDate(
      evento.endDate ?? evento.fec_fin_eve
    );
    this.imagen =
      evento.coverImageUrl ??
      evento.img_por_eve ??
      evento.coverImage ??
      "https://i.imgur.com/f8adUbZ.png";
    this.esDestacado = Boolean(evento.isFeatured ?? evento.eve_des);
    this.modalidad = EventoDestacado.normalizeModality(
      evento.modality ?? evento.mod_eve
    );
    this.valor = Number(evento.price ?? evento.val_eve ?? 0);
    this.tipo = evento.type ?? evento.tip_eve ?? "";
    this.duracionHoras = Number(evento.durationHours ?? evento.dur_hor_eve ?? 0);
    this.cuposDisponibles = Number(
      evento.availableSpots ?? evento.cup_dis_eve ?? 0
    );
    this.cuposMaximos = Number(evento.maxCapacity ?? evento.cup_max_eve ?? 0);
    this.estado = EventoDestacado.normalizeStatus(
      evento.status ?? evento.est_eve
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
