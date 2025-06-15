import EventoDestacado from "./EventoDestacado";

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
