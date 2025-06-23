/**
 * Servicio específico para gestionar inscripciones
 * @module services/InscripcionService
 */

import axiosInstance from "../api/axiosConfig";

/**
 * Clase que provee métodos para interactuar con el API de inscripciones
 */
class InscripcionService {
  /**
   * Obtiene los datos completos del evento con información de inscripciones
   * @param {string} idEvento - ID del evento
   * @returns {Promise<Object>} Datos completos del evento e inscripciones
   */
  async obtenerDatosEventoDirecto(idEvento) {
    try {
      // Hacer múltiples llamadas para obtener datos desde diferentes endpoints
      const [inscripcionesRes, eventoRes] = await Promise.all([
        axiosInstance.get(`/admin/inscripciones/evento/${idEvento}`),
        axiosInstance.get(`/eventos/${idEvento}`),
      ]);

      return {
        inscripciones: inscripcionesRes.data,
        evento: eventoRes.data,
        debug: {
          timestamp: new Date().toISOString(),
          metodo: "obtenerDatosEventoDirecto",
          idEvento: idEvento,
        },
      };
    } catch (error) {
      console.error("Error al obtener datos del evento:", error);
      throw error;
    }
  }

  /**
   * Obtiene solo las inscripciones de un evento (método de respaldo)
   * @param {string} idEvento - ID del evento
   * @returns {Promise<Array>} Lista de inscripciones
   */
  async obtenerInscripcionesPorEvento(idEvento) {
    try {
      const response = await axiosInstance.get(
        `/admin/inscripciones/evento/${idEvento}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw error;
    }
  }

  /**
   * Obtiene información específica del evento
   * @param {string} idEvento - ID del evento
   * @returns {Promise<Object>} Datos del evento
   */
  async obtenerEvento(idEvento) {
    try {
      const response = await axiosInstance.get(`/eventos/${idEvento}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener evento:", error);
      throw error;
    }
  }
}

export default new InscripcionService();
