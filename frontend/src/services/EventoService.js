/**
 * @class EventoService
 * @description Servicio para gestionar eventos, incluyendo eventos destacados
 */
class EventoService {
  constructor() {
    this.baseURL =
      (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api";
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
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const url = `${this.baseURL}/eventos/${idEvento}/destacado`;
      const requestBody = { eve_des: esDestacado };

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseText = await response.text();

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(
            `Error ${response.status}: Respuesta no JSON - ${responseText}`
          );
        }

        throw new Error(
          errorData.msg || `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error al cambiar estado destacado:", error.message);
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
