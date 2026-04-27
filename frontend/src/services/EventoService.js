import axiosInstance from "../api/axiosConfig";
import { requestWithEndpointFallback } from "../api/endpointFallback";

/**
 * @class EventoService
 * @description Servicio para gestionar eventos, incluyendo eventos destacados
 */
class EventoService {
  toBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return (
        normalized === "true" ||
        normalized === "1" ||
        normalized === "si" ||
        normalized === "sí"
      );
    }
    return false;
  }

  isActiveStatus(value) {
    const normalized = String(value ?? "").trim().toUpperCase();
    return (
      normalized === "" ||
      normalized === "ACTIVE" ||
      normalized === "ACTIVO"
    );
  }

  extraerEventos(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.eventosDestacados)) return payload.eventosDestacados;
    if (Array.isArray(payload.eventos)) return payload.eventos;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (payload.data && typeof payload.data === "object") {
      return this.extraerEventos(payload.data);
    }
    return [];
  }

  normalizarDestacados(eventos = []) {
    const unicos = eventos.filter((evento, index, array) => {
      const id = evento?.id ?? evento?.id_eve;
      const title = evento?.name ?? evento?.nom_eve ?? evento?.title ?? "";
      const date = evento?.startDate ?? evento?.fec_ini_eve ?? "";

      return (
        array.findIndex((candidate) => {
          const candidateId = candidate?.id ?? candidate?.id_eve;
          if (id && candidateId && id === candidateId) return true;

          const candidateTitle =
            candidate?.name ?? candidate?.nom_eve ?? candidate?.title ?? "";
          const candidateDate =
            candidate?.startDate ?? candidate?.fec_ini_eve ?? "";

          return candidateTitle === title && candidateDate === date;
        }) === index
      );
    });

    return unicos.slice(0, 8);
  }

  /**
   * Obtiene los eventos destacados (maximo 8)
   * @returns {Promise<Array>} Lista de eventos destacados
   */
  async getEventosDestacados() {
    try {
      const featuredResponses = [
        await requestWithEndpointFallback(
          () => axiosInstance.get("/events/featured"),
          () => axiosInstance.get("/eventos-destacados")
        ),
      ];

      try {
        featuredResponses.push(await axiosInstance.get("/events-featured"));
      } catch (_error) {
        // Compatibilidad: no todos los tenants exponen esta ruta.
      }

      const direct = this.normalizarDestacados(
        featuredResponses.flatMap((response) => this.extraerEventos(response.data))
      );

      // Si el endpoint existe pero devuelve vacio, intentamos traer todos
      // los eventos y rescatar los que siguen marcados como destacados.
      if (direct.length > 0) return direct;

      const allResponses = [];

      try {
        allResponses.push(
          await requestWithEndpointFallback(
            () => axiosInstance.get("/public-events"),
            () => axiosInstance.get("/eventos-publicos")
          )
        );
      } catch (_error) {
        // Continuamos con rutas generales si las públicas no están disponibles.
      }

      allResponses.push(
        await requestWithEndpointFallback(
          () => axiosInstance.get("/events"),
          () => axiosInstance.get("/eventos")
        )
      );

      const allEvents = allResponses.flatMap((response) =>
        this.extraerEventos(response.data)
      );

      const featured = this.normalizarDestacados(
        allEvents
          .filter((evt) => this.toBoolean(evt?.isFeatured ?? evt?.eve_des))
          .sort((a, b) => {
            const aDate = new Date(a?.startDate ?? a?.fec_ini_eve ?? 0).getTime();
            const bDate = new Date(b?.startDate ?? b?.fec_ini_eve ?? 0).getTime();
            return aDate - bDate;
          })
      );

      if (featured.length > 0) {
        return featured;
      }

      return this.normalizarDestacados(
        allEvents
          .filter((evt) => this.isActiveStatus(evt?.status ?? evt?.est_eve))
          .sort((a, b) => {
            const aDate = new Date(a?.startDate ?? a?.fec_ini_eve ?? 0).getTime();
            const bDate = new Date(b?.startDate ?? b?.fec_ini_eve ?? 0).getTime();
            return aDate - bDate;
          })
      );
    } catch (error) {
      console.error("Error al obtener eventos destacados:", error);
      throw error;
    }
  }

  /**
   * Marca o desmarca un evento como destacado
   * @param {string} idEvento - ID del evento
   * @param {boolean} esDestacado - Indica si el evento sera destacado o no
   * @returns {Promise<Object>} Resultado de la operacion
   */
  async toggleEventoDestacado(idEvento, esDestacado) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontro token de autenticacion");
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
   * Obtiene todos los eventos para el administrador (incluye informacion de destacado)
   * @returns {Promise<Array>} Lista de eventos
   */
  async getEventosParaAdmin() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontro token de autenticacion");
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
