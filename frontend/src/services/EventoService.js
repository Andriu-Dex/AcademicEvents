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
      const direct = Array.isArray(data?.eventosDestacados)
        ? data.eventosDestacados
        : [];

      // Si el endpoint existe pero devuelve vacío (compatibilidad/datos), intentamos
      // obtener todos los eventos y filtrar los que estén marcados como destacados.
      if (direct.length > 0) return direct;

      const allEventsResponse = await requestWithEndpointFallback(
        () => axiosInstance.get("/events"),
        () => axiosInstance.get("/eventos")
      );

      const allData = allEventsResponse.data;
      let allEvents = [];
      if (Array.isArray(allData)) {
        allEvents = allData;
      } else if (Array.isArray(allData?.eventos)) {
        allEvents = allData.eventos;
      } else if (Array.isArray(allData?.data)) {
        allEvents = allData.data;
      }

      const featured = allEvents
        .filter((evt) => Boolean(evt?.isFeatured ?? evt?.eve_des))
        .sort((a, b) => {
          const aDate = new Date(a?.startDate ?? a?.fec_ini_eve ?? 0).getTime();
          const bDate = new Date(b?.startDate ?? b?.fec_ini_eve ?? 0).getTime();
          return aDate - bDate;
        })
        .slice(0, 8);

      return featured;
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
