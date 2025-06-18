import axios from "axios";

// Construir la URL del API asegurándonos de que termine con /api
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

/**
 * Servicio para gestionar la recuperación de contraseña
 */
class PasswordRecoveryService {
  /**
   * Solicita la recuperación de contraseña
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise} Respuesta de la API
   */
  async requestPasswordRecovery(email) {
    try {
      const url = `${API_URL}/password-recovery/request`;

      const response = await axios.post(url, { email });

      return response.data;
    } catch (error) {
      console.error("❌ [REQUEST-RECOVERY] Error completo:", error);
      console.error(
        "❌ [REQUEST-RECOVERY] Response data:",
        error.response?.data
      );
      console.error("❌ [REQUEST-RECOVERY] Status:", error.response?.status);
      console.error("❌ [REQUEST-RECOVERY] URL que falló:", error.config?.url);

      const message =
        error.response?.data?.message ||
        "Error al solicitar recuperación de contraseña";
      const customError = new Error(message);

      // Adjuntar los datos de respuesta al error para más contexto
      if (error.response?.data) {
        customError.response = error.response;
      }

      throw customError;
    }
  }

  /**
   * Valida un token de recuperación de contraseña
   * @param {string} token - Token de recuperación
   * @returns {Promise} Respuesta de la API
   */
  async validateToken(token) {
    try {
      const url = `${API_URL}/password-recovery/validate/${token}`;
      console.log("🔍 [VALIDATE-TOKEN] Enviando solicitud a:", url);
      console.log("🔍 [VALIDATE-TOKEN] Token:", token);

      const response = await axios.get(url);

      console.log("✅ [VALIDATE-TOKEN] Respuesta exitosa:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [VALIDATE-TOKEN] Error completo:", error);
      console.error("❌ [VALIDATE-TOKEN] Response data:", error.response?.data);
      console.error("❌ [VALIDATE-TOKEN] Status:", error.response?.status);
      console.error("❌ [VALIDATE-TOKEN] URL que falló:", error.config?.url);

      const message =
        error.response?.data?.message || "Token inválido o expirado";
      const customError = new Error(message);

      // Adjuntar los datos de respuesta al error para más contexto
      if (error.response?.data) {
        customError.response = error.response;
        customError.reason = error.response.data.reason;
      }

      throw customError;
    }
  }

  /**
   * Restablece la contraseña usando un token válido
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de la nueva contraseña
   * @returns {Promise} Respuesta de la API
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const url = `${API_URL}/password-recovery/reset`;
      console.log("🔄 [RESET-PASSWORD] Enviando solicitud a:", url);
      console.log("🔄 [RESET-PASSWORD] Token presente:", !!token);
      console.log(
        "🔄 [RESET-PASSWORD] Contraseñas presentes:",
        !!newPassword && !!confirmPassword
      );

      const response = await axios.post(url, {
        token,
        newPassword,
        confirmPassword,
      });

      console.log("✅ [RESET-PASSWORD] Respuesta exitosa:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ [RESET-PASSWORD] Error completo:", error);
      console.error("❌ [RESET-PASSWORD] Response data:", error.response?.data);
      console.error("❌ [RESET-PASSWORD] Status:", error.response?.status);
      console.error("❌ [RESET-PASSWORD] URL que falló:", error.config?.url);

      const message =
        error.response?.data?.message || "Error al restablecer la contraseña";
      const customError = new Error(message);

      // Adjuntar los datos de respuesta al error para más contexto
      if (error.response?.data) {
        customError.response = error.response;
        customError.reason = error.response.data.reason;
      }

      throw customError;
    }
  }
}

export default new PasswordRecoveryService();
