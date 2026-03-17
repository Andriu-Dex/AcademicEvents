import axiosInstance from "../api/axiosConfig";
import { requestWithEndpointFallback } from "../api/endpointFallback";

/**
 * @class EventoService
 * @description Servicio para gestionar eventos, incluyendo eventos destacados
 */
class EventoService {
  /**
   * Obtiene los eventos destacados (máximo 8)
   * @returns {Promise<Array>} Lista de eventos destacados
   */
  async getEventosDestacados() {
    try {
      const response = await requestWithEndpointFallback(
        () => axiosInstance.get("/events/featured"),
        () => axiosInstance.get("/eventos-destacados")
      );

      const data = response.data;
      return data.eventosDestacados || [];
    } catch (error) {
      console.error("Error al obtener eventos destacados:", error);
      throw error;
    }
  }
  /**
   * Marca o desmarca un evento como destacado
   * @param {string} idEvento - ID del evento
   * @param {boolean} esDestacado - Indica si el evento será destacado o no
   * @returns {Promise<Object>} Resultado de la operación  */ async toggleEventoDestacado(
    idEvento,
    esDestacado
  ) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }
      const requestBody = { eve_des: esDestacado };

      const response = await requestWithEndpointFallback(
        () => axiosInstance.patch(`/events/${idEvento}/featured`, requestBody),
        () => axiosInstance.patch(`/eventos/${idEvento}/destacado`, requestBody)
      );

      const result = response.data;
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los eventos para el administrador (incluye información de destacado)
   * @returns {Promise<Array>} Lista de eventos
   */
  async getEventosParaAdmin() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await requestWithEndpointFallback(
        () => axiosInstance.get("/events"),
        () => axiosInstance.get("/eventos")
      );

      const data = response.data;
      return data.eventos || [];
    } catch (error) {
      console.error("Error al obtener eventos para admin:", error);
      throw error;
    }
  }
}

export default new EventoService();
