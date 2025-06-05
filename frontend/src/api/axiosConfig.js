import axios from "axios";
import { toast } from "react-toastify"; // Importar toast para notificaciones

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api", // URL base del backend desde las variables de entorno
});

// Variable para almacenar la función de logout
let logoutFunction = null;

// Función para configurar el logout (será llamada desde AuthContext)
export const setLogoutFunction = (logout) => {
  logoutFunction = logout;
};

// Interceptor de solicitudes - agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable para controlar que solo se muestre una notificación de sesión expirada
let tokenExpirationNotified = false;

// Interceptor de respuestas - manejar errores de token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si hay error de autenticación (token inválido, expirado, corrupto)
    if (error.response?.status === 401) {
      console.log("🚫 Error 401: Token inválido o expirado");

      // Limpiar token corrupto automáticamente
      localStorage.removeItem("token");
      localStorage.removeItem("authData");

      // Si hay función de logout configurada, ejecutarla
      if (logoutFunction) {
        console.log("🔄 Cerrando sesión automáticamente por token inválido");
        logoutFunction();
      }

      // Mostrar notificación al usuario
      toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
