import EventoDestacado from "./EventoDestacado";
import { useSocket } from "../context/SocketContext";

/**
 * @class GestorEventosDestacados
 * @description Gestiona la colección de eventos destacados
 */
class GestorEventosDestacados {
  /**
   * @constructor
   * @param {Object} apiService - Servicio API para eventos
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.eventosDestacados = [];
    this.cargando = false;
    this.error = null;
    this.onEventoDestacadoChange = null;
  }

  /**
   * Configura un callback para cuando cambia un evento destacado
   * @param {Function} callback - Función a llamar cuando hay cambios
   */
  setOnEventoDestacadoChange(callback) {
    this.onEventoDestacadoChange = callback;
  }

  /**
   * Obtiene los eventos destacados desde la API
   * @returns {Promise<Array>} Lista de eventos destacados como instancias de EventoDestacado
   */
  async obtenerEventosDestacados() {
    try {
      this.cargando = true;
      this.error = null;

      const eventos = await this.apiService.getEventosDestacados();
      this.eventosDestacados = eventos.map(
        (evento) => new EventoDestacado(evento)
      );

      return this.eventosDestacados;
    } catch (error) {
      this.error = error.message || "Error al obtener eventos destacados";
      throw error;
    } finally {
      this.cargando = false;
    }
  }
  /**
   * Actualiza la lista de eventos destacados con nuevos datos desde el servidor
   * @param {Object} eventoData - Datos del evento actualizado
   */
  actualizarEventoDestacado(eventoData) {
    if (!eventoData || typeof eventoData.id === "undefined") {
      console.warn(
        "GestorEventosDestacados: Datos de evento inválidos recibidos",
        eventoData
      );
      return;
    }

    // Determinar acción según si es destacado o no
    if (eventoData.esDestacado) {
      // Si es destacado y no existe, lo agregamos
      const eventoExistente = this.eventosDestacados.find(
        (evento) => evento.id === eventoData.id
      );

      if (!eventoExistente && eventoData.evento) {
        const nuevoEvento = new EventoDestacado(eventoData.evento);
        this.eventosDestacados.push(nuevoEvento);
      }
    } else {
      // Si ya no es destacado, lo eliminamos de la lista
      this.eventosDestacados = this.eventosDestacados.filter(
        (evento) => evento.id !== eventoData.id
      );
    }

    // Notificar al componente que hubo un cambio
    if (
      this.onEventoDestacadoChange &&
      typeof this.onEventoDestacadoChange === "function"
    ) {
      this.onEventoDestacadoChange(this.eventosDestacados);
    }
  }

  /**
   * Marca o desmarca un evento como destacado
   * @param {string} idEvento - ID del evento
   * @param {boolean} esDestacado - Nuevo estado destacado
   * @returns {Promise<Object>} Resultado de la operación
   */
  async toggleEventoDestacado(idEvento, esDestacado) {
    try {
      return await this.apiService.toggleEventoDestacado(idEvento, esDestacado);
    } catch (error) {
      this.error = error.message || "Error al actualizar evento destacado";
      throw error;
    }
  }

  /**
   * Verifica si se ha alcanzado el límite de eventos destacados (8)
   * @returns {boolean} Verdadero si se alcanzó el límite
   */
  haAlcanzadoLimite() {
    return this.eventosDestacados.length >= 8;
  }

  /**
   * Filtra eventos destacados por criterio
   * @param {Function} filtro - Función de filtrado
   * @returns {Array} Eventos filtrados
   */
  filtrarEventos(filtro) {
    return this.eventosDestacados.filter(filtro);
  }

  /**
   * Obtiene eventos destacados ordenados por fecha de inicio
   * @param {boolean} ascendente - Orden ascendente o descendente
   * @returns {Array} Eventos ordenados
   */
  obtenerOrdenadosPorFecha(ascendente = true) {
    return [...this.eventosDestacados].sort((a, b) => {
      return ascendente
        ? a.fechaInicio - b.fechaInicio
        : b.fechaInicio - a.fechaInicio;
    });
  }
}

export default GestorEventosDestacados;
