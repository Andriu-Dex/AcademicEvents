/**
 * @class EventoService
 * @description Servicio para gestionar eventos, incluyendo eventos destacados
 */
class EventoService {
  constructor() {
    this.baseURL =
      (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api";
    console.log("EventoService - Base URL configurada:", this.baseURL);
  }

  /**
   * Obtiene los eventos destacados (máximo 8)
   * @returns {Promise<Array>} Lista de eventos destacados
   */
  async getEventosDestacados() {
    try {
      const response = await fetch(`${this.baseURL}/eventos-destacados`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
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
      console.log("=== FRONTEND - TOGGLE EVENTO DESTACADO ===");
      console.log("ID Evento:", idEvento);
      console.log("Es Destacado:", esDestacado);

      const token = localStorage.getItem("token");
      console.log("Token encontrado:", token ? "SÍ" : "NO");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const url = `${this.baseURL}/eventos/${idEvento}/destacado`;
      console.log("URL completa:", url);
      console.log("BaseURL:", this.baseURL);
      console.log("Método: PATCH, Valor eve_des:", esDestacado);

      const requestBody = { eve_des: esDestacado };
      console.log("Body a enviar:", JSON.stringify(requestBody));

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);
      console.log("Response ok:", response.ok);
      console.log("Response status:", response.status);
      console.log("Response statusText:", response.statusText);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        console.log("Response no ok, obteniendo error data...");
        const responseText = await response.text();
        console.log("Response text:", responseText);

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.log("Error al parsear JSON de respuesta:", parseError);
          throw new Error(
            `Error ${response.status}: Respuesta no JSON - ${responseText}`
          );
        }

        throw new Error(
          errorData.msg || `Error ${response.status}: ${response.statusText}`
        );
      }

      console.log("Respuesta exitosa, parseando JSON...");
      const result = await response.json();
      console.log("Resultado:", result);
      console.log("=== FIN FRONTEND TOGGLE ===");
      return result;
    } catch (error) {
      console.error("=== ERROR FRONTEND TOGGLE ===");
      console.error("Error completo:", error);
      console.error("Mensaje:", error.message);
      console.error("Stack:", error.stack);
      console.error("=== FIN ERROR FRONTEND ===");
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

      const response = await fetch(`${this.baseURL}/eventos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.eventos || [];
    } catch (error) {
      console.error("Error al obtener eventos para admin:", error);
      throw error;
    }
  }
}

export default new EventoService();
