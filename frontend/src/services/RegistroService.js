import axiosInstance from "../api/axiosConfig";
import { requestWithEndpointFallback } from "../api/endpointFallback";

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
      const response = await requestWithEndpointFallback(
        () => axiosInstance.post("/auth/register", datos),
        () => axiosInstance.post("/registro", datos)
      );

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

  /**
   * Obtiene el logo institucional configurable desde la API pública.
   * Prioriza logo de universidad y, si no existe, usa logo de facultad.
   * @returns {Promise<{success:boolean,data:string|null,error?:any}>}
   */
  async obtenerLogoInstitucional() {
    const fuentes = [
      { endpoint: "/universidad-principal", field: "url_log_uni" },
      { endpoint: "/facultad-principal", field: "url_log_fac" },
    ];

    for (const fuente of fuentes) {
      try {
        const response = await axiosInstance.get(fuente.endpoint);
        const logo = response?.data?.[fuente.field];
        if (logo) {
          return {
            success: true,
            data: logo,
          };
        }
      } catch (error) {
        // Continúa con la siguiente fuente disponible.
      }
    }

    return {
      success: false,
      data: null,
    };
  }
}

export default RegistroService;
