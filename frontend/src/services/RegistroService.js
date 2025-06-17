import axiosInstance from "../api/axiosConfig";

/**
 * Clase para gestionar las operaciones de registro de usuarios
 * Implementa patrón Singleton para manejar el registro
 */
class RegistroService {
  static instance;

  /**
   * Obtiene la instancia única del servicio
   * @returns {RegistroService} - Instancia del servicio
   */
  static getInstance() {
    if (!RegistroService.instance) {
      RegistroService.instance = new RegistroService();
    }
    return RegistroService.instance;
  }
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} datos - Datos del usuario a registrar
   * @returns {Promise} - Promesa con la respuesta del servidor
   */
  async registrarUsuario(datos) {
    try {
      const response = await axiosInstance.post("/registro", datos);

      // Verificar si la respuesta indica que se requiere verificación de correo
      if (response.data.requireVerification) {
        return {
          success: true,
          data: response.data,
          message:
            response.data.msg ||
            "Cuenta creada. Revisa tu correo para activarla",
          requireVerification: true,
          email: response.data.email || datos.cor_usu,
        };
      }

      return {
        success: true,
        data: response.data,
        message: "Registro exitoso",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.msg || "Error al registrar usuario",
        error,
      };
    }
  }

  /**
   * Obtiene la lista de carreras disponibles
   * @returns {Promise} - Promesa con la lista de carreras
   */
  async obtenerCarreras() {
    try {
      const response = await axiosInstance.get("/carreras");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error,
      };
    }
  }
}

export default RegistroService;
